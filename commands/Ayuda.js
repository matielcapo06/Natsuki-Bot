const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayuda')
        .setDescription('Muestra la descripción de los comandos disponibles.'),
    async execute(interaction) {
        try {
            const Ayuda = new EmbedBuilder()
                .setColor('#F1B9C0')
                .setDescription(`
                    
🔝   **Votá por Natsuki** **→** [Votar](https://top.gg/bot/870706325208842281/vote) 

**🎮 Lista de comandos:**
\`\`\`
/avatar: Enseña el avatar de un usuario. 
/ayuda: Activa este comando.
/bola8: El bot responderá tus preguntas aleatoriamente.
/borrar: Comando de moderación para borrar mensajes del chat.
/calcular: Realiza cuentas matemáticas.
/categorias: Enseña las categorías disponibles para el juego de preguntas.
/clima: Consulta el clima en diferentes partes del mundo.
/doki-doki: Envía fotos de una gelería del juego Doki Doki Literature Club!
/dolar: Proporciona el valor en $ARS del dólar blue en tiempo real.
/fernanfrase: Envía una frase random de Fernanfloo.
/funfact: Envía datos curiosos aleatorios.
/guau: Envía fotos de perritos.
/miau: Envía fotos de gatitos.
/minecraft: Juego de adivinar bloques de Minecraft.
/ping: Indica el tiempo de respuesta del Bot.
/preguntas: Juego de adivinar diferentes preguntas.
/puntos: Indica la cantidad de puntos que has obtenido jugando.
/speedrun: Enseña la suerte actual de Seedluck (comando para speedrun de Minecraft).
/streamer: Informa sobre el estado de un streamer.
/tirar: Escoge un número aleatorio en el rango que desees.
/top: Muestra el top de usuarios con más puntos en el Bot.\`\`\`

💻    **¡Añádeme a tu servidor!** **→** [Haz clic aquí para añadirme a tu servidor](https://discord.com/oauth2/authorize?client_id=870706325208842281&permissions=8&scope=bot)

**•** *Bot desarrollado por matiii_8217, inspirado en TriviaBot.*`)
                    .setFooter({
                        text: `Ayuda • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                        iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQp0C9zKiUM8F6UcsAr7_S0sVcKkL-JCZSbkYtWaueRQ&s'
                    })
            await interaction.reply({ embeds: [Ayuda] });
        } catch (error) {
            console.error('Ocurrió un error al ejecutar el comando "ayuda":', error);
            // Puedes agregar aquí cualquier acción adicional para manejar el error, como enviar un mensaje al usuario informando del problema.
        }
    }
};
