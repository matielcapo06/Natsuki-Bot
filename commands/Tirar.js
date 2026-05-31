const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tirar')
        .setDescription('Genera un número aleatorio en un rango específico.')
        .addIntegerOption(option => option
            .setName('maximo')
            .setDescription('Rango máximo')
            .setRequired(true)),

    async execute(interaction) {
        try {
            if (interaction.deferred || interaction.replied) {
                // Si la interacción ya ha sido respondida o diferida, no hagas nada adicional
                return;
            }

            // Diferir la respuesta antes de realizar cualquier acción
            await interaction.deferReply();

            const maximo = interaction.options.getInteger('maximo');

            // Verifica que el valor proporcionado sea un número válido
            if (isNaN(maximo) || maximo < 1) {
                return interaction.followUp('Por favor, ingrese un número válido.');
            }

            // Genera un número aleatorio entre 1 y el rango máximo especificado
            let numeroAleatorio = Math.floor(Math.random() * maximo) + 1;

            if (numeroAleatorio === 69) {
                numeroAleatorio += ' :fire: :fire:';
            }
            
            // Crea el mensaje embed con el número aleatorio
            const NumeroRandom = new EmbedBuilder()
                .setColor('#56bd2a')
                .setTitle(':game_die: **Tirar**')
                .setDescription(`
                ¡Ha salido **${numeroAleatorio}**!`)
                .setFooter({
                    text: `Tirar • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                    iconURL: 'https://www.soyvisual.org/sites/default/files/styles/twitter_card/public/images/photos/jue_0018.jpg?itok=4YFq5Aar'
                })

            // Responde con el mensaje embed
            await interaction.followUp({ embeds: [NumeroRandom] });
        } catch (error) {
            console.error(error);
        }
    },
};