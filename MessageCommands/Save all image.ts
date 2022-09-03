import {
	ApplicationCommandType,
	AttachmentBuilder,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import JSZip from 'jszip';
import jimp from 'jimp';

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
			var resimage = await res.arrayBuffer();
			if (Attachment.contentType != 'image/jpeg') {
				const jimpimage = await jimp.read(Buffer.from(resimage));
				resimage = (await jimpimage.getBufferAsync('image/jpeg')).buffer;
			}
			zip.file(`${index + 1}.${Attachment.name}`, resimage, {
				binary: true,
				compression: 'DEFLATE',
			});
		}
		const zipData = await zip.generateAsync({ type: 'nodebuffer' });
		const zipAttachment = new AttachmentBuilder(zipData, {
			name: `${new Date().toTimeString()}`,
		});
		const size = (zipData.byteLength * 0.000001).toFixed(2);
		const embed = new EmbedBuilder()
			.setColor(0xffffff)
			.setTitle('Done!')
			.setDescription(`size: ${size}MB`);
		i.editReply({ embeds: [embed], files: [zipAttachment] });
	},
};
