const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');

// Función para generar direcciones IP aleatorias
function generateRandomIP() {
    const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    return ip;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong!."),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(interaction) {
        try {
            const randomIP = generateRandomIP();

            const ipEmbed = new EmbedBuilder()
                .setColor('#14850f')
                .setTitle(':computer:  **Ping**')
                
                .setDescription(`
Latencia: \`${interaction.client.ws.ping}ms\`   IP: \`${randomIP}\``)
                .setFooter({
                    text: `Ip • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                    iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTacyTNpO7fCpGfqbZMX4jaf5ROl7N78jldnrpfsQIjhQ&s'
                });

            await interaction.deferReply(); // Defer the reply before sending the embed
            await interaction.followUp({ embeds: [ipEmbed] });
        } catch (error) {
            console.error(error);
        }
    }
};