import { Client, Collection, EmbedBuilder, Events, GatewayIntentBits, MessageFlags, TextChannel } from 'discord.js';
import { config } from 'dotenv';
import { Command } from './types/command';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import db, { initializeDatabase } from './database/db';
import isChannelLive from './utils/checkTwitchChannel';
import { StreamerData } from './interfaces/streamerData';

config()

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN;
const interval = process.env.TWITCH_CHANNEL_CHECK_INTERVAL;
const liveStreamers = new Set();

if(!token) {
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
    if('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[Warning]: The command file ${file} doesn't contain the necessary parameters (data or execute).`)
    }
}

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
    initializeDatabase();

    if(interval) {
        setInterval(() => {
            db.all(`SELECT * FROM streamers`, async (err, rows) => {
                if(err) {
                    console.error(err.message);
                    return;
                }

                if(rows.length < 1) return;
                for(let i = 0; i < rows.length; i++) {
                    let row: any = rows[i];

                    const liveData = await isChannelLive(row.url);

                    if(liveData.length > 0) {
                        sendLiveEmbedMessage(row, liveData);
                    } else {
                        if(liveStreamers.has(row.url)) {
                            liveStreamers.delete(row.url);
                        }
                    }
                }
                
            })
        }, Number(interval));
    }
});

const sendLiveEmbedMessage = async (streamerData: StreamerData, liveData: any) => {
    let userLiveData = liveData[0];
    try {
        if(liveStreamers.has(streamerData.url)) return;
        const guild = await client.guilds.fetch(streamerData.guildId);
        const channel = await guild.channels.fetch(streamerData.channelId);

        if(!channel || !channel.isTextBased()) {
            console.error('[Error]: The channel is not text-based or was not found.');
            return;
        }

        const thumbnail_parsed_url = userLiveData.thumbnail_url.replace('{width}', "1920").replace('{height}', 1080);

        const embed = new EmbedBuilder()
            .setColor(0x9146FF)
            .setTitle(`🚨 ${userLiveData.user_name} è ora live! - ${userLiveData.title}`)
            .setURL(streamerData.url)
            .setAuthor({ name: "Kirbot", iconURL: client.user?.displayAvatarURL({
                size: 1024,
                extension: 'png'
            })})
            .addFields(
                { name: 'Gioco', value: userLiveData.game_name, inline: true },
                { name: 'Visitatori', value: `${userLiveData.viewer_count}`, inline: true },
                { name: 'Lingua', value: userLiveData.language, inline: true },
            )
            .setImage(thumbnail_parsed_url)
            .setTimestamp()

        await (channel as TextChannel).send({
            content: `@everyone ${streamerData.message}`,
            allowedMentions: {parse: ['everyone']},
            embeds: [embed]
        });

        liveStreamers.add(streamerData.url);
    } catch (error) {
        console.error('[Error]: Error when sending message.', error);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Errore durante l\'esecuzione del comando.', flags: MessageFlags.Ephemeral })
    }
})

client.login(token);