// 導入模塊
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	ModalMessageModalSubmitInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import '../utility/database.js';

export const data = new SlashCommandBuilder()
	.setName('github')
	.setDescription('Github account.');

export async function execute(
	interaction: ChatInputCommandInteraction | ButtonInteraction
) {
	// 建立 embed
	const embed = new EmbedBuilder()
		.setTitle('Github')
		.setDescription(
			'⚠️ Warning: This feature is an experimental feature.\nplease report any bugs to github issue.'
		)
		.setColor(0xffffff);
	// 建立 ActionRow
	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('github.account')
				.setLabel('Account')
				.setStyle(ButtonStyle.Primary)
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('github.repo')
				.setLabel('Repository')
				.setStyle(ButtonStyle.Primary)
		);
	// 回復交互
	await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
	return;
}

export async function executeModule(
	interaction:
		| SelectMenuInteraction
		| ButtonInteraction
		| ModalMessageModalSubmitInteraction
) {
	const query = interaction.customId.split('?')[1]?.split(',');
	const path = './' + interaction.customId.replaceAll('.', '/').split('?')[0] + '.js';
	const filecontent = await import(path);
	await filecontent.execute(interaction, query);
}
