import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
} from 'discord.js';
import { tokendb } from '../../utility/database.js';
import { TokenDB } from '../../typings/type.js';
import { CheckTokenExpired } from '../../utility/github.js';

export async function execute(interaction: ButtonInteraction) {
	// 從資料庫取得token
	const token = await tokendb.get<TokenDB>(
		`SELECT * FROM accounts WHERE Discord="${interaction.user.id}"`
	);
	await CheckTokenExpired(token);
	// 建立 embed
	const embed = new EmbedBuilder()
		.setTitle('Account')
		.setDescription('Manage your account.')
		.setColor(0xffffff);
	// 建立按鈕
	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('github.account.link')
				.setStyle(ButtonStyle.Success)
				.setLabel('Link')
				.setEmoji('🔗')
				.setDisabled(!!token)
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('github.account.unlink')
				.setStyle(ButtonStyle.Danger)
				.setLabel('Unlink')
				.setEmoji('❎')
				.setDisabled(!token)
		);
	await interaction.update({ embeds: [embed], components: [row] });
}
