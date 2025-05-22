import SqLite from "sqlite3";

const db = new SqLite.Database('./kirbot.db');

export const initializeDatabase = () => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT,
            userId TEXT,
            points INTEGER DEFAULT 0
        );
    `);
    console.log("[Info]: Created table USERS");

    db.run(`
        CREATE TABLE IF NOT EXISTS streamers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT,
            url TEXT,
            message TEXT,
            channelId TEXT
        );
    `);

    console.log("[Info]: Created table STREAMERS");

    console.log('[Info]: DB Schema initialized.');
}

export default db;