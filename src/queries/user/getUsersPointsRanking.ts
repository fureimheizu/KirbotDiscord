import db from "../../database/db";
import { User } from "../../interfaces/user";

const getUsersPointsRanking = (userId: string, guildId: string | undefined): Promise<User[]> => {
    return new Promise((resolve, reject) => {
        if(!userId || !guildId) 
        {
            console.error("[Error]: Missing values from userId or guildId.");
            return resolve([]);
        }
        const query = `SELECT * FROM users WHERE guildId = ?`;
        db.all(query, [guildId], async (err, rows: User[]) => {
            if(err) {
                console.error("[Error]: An error has occurred while querying the database.");
                return resolve([]); 
            }
    
            if(rows.length > 0) {
                resolve(rows);
            } else {
                resolve([]);
            }
        });
    })
}

export default getUsersPointsRanking;