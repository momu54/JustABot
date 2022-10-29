import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
	AutocompleteInteraction,
} from 'discord.js';
import { User } from './github.js';

export interface Command {
	data: SlashCommandBuilder;
	execute(interaction: ChatInputCommandInteraction): Promise<void>;
	executeBtn?(interaction: ButtonInteraction): Promise<void>;
	executeMenu?(interaction: SelectMenuInteraction): Promise<void>;
	executeModal?(interaction: ModalSubmitInteraction): Promise<void>;
	executeAutoComplete?(interaction: AutocompleteInteraction): Promise<void>;
}

export interface MessageCommandType {
	data: SlashCommandBuilder;
	execute(interaction: ContextMenuCommandInteraction): Promise<void>;
	executeBtn?(interaction: ButtonInteraction): Promise<void>;
	executeMenu?(interaction: SelectMenuInteraction): Promise<void>;
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

export interface GithubCache {
	[key: string]: any[];
}

export interface GithubEtags {
	[key: string]: string;
}

export interface AuthorizedUserCache {
	[key: string]: User;
}

export interface TokenDB {
	Token: string;
	timestamp: string;
	Discord: string;
}

export interface GithubCommandFile {
	execute(): Promise<void>;
}
