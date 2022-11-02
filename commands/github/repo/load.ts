import { AttachmentBuilder, EmbedBuilder, WebhookEditMessageOptions } from 'discord.js';
import { launch } from 'puppeteer';
import { appoctokit, stylehtml } from '../../../utility/github.js';

export async function loadrepo(values: string[]) {
	// 取得儲存庫名稱及所有者
	const repofullname = values[0];
	const reponamedata = repofullname.split('/');
	const reponame = reponamedata[1];
	const repoowner = reponamedata[0];
	// 取得儲存庫資訊
	const { data } = await appoctokit.rest.repos.get({
		repo: reponame,
		owner: repoowner,
	});
	// 取得 readme
	const readme: any = await appoctokit.rest.repos
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
	// 建立 embed
	const embed = new EmbedBuilder()
		.setTitle(data.full_name)
		.setDescription(data.description)
		.setAuthor({ name: data.owner.login, iconURL: data.owner.avatar_url })
		.setColor(0xffffff);
	// 回傳資料
	const msgplayload: WebhookEditMessageOptions = {
		embeds: [embed],
		components: [],
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
