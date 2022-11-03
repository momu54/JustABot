import { Octokit } from '@octokit/rest';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
} from 'discord.js';
import { GetToken } from '../../utility/github.js';
import { DeferUpdate } from '../../utility/other.js';

export async function execute(interaction: ButtonInteraction) {
	// 推遲回應
	await DeferUpdate(interaction);
	// 取得 token
	const tokenres = await GetToken(interaction.user.id);
	// 建立 Embed
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle('Repository')
		.setDescription(
			'Open a repository.\nThe selector can only display 25 items, if the repository you need is not on it, use search.'
		);
	// 建立 SelectMenu
	const menu = new SelectMenuBuilder()
		.setCustomId('github.repo.select')
		.setPlaceholder(
			tokenres ? 'Choose a repository...' : 'You need authorization to use.'
		)
		.setDisabled(!tokenres);
	if (tokenres) {
		const octokit = new Octokit({
			auth: tokenres.Token,
		});
		const user = await octokit.users.getAuthenticated();
		const { data } = await octokit.rest.repos.listForUser({
			username: user.data.login,
			per_page: 25,
		});
		const options = data.map((repo) =>
			new SelectMenuOptionBuilder()
				.setLabel(repo.full_name)
				.setValue(repo.full_name)
		);
		menu.addOptions(options);
	}
	// 建立 ActionRow
	const btnrow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('github.repo.search')
			.setEmoji('🔎')
			.setStyle(ButtonStyle.Primary)
	);
	const selectorrow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu);
	await interaction.editReply({ embeds: [embed], components: [selectorrow, btnrow] });
}
