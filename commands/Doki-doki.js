const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
function leerRespuestasDesdeArchivo(nombreArchivo) {
    try {
        const contenido = fs.readFileSync(nombreArchivo, 'utf8');
        return JSON.parse(contenido);
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        return null;
    }
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName("doki-doki")
        .setDescription("Generaré una imagen del doki doki."),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(interaction) {
        try {
            
            const respuestas = leerRespuestasDesdeArchivo('Datos/dokidoki.txt');
            const Imagenes = respuestas.Imagenes;
            const DokiDoki = Imagenes[Math.floor(Math.random() * Imagenes.length)];
            const Doki = new EmbedBuilder()
                .setColor('#fcd2fc')
                .setTitle('📚  Doki Doki Literature Club!')
                .setImage(`${DokiDoki}`)
                .setFooter({
                    text: `Doki-doki • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                    iconURL: 'https://cdn.akamai.steamstatic.com/steam/apps/1388880/capsule_616x353.jpg?t=1634143775'
                })
            await interaction.deferReply(); // Defer the reply before sending the embed
            await interaction.followUp({ embeds: [Doki] });
        } catch (error) {
            console.error(error);
        }
    }
};