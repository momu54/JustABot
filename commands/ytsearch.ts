import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SelectMenuBuilder,
	SelectMenuInteraction,
	SelectMenuOptionBuilder,
	SlashCommandBuilder,
	SlashCommandStringOption,
} from 'discord.js';
import ytsr, { Video } from 'ytsr';

export const data = new SlashCommandBuilder()
	.setName('ytsearch')
	.setDescription('search for videos on youtube.')
	.addStringOption(
		new SlashCommandStringOption()
			.setName('keyword')
			.setDescription('Keyword to search.')
			.setRequired(true)
	);

export async function execute(i: ChatInputCommandInteraction) {
	await i.deferReply({ ephemeral: true });
	const keyword = i.options.getString('keyword', true);
	const res = (
		await ytsr(keyword, {
			limit: 25,
		})
	).items;
	const videos = res.filter((item) => item.type == 'video') as Video[];
	const VideoOptions = videos.map((video) =>
		new SelectMenuOptionBuilder()
			.setEmoji('🎬')
			.setLabel(video.title.slice(0, 100))
			.setDescription(
				`👤${video.author?.name || 'unknown'} ⏱️${video.duration} ⬆️${
					video.uploadedAt
				}`
			)
			.setValue(video.url)
	);
	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
		new SelectMenuBuilder()
			.setCustomId('ytsearch.result')
			.addOptions(VideoOptions)
			.setPlaceholder('Select result...')
	);
	await i.editReply({ components: [row] });
}

export async function executeMenu(i: SelectMenuInteraction) {
	await i.deferUpdate();
	const url = i.values[0];
	const res = (await ytsr(url, { limit: 1 })).items[0];
	if (res.type != 'video') return;
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle(res.title)
		.setDescription(
			`> 🎤 ${res.author?.name || 'unknown'}\n> ⏱️ ${res.duration}\n> 🔗 ${
				res.url
			}\n> ⬆️ ${res.uploadedAt}`
		)
		.setImage(res.bestThumbnail.url);
	await i.editReply({ embeds: [embed], components: [] });
}
