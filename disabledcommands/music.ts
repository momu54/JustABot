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
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('nowplaying')
				.setDescription('Shows the currently playing song.')
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('pause')
				.setDescription('Pauses the current player.')
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('resume')
				.setDescription('Resumes the current player.')
		),
	execute: async (interaction: ChatInputCommandInteraction, player: Player) => {
		if (!interaction.guild) {
			const errembed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('error!')
				.setDescription('You cannot execute this command in DM.');
			await interaction.reply({
				embeds: [errembed],
				ephemeral: true,
			});
			return;
		}
		if (!interaction.inCachedGuild()) return;
		if (!interaction.member.voice.channel) {
			const errembed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('error!')
				.setDescription(
					'You need to join a voice channel to execute this command.'
				);
			await interaction.reply({
				embeds: [errembed],
				ephemeral: true,
			});
			return;
		}
		const queue = player.getQueue(interaction.guild.id);
		const subcmd = interaction.options.getSubcommand();
		if (subcmd == 'play') {
			const keyword = interaction.options.getString('keyword', true);
			if (!isUrl(keyword)) {
				await interaction.deferReply({
					ephemeral: true,
				});
				const result = await ytsr(keyword, { limit: 25 });
				let menu = new SelectMenuBuilder()
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
				await interaction.editReply({
					embeds: [embed],
					components: [row],
				});
				return;
			}
			await interaction.deferReply();
			const newqueue = player.createQueue(interaction.guild.id);
			await newqueue.join(interaction.member.voice.channel?.id);
			if (keyword.includes('/playlist/') || keyword.includes('&list=')) {
				let list: Playlist;
				try {
					list = await newqueue.playlist(keyword);
				} catch (err) {
					if (!queue) {
						newqueue.stop();
					}
					const errembed = new EmbedBuilder()
						.setColor(0xff0000)
						.setTitle('error!')
						.setDescription("Can't find playlist.");
					await interaction.editReply({ embeds: [errembed] });
					return;
				}
				const embed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle(list.name)
					.setDescription(`> 👤 ${list.author}\n> 🔗 ${list.url}`);
				embed.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL(),
				});
				await interaction.editReply({ embeds: [embed] });
				return;
			}
			let song: Song;
			try {
				song = await newqueue.play(keyword);
			} catch (err) {
				if (!queue) {
					newqueue.stop();
				}
				const errembed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle('error!')
					.setDescription("Can't find song.");
				await interaction.editReply({ embeds: [errembed] });
				return;
			}
			const embed = getsongembed(song);
			embed.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL(),
			});
			await interaction.editReply({ embeds: [embed] });
			return;
		} else if (subcmd == 'volume') {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('volume')
				.setDescription(
					'Right-click on a bot in a voice channel to adjust volume'
				)
				.setImage(
					'https://cdn.discordapp.com/attachments/985143172655091792/1004930485706838106/7d75c2f90abb256b.gif'
				);
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
		if (!queue?.isPlaying) {
			const errembed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('error!')
				.setDescription('No songs are currently playing.');
			await interaction.reply({ embeds: [errembed], ephemeral: true });
			return;
		}
		if (subcmd == 'skip') {
			const song = queue.skip();
			queue.skip();
			const embed = getsongembed(song);
			embed.setTitle(`skiped: ${embed.data.title}`);
			await interaction.reply({ embeds: [embed] });
		} else if (subcmd == 'stop') {
			queue.stop();
			const embed = new EmbedBuilder().setColor(0xffffff).setTitle('stoped!');
			await interaction.reply({ embeds: [embed] });
		} else if (subcmd == 'loop') {
			const mode = interaction.options.getNumber('mode', true);
			queue.setRepeatMode(mode);
			const embed = new EmbedBuilder()
				.setColor(0xffffff)
				.setTitle('loop')
				.setDescription(
					`Success set repeat mode to ${bold(getRepeatMode(mode))}`
				);
			await interaction.reply({ embeds: [embed] });
		} else if (subcmd == 'clear') {
			queue.clearQueue();
			const embed = new EmbedBuilder().setColor(0xffffff).setTitle('cleared!');
			await interaction.reply({ embeds: [embed] });
		} else if (subcmd == 'shuffle') {
			queue.shuffle();
			const embed = new EmbedBuilder().setColor(0xffffff).setTitle('shuffled!');
			await interaction.reply({ embeds: [embed] });
		} else if (subcmd == 'queue') {
			const songs = queue.songs;
			const pagelength = Math.ceil(songs.length / 10);
			let pages: EmbedBuilder[] = [];
			for (let i = 0; i < pagelength; i++) {
				let desc = '';
				const start = 10 * i;
				const end = start + 10;
				for (let index = start; index < end; index++) {
					const song = songs[index];
					if (!song) break;
					desc += `${index + 1}. [${song.name}](${song.url})\n`;
				}
				pages.push(
					new EmbedBuilder()
						.setColor(0xffffff)
						.setTitle('queue')
						.setDescription(desc)
						.setFooter({
							text: `pages: ${i + 1}/${pagelength}`,
						})
				);
			}
			const buttons = [
				new PreviousPageButton().setStyle({
					custom_id: 'music.queue.prev',
					emojinteraction: '<:left:1007601756705935440>',
					style: ButtonStyle.Primary,
				}),
				new NextPageButton().setStyle({
					custom_id: 'music.queue.next',
					emojinteraction: '<:right:1007601758392033321>',
					style: ButtonStyle.Primary,
				}),
			];
			let pagination = new InteractionPagination()
				.setButtons(buttons)
				.setEmbeds(pages)
				.setTime(880000);
			pagination.setOnStopAction(async () => {
				console.log('stoped!');
				const response = await interaction.fetchReply();
				const embed = EmbedBuilder.from(response.embeds[0]).setColor(0xff0000);
				embed.setFooter({
					text: `${embed.data.footer?.text} This menu has expired, please use '/music queue' again.`,
				});
				await interaction.editReply({ embeds: [embed] });
			});
			pagination.send(interaction);
		} else if (subcmd == 'nowplaying') {
			const song = queue.nowPlaying!;
			const embed = getsongembed(song);
			const bar = queue
				.createProgressBar({
					size: 40,
				})
				.prettier.replaceAll(' ', '  ');
			embed.setFooter({
				text:
					`${bar}\n` +
					'If you use the mobile client, the progress bar may have display problems.\n' +
					'Due to the font width, the further you play, the longer the overall length of the progress bar is likely to be.',
			});
			await interaction.reply({ embeds: [embed] });
		} else if (subcmd == 'pause') {
			queue.setPaused(true);
			const song = queue.nowPlaying!;
			const embed = getsongembed(song);
			embed.setTitle(`paused: ${embed.data.title}`);
			await interaction.reply({ embeds: [embed] });
		} else if (subcmd == 'resume') {
			queue.setPaused(false);
			const song = queue.nowPlaying!;
			const embed = getsongembed(song);
			embed.setTitle(`resumed: ${embed.data.title}`);
			await interaction.reply({ embeds: [embed] });
		}
	},
	executeMenu: async (interaction: SelectMenuInteraction, player: Player) => {
		if (!interaction.guild) return;
		if (!interaction.inCachedGuild()) return;
		if (!interaction.member.voice.channel) {
			const errembed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('error!')
				.setDescription(
					'You need to join a voice channel to execute this command.'
				);
			await interaction.reply({
				embeds: [errembed],
				ephemeral: true,
			});
			return;
		}
		const url = interaction.values[0];
		const selection = interaction.component.options.find((item) => {
			return item.value == url;
		});
		const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			SelectMenuBuilder.from(interaction.component)
				.setDisabled(true)
				.setPlaceholder(selection?.label!)
		);
		await interaction.update({ components: [row] });
		const queue = player.createQueue(interaction.guild.id);
		await queue.join(interaction.member.voice.channel?.id);
		const song = await queue.play(url);
		const embed = getsongembed(song);
		embed.setAuthor({
			name: interaction.user.tag,
			iconURL: interaction.user.displayAvatarURL(),
		});
		await interaction.channel?.send({ embeds: [embed] });
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
