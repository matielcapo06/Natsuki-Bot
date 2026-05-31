const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

function leerFunFacts() {
    try {
        const contenido = fs.readFileSync('Datos/funfacts.txt', 'utf8');
        return JSON.parse(contenido);
    } catch (error) {
        console.error('Error al leer los fun facts:', error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('funfact')
        .setDescription('Te diré datos curiosos aleatorios.')
        .setContexts([0, 1, 2]) // Funciona en DMs, servidores y grupos
        .setIntegrationTypes([1]), // Integración con apps

    async execute(interaction) {
        await interaction.deferReply();

        const datos = leerFunFacts();
        if (!datos) return interaction.followUp('❌ No se pudieron cargar los datos curiosos.');

        const funfactAleatorio = datos.funfacts[Math.floor(Math.random() * datos.funfacts.length)];

        const embed = new EmbedBuilder()
            .setColor('#FF69B4') // Rosa brillante
            .setTitle(':grey_question: **Dato Curioso**')
            .setDescription(`\n\`\`\`${funfactAleatorio}\`\`\``)
            .setFooter({
                text: `Fun Fact • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO8quV6F7iHoJvRIm8hS_QuDMnbPuENUB0MQ&s' // Icono de cerebro
            });

        await interaction.followUp({ embeds: [embed] });
    },
};