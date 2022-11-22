import {
	ActionRowBuilder,
	EmbedBuilder,
	ModalMessageModalSubmitInteraction,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
} from 'discord.js';
import { appoctokit, GetAuthenticatedOctokit } from '../../../../utility/github.js';
import { DeferUpdate } from '../../../../utility/other.js';

export async function execute(
	interaction: ModalMessageModalSubmitInteraction,
	_query: string[]
) {
	// 推遲回應
	await DeferUpdate(interaction);
	// 取得關鍵字
	const keyword = interaction.fields.getTextInputValue('github.user.search.keyword');
	// get octokit
	let octokit = await GetAuthenticatedOctokit(interaction.user.id);
	if (!octokit) octokit = appoctokit;
	// 取得搜索结果
	const { data: users } = await octokit.rest.search.users({
		q: keyword,
		sort: 'followers',
		per_page: 25,
	});
	// 將搜索結果轉換為選項
	const options = users.items.map((user) =>
		new SelectMenuOptionBuilder().setLabel(user.login).setValue(user.login)
	);
	// 建立 SelectMenu
	const menu = new SelectMenuBuilder()
		.setCustomId(`github.user.select`)
		.setPlaceholder('Choose a user...')
		.addOptions(options);
	// 建立 ActionRow
	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu);
	// 建立 Embed
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle('Repository')
		.setDescription('Choose a user.\nThe selector can only display 25 items.');
	// 修改回應
	await interaction.editReply({ embeds: [embed], components: [row] });
}
