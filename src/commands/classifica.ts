import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import db from '../database/db';
import { Command } from '../types/command';
import { User } from '../interfaces/user';

// Funzione helper per ottenere i dati utenti dal DB con Promise
const getUsersByGuildId = (guildId: string): Promise<User[]> => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users WHERE guildId = ? ORDER BY points DESC`, [guildId], (err, rows: User[]) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const classifica: Command = {
    data: new SlashCommandBuilder()
        .setName('classifica')
        .setDescription('Mostra la classifica punti degli utenti del server.'),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            interaction.reply({
                content: "Questo comando può essere usato solo in un server.",
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply(); // importante per evitare timeout

        try {
            console.log("Initialized try/catch")
            const rows = await getUsersByGuildId(interaction.guild.id);
            const medals = ['🥇', '🥈', '🥉'];
            console.log("Rows", rows)
            // Otteniamo gli username
            const members = await Promise.all(
                rows.map(row => interaction.guild!.members.fetch(row.userId).catch(() => null))
            );
            console.log("Members", members)
            const description = rows.map((row, i) => {
                const member = members[i];
                const username = member?.user.username ?? `Utente (${row.userId})`;
                const icon = medals[i] ?? `#${i + 1}`;
                return `**${icon}** – ${username} → **${row.points} punti**`;
            }).join('\n');


            console.log("Desc", description)

            const embed = new EmbedBuilder()
                .setColor(0x9146FF)
                .setTitle('🏆 Classifica Punti')
                .setDescription(description || 'Nessun utente trovato nella classifica.')
                .setTimestamp()
                .setAuthor({
                    name: "Kirbot",
                    iconURL: interaction.client.user?.displayAvatarURL({ size: 1024 })
                });

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error("[Errore classifica]:", err);
            await interaction.editReply({
                content: "Si è verificato un errore durante il recupero della classifica."
            });
        }
    }
};

export default classifica;
