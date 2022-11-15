import {
	EmbedBuilder,
	MessageComponentInteraction,
	ModalMessageModalSubmitInteraction,
} from 'discord.js';

export function InRange(size: number) {
	return [...Array(size).keys()];
}

export async function DeferUpdate(
	interaction: MessageComponentInteraction | ModalMessageModalSubmitInteraction
) {
	// 建立embed
	const embed = new EmbedBuilder()
		.setTitle('<a:Rolling:1037669173939150848> Processing...')
		.setColor(0xffaa00);
	await interaction.update({ embeds: [embed], components: [] });
}
