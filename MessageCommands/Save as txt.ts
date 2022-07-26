import {
	ApplicationCommandType,
	AttachmentBuilder,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';

export const data = new ContextMenuCommandBuilder()
	.setName('Save as txt')
	.setType(ApplicationCommandType.Message);

export async function execute(interaction: MessageContextMenuCommandInteraction) {
	const msg = interaction.targetMessage;
	if (!msg.content) {
		const errembed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('error!')
			.setDescription('This message has no content.');
		await interaction.reply({ embeds: [errembed], ephemeral: true });
		return;
	}
	const AttachmentData = Buffer.from(msg.content);
	const Attachment = new AttachmentBuilder(AttachmentData, {
		name: `${new Date().toDateString()}.${msg.id}.txt`,
	});
	await interaction.reply({ files: [Attachment], ephemeral: true });
}
