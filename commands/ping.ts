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

export async function execute(interaction: ChatInputCommandInteraction) {
	let embed = getpingembed(interaction);
	let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('ping.refresh')
			.setLabel('Refresh')
			.setStyle(ButtonStyle.Primary)
	);
	await interaction.reply({
		embeds: [embed],
		components: [row],
	});
}

export async function executeBtn(interaction: ButtonInteraction) {
	let embed = getpingembed(interaction);
	await interaction.update({
		embeds: [embed],
	});
}

function getpingembed(
	interaction: ChatInputCommandInteraction | ButtonInteraction
): EmbedBuilder {
	return new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle('Pong!')
		.setDescription(`${interaction.client.ws.ping} ms`);
}
