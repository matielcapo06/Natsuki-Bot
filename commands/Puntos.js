const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('puntos.db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puntos')
        .setDescription('Puntos totales del usuario'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const userDiscordId = interaction.user.id; // Obtener el ID de Discord del usuario

        try {
            const rows = await new Promise((resolve, reject) => {
                db.get("SELECT id, puntos FROM puntajes WHERE id = ?", [userId], (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            });

            if (rows) {
                const puntajeUsuario = rows.puntos;
                const Puntos = new EmbedBuilder()
                    .setColor('#0273e3')
                    .setTitle(':1234: **Puntos**')
                    .setDescription(`¡<@${userDiscordId}>, te has hecho con ${puntajeUsuario} puntos! 🌟`)
                await interaction.deferReply() // Defer the reply before sending the embed
                await interaction.followUp({ embeds: [Puntos] })
            }
            else {
                const Puntos2 = new EmbedBuilder()
                    .setColor('#0273e3')
                    .setTitle(':1234: **Puntos**')
                    .setDescription(`<@${userDiscordId}>, aún no has obtenido puntos. ¡Participa en una partida para ganarlos! 🎮🌟`)
                    .setFooter({
                        text: `Puntos • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                        iconURL: 'https://mehrilaw.com/wp-content/uploads/2018/11/score-points.png'
                    })
                await interaction.deferReply() // Defer the reply before sending the embed
                await interaction.followUp({ embeds: [Puntos2] })
            }
        } catch (err) {
            console.error(err.message);
        }
    },
};