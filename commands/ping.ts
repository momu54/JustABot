import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("show websocket ping"),
    execute: (i: CommandInteraction) => {
        var embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle("Pong!")
            .setDescription(`${i.client.ws.ping} ms`)
        var button = new ButtonBuilder()
            .setCustomId('refreshping')
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Primary)
        var row = new ActionRowBuilder()
            .addComponents(button)
        i.reply({ embeds: [embed], components: [row] })
    },
    button: (i: ButtonInteraction) => {
        var embed = getpingembed(i)
        i.update({ embeds: [embed], components: [row] })
    }
}

function getpingembed (i: CommandInteraction | ButtonInteraction): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x000000)
        .setTitle("Pong!")
        .setDescription(`${i.client.ws.ping} ms`)
}