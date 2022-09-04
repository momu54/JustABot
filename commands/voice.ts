import {
	//ActionRowBuilder,
	ChannelType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	//ModalBuilder,
	SlashCommandBuilder,
	SlashCommandChannelOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	//TextInputBuilder,
	//TextInputStyle,
} from 'discord.js';
import { isChannelCreatedByBot } from '../utility/voice';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('voice')
		.setDescription('Voice channel commands.')
		.addSubcommandGroup(
			new SlashCommandSubcommandGroupBuilder()
				.setName('category')
				.setDescription('Voice channel category commands.')
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName('set')
						.setDescription('Set the category to the voice channel category.')
						.addChannelOption(
							new SlashCommandChannelOption()
								.setName('category')
								.setDescription('The category you want to set.')
								.addChannelTypes(ChannelType.GuildCategory)
								.setRequired(true)
						)
						.addStringOption(
							new SlashCommandStringOption()
								.setName('channelname')
								.setDescription(
									'The creatable channel name you want to set.'
								)
								.setRequired(false)
						)
				)
		),
	execute: async (i: ChatInputCommandInteraction) => {
		if (!i.inCachedGuild()) return;
		const subcmdgroup = i.options.getSubcommandGroup(true);
		const subcmd = i.options.getSubcommand(true);
		if (subcmdgroup == 'category') {
			if (subcmd == 'set') {
				const category = i.options.getChannel('category', true);
				const channelName = i.options.getString('channelname', false);
				if (category.type !== ChannelType.GuildCategory) return;
				for (const e of category.children.cache) {
					const channel = e[1];
					if (isChannelCreatedByBot(channel)) {
						await channel.delete();
					}
				}
				await category.children.create({
					name: channelName ? `[create]${channelName}` : '[create]',
					type: ChannelType.GuildVoice,
				});
				const embed = new EmbedBuilder()
					.setColor(0xffffff)
					.setTitle('voice category')
					.setDescription('Category successfully set.');
				await i.reply({ embeds: [embed], ephemeral: true });
			}
		}
	},
};
