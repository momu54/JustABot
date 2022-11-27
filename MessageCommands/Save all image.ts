import {
	ApplicationCommandType,
	AttachmentBuilder,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import JSZip from 'jszip';
import sharp from 'sharp';
import { deferReply } from '../utility/other.js';

export const data = new ContextMenuCommandBuilder()
	.setName('Save all image')
	.setType(ApplicationCommandType.Message);

export async function execute(interaction: MessageContextMenuCommandInteraction) {
	await deferReply(interaction);
	const msg = interaction.targetMessage;
	const AttachmentList = Array.from(msg.attachments.values());
	const zip = new JSZip();
	for (let index = 0; index < AttachmentList.length; index++) {
		const Attachment = AttachmentList[index];
		if (!Attachment.contentType?.startsWith('image')) continue;
		const res = await fetch(Attachment.url);
		let resimage = Buffer.from(await res.arrayBuffer());
		const isntwebporjpeg =
			Attachment.contentType != 'image/webp' &&
			Attachment.contentType != 'image/jpeg';
		if (isntwebporjpeg) {
			resimage = await sharp(resimage)
				.webp({
					quality: 82,
				})
				.toBuffer();
		}
		const spiltedfilename = Attachment.name?.split('.');
		const filename = isntwebporjpeg
			? Attachment.name?.replaceAll(spiltedfilename?.pop()!, 'webp')
			: Attachment.name;
		zip.file(`${index + 1}.${filename}`, resimage, {
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
		name: `${new Date().toJSON()}.${msg.id}.zip`,
	});
	const size = (zipData.byteLength * 0.000001).toFixed(2);
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle('done!')
		.setDescription(
			`size: ${size}MB\nAll images not in jpeg or webp format are converted to webp at quality 82.`
		);
	await interaction.editReply({ embeds: [embed], files: [zipAttachment] });
}
