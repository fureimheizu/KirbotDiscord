import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const client_id = process.env.DISCORD_CLIENT_ID;

if(!token || !client_id) {
    throw new Error("Missing environment variables.");
}

const commands: string[] = [];
const commandsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
    const command = await import(`file://${path.join(commandsPath, file)}`);
    if ('data' in command.default) {
        commands.push(command.default.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(token);

const refreshApplicationCommands = async () => {
    try {
        console.log('Refreshing application (/) commands...');
    
        await rest.put(Routes.applicationCommands(client_id), { body: commands });
    
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

refreshApplicationCommands();
