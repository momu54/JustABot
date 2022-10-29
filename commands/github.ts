// 導入模塊
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	// InteractionReplyOptions,
	SlashCommandBuilder,
} from 'discord.js';
import '../utility/database.js';
import { tokendb } from '../utility/database.js';
// import { AuthorizedUserCache, GithubEtags, TokenDB } from '../typings/type.js';
// import { User } from '../typings/github.js';
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
// 建立是否有人授權的狀態機
let issomeoneauthorizing = false;
// 建立使用者快取變數
// const usercache: AuthorizedUserCache = {};
// const useretags: GithubEtags = {};

export const data = new SlashCommandBuilder()
	.setName('github')
	.setDescription('Github account.');

export async function execute(interaction: ChatInputCommandInteraction) {
	// 建立 embed
	const embed = new EmbedBuilder()
		.setTitle('Github')
		.setDescription(
			'⚠️ Warning: This feature is an experimental feature.\nplease report any bugs to github issue.'
		)
		.setColor(0xffffff);
	// 建立 components
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('github.account')
			.setLabel('account')
			.setStyle(ButtonStyle.Primary)
	);
	// 回復交互
	await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
	return;
}

export async function executeBtn(interaction: ButtonInteraction) {
	const path = './' + interaction.customId.replaceAll('.', '/') + '.js';
	const filecontent = await import(path);
	await filecontent.execute(interaction);
}

export async function executeBtnOld(interaction: ButtonInteraction) {
	// 取得按鈕資料
	const args = interaction.customId.split('.');
	const action = args[1];
	// 推遲回應
	await interaction.deferUpdate();
	// 辨認按鈕
	if (action == 'link') {
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
			await interaction.editReply({ embeds: [errembed] });
			return;
		}
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
		// 建立embed
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
	} else if (action == 'unlink') {
		// 從資料庫移除
		await tokendb.run(`DELETE FROM accounts WHERE Discord="${interaction.user.id}"`);
		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle('Unlink Github account')
			.setDescription('✅ Done!');
		// 修改回應
		await interaction.editReply({ embeds: [embed], components: [] });
	}
}
