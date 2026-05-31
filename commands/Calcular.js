const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calcular')
        .setDescription('Realiza operaciones matemáticas.')
        .addStringOption(option => option
            .setName('operacion')
            .setDescription('Escribe aquí tu operación matemática.')
            .setRequired(true)),
    async execute(interaction) {
        const operation = interaction.options.getString('operacion');

        // Reemplazar el operador de división
        const formattedOperation = operation
            .replace(/:/g, '/')
            .replace(/÷/g, '/');

        // Reemplazar exponentes
        const formattedOperationWithExponents = formattedOperation
        .replace(/(\d+)\^9/g, (match, number) => `Math.pow(${number}, 9)`)
        .replace(/(\d+)\^8/g, (match, number) => `Math.pow(${number}, 8)`)
        .replace(/(\d+)\^7/g, (match, number) => `Math.pow(${number}, 7)`)
        .replace(/(\d+)\^6/g, (match, number) => `Math.pow(${number}, 6)`)
        .replace(/(\d+)\^5/g, (match, number) => `Math.pow(${number}, 5)`)
        .replace(/(\d+)\^4/g, (match, number) => `Math.pow(${number}, 4)`)
        .replace(/(\d+)\^3/g, (match, number) => `Math.pow(${number}, 3)`)
        .replace(/(\d+)\^2/g, (match, number) => `Math.pow(${number}, 2)`)
        .replace(/(\d+)⁹/g, (match, number) => `Math.pow(${number}, 9)`)
        .replace(/(\d+)⁸/g, (match, number) => `Math.pow(${number}, 8)`)
        .replace(/(\d+)⁷/g, (match, number) => `Math.pow(${number}, 7)`)
        .replace(/(\d+)⁶/g, (match, number) => `Math.pow(${number}, 6)`)
        .replace(/(\d+)⁵/g, (match, number) => `Math.pow(${number}, 5)`)
        .replace(/(\d+)⁴/g, (match, number) => `Math.pow(${number}, 4)`)
        .replace(/(\d+)³/g, (match, number) => `Math.pow(${number}, 3)`)
        .replace(/(\d+)²/g, (match, number) => `Math.pow(${number}, 2)`);
    
        // Reemplazar raíz cuadrada
        const formattedOperationWithRoot = formattedOperationWithExponents
        .replace(/sqrt\(([^)]*)\)/g, (match, innerContent) => `Math.sqrt(${innerContent})`)
        .replace(/√\(([^)]*)\)/g, (match, innerContent) => `Math.sqrt(${innerContent})`);

        // Reemplazar constantes matemáticas
        const formattedOperationWithConstants = formattedOperationWithRoot
            .replace(/e/g, Math.E)
            .replace(/π/g, Math.PI);

        try {
            const result = eval(formattedOperationWithConstants);

            const embed = new EmbedBuilder()
            .setTitle(':1234: Resultado de la operación')
            .setDescription(`\`\`\`${operation} = ${result}\`\`\``)
            .setColor('#43484f')
            .setFooter({
                text: `Calcular • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                iconURL: 'https://api.new.buscatuprofesor.mx/news_image/H5/Zs/H5Zsubr5A3qa0c6MxwHxpXv9fFcxcT4FqjU8j5h6.jpg'
            })
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(':x: Error en la operación')
                .setDescription(`Lo siento, hubo un error al calcular la operación: ${error.message}`)
                .setColor('#43484f');

            await interaction.reply({ embeds: [embed] });
        }
    },
};