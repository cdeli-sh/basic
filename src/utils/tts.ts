import { AudioPlayer, StreamType, createAudioResource } from "@discordjs/voice";
import say from "say";

export default function tts(text: string, player: AudioPlayer): void {
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  say.export(text, 'Microsoft Hortense Desktop', 1, '../.tmp/message.wav', (err) => {
    if (err) {
      // return console.error(err);
    }

    const resource = createAudioResource('message.wav', {
      inputType: StreamType.Arbitrary,
    });
    player.play(resource);
  });
}