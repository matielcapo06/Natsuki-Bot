const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar de un usuario.')
        .setContexts([0, 1, 2]) // Permite uso en DMs, servidores y canales de grupo
        .setIntegrationTypes([1]) // Permite integración en apps
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Usuario cuyo avatar quieres ver')
            .setRequired(false)), // No es obligatorio

    async execute(interaction) {
        await interaction.deferReply();
        
        // Obtener el usuario mencionado o el que ejecuta el comando
        const user = interaction.options.getUser('usuario') || interaction.user;
        
        // Formatear la fecha y hora como en el comando bola8
        const fechaHora = `${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`:camera: Avatar de ${user.username}`)
            .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
            .setFooter({
                text: `Avatar • ${fechaHora}`,
                iconURL: 'https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-s%C3%ADmbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk='
            });

        await interaction.followUp({ embeds: [embed] });
    },
};