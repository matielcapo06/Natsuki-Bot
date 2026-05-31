const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuración
const TIEMPO_RESPUESTA = 20000; // 20 segundos
const TIEMPO_PISTA = 10000; // 10 segundos
const PUNTOS_BASE = 10;
const PUNTOS_CON_PISTA = 5;
const PUNTOS_EXTREMO = 15;
const HISTORIAL_PREGUNTAS = 3;

// Control de rondas activas
const rondasActivas = new Set();
const rondasPausadas = new Set();
const colectoresActivos = new Map();
const estadoRondas = new Map();

// Historial de preguntas
const historialPreguntas = {};

// Colores y configuración de embeds
const colores = {
    exito: '#83FF7B',
    error: '#FC5564',
    pregunta: '#70F9FF',
    deportes: '#daa71d',
    banderas: '#0051ff',
    ciencias: '#6ee094',
    fechas: '#5a4f63',
    matematicas: '#2ECC71'
};

const categoryConfig = {
    banderas: { table: 'TiempoBanderas', color: colores.banderas, icon: 'https://www.lavoz.com.ar/resizer/2t9fJnJQndTcJSdszufgHOSzFcQ=/arc-anglerfish-arc2-prod-grupoclarin/public/IKZOHFNEFJCJZCZTNA4KFIFCBI.jpg' },
    ciencias: { table: 'TiempoCiencias', color: colores.ciencias, icon: 'https://cdn-icons-png.flaticon.com/512/10646/10646252.png' },
    fechas: { table: 'TiempoFechas', color: colores.fechas, icon: 'https://elucabista.com/wp-content/uploads/2017/01/historia.jpg' },
    futbol: { table: 'TiempoDeportes', color: colores.deportes, icon: 'https://img.freepik.com/foto-gratis/balon-futbol_1398-1351.jpg?semt=ais_hybrid&w=740' },
    matematicas: { table: 'TiempoResuelve', color: colores.matematicas, icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv9sHMNo9aN2iW1dHrXoxglYJgfvZDS_xYvA&s' }
};

// Conexión a la base de datos 
const db = new sqlite3.Database('./puntos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error('Error al conectar a la base de datos:', err.message);
    db.run(`CREATE TABLE IF NOT EXISTS puntajes (
        id TEXT PRIMARY KEY,
        username TEXT,
        TiempoBanderas REAL,
        TiempoCiencias REAL,
        TiempoFechas REAL,
        TiempoDeportes REAL,
        TiempoResuelve REAL,
        puntos INTEGER DEFAULT 0
    )`);
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('preguntas')
        .setDescription('Sistema de preguntas interactivo')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Elige una categoría')
                .setRequired(false)
                .addChoices(
                    { name: 'Banderas', value: 'banderas' },
                    { name: 'Ciencias', value: 'ciencias' },
                    { name: 'Fechas', value: 'fechas' },
                    { name: 'Fútbol', value: 'futbol' },
                    { name: 'Matemáticas', value: 'matematicas' },
                    { name: 'Mix', value: 'mix'}
                ))
        .addStringOption(option =>
            option.setName('dificultad')
                .setDescription('Dificultad de las preguntas')
                .setRequired(false)
                .addChoices(
                    { name: 'Normal', value: 'normal' },
                    { name: 'Extremo', value: 'extremo' }
                ))
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Número de preguntas a realizar')
                .setRequired(false)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('opcion')
                .setDescription('Opciones de control de la ronda')
                .setRequired(false)
                .addChoices(
                    { name: 'Detener', value: 'detener' },
                    { name: 'Reanudar', value: 'reanudar' },
                    { name: 'Terminar', value: 'terminar' }
                )),

    async execute(interaction) {
        const opcion = interaction.options.getString('opcion');
        
        // Manejar opción de terminar
        if (opcion === 'terminar') {
            if (!rondasActivas.has(interaction.channelId)) {
                return await interaction.reply({
                    content: '❌ No hay ninguna ronda activa en este canal para terminar.',
                    ephemeral: true
                });
            }
            
            // Limpiar todo el estado
            const collector = colectoresActivos.get(interaction.channelId);
            if (collector) collector.stop('terminado');
            
            rondasActivas.delete(interaction.channelId);
            rondasPausadas.delete(interaction.channelId);
            colectoresActivos.delete(interaction.channelId);
            estadoRondas.delete(interaction.channelId);
            
            return await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(colores.error)
                    .setTitle('⏹ Ronda finalizada')
                    .setDescription('La ronda de preguntas ha sido finalizada manualmente. Recuerda que puedes iniciar una nueva cuando quieras.')
                ]
            });
        }

        // Manejar opción de detener
        if (opcion === 'detener') {
            if (!rondasActivas.has(interaction.channelId)) {
                return await interaction.reply({
                    content: '❌ No hay ninguna ronda activa en este canal para detener.',
                    ephemeral: true
                });
            }
            
            if (rondasPausadas.has(interaction.channelId)) {
                return await interaction.reply({
                    content: '❌ La ronda ya está pausada en este canal.',
                    ephemeral: true
                });
            }
            
            rondasPausadas.add(interaction.channelId);
            const collector = colectoresActivos.get(interaction.channelId);
            if (collector) collector.stop('pausado');
            
            return await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('⏸ Ronda pausada')
                    .setDescription('La ronda de preguntas ha sido pausada. Usa `/preguntas opcion: reanudar` para continuar.')
                ]
            });
        }
        
        // Manejar opción de reanudar
        if (opcion === 'reanudar') {
            if (!rondasActivas.has(interaction.channelId)) {
                return await interaction.reply({
                    content: '❌ No hay ninguna ronda pausada en este canal para reanudar.',
                    ephemeral: true
                });
            }
            
            if (!rondasPausadas.has(interaction.channelId)) {
                return await interaction.reply({
                    content: '❌ La ronda no está pausada en este canal.',
                    ephemeral: true
                });
            }
            
            const estado = estadoRondas.get(interaction.channelId);
            if (!estado) {
                return await interaction.reply({
                    content: '❌ No se pudo recuperar el estado de la ronda.',
                    ephemeral: true
                });
            }
            
            rondasPausadas.delete(interaction.channelId);
            
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('▶ Ronda reanudada')
                    .setDescription('La ronda de preguntas ha sido reanudada. La próxima pregunta comenzará en breve.')
                ]
            });
            
            await processQuestion(interaction, estado.preguntasRealizadas);
            return;
        }

        // Verificar si ya hay una ronda activa
        if (rondasActivas.has(interaction.channelId) && !rondasPausadas.has(interaction.channelId)) {
            return await interaction.reply({
                content: '❌ Ya hay una ronda en curso en este canal. Espera a que termine o usa `/preguntas opcion: terminar`.',
                ephemeral: true
            });
        }

        // Registrar ronda activa
        rondasActivas.add(interaction.channelId);
        rondasPausadas.delete(interaction.channelId);

        const category = interaction.options.getString('categoria') || 'mix';
        const difficulty = interaction.options.getString('dificultad') || 'normal';
        const cantidad = interaction.options.getInteger('cantidad') || 1;
        const isMixMode = category === 'mix';

        // Configurar estado inicial
        estadoRondas.set(interaction.channelId, {
            preguntasRealizadas: 0,
            cantidad: cantidad,
            category: category,
            difficulty: difficulty,
            isMixMode: isMixMode
        });

        // Solo limpiar historial si no hay una ronda pausada
        if (!rondasPausadas.has(interaction.channelId)) {
            Object.keys(historialPreguntas).forEach(key => delete historialPreguntas[key]);
        }

        try {
            if (cantidad > 1) {
                const inicioEmbed = new EmbedBuilder()
                    .setColor(colores.pregunta)
                    .setTitle('🎲 La ronda de preguntas está a punto de comenzar')
                    .setDescription(`\`\`\`A continuación comenzará una ronda de preguntas, responde correctamente para recibir puntos y
estar entre los mejores.\`\`\``);
                await interaction.reply({ embeds: [inicioEmbed] });
            }

            await processQuestion(interaction, 0);

        } catch (error) {
            console.error('Error en comando preguntas:', error);
            await interaction.followUp({ 
                content: '❌ Error al cargar la pregunta. Por favor intenta nuevamente.',
                ephemeral: true 
            });
            
            // Limpiar en caso de error
            rondasActivas.delete(interaction.channelId);
            rondasPausadas.delete(interaction.channelId);
            colectoresActivos.delete(interaction.channelId);
            estadoRondas.delete(interaction.channelId);
        }
    }
};

