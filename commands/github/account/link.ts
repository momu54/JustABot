import {
	ButtonBuilder,
	ButtonInteraction,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonStyle,
} from 'discord.js';
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import { tokendb } from '../../../utility/database.js';

// 建立是否有人授權的狀態機
let issomeoneauthorizing = false;

export async function execute(interaction: ButtonInteraction) {
	// 如果有人正在授權
	if (issomeoneauthorizing) {
		// 建立錯誤embed
		const errembed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('Link Github account')
			.setDescription(
				'Another user is currently authorizing.\nPlease try again in five minutes.'
			);
		// 修改回應
		await interaction.reply({ embeds: [errembed] });
		return;
	}
	// 推遲回應
	await interaction.deferUpdate();
	// 改變狀態
	issomeoneauthorizing = true;
	// 生成設備代碼
	const auth = createOAuthDeviceAuth({
		clientId: process.env.githubclientid!,
		scopes: ['repo'],
		async onVerification(verification) {
			// 建立embed
			const embed = new EmbedBuilder()
				.setColor(0xffffff)
				.setTitle('Link Github account')
				.setDescription(
					'Please click the button below the message and paste this code.\nIt may take a while after completion.'
				)
				.addFields({
					name: verification.user_code,
					value: '↑',
				});
			// 建立按鈕
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setURL(verification.verification_uri)
					.setLabel('Authorization')
			);
			// 修改回應
			await interaction.editReply({ embeds: [embed], components: [row] });
		},
	});
	// 等待授權
	const { token } = await auth({ type: 'oauth' });
	// 建立 embed
	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle('Link Github account')
		.setDescription('✅ Done!');
	// 修改回應
	await interaction.editReply({ embeds: [embed], components: [] });
	// 加入資料庫
	await tokendb.run('INSERT INTO accounts VALUES(?, ?, ?)', [
		interaction.user.id,
		token,
		new Date().toJSON(),
	]);
	// 改變狀態
	issomeoneauthorizing = false;
}
