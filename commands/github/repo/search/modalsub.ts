import {
	ActionRowBuilder,
	EmbedBuilder,
	ModalMessageModalSubmitInteraction,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
} from 'discord.js';
import { appoctokit } from '../../../../utility/github.js';
import { DeferUpdate } from '../../../../utility/other.js';

export async function execute(
	interaction: ModalMessageModalSubmitInteraction,
	_query: string[]
) {
	// 推遲回應
	await DeferUpdate(interaction);
	// 取得關鍵字
	const keyword = interaction.fields.getTextInputValue('github.repo.search.keyword');
	// 取得搜索结果
	const { data } = await appoctokit.rest.search.repos({
		q: keyword,
		sort: 'stars',
		per_page: 25,
	});
	// 將搜索結果轉換為選項
	const options = data.items.map((repo) =>
		new SelectMenuOptionBuilder().setLabel(repo.full_name).setValue(repo.full_name)
	);
	// 建立 SelectMenu
	const menu = new SelectMenuBuilder()
		.setCustomId(`github.repo.select`)
		.setPlaceholder('Choose a repository...')
		.addOptions(options);
	// 建立 ActionRow
	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu);
	// 建立 Embed
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle('Repository')
		.setDescription('Open a repository.\nThe selector can only display 25 items.');
	// 修改回應
	await interaction.editReply({ embeds: [embed], components: [row] });
}