async function processQuestion(interaction, index) {
    const estado = estadoRondas.get(interaction.channelId);
    if (!estado || rondasPausadas.has(interaction.channelId)) return;

    // Usar el historial del estado si existe, o crear uno nuevo
    estado.historialPreguntas = estado.historialPreguntas || {};

    const targetCategory = estado.isMixMode ? getRandomCategory() : estado.category;
    const questionsData = loadQuestions(targetCategory);
    const questions = questionsData.preguntas;
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error(`No hay preguntas disponibles para ${targetCategory}`);
    }

    // Filtrar preguntas recientes
    const preguntasRecientes = historialPreguntas[targetCategory] || [];
    const preguntasDisponibles = questions.filter(q => !preguntasRecientes.some(p => p.texto === q.texto));
    const questionsPool = preguntasDisponibles.length > 0 ? preguntasDisponibles : questions;
    
    const question = questionsPool[Math.floor(Math.random() * questionsPool.length)];
    if (!question || !question.texto) throw new Error('Pregunta mal formada');

    // Actualizar historial en el estado
    if (!estado.historialPreguntas[targetCategory]) {
        estado.historialPreguntas[targetCategory] = [];
    }
    estado.historialPreguntas[targetCategory].push(question);
    
    if (estado.historialPreguntas[targetCategory].length > HISTORIAL_PREGUNTAS) {
        estado.historialPreguntas[targetCategory].shift();
    }

    const replyMethod = index === 0 && estado.cantidad === 1 ? 'reply' : 'followUp';
    
    await showQuestion(interaction, question, targetCategory, estado.difficulty, estado.isMixMode, index+1, estado.cantidad, replyMethod);
    
    // Actualizar estado
    estado.preguntasRealizadas = index + 1;
    estadoRondas.set(interaction.channelId, estado);
    
    if (index >= estado.cantidad - 1) {
        if (estado.cantidad > 1) {
            const finalEmbed = new EmbedBuilder()
                .setColor(colores.exito)
                .setTitle('🏁 Ronda completada')
                .setDescription(`La ronda de preguntas se ha acabado. Se han realizado ${estado.cantidad} preguntas.`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                await interaction.channel.send({ embeds: [finalEmbed] });
        }
        
        // Limpiar al finalizar
        rondasActivas.delete(interaction.channelId);
        rondasPausadas.delete(interaction.channelId);
        colectoresActivos.delete(interaction.channelId);
        estadoRondas.delete(interaction.channelId);
        return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 15000));
    await processQuestion(interaction, index + 1);
}

