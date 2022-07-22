import { Client, Collection, GatewayIntentBits, InteractionType, SlashCommandBuilder } from 'discord.js'
import 'dotenv/config'
import path from 'path'
import fs from 'fs'

const client = new Client({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] })
var commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandsFile = fs.readdirSync(commandsPath)
var commandslist: SlashCommandBuilder[] = []

interface CommandType {
    data: SlashCommandBuilder,
    execute: Function,
    executeBtn?: Function
}

client.on("ready", () => {
    console.log('ready!')
    loadcommand()
})

async function loadcommand() {
    for (const file of commandsFile) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath) as CommandType
        commands.set(command.data.name, command)
        commandslist.push(command.data)
    }
    console.log('Started refreshing application (/) commands.');
    client.application?.commands.set(commandslist)
    console.log('Successfully reloaded application (/) commands.');
}

client.on('interactionCreate', async (i) => {
    if (i.type == InteractionType.ApplicationCommand) {
        const commandFile = commands.get(i.commandName) as CommandType;
        
        if (!commandFile) return;

        try {
            await commandFile.execute(i);
        } catch (error) {
            console.error(error);
            await i.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
    if (i.type == InteractionType.MessageComponent) {
        const commandName = i.customId.split('.')[0]
        const commandFile = commands.get(commandName) as CommandType
        commandFile.executeBtn?.(i)
    }
});

client.login(process.env.TOKEN)