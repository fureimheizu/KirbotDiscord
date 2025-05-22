import db from "../../database/db";
import { User } from "../../interfaces/user";

const getUserPoints = (userId: string, guildId: string | undefined): Promise<number> => {
    return new Promise((resolve, reject) => {
        if(!userId || !guildId) 
        {
            console.error("[Error]: Missing values from userId or guildId.");
            return resolve(0);
        }
        const query = `SELECT * FROM users WHERE userId = ? AND guildId = ?`;
        db.all(query, [userId, guildId], async (err, rows: User[]) => {
            if(err) {
                console.error("[Error]: An error has occurred while querying the database.");
                return resolve(0); 
            }
    
            if(rows.length > 0) {
                resolve(rows[0].points);
            } else {
                resolve(0);
            }
        });
    })
}

export default getUserPoints;