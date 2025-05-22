import axios from "axios";

const validateTwitchToken = async (token: string) => {
    try {
        await axios.get('https://id.twitch.tv/oauth2/validate', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return "VALID";
    } catch (error: any) {
        if (error.response.status === 401) {
            return "REFRESH";
        } else {
            console.log('[Error]: Error while validating twitch token.');
            return "ERROR";
        }
    }
}

export default validateTwitchToken;