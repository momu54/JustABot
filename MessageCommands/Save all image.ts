import {
	ApplicationCommandType,
	AttachmentBuilder,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import JSZip from 'jszip';
import jimp from 'jimp';
import { writeFileSync } from 'fs';

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Save all image')
		.setType(ApplicationCommandType.Message),
	execute: async (i: MessageContextMenuCommandInteraction) => {
		await i.deferReply({ ephemeral: true });
		const msg = i.targetMessage;
		const AttachmentList = Array.from(msg.attachments.values());
		const zip = new JSZip();
		for (let index = 0; index < AttachmentList.length; index++) {
			const Attachment = AttachmentList[index];
			if (!Attachment.contentType?.startsWith('image')) continue;
			const res = await fetch(Attachment.url);
			var resimage = Buffer.from(await res.arrayBuffer());
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
			await i.editReply({ embeds: [errembed] });
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
		await i.editReply({ embeds: [embed], files: [zipAttachment] });
	},
};
