import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
} from 'discord.js';
import { GetToken } from '../../utility/github.js';
import { Octokit } from '@octokit/rest';

export async function execute(interaction: ButtonInteraction) {
	// 推遲回應
	await interaction.deferUpdate();
	// 取得 token
	const tokenres = await GetToken(interaction.user.id);
	// 建立按鈕
	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('github.account.link')
				.setStyle(ButtonStyle.Success)
				.setLabel('Link')
				.setEmoji('🔗')
				.setDisabled(!!tokenres)
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('github.account.unlink')
				.setStyle(ButtonStyle.Danger)
				.setLabel('Unlink')
				.setEmoji('❎')
				.setDisabled(!tokenres)
		);
	const embed = new EmbedBuilder()
		.setTitle('Account')
		.setDescription('Manage your account.')
		.setColor(0xffffff);
	if (tokenres) {
		// 取得 github 使用者
		const octokit = new Octokit({
			auth: tokenres.Token,
		});
		const { data } = await octokit.rest.users.getAuthenticated();
		// 建立 embed
		embed.setAuthor({
			name: data.login,
			iconURL: data.avatar_url,
			url: data.html_url,
		});
	}
	// 回復
	await interaction.editReply({ embeds: [embed], components: [row] });
}
