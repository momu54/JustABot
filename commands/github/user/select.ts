import { SelectMenuInteraction } from 'discord.js';
import { DeferUpdate } from '../../../utility/other.js';
import { loaduser } from './load.js';

export async function execute(interaction: SelectMenuInteraction, _query: string[]) {
	// 推遲回應
	await DeferUpdate(interaction);
	// 取得儲存庫資料
	const data = await loaduser(interaction.values, interaction.user.id);
	// 回應
	await interaction.editReply(data);
}
