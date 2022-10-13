import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { InRange } from '../utility/range.js';
import { setTimeout } from 'timers/promises';
// 建立狀態機
let issomeoneauthorizing = false;

export const data = new SlashCommandBuilder()
	.setName('github')
	.setDescription('Github account.');

export async function execute(i: ChatInputCommandInteraction) {
	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Success)
				.setEmoji('🔗')
				.setLabel('Link')
				.setCustomId('github.link')
		)
		.addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setEmoji('❎')
				.setLabel('Unlink')
				.setCustomId('github.unlink')
		);
	await i.reply({ components: [row], ephemeral: true });
}

export async function executeBtn(i: ButtonInteraction) {
	// 取得按鈕資料
	const args = i.customId.split('.');
	const action = args[1];
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
			await i.reply({ embeds: [errembed], ephemeral: true });
			return;
		}
		// 改變狀態
		issomeoneauthorizing = true;
		// 推遲回應
		await i.deferUpdate();
		// 發送請求
		const res = await fetch(
			`https://github.com/login/device/code?client_id=${process.env.githubclientid}&scope=repo`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
				},
			}
		);
		// 取得json請求
		const jsonres = await res.json();
		// 建立embed
		const embed = new EmbedBuilder()
			.setColor(0xffffff)
			.setTitle('Link Github account')
			.setDescription(
				'Please click the button below the message and paste this code.\nIt may take a while after completion.'
			)
			.addFields({
				name: jsonres.user_code,
				value: '↑',
			});
		// 建立按鈕
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setURL(jsonres.verification_uri)
				.setLabel('Authorization')
		);
		// 修改回應
		await i.editReply({ embeds: [embed], components: [row] });
		// 向Github輪詢
		for (const _index in InRange(30)) {
			// 發送輪詢請求
			const res = await fetch(
				`https://github.com/login/oauth/access_token?client_id=${process.env.githubclientid}&device_code=${jsonres.device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
				{
					method: 'POST',
					headers: {
						Accept: 'application/json',
					},
				}
			);
			// 取得json請求
			const pollsjsonres = await res.json();
			// 如果完成登入
			if (!pollsjsonres.error) {
				// 建立embed
				const embed = new EmbedBuilder()
					.setColor(0x00ff00)
					.setTitle('Link Github account')
					.setDescription('✅ Done!');
				// 修改回應
				await i.editReply({ embeds: [embed], components: [] });
				return;
			}
			await setTimeout(10000);
		}
		// 建立錯誤embed
		const errembed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('Link Github account')
			.setDescription('Expired, please execute the command again');
		// 修改回應
		await i.editReply({ embeds: [errembed], components: [] });
		// 改變狀態
		issomeoneauthorizing = false;
	}
}
