import { Player } from 'discord-music-player';
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Collection,
	ContextMenuCommandInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
} from 'discord.js';

export interface CommandType {
	data: SlashCommandBuilder;
	execute(i: ChatInputCommandInteraction, player: Player): Promise<void>;
	executeBtn?(i: ButtonInteraction): Promise<void>;
	executeMenu?(i: SelectMenuInteraction, player: Player): Promise<void>;
}

export interface MessageCommandType {
	data: SlashCommandBuilder;
	execute(i: ContextMenuCommandInteraction): Promise<void>;
}

export class HaveIncludesCollection<k, v> extends Collection<k, v> {
	includes(e: any) {
		return !!super.find((v) => v === e);
	}
}
