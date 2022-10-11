import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
	AutocompleteInteraction,
} from 'discord.js';

export interface Command {
	data: SlashCommandBuilder;
	execute(i: ChatInputCommandInteraction): Promise<void>;
	executeBtn?(i: ButtonInteraction): Promise<void>;
	executeMenu?(i: SelectMenuInteraction): Promise<void>;
	executeModal?(i: ModalSubmitInteraction): Promise<void>;
	executeAutoComplete?(i: AutocompleteInteraction): Promise<void>;
}

export interface MessageCommandType {
	data: SlashCommandBuilder;
	execute(i: ContextMenuCommandInteraction): Promise<void>;
	executeBtn?(i: ButtonInteraction): Promise<void>;
	executeMenu?(i: SelectMenuInteraction): Promise<void>;
	executeModal?(i: ModalSubmitInteraction): Promise<void>;
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

export interface GithubCache {
	[key: string]: any[];
}

export interface GithubEtags {
	[key: string]: string;
}
