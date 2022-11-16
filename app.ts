import {
	ApplicationCommandType,
	Client,
	codeBlock,
	Collection,
	ComponentType,
	EmbedBuilder,
	GatewayIntentBits,
	InteractionType,
	Events,
} from 'discord.js';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { Command, MessageCommandType } from './typings/type.js';
// load other features
import { execute, ExecuteChannelCreate } from './other/voicechannel.js';

const client = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.Guilds,
	],
});

let commands = new Collection<string, Command>();
let MessageCommands = new Collection<string, MessageCommandType>();
const CommandsPath = path.join('./', 'commands');
const CommandsFiles = fs.readdirSync(CommandsPath);
const MessageCommandsPath = path.join('./', 'MessageCommands');
const MessageCommandsFiles = fs.readdirSync(MessageCommandsPath);
client.on('ready', async () => {
	console.log('ready!');
	await loadcommand();
});

async function loadcommand() {
	// const clientcommands = client.application?.commands;
	console.log('Started refreshing application (/) commands.');
	for (const file of CommandsFiles) {
		const filePath = `./commands/${file}`;
		if (!file.endsWith('.ts')) continue;
		const command = (await import(filePath)) as Command;
		commands.set(command.data.name, command);
	}
	for (const file of MessageCommandsFiles) {
		const filePath = `./MessageCommands/${file}`;
		const command = (await import(filePath)) as MessageCommandType;
		MessageCommands.set(command.data.name, command);
	}
	// const AllCommands: SlashCommandBuilder[] = [...commands, ...MessageCommands].map(
	// 	(command) => command[1].data
	// );
	// await clientcommands?.set(AllCommands);
	console.log('Successfully reloaded application (/) commands.');
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.type == InteractionType.ApplicationCommand) {
		if (interaction.commandType == ApplicationCommandType.ChatInput) {
			const CommandFile = commands.get(interaction.commandName);

			if (!CommandFile) return;

			try {
				await CommandFile.execute(interaction);
			} catch (error) {
				console.error(error);
				const errorembed = geterrorembed(error);
				try {
					await interaction.reply({
						embeds: [errorembed],
						ephemeral: true,
					});
				} catch (err) {
					console.error(err);
					await interaction.editReply({
						embeds: [errorembed],
					});
				}
			}
		} else if (interaction.commandType == ApplicationCommandType.Message) {
			const CommandFile = MessageCommands.get(interaction.commandName);

			if (!CommandFile) return;

			try {
				await CommandFile.execute(interaction);
			} catch (error) {
				console.error(error);
				const errorembed = geterrorembed(error);
				try {
					await interaction.reply({
						embeds: [errorembed],
						ephemeral: true,
					});
				} catch (err) {
					console.error(err);
					await interaction.editReply({
						embeds: [errorembed],
					});
				}
			}
		}
	}
	if (interaction.type == InteractionType.MessageComponent) {
		const CommandName = interaction.customId.split('.')[0];
		const CommandFile = commands.get(CommandName);

		if (!CommandFile) return;

		if (CommandName == 'github') {
			await CommandFile.executeModule?.(interaction);
			return;
		}

		if (interaction.componentType == ComponentType.Button) {
			try {
				await CommandFile.executeBtn?.(interaction);
			} catch (error) {
				console.error(error);
				const errorembed = geterrorembed(error);
				try {
					await interaction.reply({
						embeds: [errorembed],
						ephemeral: true,
					});
				} catch (err) {
					console.error(err);
					await interaction.editReply({
						embeds: [errorembed],
					});
				}
			}
		}
	}
	if (interaction.type == InteractionType.ModalSubmit) {
		const CommandName = interaction.customId.split('.')[0];
		const CommandFile = commands.get(CommandName);

		if (!CommandFile) return;

		try {
			if (CommandName == 'github') {
				if (!interaction.isFromMessage()) return;
				await CommandFile.executeModule?.(interaction);
				return;
			}

			await CommandFile.executeModal?.(interaction);
		} catch (error) {
			console.error(error);
			const errorembed = geterrorembed(error);
			try {
				await interaction.reply({
					embeds: [errorembed],
					ephemeral: true,
				});
			} catch (err) {
				console.error(err);
				await interaction.editReply({
					embeds: [errorembed],
				});
			}
		}
	}
	if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
		const CommandFile = commands.get(interaction.commandName);

		if (!CommandFile) return;

		try {
			await CommandFile.executeAutoComplete?.(interaction);
		} catch (error) {
			console.error(error);
		}
	}
});

client.on('voiceStateUpdate', async (oldvoice, voice) => {
	try {
		await execute(oldvoice, voice);
	} catch (error) {
		console.error(error);
	}
});

client.on('channelCreate', ExecuteChannelCreate);

function geterrorembed(error: any) {
	return new EmbedBuilder()
		.setColor(0xf00000)
		.setTitle('error!')
		.setDescription(codeBlock('js', (error as Error).stack!));
}

client.login(process.env.token);

process.on('uncaughtException', console.error);

process.on('unhandledRejection', console.error);
