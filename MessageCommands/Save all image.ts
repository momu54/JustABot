import {
	ApplicationCommandType,
	AttachmentBuilder,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import JSZip from 'jszip';
import jimp from 'jimp';

export const data = new ContextMenuCommandBuilder()
	.setName('Save all image')
	.setType(ApplicationCommandType.Message);

export async function execute(interaction: MessageContextMenuCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });
	const msg = interaction.targetMessage;
	const AttachmentList = Array.from(msg.attachments.values());
	const zip = new JSZip();
	for (let index = 0; index < AttachmentList.length; index++) {
		const Attachment = AttachmentList[index];
		if (!Attachment.contentType?.startsWith('image')) continue;
		const res = await fetch(Attachment.url);
		let resimage = Buffer.from(await res.arrayBuffer());
		if (Attachment.contentType != 'image/jpeg') {
			const jimpimage = await jimp.read(resimage);
			jimpimage.quality(70);
			resimage = await jimpimage.getBufferAsync('image/jpeg');
		}
		zip.file(`${index + 1}.${Attachment.name?.replace('png', 'jpg')}`, resimage, {
			binary: true,
			compression: 'DEFLATE',
		});
	}
	const zipData = await zip.generateAsync({ type: 'nodebuffer' });
	if (zipData.byteLength > 8388608) {
		const errembed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('error!')
			.setDescription('The generated zip is too large.');
		await interaction.editReply({ embeds: [errembed] });
		return;
	}
	const zipAttachment = new AttachmentBuilder(zipData, {
		name: `${new Date().toTimeString()}.${msg.id}.zip`,
	});
	const size = (zipData.byteLength * 0.000001).toFixed(2);
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle('done!')
		.setDescription(`size: ${size}MB`);
	await interaction.editReply({ embeds: [embed], files: [zipAttachment] });
}
