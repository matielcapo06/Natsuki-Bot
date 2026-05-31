const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Configuración de archivos
const BLOQUES_FILE = path.join(__dirname, '..', 'Datos', 'minecraft.txt');

function leerJSON(archivo) {
    try {
        if (!fs.existsSync(archivo)) {
            fs.writeFileSync(archivo, JSON.stringify({}), 'utf8');
            return {};
        }
        return JSON.parse(fs.readFileSync(archivo, 'utf8'));
    } catch (error) {
        console.error(`Error al leer ${archivo}:`, error);
        return {};
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bloques')
        .setDescription('Adivina múltiples bloques de Minecraft')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Número de bloques a adivinar')
                .setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const cantidad = interaction.options.getInteger('cantidad');
            const bloques = leerJSON(BLOQUES_FILE);
            const resultadosUsuarios = new Map();

            const infoEmbed = new EmbedBuilder()
                .setColor('#b87e1c')
                .setTitle(`:pick: **Adivina**`)
                .setDescription(`A continuación te daré pistas acerca de un bloque de Minecraft, puedes decirme... **¿Qué bloque es?**`)
                .setFooter({
                    text: `Minecraft • ${new Date().toLocaleTimeString('es-ES')} - ${new Date().toLocaleDateString('es-ES')}`,
                    iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Userbox_creeper.svg/320px-Userbox_creeper.svg.png`
                });
            
            await interaction.editReply({ embeds: [infoEmbed] });

            const bloquesDisponibles = Object.keys(bloques).filter(b => bloques[b].datos.length >= 3);
            if (bloquesDisponibles.length < cantidad) {
                return interaction.followUp(`No hay suficientes bloques con pistas disponibles (necesitas ${cantidad}, hay ${bloquesDisponibles.length}).`);
            }

            const bloquesAleatorios = [];
            while (bloquesAleatorios.length < cantidad && bloquesDisponibles.length > 0) {
                const randomIndex = Math.floor(Math.random() * bloquesDisponibles.length);
                bloquesAleatorios.push(bloquesDisponibles.splice(randomIndex, 1)[0]);
            }

            const manejarBloque = async (bloqueNombre, index) => {
                const bloque = bloques[bloqueNombre];
                const respuestasValidas = [bloqueNombre.toLowerCase(), ...(bloque.nombres_alternativos || []).map(n => n.toLowerCase())];
                const pistas = [...bloque.datos];
                const imagenBloque = pistas.pop();
                
                await new Promise(resolve => setTimeout(resolve, 5000));

                const bloqueEmbed = new EmbedBuilder()
                    .setColor('#b87e1c')
                    .setTitle(`:bulb: Pistas`)
                    .setDescription(`**Pista 1/${pistas.length}:** ${pistas[0]}`)
                    .setFooter({
                        text: `Bloque ${index + 1} de ${cantidad}. Minecraft • ${new Date().toLocaleTimeString('es-ES')} - ${new Date().toLocaleDateString('es-ES')}`,
                        iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Userbox_creeper.svg/320px-Userbox_creeper.svg.png`
                    });
                
                    
                const mensajeBloque = await interaction.followUp({ embeds: [bloqueEmbed] });
                
                let bloqueResuelto = false;
                let pistaActual = 1;
                const MAX_PISTAS = pistas.length;

                const mostrarPista = async () => {
                    if (pistaActual >= pistas.length || bloqueResuelto) return;
                    
                    bloqueEmbed.setDescription(`**Pista ${pistaActual + 1}/${MAX_PISTAS}:** ${pistas[pistaActual]}`);
                    await mensajeBloque.edit({ embeds: [bloqueEmbed] });
                    pistaActual++;
                };

                const intervaloPistas = setInterval(mostrarPista, 7000);

                // Definir el collector aquí dentro del ámbito correcto
                const collector = interaction.channel.createMessageCollector({ 
                    filter: m => !m.author.bot, 
                    time: 50000 
                });

                return new Promise((resolve) => {
                    collector.on('collect', async m => {
                        const respuestaUsuario = m.content.toLowerCase();
                        if (respuestasValidas.includes(respuestaUsuario)) {
                            const userId = m.author.id;
                            if (!resultadosUsuarios.has(userId)) {
                                resultadosUsuarios.set(userId, {
                                    username: m.author.username,
                                    aciertos: 0
                                });
                            }
                            const usuario = resultadosUsuarios.get(userId);
                            usuario.aciertos++;

                            if (!bloqueResuelto) {
                                bloqueResuelto = true;
                                clearInterval(intervaloPistas);
                                
                                bloqueEmbed
                                    .setColor('#83FF7B')
                                    .setTitle(':white_check_mark: **Respuesta correcta**')
                                    .setDescription(`¡${m.author.username} adivinó el bloque correcto: **${bloqueNombre}**!`)
                                    .setImage(imagenBloque);
                                
                                await mensajeBloque.edit({ embeds: [bloqueEmbed] });
                                collector.stop();
                            } else {
                                await m.reply(`¡Correcto! El bloque era **${bloqueNombre}**. (+1 punto)`);
                            }
                        }
                    });

                    collector.on('end', async collected => {
                        clearInterval(intervaloPistas);
                        if (!bloqueResuelto) {
                            bloqueEmbed
                                .setColor('#FC5564')
                                .setTitle(':clock1: **Tiempo agotado**')
                                .setDescription(`El bloque era: **${bloqueNombre}**.`)
                                .setImage(imagenBloque);
                            
                            await mensajeBloque.edit({ embeds: [bloqueEmbed] });
                        }
                        resolve();
                    });
                });
            };

            for (let i = 0; i < bloquesAleatorios.length; i++) {
                await manejarBloque(bloquesAleatorios[i], i);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }

            const usuariosArray = Array.from(resultadosUsuarios.values());
            usuariosArray.sort((a, b) => b.aciertos - a.aciertos);
            usuariosArray.forEach((usuario, index) => {
                // Asignar emojis según la posición
                let emoji = '🔹';
                if (index === 0) emoji = '🥇';
                else if (index === 1) emoji = '🥈';
                else if (index === 2) emoji = '🥉';
                
                rankingDescription += `${emoji} ${index + 1}. ${usuario.username} (${usuario.aciertos})\n`;
            });
            rankingDescription += '```';

            // Resumen final con ranking
            const resumenEmbed = new EmbedBuilder()
                .setTitle(`🏆 **TOP JUGADORES**`)
                .setColor('#FFDF00')
                .setDescription(rankingDescription)
                .setFooter({
                    text: `Minecraft • ${new Date().toLocaleTimeString('es-ES')} - ${new Date().toLocaleDateString('es-ES')}`,
                    iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Userbox_creeper.svg/320px-Userbox_creeper.svg.png'
                });

                await interaction.followUp({ embeds: [resumenEmbed] });

        } catch (error) {
            console.error('Error en el comando bloques:', error);
            await interaction.followUp('Ocurrió un error al procesar el comando. Por favor, inténtalo de nuevo.');
        }
    },
};