import { ButtonInteraction } from 'discord.js';
import {
	// GetAndEditButtonActionRow,
	GetAuthenticatedOctokit,
} from '../../../utility/github.js';
import { DeferUpdate } from '../../../utility/other.js';
import { loadrepo } from './load.js';

export async function execute(interaction: ButtonInteraction, query: string[]) {
	// deferupdate
	await DeferUpdate(interaction);
	// check stared
	const isstared = interaction.component.label?.includes('★');
	// get repo
	const repoowner = query[0];
	const reponame = query[1];
	// get Octokit Instance
	const octokit = await GetAuthenticatedOctokit(interaction.user.id);
	// // get row
	// const row = GetAndEditButtonActionRow(interaction, 0, '☆', '★');
	// toggle star
	if (!octokit) return;
	if (isstared) {
		await octokit.rest.activity.unstarRepoForAuthenticatedUser({
			repo: reponame,
			owner: repoowner,
		});
	} else {
		await octokit.rest.activity.starRepoForAuthenticatedUser({
			repo: reponame,
			owner: repoowner,
		});
	}
	// 取得儲存庫資料
	const updatedata = await loadrepo([`${repoowner}/${reponame}`], interaction.user.id);
	//	updatedata.components = [row];
	await interaction.editReply(updatedata);
}
