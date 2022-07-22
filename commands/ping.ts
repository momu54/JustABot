import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("show websocket ping"),
    execute: (i: CommandInteraction) => {
        var embed = getpingembed(i);
        var button = new ButtonBuilder()
            .setCustomId("ping.refresh")
            .setLabel("Refresh")
            .setStyle(ButtonStyle.Primary);
        var row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        i.reply({ embeds: [embed], components: [row] });
    },
    executeBtn: (i: ButtonInteraction) => {
        var embed = getpingembed(i);
        i.update({ embeds: [embed] });
    },
};

function getpingembed(i: CommandInteraction | ButtonInteraction): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x000000)
        .setTitle("Pong!")
        .setDescription(`${i.client.ws.ping} ms`);
}
