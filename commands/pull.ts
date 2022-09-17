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
	if (i.user.id == process.env.BOT_OWNER) {
		const errembed = new EmbedBuilder()
			.setColor(0xf00000)
			.setTitle('error!')
			.setDescription('You are not the creator of this bot.');
		await i.reply({ embeds: [errembed], ephemeral: true });
		return;
	}
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
