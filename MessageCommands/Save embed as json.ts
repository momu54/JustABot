import {
	ApplicationCommandType,
	AttachmentBuilder,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';

export const data = new ContextMenuCommandBuilder()
	.setName('Save embed as json')
	.setType(ApplicationCommandType.Message);

export async function execute(interaction: MessageContextMenuCommandInteraction) {
	const msg = interaction.targetMessage;
	if (!msg.embeds.length) {
		const errembed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('error!')
			.setDescription('This message has no any embed.');
		await interaction.reply({ embeds: [errembed], ephemeral: true });
		return;
	}
	let Attachments: AttachmentBuilder[] = [];
	for (let index = 0; index < msg.embeds.length; index++) {
		const embed = msg.embeds[index];
		const DataString = JSON.stringify(embed.toJSON(), null, 4);
		const data = Buffer.from(DataString);
		Attachments.push(
			new AttachmentBuilder(data, {
				name: `${new Date().toDateString()}.${msg.id}.${index}.json`,
			})
		);
	}
	await interaction.reply({ files: Attachments, ephemeral: true });
}
