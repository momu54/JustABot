import {
	ApplicationCommandType,
	Client,
	codeBlock,
	Collection,
	ComponentType,
	EmbedBuilder,
	GatewayIntentBits,
	InteractionType,
} from 'discord.js';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { Player } from 'discord-music-player';
import { CommandType } from './type';

const client = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.Guilds,
	],
});
const player = new Player(client, {
	deafenOnJoin: true,
	leaveOnEmpty: true,
	leaveOnStop: true,
	leaveOnEnd: true,
});
var commands = new Collection<string, CommandType>();
const commandsPath = path.join(__dirname, 'commands');
const commandsFile = fs.readdirSync(commandsPath);

client.on('ready', () => {
	console.log('ready!');
	loadcommand();
});

async function loadcommand() {
	for (const file of commandsFile) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath) as CommandType;
		commands.set(command.data.name, command);
		client.application?.commands.create(command.data);
	}
	console.log('Started refreshing application (/) commands.');
	console.log('Successfully reloaded application (/) commands.');
}

client.on('interactionCreate', async (i) => {
	if (i.type == InteractionType.ApplicationCommand) {
		if (i.commandType == ApplicationCommandType.ChatInput) {
			const commandFile = commands.get(i.commandName);

			if (!commandFile) return;

			try {
				await commandFile.execute(i, player);
			} catch (error) {
				console.error(error);
				const errorembed = geterrorembed(error);
				try {
					await i.reply({
						embeds: [errorembed],
						ephemeral: true,
					});
				} catch (err) {
					console.error(err);
					await i.editReply({
						embeds: [errorembed],
					});
				}
			}
		}
	}
	if (i.type == InteractionType.MessageComponent) {
		const commandName = i.customId.split('.')[0];
		const commandFile = commands.get(commandName);

		if (!commandFile) return;

		if (i.componentType == ComponentType.Button) {
			try {
				await commandFile.executeBtn?.(i, player);
			} catch (error) {
				console.error(error);
				const errorembed = geterrorembed(error);
				try {
					await i.reply({
						embeds: [errorembed],
						ephemeral: true,
					});
				} catch (err) {
					console.error(err);
					await i.editReply({
						embeds: [errorembed],
					});
				}
			}
		}
		if (i.componentType == ComponentType.SelectMenu) {
			try {
				await commandFile.executeMenu?.(i, player);
			} catch (error) {
				console.error(error);
				const errorembed = geterrorembed(error);
				try {
					await i.reply({
						embeds: [errorembed],
						ephemeral: true,
					});
				} catch (err) {
					console.error(err);
					await i.editReply({
						embeds: [errorembed],
					});
				}
			}
		}
	}
});

function geterrorembed(error: any) {
	return new EmbedBuilder()
		.setColor(0xf00000)
		.setTitle('error!')
		.setDescription(codeBlock('js', (error as Error).stack!));
}

client.login(process.env.TOKEN);
