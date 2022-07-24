import { Player, Song } from 'discord-music-player';
import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SelectMenuBuilder,
	SelectMenuInteraction,
	SelectMenuOptionBuilder,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import { URL } from 'url';
import ytsr from 'ytsr';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('music')
		.setDescription('Play a music in the voice channel.')
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('play')
				.setDescription('Play a music in the voice channel.')
				.addStringOption(
					new SlashCommandStringOption()
						.setName('keyword')
						.setDescription('URL or search query of the video.')
						.setRequired(true)
				)
		),
	execute: async (i: ChatInputCommandInteraction, player: Player) => {
		if (!i.guild) {
			i.reply({
				content: 'You cannot execute this command in DM.',
				ephemeral: true,
			});
			return;
		}
		if (!i.inCachedGuild()) {
			return;
		}
		if (!i.member.voice.channel) {
			i.reply({
				content: 'You need to join a voice channel to execute this command.',
				ephemeral: true,
			});
			return;
		}
		const guildqueue = player.getQueue(i.guild.id);
		if (i.options.getSubcommand() == 'play') {
			await i.deferReply({
				ephemeral: false,
			});
			const keyword = i.options.getString('keyword', true);
			if (!isUrl(keyword)) {
				const result = await ytsr(keyword, { limit: 25 });
				var menu = new SelectMenuBuilder()
					.setCustomId('music.search')
					.setPlaceholder('select result');
				result.items.forEach((e) => {
					if (e.type == 'video') {
						menu.addOptions(
							new SelectMenuOptionBuilder()
								.setLabel(e.title)
								.setDescription(
									`🎤${e.author?.name || 'unknown'} ⏱️${e.duration} ⬆️${
										e.uploadedAt
									}`
								)
								.setValue(e.url)
						);
					}
				});
				const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu);
				const embed = new EmbedBuilder()
					.setColor(0x000000)
					.setTitle('Search')
					.setDescription('Please select a search result');
				i.editReply({
					embeds: [embed],
					components: [row],
				});
				return;
			}
			const queue = player.createQueue(i.guild.id);
			await queue.join(i.member.voice.channel?.id);
			const song = await queue.play(keyword).catch((err) => {
				console.error(err);
				if (!guildqueue) {
					queue.stop();
				}
				i.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			});
			const embed = getsongembed(song as Song);
			i.editReply({ embeds: [embed] });
		}
	},
	executeMenu: async (i: SelectMenuInteraction, player: Player) => {
		if (!i.guild) {
			return;
		}
		if (!i.inCachedGuild()) {
			return;
		}
		if (!i.member.voice.channel) {
			i.reply({
				content: 'You need to join a voice channel to execute this command.',
				ephemeral: true,
			});
			return;
		}
		await i.deferUpdate();
		const url = i.values[0];
		const queue = player.createQueue(i.guild.id);
		await queue.join(i.member.voice.channel?.id);
		const song = await queue.play(url);
		const embed = getsongembed(song);
		i.editReply({ embeds: [embed], components: [] });
	},
};

function isUrl(s: string): Boolean {
	try {
		new URL(s);
		return true;
	} catch (error) {
		return false;
	}
}

function getsongembed(song: Song) {
	return new EmbedBuilder()
		.setColor(0x000000)
		.setTitle(song.name)
		.setDescription(`> 🎤 ${song.author}\n> ⏱️ ${song.duration}\n> 🔗 ${song.url}`)
		.setThumbnail(song.thumbnail);
}
