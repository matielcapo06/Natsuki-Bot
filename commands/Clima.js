const { EmbedBuilder, Embed } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const axios = require('axios');
const { DateTime } = require('luxon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clima')
        .setDescription('Muestra el clima actual de una ubicación.')
        .addStringOption(option =>
            option.setName('ubicacion')
                .setDescription('Ingresa la ubicación para obtener el clima.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const ubicacion = interaction.options.getString('ubicacion');
            const apiKey = 'ce18846f3e6345129c7164944242204'; // Aquí debes colocar la clave de API proporcionada

            const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${ubicacion}&lang=es`;

            const response = await axios.get(url);
            const data = response.data;
            const clima = {};
            clima.ubicacion = data.location.name;
            clima.temperatura = `${data.current.temp_c}°C`;
            clima.descripcion = data.current.condition.text;
            clima.humedad = `${data.current.humidity}%`;
            clima.viento = `${data.current.wind_kph} kph`;
            clima.presion = `${data.current.pressure_mb} mb`;
            clima.uvIndex = data.current.uv;
            const offsetMinutes = DateTime.local().setZone(data.location.tz_id).offset;
            const offsetHours = offsetMinutes / 60;
            const gmt = `GMT${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
            
            clima.gmt = gmt;
            
            let embed;
if (clima.descripcion === 'Soleado') {
    embed = new EmbedBuilder()
        .setTitle(`:sunny: **Clima en ${clima.ubicacion}**`)
        .setColor('#0bc2d6')
        .setFields(
            { name: 'Temperatura', value: `${clima.temperatura}`, inline: true },
            { name: 'Humedad', value: `${clima.humedad}`, inline: true },
            { name: 'Rayos UV', value: `${clima.uvIndex}`, inline: true },
            { name: ' ', value: ' ', inline: false }, // Campo vacío para forzar un salto de línea
            { name: 'Viento', value: `${clima.viento}`, inline: true },
            { name: 'Presión', value: `${clima.presion}`, inline: true },
            { name: 'Huso horario', value: `${clima.gmt}`, inline: true },
        )
        .setFooter({
            text: `Clima • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
            iconURL: 'https://images.vexels.com/media/users/3/154307/isolated/preview/a38d9dafd989165be8ab4dbe0ad524d6-icono-de-trazo-de-meteorologia-en-la-nube.png'
        })
        .setDescription(`\`\`\`${clima.descripcion}\`\`\``);
} else if (clima.descripcion === 'Nublado') {
    embed = new EmbedBuilder()
        .setTitle(`:cloud: **Clima en ${clima.ubicacion}**`)
        .setColor('#0bc2d6')
        .setFields(
            { name: 'Temperatura', value: `${clima.temperatura}`, inline: true },
            { name: 'Humedad', value: `${clima.humedad}`, inline: true },
            { name: 'Rayos UV', value: `${clima.uvIndex}`, inline: true },
            { name: ' ', value: ' ', inline: false }, // Campo vacío para forzar un salto de línea
            { name: 'Viento', value: `${clima.viento}`, inline: true },
            { name: 'Presión', value: `${clima.presion}`, inline: true },
            { name: 'Huso horario', value: `${clima.gmt}`, inline: true },
        )
        .setFooter({
            text: `Clima • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
            iconURL: 'https://images.vexels.com/media/users/3/154307/isolated/preview/a38d9dafd989165be8ab4dbe0ad524d6-icono-de-trazo-de-meteorologia-en-la-nube.png'
        })
        .setDescription(`\`\`\`${clima.descripcion}\`\`\``);
} else if (clima.descripcion === 'Tormentas') {
    embed = new EmbedBuilder()
        .setTitle(`:thunder_cloud_rain: **Clima en ${clima.ubicacion}**`)
        .setColor('#0bc2d6')
        .setFields(
            { name: 'Temperatura', value: `${clima.temperatura}`, inline: true },
            { name: 'Humedad', value: `${clima.humedad}`, inline: true },
            { name: 'Rayos UV', value: `${clima.uvIndex}`, inline: true },
            { name: ' ', value: ' ', inline: false }, // Campo vacío para forzar un salto de línea
            { name: 'Viento', value: `${clima.viento}`, inline: true },
            { name: 'Presión', value: `${clima.presion}`, inline: true },
            { name: 'Huso horario', value: `${clima.gmt}`, inline: true },
        )
        .setFooter({
            text: `Clima • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
            iconURL: 'https://images.vexels.com/media/users/3/154307/isolated/preview/a38d9dafd989165be8ab4dbe0ad524d6-icono-de-trazo-de-meteorologia-en-la-nube.png'
        })
        .setDescription(`\`\`\`${clima.descripcion}\`\`\``);
} else {
    embed = new EmbedBuilder()
        .setTitle(`:white_sun_cloud: **Clima en ${clima.ubicacion}**`)
        .setColor('#0bc2d6')
        .setFields(
            { name: 'Temperatura', value: `${clima.temperatura}`, inline: true },
            { name: 'Humedad', value: `${clima.humedad}`, inline: true },
            { name: 'Rayos UV', value: `${clima.uvIndex}`, inline: true },
            { name: ' ', value: ' ', inline: false }, // Campo vacío para forzar un salto de línea
            { name: 'Viento', value: `${clima.viento}`, inline: true },
            { name: 'Presión', value: `${clima.presion}`, inline: true },
            { name: 'Huso horario', value: `${clima.gmt}`, inline: true },
        )
        .setFooter({
            text: `Clima • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
            iconURL: 'https://images.vexels.com/media/users/3/154307/isolated/preview/a38d9dafd989165be8ab4dbe0ad524d6-icono-de-trazo-de-meteorologia-en-la-nube.png'
        })
        .setDescription(`\`\`\`${clima.descripcion}\`\`\``);
}

await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ocurrió un error al ejecutar el comando "clima":', error);
            // Puedes agregar aquí cualquier acción adicional para manejar el error, como enviar un mensaje al usuario informando del problema.
        }
    }
};
