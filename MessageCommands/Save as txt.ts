import {
	ApplicationCommandType,
	AttachmentBuilder,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Save as txt')
		.setType(ApplicationCommandType.Message),
	execute: async (i: MessageContextMenuCommandInteraction) => {
		const msg = i.targetMessage;
		if (!msg.content) {
			const errembed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('error!')
				.setDescription('This message has no content.');
			await i.reply({ embeds: [errembed], ephemeral: true });
			return;
		}
		const AttachmentData = Buffer.from(msg.content);
		const Attachment = new AttachmentBuilder(AttachmentData, {
			name: `${new Date().toDateString()}.${msg.id}.txt`,
		});
		await i.reply({ files: [Attachment], ephemeral: true });
	},
};
