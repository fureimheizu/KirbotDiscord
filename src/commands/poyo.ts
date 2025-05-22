import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command";
import { kirbyGifLinks } from "../config/gifs";

const poyo: Command = {
    data: new SlashCommandBuilder()
        .setName('poyo')
        .setDescription('POYO!'),
    async execute(interaction) {
        const randomKirbyGif = kirbyGifLinks[Math.floor(Math.random() * kirbyGifLinks.length)];
        await interaction.reply(randomKirbyGif);
    }
}

export default poyo;