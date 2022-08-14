import { Player } from 'discord-music-player';
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
} from 'discord.js';

export interface CommandType {
	data: SlashCommandBuilder;
	execute(i: ChatInputCommandInteraction, player: Player): Promise<void>;
	executeBtn?(i: ButtonInteraction, player: Player): Promise<void>;
	executeMenu?(i: SelectMenuInteraction, player: Player): Promise<void>;
}