// Funciones auxiliares 

async function showQuestion(interaction, question, category, difficulty, isMixMode = false, preguntaActual = 1, totalPreguntas = 1, replyMethod = 'reply') {
    return new Promise(async (resolve) => {
        try {
            // Verificar si la ronda está pausada antes de mostrar la pregunta
            if (rondasPausadas.has(interaction.channelId)) {
                await interaction.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('⏸ Ronda pausada')
                        .setDescription('La ronda está actualmente pausada. Usa `/preguntas opcion: reanudar` para continuar.')
                    ]
                });
                return resolve();
            }

            const config = categoryConfig[category] || categoryConfig.futbol;
            const categoryDisplayName = formatCategoryName(category);
            const modeIndicator = isMixMode ? ': Modo Mix' : '';
            const progressInfo = totalPreguntas > 1 ? ` [${preguntaActual}/${totalPreguntas}] ` : '';
            const difficultyIndicator = difficulty === 'extremo' ? '🔥 ' : '❓';

            // Embed de pregunta
            const questionEmbed = crearEmbedConFooter(
                config.color,
                `${difficultyIndicator}${progressInfo}${categoryDisplayName}${modeIndicator}`,
                question.texto,
                category
            );
            
            if (question.imagen) {
                questionEmbed.setImage(question.imagen);
            }

            // Responder a la interacción primero
            let reply;
            try {
                if (replyMethod === 'reply') {
                    reply = await interaction.reply({ 
                        embeds: [questionEmbed],
                        fetchReply: true 
                    });
                } else {
                    reply = await interaction.followUp({ 
                        embeds: [questionEmbed],
                        fetchReply: true 
                    });
                }
            } catch (error) {
                console.error('Error al responder:', error);
                throw error;
            }

            // Variables para controlar pista y puntos
            let pistaEnviada = false;
            let puntosAPremiar = difficulty === 'extremo' ? PUNTOS_EXTREMO : PUNTOS_BASE;

            // Configurar temporizador para pista automática
            const pistaTimeout = difficulty !== 'extremo' ? setTimeout(async () => {
                try {
                    if (question.pista && !rondasPausadas.has(interaction.channelId)) {
                        const puntosReducidos = difficulty === 'extremo' ? Math.floor(PUNTOS_EXTREMO * 0.5) : PUNTOS_CON_PISTA;
                        const hintEmbed = crearEmbedConFooter(
                            '#FFA500',
                            '💡 Pista',
                            `\`\`\`\n${question.pista}\n\`\`\``,
                            category
                        );
                        await reply.reply({ embeds: [hintEmbed] });
                        pistaEnviada = true;
                        puntosAPremiar = puntosReducidos;
                    }
                } catch (error) {
                    console.error('Error al enviar pista:', error);
                }
            }, TIEMPO_PISTA) : null;

            // Collector para respuestas
            const filter = m => !m.author.bot;
            const collector = reply.channel.createMessageCollector({ 
                filter, 
                time: TIEMPO_RESPUESTA 
            });

            // Guardar el collector para poder detenerlo luego
            colectoresActivos.set(interaction.channelId, collector);

            const startTime = Date.now();

            collector.on('collect', async m => {
                try {
                    // Si la ronda está pausada, ignorar respuestas
                    if (rondasPausadas.has(interaction.channelId)) {
                        return;
                    }
                    
                    const userAnswer = m.content.toLowerCase().trim();
                    const correctAnswers = Array.isArray(question.respuesta) 
                        ? question.respuesta.map(r => r.toLowerCase())
                        : [question.respuesta.toLowerCase()];
                    
                    if (correctAnswers.includes(userAnswer)) {
                        collector.stop('correcto');
                        if (pistaTimeout) clearTimeout(pistaTimeout);
                        
                        const responseTime = (Date.now() - startTime) / 1000;
                        await handleCorrectAnswer(interaction, question, category, responseTime, m.author.id, m.author.username, puntosAPremiar);
                    }
                } catch (error) {
                    console.error('Error al procesar respuesta:', error);
                }
            });

            collector.on('end', async (collected, reason) => {
                try {
                    if (pistaTimeout) clearTimeout(pistaTimeout);
                    colectoresActivos.delete(interaction.channelId);
                    
                    // Solo mostrar mensaje de tiempo agotado si no fue terminado manualmente
                    if (reason === 'time' && !rondasPausadas.has(interaction.channelId)) {
                        await handleIncorrectAnswer(interaction, question, category);
                    }
                    // Si fue pausado o terminado, no hacer nada adicional
                } catch (error) {
                    console.error('Error al finalizar collector:', error);
                } finally {
                    resolve();
                }
            });

        } catch (error) {
            console.error('Error en showQuestion:', error);
            try {
                await interaction.followUp({ 
                    content: '❌ Ocurrió un error al mostrar la pregunta',
                    ephemeral: true 
                });
            } catch (followUpError) {
                console.error('Error al enviar mensaje de error:', followUpError);
            }
            resolve();
        }
    });
}

