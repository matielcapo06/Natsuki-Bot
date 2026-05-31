const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('puntos.db');

// Función para truncar texto
const truncate = (str, n) => str.length > n ? str.slice(0, n) + '…' : str;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Muestra el top 10 de usuarios en diferentes categorías.'),
    async execute(interaction) {
        let category = 'puntos';

        // Embed inicial informativo
        const initialEmbed = new EmbedBuilder()
            .setColor('#FFD300')
            .setTitle('🏆 Tabla de Clasificaciones 🏆')
            .setDescription('¡Bienvenido al sistema de clasificaciones! Selecciona una categoría para ver los mejores jugadores en cada modalidad.')
            .addFields(
                { name: '📊 Puntos Históricos', value: 'Muestra los usuarios con más puntos acumulados', inline: true },
                { name: '⏱️ Tiempos Rápidos', value: 'Muestra los récords de velocidad en diferentes juegos', inline: true }
            )
            .setFooter({
                text: `top • ${new Date().toLocaleDateString('es-ES')}`,
                iconURL: 'https://i.pinimg.com/736x/21/84/62/218462e75e2d4b5833439830039f451f.jpg'
            });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('category_select')
            .setPlaceholder('Selecciona una categoría')
            .addOptions([
                new StringSelectMenuOptionBuilder()
                    .setLabel('Top Histórico De Puntos')
                    .setValue('puntos')
                    .setDescription('Usuarios con más puntos acumulados')
                    .setEmoji('🏅'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Top de Banderas')
                    .setValue('TiempoBanderas')
                    .setDescription('Mejores tiempos en el juego de banderas')
                    .setEmoji('🏳️'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Top de Ciencias')
                    .setValue('TiempoCiencias')
                    .setDescription('Mejores tiempos en el juego de ciencias')
                    .setEmoji('🔬'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Top de Fechas')
                    .setValue('TiempoFechas')
                    .setDescription('Mejores tiempos en el juego de fechas')
                    .setEmoji('📅'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Top de Fútbol')
                    .setValue('TiempoDeportes')
                    .setDescription('Mejores tiempos en el juego de fútbol')
                    .setEmoji('⚽'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Top de Resuelve')
                    .setValue('TiempoResuelve')
                    .setDescription('Mejores tiempos en el juego Resuelve')
                    .setEmoji('🧩'),
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
            category = i.values[0];
            const orderBy = category.startsWith('Tiempo') ? 'ASC' : 'DESC';

            db.all(
                `SELECT username, ${category} FROM puntajes 
                 WHERE ${category} IS NOT NULL 
                 ORDER BY ${category} ${orderBy} 
                 LIMIT 10`,  [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return i.reply({ content: 'Ocurrió un error al procesar la solicitud.', ephemeral: true });
                }

                if (rows && rows.length > 0) {
                    const categoryTitles = {
                        puntos: '🏆 Top Histórico De Puntos 🏆',
                        TiempoFechas: '⏱️ Top más rápidos de Fechas ⏱️',
                        TiempoBanderas: '⏱️ Top más rápidos de Banderas ⏱️',
                        TiempoResuelve: '⏱️ Top más rápidos de Resuelve ⏱️',
                        TiempoCiencias: '⏱️ Top más rápidos de Ciencias ⏱️',
                        TiempoDeportes: '⏱️ Top más rápidos de Fútbol ⏱️'
                    };

                    const descriptions = rows.map((row, index) => {
                        const username = truncate(row.username, 20); // Truncar el nombre de usuario a 20 caracteres
                        return `*#${index + 1}* \`${username}\` **(${row[category]})**`;
                    });

                    const resultsEmbed = new EmbedBuilder()
                        .setTitle(categoryTitles[category])
                        .setDescription(descriptions.join('\n'))
                        .setColor('#FFD300')
                        .setFooter({
                            text: `Top • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                            iconURL: 'https://i.pinimg.com/736x/21/84/62/218462e75e2d4b5833439830039f451f.jpg'
                        });

                    i.update({ 
                        embeds: [resultsEmbed], 
                        components: [row] 
                    });
                } else {
                    i.update({ 
                        content: `No hay datos disponibles para la categoría ${category}.`, 
                        embeds: [], 
                        components: [row] 
                    });
                }
            });
        });

        collector.on('end', () => {
            // Opcional: puedes desactivar el menú cuando el collector termina
            message.edit({ components: [] }).catch(console.error);
        });
    },
};