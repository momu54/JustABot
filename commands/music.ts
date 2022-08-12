import { Player, Playlist, RepeatMode, Song } from 'discord-music-player';
import {
	ActionRowBuilder,
	bold,
	ButtonStyle,
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
import {
	InteractionPagination,
	NextPageButton,
	PreviousPageButton,
} from 'djs-button-pages';
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
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('volume')
				.setDescription('Shows how to adjust the volume.')
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('clear')
				.setDescription('Clear the current queue.')
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('shuffle')
				.setDescription('Shuffles the Queue.')
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('queue')
				.setDescription('Shows the current queue.')
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
			const keyword = i.options.getString('keyword', true);
			if (!isUrl(keyword)) {
				await i.deferReply({
					ephemeral: true,
				});
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
			await i.deferReply();
			const queue = player.createQueue(i.guild.id);
			await queue.join(i.member.voice.channel?.id);
			if (keyword.includes('/playlist/') || keyword.includes('&list=')) {
				var list: Playlist;
				try {
					list = await queue.playlist(keyword);
				} catch (err) {
					if (!guildqueue) {
						queue.stop();
					}
					const errembed = new EmbedBuilder()
						.setColor(0xffffff)
						.setTitle('error')
						.setDescription("Can't find playlist.");
					await i.editReply({ embeds: [errembed] });
					return;
				}
				const embed = new EmbedBuilder()
					.setColor(0xffffff)
					.setTitle(list.name)
					.setDescription(`> 👤 ${list.author}\n> 🔗 ${list.url}`);
				embed.setAuthor({
					name: i.user.tag,
					iconURL: i.user.displayAvatarURL(),
				});
				await i.editReply({ embeds: [embed] });
				return;
			}
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
					.setDescription("Can't find song.");
				await i.editReply({ embeds: [errembed] });
				return;
			}
			const embed = getsongembed(song);
			embed.setAuthor({
				name: i.user.tag,
				iconURL: i.user.displayAvatarURL(),
			});
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
		} else if (subcmd == 'volume') {
			const embed = new EmbedBuilder()
				.setColor(0xffffff)
				.setTitle('volume')
				.setDescription(
					'Right-click on a bot in a voice channel to adjust volume'
				)
				.setImage(
					'https://cdn.discordapp.com/attachments/985143172655091792/1004930485706838106/7d75c2f90abb256b.gif'
				);
			await i.reply({ embeds: [embed], ephemeral: true });
		} else if (subcmd == 'clear') {
			guildqueue.clearQueue();
			const embed = new EmbedBuilder().setColor(0xffffff).setTitle('cleared!');
			await i.reply({ embeds: [embed] });
		} else if (subcmd == 'shuffle') {
			guildqueue.shuffle();
			const embed = new EmbedBuilder().setColor(0xffffff).setTitle('shuffled!');
			await i.reply({ embeds: [embed] });
		} else if (subcmd == 'queue') {
			const songs = guildqueue.songs;
			const pagelength = Math.ceil(songs.length / 10);
			var pages: EmbedBuilder[] = [];
			for (let i = 0; i < pagelength; i++) {
				var desc = '';
				for (let index = 10 * i; index < index + 10; index++) {
					const song = songs[index];
					if (!song) break;
					desc += `${index}. [${song.name}](${song.url})`;
				}
				pages.push(
					new EmbedBuilder()
						.setColor(0xffffff)
						.setTitle('queue')
						.setDescription(desc)
						.setFooter({
							text: `Pages: ${i}/${pagelength}`,
						})
				);
			}
			const buttons = [
				new PreviousPageButton().setStyle({
					custom_id: 'music.queue.prev',
					emoji: '➡️',
					style: ButtonStyle.Primary,
				}),
				new NextPageButton().setStyle({
					custom_id: 'music.queue.next',
					emoji: '⬅️',
					style: ButtonStyle.Primary,
				}),
			];
			const pagination = new InteractionPagination()
				.setButtons(buttons)
				.setEmbeds(pages);
			pagination.send(i);
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
		const url = i.values[0];
		const selection = i.component.options.filter((item) => {
			return item.value == url;
		})[0];
		const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			SelectMenuBuilder.from(i.component)
				.setDisabled(true)
				.setPlaceholder(selection.label)
		);
		await i.update({ components: [row] });
		const queue = player.createQueue(i.guild.id);
		await queue.join(i.member.voice.channel?.id);
		const song = await queue.play(url);
		const embed = getsongembed(song);
		embed.setAuthor({
			name: i.user.tag,
			iconURL: i.user.displayAvatarURL(),
		});
		await i.channel?.send({ embeds: [embed] });
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

function getsongembed(song: Song): EmbedBuilder {
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
