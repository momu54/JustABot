import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('show websocket ping'),
	execute: (i: ChatInputCommandInteraction) => {
		var embed = getpingembed(i);
		var row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('ping.refresh')
				.setLabel('Refresh')
				.setStyle(ButtonStyle.Primary)
		);
		i.reply({
			embeds: [embed],
			components: [row],
		});
	},
	executeBtn: (i: ButtonInteraction) => {
		var embed = getpingembed(i);
		i.update({
			embeds: [embed],
		});
	},
};

function getpingembed(i: ChatInputCommandInteraction | ButtonInteraction): EmbedBuilder {
	return new EmbedBuilder()
		.setColor(0x000000)
		.setTitle('Pong!')
		.setDescription(`${i.client.ws.ping} ms`);
}
