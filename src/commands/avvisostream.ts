import { ChannelType, GuildBasedChannel, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command";
import db from "../database/db";

const avvisostream: Command = {
    data: new SlashCommandBuilder()
        .setName('avvisostream')
        .setDescription('Imposta un avviso per quando inizia lo streaming di un canale Twitch!')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Il link (URL) del canale streaming da tracciare')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('canale')
                .setDescription('Il nome del canale in cui verranno pubblicati gli avvisi')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('messaggio')
                .setDescription('Messaggio da pubblicare quando il canale va in live')
                .setRequired(false)
        ),
    async execute(interaction: any) {
        const link = interaction.options.getString('link', true);
        const message = interaction.options.getString('messaggio') ?? "Il canale è in live!";
        const channelName = interaction.options.getString('canale', true);
        const guild = interaction.guild;
        const regex = /^https?:\/\/(www\.)?twitch\.tv\/([a-zA-Z0-9_]{4,25})\/?$/;

        // Channel logic
        if (!guild) return await interaction.reply('Devi essere in un server Discord per utilizzare questo comando.');
        const channel = guild.channels.cache.find(
            (c: { type: ChannelType; name: any; }): c is GuildBasedChannel => c.type === ChannelType.GuildText && c.name === channelName);
        if (!channel) return await interaction.reply(`Il canale ${channelName} non esiste in questo server.`);

        const channelId = channel.id;

        // Link logic
        const match = link.match(regex);
        if (!match) return interaction.reply(`Il link ${link} non è un valido URL di Twitch.`);

        const { id } = guild;

        const query = db.prepare(`INSERT INTO streamers (guildId, url, message, channelId) VALUES (?, ?, ?, ?)`);
        query.run(id, link, message, channelId);

        await interaction.reply(`Poyo! Inizierò a seguire questo canale per quando andrà in live! <:kirby:1374853952012685362>`);
    }
}

export default avvisostream;