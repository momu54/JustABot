import {
	AuditLogEvent,
	ChannelType,
	NonThreadGuildBasedChannel,
	VoiceState,
} from 'discord.js';
import { isChannelCreatedByBot } from '../utility/voice';

export async function execute(oldvoice: VoiceState, voice: VoiceState): Promise<void> {
	const channel = voice.channel;
	const category = channel?.parent;
	const oldchannel = oldvoice.channel;
	const oldcategory = oldchannel?.parent;
	const CreatableChannel = oldcategory?.children.cache.find((c) =>
		c.name.startsWith('[create]')
	);
	if (!voice.guild) return;
	if (channel?.name.startsWith('[create]') && category) {
		if (oldchannel?.name.startsWith('[bot]') && category == oldcategory) {
			await voice.setChannel(oldchannel);
			return;
		}
		const newchannel = await category.children.create({
			name: `[bot]${voice.member?.displayName}'schannel`,
			type: ChannelType.GuildVoice,
		});
		await voice.setChannel(newchannel);
	}
	if (
		oldchannel?.name.startsWith('[bot]') &&
		oldchannel?.members.size == 0 &&
		oldcategory &&
		CreatableChannel
	) {
		await oldchannel?.delete();
	}
}

export async function ExecuteChannelCreate(c: NonThreadGuildBasedChannel) {
	if (isChannelCreatedByBot(c) && c.type == ChannelType.GuildVoice) {
		const name = c.name;
		const fetchres = await c.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.ChannelCreate,
		});
		const log = fetchres.entries.first();
		if (!log?.executor?.bot) {
			await c.setName(
				name == '[bot]' || name == '[create]'
					? 'ThisNameIsReserved'
					: name
							.replace('[create]', '[ThisNameIsReserved]')
							.replace('[bot]', '[ThisNameIsReserved]')
			);
		}
	}
}
