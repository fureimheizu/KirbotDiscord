import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command";

const ciao: Command = {
    data: new SlashCommandBuilder()
        .setName('ciao')
        .setDescription('Saluta Kirbot!'),
    async execute(interaction) {
        interaction.reply(
            'Poyo! Sono **Kirbot**, un discord bot creato appositamente per gestire il canale discord di **Sophie**! <:kirbystar:1374887355265318963>');
    }
}

export default ciao;