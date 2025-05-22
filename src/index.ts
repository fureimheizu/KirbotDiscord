import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { config } from 'dotenv';
import { Command } from './types/command';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import db, { initializeDatabase } from './database/db';
import isChannelLive from './utils/checkTwitchChannel';
import sendLiveEmbedMessage from './utils/sendLiveEmbedMessage';
import { User } from './interfaces/user';

config()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
const token = process.env.DISCORD_TOKEN;
const interval = process.env.TWITCH_CHANNEL_CHECK_INTERVAL;
const liveStreamers = new Set();
const recentlyUsersAddedPoints = new Set();

if (!token) {
    throw new Error("Discord token is required in order to run Kirbot.");
}

// Init commands
client.commands = new Collection();
const commandsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(pathToFileURL(filePath).toString());
    const command: Command = commandModule.default;
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[Warning]: The command file ${file} doesn't contain the necessary parameters (data or execute).`)
    }
}

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
    initializeDatabase();

    if (interval) {
        setInterval(() => {
            db.all(`SELECT * FROM streamers`, async (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return;
                }

                if (rows.length < 1) return;
                for (let i = 0; i < rows.length; i++) {
                    let row: any = rows[i];

                    const liveData = await isChannelLive(row.url);

                    if (liveData.length > 0) {
                        sendLiveEmbedMessage(row, liveData, liveStreamers, client);
                    } else {
                        if (liveStreamers.has(row.url)) {
                            liveStreamers.delete(row.url);
                        }
                    }
                }

            })
        }, Number(interval));
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.inGuild) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Errore durante l\'esecuzione del comando.', flags: MessageFlags.Ephemeral })
    }
});

client.on(Events.MessageCreate, async message => {
    if(message.author.bot) return;

    const query = `SELECT * FROM users WHERE userId = ?`;
    db.all(query, [message.author.id], async (err, rows: User[]) => {
        if(err) {
            console.error(err.message)
            return;
        }
        
        if(recentlyUsersAddedPoints.has(message.author.id)) return;
        if (rows.length < 1)
        {
            // Insert user into db
            const insert = `INSERT INTO users (userId, guildId, points) VALUES(?, ?, ?)`
            console.log("No user found, inserting new data into users.");
            db.prepare(insert).run(message.author.id, message.guild?.id, 0);
            return;
        }

        const user: User = rows[0]
        const points = user.points;
        const randomPointsGain = Math.floor(Math.random() * 11);
        const total = points + randomPointsGain;
        const update = `UPDATE users SET points = ? WHERE userId = ?`;

        db.prepare(update).run(total, message.author.id);

        // Prevent spamming
        recentlyUsersAddedPoints.add(message.author.id);
        setTimeout(() => {
            recentlyUsersAddedPoints.delete(message.author.id);
        }, 10000)
        
    });
});

client.login(token);