import { joinVoiceChannel } from "@discordjs/voice";
import { GuildMember, VoiceBasedChannel, User } from "discord.js";
import tts from "./tts";
import VoiceHelper from "./voice";
import { client, player } from '../main'

const voiceAdapter = new VoiceHelper();

const DiscordUtils = {
  async getUserName(userId: string): Promise<string> {
    const user: GuildMember | undefined = await client.guilds.cache.get("290175499618222091")?.members.fetch(userId)
    if (!user) {
      throw new Error("User not found")
    }
    return user.displayName
  },
  async getGlobalUserName(userId: string, user: User|undefined = undefined): Promise<string>{
    if(!user){
      user = await client.users.fetch(userId)
    }
    return user.username
  },
  connectToChannel(channel: VoiceBasedChannel) {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: voiceAdapter.createDiscordJSAdapter(channel),
      selfDeaf: true,
      selfMute: false,
    });
  
    connection.on('error', (error) => {
      console.error(error.message)
    })
  
    connection.on('stateChange', (oldState, newState) => {
      console.log(`State changed from ${oldState.status} to ${newState.status}`)
      if(newState.status === 'ready') {
        tts("Bippp boubbb", player)
      }
    })
  
    try {
      connection.subscribe(player);
      // const receiver = connection.receiver;
      // if(client.user?.id){
      // 	createListeningStream(receiver, client.user.id, client.user);
      // }
    } catch (error) {
      connection.destroy();
      throw error;
    }
  }
}

export default DiscordUtils