import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
} from 'discord.js';

export interface CommandType {
	data: SlashCommandBuilder;
	execute(i: ChatInputCommandInteraction): Promise<void>;
	executeBtn?(i: ButtonInteraction): Promise<void>;
	executeMenu?(i: SelectMenuInteraction): Promise<void>;
	executeModal?(i: ModalSubmitInteraction): Promise<void>;
}

export interface MessageCommandType {
	data: SlashCommandBuilder;
	execute(i: ContextMenuCommandInteraction): Promise<void>;
	executeBtn?(i: ButtonInteraction): Promise<void>;
	executeMenu?(i: SelectMenuInteraction): Promise<void>;
	executeModal?(i: ModalSubmitInteraction): Promise<void>;
}

export type editerlanguages = 'js' | 'ts' | 'py';
