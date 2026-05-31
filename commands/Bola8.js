const { SlashCommandBuilder } = require('@discordjs/builders');
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
        .setName('bola8')
        .setDescription('Hazle una pregunta a la bola 8.')
        .setContexts([0,1, 2]) // Corregido: array con los valores correctos
        .setIntegrationTypes([1]) // El setIntegrationTypes también espera un array.
        .addStringOption(option => option
            .setName('pregunta')
            .setDescription('Escribe tu pregunta.')
            .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const pregunta = interaction.options.getString('pregunta');
        const respuestasObjeto = leerRespuestasDesdeArchivo('Datos/bola8.txt');
        if (!respuestasObjeto) return interaction.followUp('No se pudo leer el archivo de respuestas.');

        if (!pregunta) {
            return interaction.followUp('Por favor, ingrese una pregunta válida.');
        }

        const respuestas = respuestasObjeto.respuestas; // Accede al array de respuestas dentro del objeto
        const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎱 Pregunta a la bola 8')
            .setDescription('`' + pregunta + '`')
            .addFields(
                { name: 'Respuesta: ', value: '\n **' + respuestaAleatoria + '**' }
            )
            .setFooter({
                text: `Bola 8 • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                iconURL: 'https://http2.mlstatic.com/D_NQ_NP_951350-MLA54907864311_042023-O.webp'
            });

        await interaction.followUp({ embeds: [embed] });
    },
};