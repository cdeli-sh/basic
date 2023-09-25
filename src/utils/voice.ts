import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { EndBehaviorType, type DiscordGatewayAdapterCreator, type DiscordGatewayAdapterLibraryMethods, type VoiceReceiver } from '@discordjs/voice';
import {
	GatewayDispatchEvents,
	GatewayVoiceServerUpdateDispatchData,
	GatewayVoiceStateUpdateDispatchData,
} from 'discord-api-types/v10';
import { Snowflake, Client, Guild, VoiceBasedChannel, Status, User } from 'discord.js';
import * as prism from 'prism-media';
import DiscordUtils from './discord';

export default class VoiceHelper {
  private readonly adapters = new Map<Snowflake, DiscordGatewayAdapterLibraryMethods>();
  private readonly trackedClients = new Set<Client>();
  private readonly trackedShards = new Map<number, Set<Snowflake>>();

  public createDiscordJSAdapter(channel: VoiceBasedChannel): DiscordGatewayAdapterCreator {
    return (methods) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      this.adapters.set(channel.guild.id, methods);
      this.trackClient(channel.client);
      this.trackGuild(channel.guild);
      return {
        sendPayload(data) {
          if (channel.guild.shard.status === Status.Ready) {
            channel.guild.shard.send(data);
            return true;
          }
          return false;
        },
        destroy() {
          return self.adapters.delete(channel.guild.id);
        },
      };
    };
  }

  private trackGuild(guild: Guild) {
    let guilds = this.trackedShards.get(guild.shardId);
    if (!guilds) {
      guilds = new Set();
      this.trackedShards.set(guild.shardId, guilds);
    }
    guilds.add(guild.id);
  }

  private trackClient(client: Client) {
    if (this.trackedClients.has(client)) return;
    this.trackedClients.add(client);
    client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (payload: GatewayVoiceServerUpdateDispatchData) => {
      this.adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
    });
    client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (payload: GatewayVoiceStateUpdateDispatchData) => {
      if (payload.guild_id && payload.session_id && payload.user_id === client.user?.id) {
        this.adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
      }
    });
    client.on('shardDisconnect', (_, shardId) => {
      const guilds = this.trackedShards.get(shardId);
      if (guilds) {
        for (const guildID of guilds.values()) {
          this.adapters.get(guildID)?.destroy();
        }
      }
      this.trackedShards.delete(shardId);
    });
  }
  
  public async createListeningStream(receiver: VoiceReceiver, userId: string, user?: User) {
    const opusStream = receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 1000,
      },
    });
  
    const oggStream = new prism.opus.OggLogicalBitstream({
      opusHead: new prism.opus.OpusHead({
        channelCount: 2,
        sampleRate: 48000,
      }),
      pageSizeControl: {
        maxPackets: 10,
      },
    });
  
    const filename = `./recordings/${Date.now()}-${await DiscordUtils.getGlobalUserName(userId, user)}.ogg`;
  
    const out = createWriteStream(filename);
  
    console.log(`👂 Started recording ${filename}`);
  
    pipeline(opusStream as any, oggStream, out, (err) => {
      if (err) {
        console.warn(`❌ Error recording file ${filename} - ${err.message}`);
      } else {
        console.log(`✅ Recorded ${filename}`);
      }
    });
  
    out.on('close', () => {
      console.log(`👋 Closed write stream for ${filename}`);
    });
  }
}