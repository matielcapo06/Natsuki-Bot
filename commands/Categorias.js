const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('categorias')
        .setDescription('Muestra las diferentes categorías para el juego de preguntas'),
    async execute(interaction) {
        let category = 'puntos';

        // Embed inicial informativo
        const initialEmbed = new EmbedBuilder()
            .setColor('#c46cda')
            .setTitle('✨ Categorías')
            .setDescription('```\n' +
'➤ 🚩 Banderas                                     \n' +
'➤ 🧪 Ciencia                                      \n' +
'➤ 📅 Fechas                                       \n' +
'➤ ⚽ Fútbol                                       \n' +
'➤ 🔢 Matemáticas                                  \n' +
'                                                   \n' +
'```')
            .setFooter({    text: `Categorías • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                            iconURL: 'https://martel.com.ar/storage/2023/04/01-1-600x553.jpg'
            });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('category_select')
            .setPlaceholder('Siguiente página')
            .addOptions([
                new StringSelectMenuOptionBuilder()
                    .setLabel('Página 2')
                    .setValue('page_2')
                    .setDescription('Pasar a la siguiente página')
                    .setEmoji('▶️'),
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Envía el embed inicial y el menú
        await interaction.reply({ 
            embeds: [initialEmbed], 
            components: [row] 
        });

        // Obtener el mensaje enviado
        const message = await interaction.fetchReply();

        // Crear el collector para el mensaje específico
        const collector = message.createMessageComponentCollector({ 
            filter: i => i.user.id === interaction.user.id && i.customId === 'category_select',
            time: 60000 
        });

        collector.on('collect', async i => {
    if (i.values[0] === 'page_2') {
        // Lógica para mostrar página 2
        const page2Embed = new EmbedBuilder()
            .setColor('#c46cda')
            .setTitle('✨ Categorías - Página 2')
            .setDescription('```\n' +
                '➤ 🎁 Próximamente                                 \n' +
                '                                                   \n' +
                '```')
            .setFooter({
                text: `Categorías • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                iconURL: 'https://martel.com.ar/storage/2023/04/01-1-600x553.jpg'
            });

        const page2Menu = new StringSelectMenuBuilder()
            .setCustomId('category_select')
            .setPlaceholder('Página 2')
            .addOptions([
                new StringSelectMenuOptionBuilder()
                    .setLabel('Página 1')
                    .setValue('page_1')
                    .setDescription('Volver a la página anterior')
                    .setEmoji('◀️'),
                // Aquí puedes añadir más opciones reales para página 2 si quieres
            ]);

        const newRow = new ActionRowBuilder().addComponents(page2Menu);

        await i.update({ embeds: [page2Embed], components: [newRow] });

    } else if (i.values[0] === 'page_1') {
        // Lógica para volver a página 1
        const page1Embed = new EmbedBuilder()
            .setColor('#c46cda')
            .setTitle('✨ Categorías')
            .setDescription('```\n' +
                '➤ 🚩 Banderas                                     \n' +
                '➤ 🧪 Ciencia                                      \n' +
                '➤ 📅 Fechas                                       \n' +
                '➤ ⚽ Fútbol                                       \n' +
                '➤ 🔢 Matemáticas                                  \n' +
                '                                                   \n' +
                '```')
            .setFooter({
                text: `Categorías • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                iconURL: 'https://martel.com.ar/storage/2023/04/01-1-600x553.jpg'
            });

        const page1Menu = new StringSelectMenuBuilder()
            .setCustomId('category_select')
            .setPlaceholder('Página 1')
            .addOptions([
                new StringSelectMenuOptionBuilder()
                    .setLabel('Página 2')
                    .setValue('page_2')
                    .setDescription('Pasar a la siguiente página')
                    .setEmoji('▶️'),
                // Aquí puedes añadir más opciones reales para página 1 si quieres
            ]);

        const newRow = new ActionRowBuilder().addComponents(page1Menu);

        await i.update({ embeds: [page1Embed], components: [newRow] });

    } else {
        // Aquí puedes manejar la selección de categorías, si es que tienes alguna opción con otro value
        // Por ejemplo:
        // const category = i.values[0];
        // ... lógica para mostrar datos de la categoría seleccionada ...
    }
});
}
};