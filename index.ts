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
import { CommandType, MessageCommandType } from './type';

//load other features
import { execute } from './other/voicechannel';

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
var MessageCommands = new Collection<string, MessageCommandType>();
const CommandsPath = path.join(__dirname, 'commands');
const CommandsFiles = fs.readdirSync(CommandsPath);
const MessageCommandsPath = path.join(__dirname, 'MessageCommands');
const MessageCommandsFiles = fs.readdirSync(MessageCommandsPath);
client.on('ready', () => {
	console.log('ready!');
	loadcommand();
});

async function loadcommand() {
	//await client.application?.commands.set([]);
	console.log('Started refreshing application (/) commands.');
	for (const file of CommandsFiles) {
		const filePath = path.join(CommandsPath, file);
		const command = require(filePath) as CommandType;
		commands.set(command.data.name, command);
		//await client.application?.commands.create(command.data);
	}
	console.log('Successfully reloaded application (/) commands.');
	console.log('Started refreshing application (MessageContextMenu) commands.');
	for (const file of MessageCommandsFiles) {
		const filePath = path.join(MessageCommandsPath, file);
		const command = require(filePath) as MessageCommandType;
		MessageCommands.set(command.data.name, command);
		//await client.application?.commands.create(command.data);
	}
	console.log('Successfully reloaded application (MessageContextMenu) commands.');
}

client.on('interactionCreate', async (i) => {
	if (i.type == InteractionType.ApplicationCommand) {
		if (i.commandType == ApplicationCommandType.ChatInput) {
			const CommandFile = commands.get(i.commandName);

			if (!CommandFile) return;

			try {
				await CommandFile.execute(i, player);
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
		} else if (i.commandType == ApplicationCommandType.Message) {
			const CommandFile = MessageCommands.get(i.commandName);

			if (!CommandFile) return;

			try {
				await CommandFile.execute(i);
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
		const CommandName = i.customId.split('.')[0];
		const CommandFile = commands.get(CommandName);

		if (!CommandFile) return;

		if (i.componentType == ComponentType.Button) {
			try {
				await CommandFile.executeBtn?.(i);
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
		} else if (i.componentType == ComponentType.SelectMenu) {
			try {
				await CommandFile.executeMenu?.(i, player);
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

client.on('voiceStateUpdate', execute);

function geterrorembed(error: any) {
	return new EmbedBuilder()
		.setColor(0xf00000)
		.setTitle('error!')
		.setDescription(codeBlock('js', (error as Error).stack!));
}

client.login(process.env.TOKEN);
