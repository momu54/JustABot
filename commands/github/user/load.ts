import { OctokitResponse } from '@octokit/types';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	WebhookEditMessageOptions,
} from 'discord.js';
import { appoctokit, GetAuthenticatedOctokit } from '../../../utility/github.js';
import { setTimeout } from 'timers/promises';

export async function loaduser(
	values: string[],
	user: string
): Promise<WebhookEditMessageOptions> {
	// get octokit
	let octokit = await GetAuthenticatedOctokit(user);
	const authed = !!octokit;
	if (!octokit) octokit = appoctokit;
	// get keyword
	const keyword = values[0];
	await setTimeout(1000);
	// get user data
	const { data: ghuser } = await octokit.rest.users.getByUsername({
		username: keyword,
	});
	// 建立 embed
	const embed = new EmbedBuilder()
		.setTitle(ghuser.login)
		.setDescription(ghuser.bio)
		.setThumbnail(ghuser.avatar_url)
		.setColor(0xffffff);
	// check follow status
	let isfollowedstatuscode: number = 404;
	if (octokit) {
		({ status: isfollowedstatuscode } = await octokit.rest.users
			.checkPersonIsFollowedByAuthenticated({
				username: ghuser.login,
			})
			.catch((res: OctokitResponse<never, 404>) => res));
	}
	// create actionrow
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`github.user.follow?${ghuser.login}`)
			.setDisabled(!authed)
			.setEmoji(isfollowedstatuscode == 204 ? '🔔' : '🔕')
			.setLabel(ghuser.followers.toString())
			.setStyle(ButtonStyle.Primary)
	);
	// 準備要回傳的資料
	const msgplayload: WebhookEditMessageOptions = {
		embeds: [embed],
		components: [row],
	};
	return msgplayload;
}
