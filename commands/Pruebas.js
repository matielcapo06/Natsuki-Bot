const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName("prueba")
        .setDescription("Para probar de todo."),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(interaction) {
        try {
            const Doki = new EmbedBuilder()
                .setColor('#fcd2fc')
                .setTitle('Prueba de imagen')
                .setImage(`https://www.banderas-mundo.es/data/flags/w580/af.webp?v=un`)
                .setFooter({
                    text: `Pruebita • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                })
            await interaction.deferReply(); // Defer the reply before sending the embed
            await interaction.followUp({ embeds: [Doki] });
        } catch (error) {
            console.error(error);
        }
    }
};

