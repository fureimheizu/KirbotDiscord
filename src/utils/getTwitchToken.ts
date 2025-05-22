import axios from "axios";
import { config } from "dotenv"

config();

let access_token: string | null = null;

const getTwitchToken = async () => {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if(!clientId || !clientSecret) return;

    if(access_token && await validateTwitchToken(access_token)) {
        return access_token
    }

    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )

        access_token = response.data.access_token;
        return access_token;
    } catch (error) {
        return;
    }
}

const validateTwitchToken = async (token: string) => {
    try {
        await axios.get('https://id.twitch.tv/oauth2/validate', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return true;
    } catch (error: any) {
        return false;
    }
}

export { validateTwitchToken, getTwitchToken };