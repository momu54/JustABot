import { SelectMenuInteraction } from 'discord.js';
import { loadrepo } from './load.js';

export async function execute(interaction: SelectMenuInteraction) {
	// 推遲回應
	await interaction.deferUpdate();
	// 取得儲存庫資料
	const data = await loadrepo(interaction.values);
	// 回應
	await interaction.editReply(data);
}
