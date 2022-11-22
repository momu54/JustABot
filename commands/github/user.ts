import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
} from 'discord.js';
import { GetAuthenticatedOctokit } from '../../utility/github.js';
import { DeferUpdate } from '../../utility/other.js';

export async function execute(interaction: ButtonInteraction, _query: string[]) {
	// deferupdate
	await DeferUpdate(interaction);
	// createembed
	const embed = new EmbedBuilder().setTitle('User').setColor(0xffffff);
	// get octokit
	const octokit = await GetAuthenticatedOctokit(interaction.user.id);
	// create action row
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('github.user.following')
			.setLabel('Following')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(!octokit),
		new ButtonBuilder()
			.setCustomId('github.user.followers')
			.setLabel('Followers')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(!octokit),
		new ButtonBuilder()
			.setCustomId(`github.user.search`)
			.setEmoji('🔎')
			.setStyle(ButtonStyle.Primary)
	);
	// reply interaction
	await interaction.editReply({ embeds: [embed], components: [row] });
}
