import db from "../../database/db";
import { User } from "../../interfaces/user";

const getUserPoints = (userId: string, guildId: string | undefined) => {
    if(!userId || !guildId) return console.error("[Error]: Missing values from userId or guildId.");
    const query = `SELECT * FROM users WHERE userId = ? AND guildId = ?`;
    db.all(query, [userId, guildId], async (err, rows: User[]) => {
        if(err) {
            return console.error("[Error]: An error has occurred while querying the database.");
        }

        return rows[0].points;
    });
}

export default getUserPoints;