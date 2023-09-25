import { VoiceBasedChannel } from 'discord.js';
import { client, player } from '../main'
import DiscordUtils from '../utils/discord';
import tts from '../utils/tts';

export function registerClientEvents() {
  client.on('ready', async (): Promise<void> => {
    console.log('Bippp boubbb');
    const channel = (await client.channels.fetch("418014405222072320")) as VoiceBasedChannel;
    DiscordUtils.connectToChannel(channel);
  });
  
  
  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;
  
    if (message.content === '-join') {
      const channel = message.member?.voice.channel;
      if (channel) {
        await DiscordUtils.connectToChannel(channel);
      } 
    } else if (message.author.id !== client.user?.id && message.channelId === "418014405222072320") {
      console.log(`TTS (message) : ${message.content}`)
      console.log(message.author)
      const nickname = await DiscordUtils.getUserName(message.author.id)
      tts(`${nickname} à dit ${message.content}`, player);
    }
  });
  
  client.on("voiceStateUpdate", (oldState, newState) => {
    if (oldState.channelId === null && newState.channelId !== null) {
      tts(`${newState.member?.displayName ?? ''} a rejoint le salon`, player)
    } else if (oldState.channelId !== null && newState.channelId === null) {
      tts(`${oldState.member?.displayName ?? ''} a quitter le salon`, player)
    }
  })
  
}