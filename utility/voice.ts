import { GuildBasedChannel } from 'discord.js';

export function isChannelCreatedByBot(channel: GuildBasedChannel) {
	const name = channel.name;
	return name.startsWith('[create]') || name.startsWith('[bot]');
}
