import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionReplyOptions,
	SlashCommandBuilder,
} from 'discord.js';
import { InRange } from '../utility/range.js';
import { setTimeout } from 'timers/promises';
import '../utility/database.js';
import { tokendb } from '../utility/database.js';
import { AuthorizedUserCache, GithubEtags, TokenDB } from '../typings/type.js';
import { AccessToken, User } from '../typings/github.js';
// 建立是否有人授權的狀態機
let issomeoneauthorizing = false;
// 建立使用者快取變數
const usercache: AuthorizedUserCache = {};
const useretags: GithubEtags = {};

export const data = new SlashCommandBuilder()
	.setName('github')
	.setDescription('Github account.');

export async function execute(interaction: ChatInputCommandInteraction) {
	// 建立embed
	let embed;
	// 從資料庫取得token
	const token = await tokendb.get<TokenDB>(
		`SELECT Token FROM accounts WHERE Discord="${interaction.user.id}"`
	);
	// 如果token存在
	if (token) {
		// 取得使用者
		const res = await fetch('https://api.github.com/user', {
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${token.Token}`,
				'If-None-Match': useretags[interaction.user.id],
			},
		});
		let jsonres: User;
		if (res.status == 304) {
			jsonres = usercache[interaction.user.id];
		} else {
			jsonres = await res.json();
			usercache[interaction.user.id] = jsonres;
			useretags[interaction.user.id] = res.headers.get('ETag')!;
		}
		// 取得json回應
		embed = new EmbedBuilder()
			.setTitle('Github account')
			.setDescription('Manage your github account.')
			.setAuthor({
				iconURL: jsonres.avatar_url,
				name: jsonres.login,
			})
			.setColor(0xffffff);
	}
	// 建立按鈕
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
				.setDisabled()
		);
	let replydata: InteractionReplyOptions;
	// 如果embed存在
	if (embed) {
		replydata = {
			embeds: [embed],
			components: [row],
			ephemeral: true,
		};
	} else {
		replydata = {
			components: [row],
			ephemeral: true,
		};
	}
	await interaction.reply(replydata);
}

export async function executeBtn(interaction: ButtonInteraction) {
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
			await interaction.reply({ embeds: [errembed], ephemeral: true });
			return;
		}
		// 改變狀態
		issomeoneauthorizing = true;
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
		// 取得json回應
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
		await interaction.editReply({ embeds: [embed], components: [row] });
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
			const pollsjsonres: AccessToken = await res.json();
			// 如果完成登入
			if (!pollsjsonres.error) {
				// 建立embed
				const embed = new EmbedBuilder()
					.setColor(0x00ff00)
					.setTitle('Link Github account')
					.setDescription('✅ Done!');
				// 修改回應
				await interaction.editReply({ embeds: [embed], components: [] });
				// 加入資料庫
				await tokendb.run('INSERT INTO accounts VALUES(?, ?)', [
					interaction.user.id,
					pollsjsonres.access_token,
				]);
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
		await interaction.editReply({ embeds: [errembed], components: [] });
		// 改變狀態
		issomeoneauthorizing = false;
	} else if (action == 'unlink') {
		// 移除資料庫
		await tokendb.run(`DELETE FROM accounts WHERE Discord=${interaction.user.id}`);
		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle('Unlink Github account')
			.setDescription('✅ Done!');
		await interaction.editReply({ embeds: [embed], components: [] });
	}
}
