const run = async () => {
    const { fetch } = await import('node-fetch');
};
run();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('streamer')
        .setDescription('Verifica si un streamer está en directo en Twitch.')
        .addStringOption(option => option
            .setName('nombre')
            .setDescription('Ingresa el nombre del streamer que quieras consultar.')
            .setRequired(true)),

    async execute(interaction) {
        try {
            const streamer = interaction.options.getString('nombre');
            const clientId = 'mr2fl9gngp85bag4bkpytsf7y2pwzu';
            const clientSecret = 'dnkuni3ey24o5v1jzs2blong42xhzr';

            const { default: fetch } = await import('node-fetch');

            const endpoint = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
            const authResponse = await fetch(endpoint, { method: 'POST' });
            if (!authResponse.ok) {
                throw new Error(`HTTP error! status: ${authResponse.status}`);
            }
            const authData = await authResponse.json();
            const oauthToken = authData.access_token;

            const streamEndpoint = `https://api.twitch.tv/helix/streams?user_login=${streamer}`;
            const streamResponse = await fetch(streamEndpoint, {
                headers: {
                    'Authorization': `Bearer ${oauthToken}`,
                    'Client-ID': clientId
                }
            });
            if (!streamResponse.ok) {
                throw new Error(`HTTP error! status: ${streamResponse.status}`);
            }
            const streamData = await streamResponse.json();
            const isLive = streamData.data && streamData.data.length > 0;

            let gameImage = 'https://placehold.co/285x380?text=No+Image';
            const TwitchLogo = "https://static.wikia.nocookie.net/youtube/images/1/19/Twitch.jpg/revision/latest?cb=20241010205739";
            let preview = 'https://placehold.co/1360x768?text=No+Preview'; // Default preview

            if (isLive) {
                const { title, game_id, game_name, viewer_count, thumbnail_url } = streamData.data[0];

                const gameEndpoint = `https://api.twitch.tv/helix/games?id=${game_id}`;
                const gameResponse = await fetch(gameEndpoint, {
                    headers: {
                        'Authorization': `Bearer ${oauthToken}`,
                        'Client-ID': clientId
                    }
                });
                if (gameResponse.ok) {
                    const gameData = await gameResponse.json();
                    if (gameData.data && gameData.data.length > 0) {
                        gameImage = gameData.data[0].box_art_url.replace('{width}', '285').replace('{height}', '380');
                    }
                }

                preview = thumbnail_url.replace('{width}', '1360').replace('{height}', '768');

                const embed = new EmbedBuilder()
                    .setColor('#6441a5')
                    .setTitle(`:green_circle: **${streamer} está en directo.**`)
                    .setDescription(`\n\n**Únete al directo** :arrow_heading_down:\n\n[**${title}**](https://www.twitch.tv/${streamer})\n\nJugando **${game_name}** con **${viewer_count}** espectadores.`)
                    .setImage(preview)
                    .setFooter({
                        text: `Twitch ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                        iconURL: TwitchLogo
                    })
                    .setThumbnail(gameImage);

                return await interaction.reply({ embeds: [embed] });
            } else {
                // Obtener información del usuario para la imagen de perfil
                const userEndpoint = `https://api.twitch.tv/helix/users?login=${streamer}`;
                const userResponse = await fetch(userEndpoint, {
                    headers: {
                        'Authorization': `Bearer ${oauthToken}`,
                        'Client-ID': clientId
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (userData.data && userData.data.length > 0) {
                        preview = userData.data[0].profile_image_url || 'https://placehold.co/1360x768?text=No+Preview';
                    }
                }

                const embed2 = new EmbedBuilder()
                    .setColor('#6441a5')
                    .setTitle(`:red_circle: **${streamer} no está en directo**`)
                    .setDescription(`
                        👉 [**¡Ve a seguirlo!**](https://www.twitch.tv/${streamer})`)
                    .setImage(preview)
                    .setFooter({
                        text: `Twitch • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                        iconURL: TwitchLogo
                    });

                return await interaction.reply({ embeds: [embed2] });
            }
        } catch (error) {
            console.error(error);
            return await interaction.reply({ content: '**Ocurrió un error al verificar el estado del streamer.** \n(Esto puede deberse a que el canal indicado no existe.)', ephemeral: true });
        }
    },
    defaultPermission: false,
};