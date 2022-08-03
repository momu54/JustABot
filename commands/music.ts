import { Player, RepeatMode, Song } from 'discord-music-player';
import {
	ActionRowBuilder,
	bold,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SelectMenuBuilder,
	SelectMenuInteraction,
	SelectMenuOptionBuilder,
	SlashCommandBuilder,
	SlashCommandNumberOption,
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
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('skip')
				.setDescription('Skip the current song.')
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('stop')
				.setDescription('Stop the current player.')
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('loop')
				.setDescription('Toggle repeat mode.')
				.addNumberOption(
					new SlashCommandNumberOption()
						.setName('mode')
						.setDescription('Repeat mode')
						.setRequired(true)
						.addChoices({
							name: 'Repeat track',
							value: RepeatMode.SONG,
						})
						.addChoices({
							name: 'Repeat queue',
							value: RepeatMode.QUEUE,
						})
						.addChoices({
							name: 'No repeat',
							value: RepeatMode.DISABLED,
						})
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
		const subcmd = i.options.getSubcommand();
		if (subcmd == 'play') {
			await i.deferReply({
				ephemeral: false,
			});
			const keyword = i.options.getString('keyword', true);
			if (!isUrl(keyword)) {
				const result = await ytsr(keyword, { limit: 25 });
				var menu = new SelectMenuBuilder()
					.setCustomId('music.search')
					.setPlaceholder('select result');
				for (const item of result.items) {
					if (item.type == 'video') {
						menu.addOptions(
							new SelectMenuOptionBuilder()
								.setLabel(item.title)
								.setDescription(
									`🎤${item.author?.name || 'unknown'} ⏱️${
										item.duration
									} ⬆️${item.uploadedAt}`
								)
								.setValue(item.url)
						);
					}
				}
				const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu);
				const embed = new EmbedBuilder()
					.setColor(0xffffff)
					.setTitle('Search')
					.setDescription('Please select a search result');
				await i.editReply({
					embeds: [embed],
					components: [row],
				});
				return;
			}
			const queue = player.createQueue(i.guild.id);
			await queue.join(i.member.voice.channel?.id);
			var song: Song;
			try {
				song = await queue.play(keyword);
			} catch (err) {
				if (!guildqueue) {
					queue.stop();
				}
				const errembed = new EmbedBuilder()
					.setColor(0xffffff)
					.setTitle('error')
					.setDescription("Can't find song");
				await i.editReply({ embeds: [errembed] });
				return;
			}
			const embed = getsongembed(song as Song);
			await i.editReply({ embeds: [embed] });
			return;
		}
		if (!guildqueue?.isPlaying) {
			const errembed = new EmbedBuilder()
				.setColor(0xffffff)
				.setTitle('error')
				.setDescription('No songs are currently playing.');
			await i.reply({ embeds: [errembed] });
			return;
		}
		if (subcmd == 'skip') {
			const song = guildqueue.skip();
			guildqueue.skip();
			const embed = getsongembed(song);
			embed.setTitle(`Skiped ${embed.data.title}`);
			await i.reply({ embeds: [embed] });
		} else if (subcmd == 'stop') {
			guildqueue.stop();
			const embed = new EmbedBuilder().setColor(0xffffff).setTitle('stoped!');
			await i.reply({ embeds: [embed] });
		} else if (subcmd == 'loop') {
			const mode = i.options.getNumber('mode', true);
			guildqueue.setRepeatMode(mode);
			const embed = new EmbedBuilder()
				.setColor(0xffffff)
				.setTitle('loop')
				.setDescription(
					`Success set repeat mode to ${bold(getRepeatMode(mode))}`
				);
			await i.reply({ embeds: [embed] });
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
		await i.editReply({ embeds: [embed], components: [] });
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
		.setColor(0xffffff)
		.setTitle(song.name)
		.setDescription(`> 🎤 ${song.author}\n> ⏱️ ${song.duration}\n> 🔗 ${song.url}`)
		.setImage(song.thumbnail);
}

function getRepeatMode(mode: RepeatMode): string {
	if (mode === RepeatMode.SONG) {
		return 'Repeat track';
	} else if (mode === RepeatMode.QUEUE) {
		return 'Repeat queue';
	} else {
		return 'No repeat';
	}
}
