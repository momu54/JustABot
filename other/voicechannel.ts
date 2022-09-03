import { ChannelType, VoiceState } from 'discord.js';

export async function execute(oldvoice: VoiceState, voice: VoiceState): Promise<void> {
	const channel = voice.channel;
	const category = channel?.parent;
	const oldchannel = oldvoice.channel;
	const oldcategory = oldchannel?.parent;
	const CreateableChannel = oldcategory?.children.cache.find(
		(c) => c.name == 'createchannel'
	);
	if (!voice.guild) return;
	if (voice.channel?.name == 'createchannel' && category) {
		if (oldchannel?.name.startsWith('[bot]')) {
			voice.setChannel(oldchannel);
			return;
		}
		const newchannel = await category.children.create({
			name: `[bot]${voice.member?.displayName}'schannel`,
			type: ChannelType.GuildVoice,
		});
		await voice.setChannel(newchannel);
	} else if (
		oldchannel?.name.startsWith('[bot]') &&
		oldchannel?.members.size == 0 &&
		oldcategory &&
		CreateableChannel
	) {
		await oldchannel?.delete();
	}
}
