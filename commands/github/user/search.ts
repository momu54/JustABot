import {
	ActionRowBuilder,
	ButtonInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

export async function execute(interaction: ButtonInteraction, _query: string[]) {
	// 建立 modal
	const modal = new ModalBuilder()
		.setTitle('Search')
		.setCustomId(`github.user.search.modalsub`)
		.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setLabel('Keyword')
					.setCustomId('github.user.search.keyword')
					.setMaxLength(256)
					.setStyle(TextInputStyle.Short)
			)
		);
	// 顯示 modal
	await interaction.showModal(modal);
}
