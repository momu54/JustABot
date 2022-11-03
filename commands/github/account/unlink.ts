import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { tokendb } from '../../../utility/database.js';
import { DeferUpdate } from '../../../utility/other.js';

export async function execute(interaction: ButtonInteraction) {
	await DeferUpdate(interaction);
	// 從資料庫移除
	await tokendb.run(`DELETE FROM accounts WHERE Discord="${interaction.user.id}"`);
	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle('Unlink Github account')
		.setDescription('✅ Done!');
	// 修改回應
	await interaction.editReply({
		embeds: [embed],
		components: [],
	});
}
