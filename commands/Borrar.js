const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('borrar')
        .setDescription('Borra mensajes en el chat.')
        .addIntegerOption(option => option
            .setName('cantidad')
            .setDescription('Cantidad de mensajes a borrar')
            .setRequired(true)),

    async execute(interaction) {
        try {
            if (!(interaction.member.permissions & 8n)) {
                return await interaction.reply('¡No tienes permisos para usar este comando!');
            }

            const cantidad = interaction.options.getInteger('cantidad');

            if (isNaN(cantidad) || cantidad < 1 || cantidad > 500) {
                const embed = new EmbedBuilder()
                    .setColor('#F5E31b')
                    .setTitle(':wastebasket: Borrar')
                    .setDescription(`Por favor, ingrese un número válido entre 1 y 500.`);

                return await interaction.reply({ embeds: [embed] });
            }

            const messages = await interaction.channel.messages.fetch({ limit: Number(cantidad) });
            const deletedCount = messages.size;
            await interaction.channel.bulkDelete(messages);

            const embed = new EmbedBuilder()
                .setColor('#E83815')
                .setTitle(':wastebasket: Borrar')
                .setDescription(`Se han borrado ${deletedCount} mensajes.`)
                .setFooter({
                    text: `Borrar • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                    iconURL: 'https://c0.klipartz.com/pngpicture/764/520/gratis-png-contenedor-de-residuos-icono-reciclaje-bote-de-basura.png'
                })

            return await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    },
    defaultPermission: false,
};