import { ButtonInteraction } from 'discord.js';
import {
	// GetAndEditButtonActionRow,
	GetAuthenticatedOctokit,
} from '../../../utility/github.js';
import { DeferUpdate } from '../../../utility/other.js';
import { loaduser } from './load.js';

export async function execute(interaction: ButtonInteraction, query: string[]) {
	// deferupdate
	await DeferUpdate(interaction);
	// check stared
	const isstared = interaction.component.emoji?.name == '🔔';
	// get user
	const user = query[0];
	// get Octokit Instance
	const octokit = await GetAuthenticatedOctokit(interaction.user.id);
	// toggle star
	if (!octokit) return;
	if (isstared) {
		await octokit.rest.users.unfollow({
			username: user,
		});
	} else {
		await octokit.rest.users.follow({
			username: user,
		});
	}
	// 取得儲存庫資料
	const updatedata = await loaduser([user], interaction.user.id);
	await interaction.editReply(updatedata);
}
