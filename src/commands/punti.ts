import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command";
import getUserPoints from "../queries/user/getUserPoints";

const punti: Command = {
    data: new SlashCommandBuilder()
        .setName('punti')
        .setDescription('Visualizza quanti punti hai ottenuto fino ad ora scrivendo!'),
    async execute(interaction) {
        const points = await getUserPoints(interaction.user.id, interaction.guild?.id);
        await interaction.reply(`Poyo! Fino ad ora hai ottenuto un totale di **${points}** punti inviando messaggi su questo Discord! 📈`);
    }
}

export default punti;