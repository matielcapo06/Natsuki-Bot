const { EmbedBuilder, ButtonInteraction, InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // 1. Manejar diferentes tipos de interacción
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                return handleCommands(interaction, client);
            
            case InteractionType.MessageComponent:
                if (interaction.isButton()) {
                    return handleButtons(interaction);
                }
                break;
                
            case InteractionType.ModalSubmit:
                return handleModals(interaction);
        }
    }
};

// 1. Función para manejar comandos slash
async function handleCommands(interaction, client) {
    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
        return interaction.reply({
            content: '❌ Comando no encontrado',
            ephemeral: true
        });
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        
    }
}

// 2. Función para manejar botones (ya la tenías implementada)
async function handleButtons(interaction) {
    if (!interaction.customId.startsWith('json_')) return;

    try {
        const userId = interaction.customId.split('_')[1];
        
        if (userId !== interaction.user.id) {
            return interaction.reply({
                content: '❌ No puedes usar este botón',
                ephemeral: true
            });
        }

        const originalEmbed = interaction.message.embeds[0];
        if (!originalEmbed) {
            return interaction.reply({
                content: '❌ No se encontró el mensaje original',
                ephemeral: true
            });
        }

        const jsonResponse = buildSuggestionJSON(originalEmbed);
        
        await interaction.reply({
            content: `📋 JSON generado:\n\`\`\`json\n${JSON.stringify(jsonResponse, null, 2)}\n\`\`\``,
            ephemeral: true
        });

    } catch (error) {
        console.error('Error en handleButtons:', error);
        await interaction.reply({
            content: '❌ Error al procesar el botón',
            ephemeral: true
        });
    }
}

// 3. Función para manejar modales
async function handleModals(interaction) {
    // Ejemplo para manejar el modal de imágenes de tu comando /sugerir
    if (interaction.customId === 'imagenesModal') {
        try {
            // Procesar los datos del modal aquí
            // (Este sería manejado por el propio comando /sugerir en tu implementación actual)
            
            await interaction.reply({
                content: 'Modal procesado correctamente',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error procesando modal:', error);
            await interaction.reply({
                content: '❌ Error al procesar el formulario',
                ephemeral: true
            });
        }
    }
}

// Función auxiliar para construir el JSON (ya implementada)
function buildSuggestionJSON(embed) {
    const fieldMap = {};
    embed.fields.forEach(field => {
        fieldMap[field.name.toLowerCase()] = field.value;
    });

    return {
        Información: {
            enviado_el: new Date().toISOString()
        },

        Pregunta: {
            texto: fieldMap.pregunta || embed.title || 'Sin pregunta',
            respuesta: fieldMap.respuesta || 'Sin respuesta',
            imagen: embed.image?.url || null,
            pista: fieldMap.pista || 'Sin pista',
            mensaje: fieldMap.mensaje || `¡Correcto! La respuesta es: ${fieldMap.respuesta || 'Sin respuesta'}`,
            imagenRC: embed.thumbnail?.url || null,
        },

            
        author: fieldMap['sugerido por'] || 'Desconocido'
    };
}
