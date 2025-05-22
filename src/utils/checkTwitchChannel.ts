import axios from "axios";
import { getTwitchToken } from "./getTwitchToken";
import { config } from "dotenv";

config();

const regex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/;

const isChannelLive = async (url: string) => {
    
    if(!url) return;
    const token = await getTwitchToken()
    const channelLogin = url.match(regex);
    if(!channelLogin) return;

    try {
        const response = await axios.get('https://api.twitch.tv/helix/streams', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID
            },
            params: {
                user_login: channelLogin[1]
            }
        });
        return response.data.data
    } catch (error) {
        return false
    }
}

export default isChannelLive;