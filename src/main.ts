import {
	createAudioPlayer
} from '@discordjs/voice';
import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { registerEvents } from './events'
dotenv.config()

export const client = new Client({
	intents: ['GuildMessages', 'MessageContent', 'GuildVoiceStates', 'Guilds', 'GuildMembers', 'GuildPresences']
})

export const player = createAudioPlayer();

registerEvents();

void client.login(process.env.DISCORD_TOKEN);
