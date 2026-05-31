const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const run = async () => {
    const { fetch } = await import('node-fetch');
};
run();


module.exports = {
    data: new SlashCommandBuilder()
        .setName("miau")
        .setDescription("Te responderé con la imagen de un gatito."),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(interaction) {
        try {
            const response = await fetch('https://api.thecatapi.com/v1/images/search', {
                headers: {
                    'x-api-key': 'live_NWkEO0CxQ5WbKvD38XAtbMIF12WwA4JVdlWbU84Bpqw3DU00OjYrTtqIj68KC9FL'}
            });
            const data = await response.json();

            const catImageUrl = data[0].url;

            // Crear el embed con la imagen obtenida
            const miau = new EmbedBuilder()
                .setColor('#e8b827')
                .setTitle(':smiley_cat:  **Aquí tienes un gatito.**')
                .setImage(catImageUrl)
                .setFooter({
                    text: `Miau • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                    iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToM8Ys0r8yJ859WkKXuNuF7se0htT-C0d_ACec5GqtMPsCAzCEoooWTYBKTEXwaORCMSc&usqp=CAU'
                })

            await interaction.deferReply(); // Defer the reply before sending the embed
            await interaction.followUp({ embeds: [miau] });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: ':crying_cat_face: Hubo un error al obtener la imagen del gatito.' });
        }
    }
};