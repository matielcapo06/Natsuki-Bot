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
        .setName("fernanfrase")
        .setDescription("Frases randoms de fernanfloo."),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(interaction) {
        try {
            const respuestasObjeto = leerRespuestasDesdeArchivo('Datos/fernanfloo.txt')
            const Floo = respuestasObjeto.fernan;
            if (!respuestasObjeto) return interaction.followUp('No se pudo leer el archivo de respuestas.')
            const Fernan = respuestasObjeto.floo
            if (!respuestasObjeto) return interaction.followUp('No se pudo leer el archivo de respuestas.');
            const CARAJO = Fernan[Math.floor(Math.random() * Fernan.length)];
            const CHORIZO = Floo[Math.floor(Math.random() * Floo.length)];
            const crack = new EmbedBuilder()
                .setColor('#02eb2d')
                .setTitle(`"${CARAJO}"
                
-Fernanfloo`)
.setDescription(`
 
`)
                .setImage(`${CHORIZO}`) 
                .setFooter({
                    text: `Frases de Fernanfloo • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                    iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB1ycKm5Z5rACm2aaUpldrTmQd9csQyqD-imBioPGb0g&s'
                })
            await interaction.deferReply();
            await interaction.followUp({ embeds: [crack] });
        } catch (error) {
            console.error(error);
        }
    }
};