import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Show websocket ping.');

export async function execute(i: ChatInputCommandInteraction) {
	let embed = getpingembed(i);
	let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('ping.refresh')
			.setLabel('Refresh')
			.setStyle(ButtonStyle.Primary)
	);
	await i.reply({
		embeds: [embed],
		components: [row],
	});
}

export async function executeBtn(i: ButtonInteraction) {
	let embed = getpingembed(i);
	await i.update({
		embeds: [embed],
	});
}

function getpingembed(i: ChatInputCommandInteraction | ButtonInteraction): EmbedBuilder {
	return new EmbedBuilder()
		.setColor(0x000000)
		.setTitle('Pong!')
		.setDescription(`${i.client.ws.ping} ms`);
}
