import {
	Client,
	codeBlock,
	CommandInteraction,
	EmbedBuilder,
	Events,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import {
	ApplicationCommandType,
	ComponentType,
	GatewayIntentBits,
	InteractionType,
} from 'discord-api-types/v10';
import 'dotenv/config';
import fs from 'fs';
import { Command } from './typings/type.js';
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

const CommandsFiles = fs
	.readdirSync('./commands/')
	.filter((file) => file.endsWith('.ts'))
	.map((file) => `./commands/${file}`);
const MessageCommandsFiles = fs
	.readdirSync('./MessageCommands/')
	.filter((file) => file.endsWith('.ts'))
	.map((file) => `./MessageCommands/${file}`);
client.on('ready', async () => {
	console.log('ready!');
	await LoadAllCommands();
});

async function LoadAllCommands() {
	console.log('Started refreshing application (/) commands.');
	const commands: SlashCommandBuilder[] = [];
	for (const file of CommandsFiles) {
		const path = `./commands/${file}`;
		await LoadCommand(path, commands);
	}
	for (const file of MessageCommandsFiles) {
		const path = `./MessageCommands/${file}`;
		await LoadCommand(path, commands);
	}
	console.log('Successfully reloaded application (/) commands.');
}

async function LoadCommand(path: string, commands: SlashCommandBuilder[]) {
	let command: SlashCommandBuilder;
	({ data: command } = await import(path));
	commands.push(command);
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.type == InteractionType.ApplicationCommand) {
		if (interaction.commandType == ApplicationCommandType.ChatInput) {
			const CommandFile = (await import(
				`./commands/${interaction.commandName}`
			)) as Command;

			try {
				await CommandFile.execute(interaction);
			} catch (error) {
				await InteractionErrorHandler(error, interaction);
			}
		} else if (interaction.commandType == ApplicationCommandType.Message) {
			const CommandFile = (await import(
				`./MessageCommands/${interaction.commandName}`
			)) as Command;

			try {
				await CommandFile.execute(interaction);
			} catch (error) {
				await InteractionErrorHandler(error, interaction);
			}
		}
	}
	if (interaction.type == InteractionType.MessageComponent) {
		const CommandName = interaction.customId.split('.')[0];
		const CommandFile = (await import(`./commands/${CommandName}`)) as Command;

		if (CommandName == 'github') {
			await CommandFile.executeModule?.(interaction);
			return;
		}

		if (interaction.componentType == ComponentType.Button) {
			try {
				await CommandFile.executeBtn?.(interaction);
			} catch (error) {
				await InteractionErrorHandler(error, interaction);
			}
		}
	}
	if (interaction.type == InteractionType.ModalSubmit) {
		const CommandName = interaction.customId.split('.')[0];
		const CommandFile = (await import(`./commands/${CommandName}`)) as Command;

		try {
			if (CommandName == 'github') {
				if (!interaction.isFromMessage()) return;
				await CommandFile.executeModule?.(interaction);
				return;
			}

			await CommandFile.executeModal?.(interaction);
		} catch (error) {}
	}
});

client.on(Events.VoiceStateUpdate, async (oldvoice, voice) => {
	try {
		await execute(oldvoice, voice);
	} catch (error) {
		console.error(error);
	}
});

client.on(Events.ChannelCreate, ExecuteChannelCreate);

client.login(process.env.token);

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

client.on(Events.Debug, (debugmsg) => {
	if (debugmsg.includes('Clearing the heartbeat interval.')) {
		process.exit(0);
	}
});

async function InteractionErrorHandler(
	error: any,
	interaction: MessageComponentInteraction | CommandInteraction | ModalSubmitInteraction
) {
	console.error(error);
	const errorembed = new EmbedBuilder()
		.setColor(0xf00000)
		.setTitle('error!')
		.setDescription(codeBlock('js', (error as Error).stack!));
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
