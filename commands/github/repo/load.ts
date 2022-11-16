import { OctokitResponse } from '@octokit/types';
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	WebhookEditMessageOptions,
} from 'discord.js';
import { launch } from 'puppeteer';
import {
	appoctokit,
	GetAuthenticatedOctokit,
	stylehtml,
} from '../../../utility/github.js';

export async function loadrepo(
	values: string[],
	user: string
): Promise<WebhookEditMessageOptions> {
	// 取得儲存庫名稱及所有者
	const repofullname = values[0];
	const reponamedata = repofullname.split('/');
	const reponame = reponamedata[1];
	const repoowner = reponamedata[0];
	// get octokit
	let octokit = await GetAuthenticatedOctokit(user);
	if (!octokit) octokit = appoctokit;
	// 取得儲存庫資訊
	const { data: repo } = await octokit.rest.repos.get({
		repo: reponame,
		owner: repoowner,
	});
	// FIXME: any type
	// 取得 readme
	const readme: any = await octokit.rest.repos
		.getReadme({
			repo: reponame,
			owner: repoowner,
			mediaType: {
				format: 'html',
			},
		})
		.catch((err) => {
			return {
				data: '',
				status: err.status,
			};
		});
	// create button
	const button = new ButtonBuilder()
		.setCustomId(`github.repo.star?${repoowner},${reponame}`)
		.setDisabled(true)
		.setStyle(ButtonStyle.Primary);
	let isstaredstatuscode: number = 404;
	if (octokit) {
		// get star status
		({ status: isstaredstatuscode } = await octokit.rest.activity
			.checkRepoIsStarredByAuthenticatedUser({
				repo: reponame,
				owner: repoowner,
			})
			.catch((res: OctokitResponse<never, 404>) => res));
		// enable star button
		button.setDisabled(false);
	}
	// 建立 embed
	const embed = new EmbedBuilder()
		.setTitle(repo.full_name)
		.setDescription(repo.description)
		.setAuthor({ name: repo.owner.login, iconURL: repo.owner.avatar_url })
		.setColor(0xffffff);
	// create actionrow
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`github.repo.star?${repoowner},${reponame}`)
			.setDisabled(!octokit)
			.setLabel(isstaredstatuscode == 204 ? '★' : '☆')
			.setStyle(ButtonStyle.Primary)
	);
	// 準備要回傳的資料
	const msgplayload: WebhookEditMessageOptions = {
		embeds: [embed],
		components: [row],
	};
	if (readme.status == 200) {
		// 啟動樓覽器
		const browser = await launch({
			defaultViewport: {
				width: 1200,
				height: 1000,
			},
			args: ['--no-sandbox'],
		});
		// 開啟新分頁
		const page = await browser.newPage();
		// 載入 html
		await page.setContent(stylehtml + readme.data);
		// 截圖
		const img = await page.screenshot({
			quality: 100,
			type: 'webp',
			encoding: 'binary',
		});
		// 建構附件
		const attachment = new AttachmentBuilder(img, { name: 'readme.webp' });
		// 加入附件
		msgplayload.files = [attachment];
		embed.setImage('attachment://readme.webp');
	}
	return msgplayload;
}
