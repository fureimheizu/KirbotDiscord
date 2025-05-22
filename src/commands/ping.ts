import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command";

const ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Comando di test, risponde con Pong!'),
    async execute(interaction) {
        interaction.reply('Pong!')
    }
}

export default ping;