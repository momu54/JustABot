import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
} from 'discord.js';
import { GetAuthenticatedOctokit } from '../../utility/github.js';
import { DeferUpdate } from '../../utility/other.js';

export async function execute(interaction: ButtonInteraction, _query: string[]) {
	// 推遲回應
	await DeferUpdate(interaction);
	// 建立 Embed
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle('Repository')
		.setDescription(
			'Open a repository.\nThe selector can only display 25 items, if the repository you need is not on it, use search.'
		);
	// 取得 Octokit 實例
	const octokit = await GetAuthenticatedOctokit(interaction.user.id);
	// 建立 SelectMenu
	const menu = new SelectMenuBuilder()
		.setCustomId(`github.repo.select`)
		.setPlaceholder(
			octokit ? 'Choose a repository...' : 'You need authorization to use.'
		)
		.setDisabled(!octokit)
		.addOptions(new SelectMenuOptionBuilder().setLabel('null').setValue('null'));
	if (octokit) {
		const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
			per_page: 25,
		});
		const options = repos.map((repo) =>
			new SelectMenuOptionBuilder()
				.setLabel(repo.full_name)
				.setValue(repo.full_name)
		);
		menu.setOptions(options);
	}
	// 建立 ActionRow
	const btnrow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`github.repo.search`)
			.setEmoji('🔎')
			.setStyle(ButtonStyle.Primary)
	);
	const selectorrow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu);
	await interaction.editReply({ embeds: [embed], components: [selectorrow, btnrow] });
}
