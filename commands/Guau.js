const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const run = async () => {
    const { fetch } = await import('node-fetch');
};
run();


module.exports = {
    data: new SlashCommandBuilder()
        .setName("guau")
        .setDescription("Te responderé con la imagen de un perrito."),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(interaction) {
        try {
            const response = await fetch('https://api.thedogapi.com/v1/images/search', {
                headers: {
                    'x-api-key': 'live_pErBsJ1DGbg3BqgrTyEjTg0NevZE17Lp7iXPtDrdZlyGVXXyRDJckPmc7AQBD2by' // Necesitas obtener tu propia API Key desde 
                }
            });
            const data = await response.json();

            const dogImageUrl = data[0].url;
            const guau = new EmbedBuilder()
                .setColor('#4B3621')
                .setTitle(':dog:  **Aquí tienes un perrito.**')
                .setImage(dogImageUrl)
                .setFooter({
                    text: `Guau • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                    iconURL: 'https://i.pinimg.com/236x/fa/0c/fc/fa0cfcae1736b968f9630d1748cb54c2.jpg'
                })

            await interaction.deferReply(); 
            await interaction.followUp({ embeds: [guau] });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: ':service_dog: **Hubo un error al obtener la imagen del perrito.**' });
        }
    }
};
