import { exec } from 'child_process';
import {
	ChatInputCommandInteraction,
	codeBlock,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('pull')
	.setDescription('Pull the code from github.');

export async function execute(i: ChatInputCommandInteraction) {
	exec('git pull', async (err, stdout, stderr) => {
		if (err) {
			const errembed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('error!')
				.setDescription(codeBlock('js', stderr));
			await i.reply({ embeds: [errembed], ephemeral: true });
			return;
		}
		const embed = new EmbedBuilder()
			.setColor(0xffffff)
			.setTitle('pull')
			.setDescription(codeBlock('js', stdout));
		await i.reply({ embeds: [embed], ephemeral: true });
	});
}
