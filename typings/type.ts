import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	AutocompleteInteraction,
	SelectMenuInteraction,
	ModalMessageModalSubmitInteraction,
} from 'discord.js';

export interface Command {
	data: SlashCommandBuilder;
	execute(interaction: ChatInputCommandInteraction): Promise<void>;
	executeBtn?(interaction: ButtonInteraction): Promise<void>;
	executeModal?(interaction: ModalSubmitInteraction): Promise<void>;
	executeAutoComplete?(interaction: AutocompleteInteraction): Promise<void>;
	executeModule?(
		interaction:
			| SelectMenuInteraction
			| ButtonInteraction
			| ModalMessageModalSubmitInteraction
	): Promise<void>;
}

export interface MessageCommandType {
	data: SlashCommandBuilder;
	execute(interaction: ContextMenuCommandInteraction): Promise<void>;
	executeBtn?(interaction: ButtonInteraction): Promise<void>;
	executeModal?(interaction: ModalSubmitInteraction): Promise<void>;
}

export enum editerlanguages {
	ts = 'ts',
	js = 'js',
	py = 'py',
}

export enum CommandType {
	global = 0,
	guild = 1,
}

export interface TokenDB {
	Token: string;
	timestamp: string;
	Discord: string;
}