async function handleCorrectAnswer(interaction, question, category, responseTime, userId, username, puntos = PUNTOS_BASE) {
    const config = categoryConfig[category] || categoryConfig.futbol;
    const timeTakenFormatted = responseTime.toFixed(2);
    
    // Verificar si es un nuevo récord
    db.get(`SELECT ${config.table}, username FROM puntajes WHERE id = ?`, [userId], async (err, row) => {
        if (err) {
            console.error('Error al verificar récord:', err);
            return sendResponseEmbed(interaction, question, category, userId, timeTakenFormatted, false, username, puntos);
        }

        const currentRecord = row ? row[config.table] : null;
        const isNewRecord = currentRecord === null || responseTime < currentRecord;
        const currentUsername = row ? row.username : username;

        // Actualizar la base de datos
        db.serialize(() => {
            // Insertar o actualizar usuario si no existe o si el nombre ha cambiado
            if (!row || currentUsername !== username) {
                db.run(`INSERT OR REPLACE INTO puntajes (id, username, ${config.table}, puntos) VALUES (?, ?, ?, COALESCE((SELECT puntos FROM puntajes WHERE id = ?), 0))`, 
                    [userId, username, isNewRecord ? responseTime.toFixed(2) : null, userId]);
            }
            
            // Actualizar el récord si es nuevo
            if (isNewRecord) {
                db.run(`UPDATE puntajes SET ${config.table} = ? WHERE id = ?`, 
                    [responseTime.toFixed(2), userId]);
            }
            
            // Actualizar puntos siempre
            db.run(`UPDATE puntajes SET puntos = puntos + ? WHERE id = ?`, 
                [puntos, userId], (err) => {
                    if (err) console.error('Error al actualizar puntos:', err);
                    
                    // Verificar si es el récord historico
                    db.get(`SELECT MIN(${config.table}) as recordHistorico FROM puntajes WHERE ${config.table} IS NOT NULL`, 
                        (err, recordRow) => {
                            const isAbsoluteRecord = recordRow && isNewRecord && responseTime <= recordRow.recordHistorico;
                            sendResponseEmbed(interaction, question, category, userId, timeTakenFormatted, isNewRecord, username, isAbsoluteRecord, puntos);
                        });
                });
        });
    });
}

