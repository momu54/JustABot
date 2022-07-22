import {
    Client,
    Collection,
    ComponentType,
    GatewayIntentBits,
    InteractionType,
    SlashCommandBuilder,
} from "discord.js";
import "dotenv/config";
import path from "path";
import fs from "fs";

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});
var commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandsFile = fs.readdirSync(commandsPath);
var commandslist: SlashCommandBuilder[] = [];

interface CommandType {
    data: SlashCommandBuilder;
    execute: Function;
    executeBtn?: Function;
}

client.on("ready", () => {
    console.log("ready!");
    loadcommand();
});

async function loadcommand() {
    for (const file of commandsFile) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath) as CommandType;
        commands.set(command.data.name, command);
        commandslist.push(command.data);
    }
    console.log("Started refreshing application (/) commands.");
    await client.application?.commands.set(commandslist);
    console.log("Successfully reloaded application (/) commands.");
}

client.on("interactionCreate", async (i) => {
    if (i.type == InteractionType.ApplicationCommand) {
        const commandFile = commands.get(i.commandName) as CommandType;

        if (!commandFile) return;

        try {
            await commandFile.execute(i);
        } catch (error) {
            console.error(error);
            i.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
    if (i.type == InteractionType.MessageComponent) {
        if (i.componentType == ComponentType.Button) {
            const commandName = i.customId.split(".")[0];
            const commandFile = commands.get(commandName) as CommandType;
            try {
                await commandFile.executeBtn?.(i);
            } catch (error) {
                console.error(error);
                i.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            }
        }
    }
});

client.login(process.env.TOKEN);
