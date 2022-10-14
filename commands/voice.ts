import {
	ChannelType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandChannelOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { isChannelCreatedByBot } from '../utility/voice.js';

export const data = new SlashCommandBuilder()
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
							.setDescription('The creatable channel name you want to set.')
							.setRequired(false)
					)
			)
			.addSubcommand(
				new SlashCommandSubcommandBuilder()
					.setName('remove')
					.setDescription('Remove the voice channel category.')
					.addChannelOption(
						new SlashCommandChannelOption()
							.setName('category')
							.setDescription('The voice category you want to remove.')
							.setRequired(true)
							.addChannelTypes(ChannelType.GuildCategory)
					)
			)
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	if (!interaction.inCachedGuild()) return;
	const subcmdgroup = interaction.options.getSubcommandGroup(true);
	const subcmd = interaction.options.getSubcommand(true);
	if (subcmdgroup == 'category') {
		const category = interaction.options.getChannel('category', true);
		if (category.type !== ChannelType.GuildCategory) return;
		if (subcmd == 'set') {
			const channelName = interaction.options.getString('channelname', false);
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
			await interaction.reply({ embeds: [embed], ephemeral: true });
		} else if (subcmd == 'remove') {
			const channel = category.children.cache.find((c) =>
				c.name.startsWith('[create]')
			);
			if (channel) {
				await channel.delete();
				const embed = new EmbedBuilder()
					.setColor(0xffffff)
					.setTitle('voice category')
					.setDescription('Category successfully remove.');
				await interaction.reply({ embeds: [embed], ephemeral: true });
			} else {
				const errembed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle('error!')
					.setDescription('This category was not created by bots.');
				await interaction.reply({ embeds: [errembed], ephemeral: true });
			}
		}
	}
}
