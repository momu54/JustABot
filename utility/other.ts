import {
	CommandInteraction,
	EmbedBuilder,
	MessageComponentInteraction,
	ModalMessageModalSubmitInteraction,
	ModalSubmitInteraction,
} from 'discord.js';

export function InRange(size: number) {
	return [...Array(size).keys()];
}

const processingembed = new EmbedBuilder()
	.setTitle('<a:Rolling:1037669173939150848> Processing...')
	.setColor(0xffaa00);

export async function DeferUpdate(
	interaction: MessageComponentInteraction | ModalMessageModalSubmitInteraction
) {
	await interaction.update({ embeds: [processingembed], components: [], files: [] });
}

export async function deferReply(
	interaction: MessageComponentInteraction | ModalSubmitInteraction | CommandInteraction
) {
	await interaction.reply({ embeds: [processingembed], ephemeral: true });
}
