import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	AutocompleteInteraction,
	ModalMessageModalSubmitInteraction,
	AnySelectMenuInteraction,
} from 'discord.js';

export interface Command {
	data: SlashCommandBuilder;
	execute(
		interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
	): Promise<void>;
	executeBtn?(interaction: ButtonInteraction): Promise<void>;
	executeModal?(interaction: ModalSubmitInteraction): Promise<void>;
	executeAutoComplete?(interaction: AutocompleteInteraction): Promise<void>;
	executeModule?(
		interaction:
			| AnySelectMenuInteraction
			| ButtonInteraction
			| ModalMessageModalSubmitInteraction
	): Promise<void>;
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
