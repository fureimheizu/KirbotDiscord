import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { StreamerData } from "../interfaces/streamerData";

const sendLiveEmbedMessage = async (streamerData: StreamerData, liveData: any, liveStreamers: Set<unknown>, client: Client<boolean>) => {
    let userLiveData = liveData[0];
    try {
        if (liveStreamers.has(streamerData.url)) return;
        const guild = await client.guilds.fetch(streamerData.guildId);
        const channel = await guild.channels.fetch(streamerData.channelId);

        if (!channel || !channel.isTextBased()) {
            console.error('[Error]: The channel is not text-based or was not found.');
            return;
        }

        const thumbnail_parsed_url = userLiveData.thumbnail_url.replace('{width}', "1920").replace('{height}', 1080);

        const embed = new EmbedBuilder()
            .setColor(0x9146FF)
            .setTitle(`🚨 ${userLiveData.user_name} è ora live! - ${userLiveData.title}`)
            .setURL(streamerData.url)
            .setAuthor({
                name: "Kirbot", iconURL: client.user?.displayAvatarURL({
                    size: 1024,
                    extension: 'png'
                })
            })
            .addFields(
                { name: 'Gioco', value: userLiveData.game_name, inline: true },
                { name: 'Visitatori', value: `${userLiveData.viewer_count}`, inline: true },
                { name: 'Lingua', value: userLiveData.language, inline: true },
            )
            .setImage(thumbnail_parsed_url)
            .setTimestamp()

        await (channel as TextChannel).send({
            content: `@everyone ${streamerData.message}`,
            allowedMentions: { parse: ['everyone'] },
            embeds: [embed]
        });

        liveStreamers.add(streamerData.url);
    } catch (error) {
        console.error('[Error]: Error when sending message.', error);
    }
}

export default sendLiveEmbedMessage;