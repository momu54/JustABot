import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { Octokit } from '@octokit/rest';
import { TokenDB } from '../typings/type.js';
import { tokendb } from './database.js';
import { readFile } from 'fs/promises';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonComponent,
	ButtonInteraction,
} from 'discord.js';

async function CheckTokenExpired(res?: TokenDB) {
	if (!res) return;
	// 取得時間
	const now = new Date().getTime();
	const authat = new Date(res.timestamp).getTime();
	if (now - authat >= 31556952000) {
		await tokendb.run(`DELETE FROM accounts WHERE Discord="${res.Discord}"`);
	} else return;
}

export async function GetToken(user: string) {
	// 從資料庫取得token
	const token = await tokendb.get<TokenDB>(
		`SELECT * FROM accounts WHERE Discord="${user}"`
	);
	// 確認 token 是否過期
	await CheckTokenExpired(token);
	return token;
}

// 使用app授權
const auth = createOAuthAppAuth({
	clientId: process.env.githubclientid!,
	clientSecret: process.env.githubclientsecret!,
	clientType: 'oauth-app',
});
// 建立Octokit實例
export const appoctokit: Octokit = new Octokit({
	auth: auth,
	authStrategy: createOAuthAppAuth,
});

const stylecss: Buffer = await readFile('./utility/mdstyle.css');

export const stylehtml: string = `<style>${stylecss}</style>`;

export function GetAndEditButtonActionRow(
	interaction: ButtonInteraction,
	index: number,
	teststr: string,
	whentrue: string,
	isemoji: boolean = false
): ActionRowBuilder<ButtonBuilder> {
	const interactionbtn = interaction.component;
	const filteredcomponents = interaction.message.components[0].components.filter(
		(btn) => btn != interaction.component
	) as ButtonComponent[];
	const mappedcomponents = filteredcomponents.map((btn) => ButtonBuilder.from(btn));
	mappedcomponents.splice(
		index,
		0,
		ButtonBuilder.from(interaction.component).setLabel(
			isemoji
				? interactionbtn.emoji == teststr
					? whentrue
					: teststr
				: interactionbtn.label == teststr
				? whentrue
				: teststr
		)
	);
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(mappedcomponents);
	return row;
}

export async function GetAuthenticatedOctokit(user: string): Promise<Octokit | false> {
	const tokenres = await GetToken(user);
	if (tokenres)
		return new Octokit({
			auth: tokenres.Token,
		});
	else return false;
}
