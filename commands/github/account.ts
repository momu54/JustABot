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
	// 推遲回應
	await DeferUpdate(interaction);
	// 取得 octokit
	const octokit = await GetAuthenticatedOctokit(interaction.user.id);
	// 建立按鈕
	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('github.account.link')
				.setStyle(ButtonStyle.Success)
				.setLabel('Link')
				.setEmoji('🔗')
				.setDisabled(!!octokit)
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('github.account.unlink')
				.setStyle(ButtonStyle.Danger)
				.setLabel('Unlink')
				.setEmoji('❎')
				.setDisabled(!octokit)
		);
	const embed = new EmbedBuilder()
		.setTitle('Account')
		.setDescription('Manage your account.')
		.setColor(0xffffff);
	if (octokit) {
		const { data: user } = await octokit.rest.users.getAuthenticated();
		// 建立 embed
		embed.setAuthor({
			name: user.login,
			iconURL: user.avatar_url,
			url: user.html_url,
		});
	}
	// 回復
	await interaction.editReply({ embeds: [embed], components: [row] });
}