function sendResponseEmbed(interaction, question, category, userId, timeTakenFormatted, isNewRecord, username, isAbsoluteRecord = false, puntos = PUNTOS_BASE) {
    const config = categoryConfig[category] || categoryConfig.futbol;
    
    if (isAbsoluteRecord) {
        const recordEmbed = crearEmbedConFooter(
            '#FFDF00',
            '🏆 ¡Récord histórico!',
            `¡Histórico! <@${userId}> ha establecido un nuevo récord histórico de **${timeTakenFormatted}** segundos en ${formatCategoryName(category)}.\n\nLa respuesta correcta era ${question.mensaje}\n¡Ganaste ${puntos} puntos!`,
            category,
            'https://i.imgur.com/Gh8HSGX.png',
        );
        
        if (question.imagenRC) {
            recordEmbed.setImage(question.imagenRC);
        }

        interaction.channel.send({ embeds: [recordEmbed] }).catch(console.error);
    } 
    else if (isNewRecord) {
        const recordEmbed = crearEmbedConFooter(
            '#FFDF00',
            '🥇 ¡Nuevo récord personal!',
            `¡Increíble! <@${userId}> ha establecido un nuevo récord personal de **${timeTakenFormatted}** segundos en ${formatCategoryName(category)}.\n\nLa respuesta correcta era ${question.mensaje}\n¡Ganaste ${puntos} puntos!`,
            category
        );
        
        if (question.imagenRC) {
            recordEmbed.setImage(question.imagenRC);
        }

        interaction.channel.send({ embeds: [recordEmbed] }).catch(console.error);
    } else {
        const correctEmbed = crearEmbedConFooter(
            colores.exito,
            '✅ Respuesta correcta',
            `¡Correcto! <@${userId}> acertó en **${timeTakenFormatted}** segundos.\n\nLa respuesta correcta era: ${question.mensaje}\n¡Ganaste ${puntos} puntos!`,
            category
        );
        
        if (question.imagenRC) {
            correctEmbed.setImage(question.imagenRC);
        }

        interaction.channel.send({ embeds: [correctEmbed] }).catch(console.error);
    }
}

function getRandomCategory() {
    const categories = ['banderas', 'ciencias', 'fechas', 'futbol', 'matematicas'];
    return categories[Math.floor(Math.random() * categories.length)];
}

function loadQuestions(category) {
    const filePath = path.join(__dirname, '..', 'datos', `${category}.json`);
    console.log(`Cargando preguntas de: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo no encontrado: ${category}.json`);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    
    // Validar estructura del archivo JSON
    if (!data || !data.preguntas || !Array.isArray(data.preguntas)) {
        throw new Error(`El archivo ${category}.json no tiene la estructura esperada (debe contener un objeto con clave "preguntas")`);
    }
    
    return data;
}

function formatCategoryName(category) {
    const names = {
        'banderas': 'Banderas',
        'ciencias': 'Ciencias',
        'fechas': 'Fechas',
        'futbol': 'Fútbol',
        'matematicas': 'Matemáticas'
    };
    return names[category] || category;
}

function crearEmbedConFooter(color, titulo, descripcion, category, thumbnailURL = null) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(titulo)
        .setDescription(descripcion)
        .setFooter({
            text: `${formatCategoryName(category)} • ${new Date().toLocaleTimeString('es-ES')}`,
            iconURL: categoryConfig[category]?.icon,
        });

    if (thumbnailURL) {
        embed.setThumbnail(thumbnailURL); // Añade thumbnail si existe
    }

    return embed;
}


async function handleIncorrectAnswer(interaction, question, category) {
    const config = categoryConfig[category] || categoryConfig.futbol;
    
    const incorrectEmbed = crearEmbedConFooter(
        colores.error,
        '❌ Respuesta incorrecta',
        `El tiempo se ha agotado. La respuesta correcta era: ${question.mensaje}`,
        category
    );
    
    if (question.imagenRC) {
        incorrectEmbed.setImage(question.imagenRC);
    }

    await interaction.channel.send({ embeds: [incorrectEmbed] });
}