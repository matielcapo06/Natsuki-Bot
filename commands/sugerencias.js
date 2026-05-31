const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('Envía una pregunta para revisión al canal de sugerencias')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Especifique la categoría de la pregunta')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('Texto completo de la pregunta')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('respuesta')
                .setDescription('Respuesta correcta')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('pista')
                .setDescription('Pista opcional (ej: "Empieza por A...")'))
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Mensaje cuando aciertan (ej: "¡Correcto!")')),

    async execute(interaction) {
        // ID del servidor oficial y canal de sugerencias
        const SERVIDOR_OFICIAL_ID = '978111552370663485'; //  ID del servidor
        const CANAL_SUGERENCIAS_ID = '1398589005099962439'; // ID del canal de sugerencias

        // 1. Obtener datos básicos (incluyendo categoría)
        const preguntaData = {
            categoria: interaction.options.getString('categoria'),
            texto: interaction.options.getString('pregunta'),
            respuesta: interaction.options.getString('respuesta'),
            pista: interaction.options.getString('pista') || 'Sin pista',
            mensaje: interaction.options.getString('mensaje') || `¡Correcto! La respuesta es: ${interaction.options.getString('respuesta')}`
        };

        // 2. Mostrar modal para las imágenes
        try {
            const modal = new ModalBuilder()
                .setCustomId(`imagenesModal_${interaction.user.id}`)
                .setTitle('Añadir imágenes (opcional)');

            const imagenInput = new TextInputBuilder()
                .setCustomId('imagenInput')
                .setLabel("URL imagen pregunta")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const imagenRCInput = new TextInputBuilder()
                .setCustomId('imagenRCInput')
                .setLabel("URL imagen respuesta")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(imagenInput),
                new ActionRowBuilder().addComponents(imagenRCInput)
            );

            // Mostrar modal sin esperar respuesta aquí
            await interaction.showModal(modal);

            // 3. Esperar la respuesta del modal
            const modalResponse = await interaction.awaitModalSubmit({
                filter: i => i.customId === `imagenesModal_${interaction.user.id}` && i.user.id === interaction.user.id,
                time: 60000
            });

            // Procesar URLs
            const validateURL = url => {
                if (!url) return null;
                try {
                    new URL(url);
                    return url;
                } catch {
                    return null;
                }
            };

            preguntaData.imagen = validateURL(modalResponse.fields.getTextInputValue('imagenInput'));
            preguntaData.imagenRC = validateURL(modalResponse.fields.getTextInputValue('imagenRCInput'));

            // 4. Obtener el cliente y el servidor oficial
            const client = interaction.client;
            const servidorOficial = await client.guilds.fetch(SERVIDOR_OFICIAL_ID);
            
            if (!servidorOficial) {
                return await modalResponse.reply({
                    content: '❌ No se pudo conectar con el servidor oficial del bot',
                    ephemeral: true
                });
            }

            // 5. Obtener el canal de sugerencias del servidor oficial
            const canalSugerencias = await servidorOficial.channels.fetch(CANAL_SUGERENCIAS_ID);
            
            if (!canalSugerencias) {
                return await modalResponse.reply({
                    content: '❌ No se encontró el canal de sugerencias en el servidor oficial',
                    ephemeral: true
                });
            }

            // 6. Crear embed con todos los campos
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('📌 Nueva Sugerencia')
                .addFields(
                    { name: 'Categoría', value: preguntaData.categoria },
                    { name: 'Pregunta', value: preguntaData.texto },
                    { name: 'Respuesta', value: preguntaData.respuesta },
                    { name: 'Pista', value: preguntaData.pista },
                    { name: 'Mensaje', value: preguntaData.mensaje },
                    { name: 'Sugerido por', value: interaction.user.tag },
                    { name: 'Servidor de origen', value: interaction.guild?.name || 'Mensaje privado' }
                );

            if (preguntaData.imagen) embed.setImage(preguntaData.imagen);
            if (preguntaData.imagenRC) embed.setThumbnail(preguntaData.imagenRC);

            // 7. Crear botón con ID único
            const botonJSON = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`json_${interaction.user.id}_${Date.now()}`)
                    .setLabel('📋 Generar JSON')
                    .setStyle(ButtonStyle.Primary)
            );

            // 8. Enviar todo al canal
            await canalSugerencias.send({
                content: `Nueva sugerencia de ${interaction.user.tag} desde el servidor: ${interaction.guild?.name || 'Mensaje privado'}`,
                embeds: [embed],
                components: [botonJSON]
            });

            // 9. Confirmación final
            await modalResponse.reply({
                content: '✅ Tu sugerencia ha sido enviada al servidor oficial del bot',
                ephemeral: true
            });

        } catch (error) {
            console.error('Error en el comando sugerir:', error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar tu sugerencia',
                    ephemeral: true
                });
            }
        }
    }
};