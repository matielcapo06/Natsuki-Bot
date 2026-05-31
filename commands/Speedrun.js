const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();
const { EmbedBuilder } = require('discord.js');

let db;
let cachedData = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 300000; // 5 minutos

function getDbConnection() {
    if (!db) {
        db = new sqlite3.Database('C:/Users/vmros/Desktop/Proyecto speedrun/speedrun_complete.db', (err) => {
            if (err) console.error('Error al conectar a la DB:', err);
        });
    }
    return db;
}

function timeStringToSeconds(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);
    
    if (isNaN(minutes) || isNaN(seconds)) return null;
    
    return (minutes * 60) + seconds;
}

const SCORE_EMOJIS = ["💀", "🌑", "🕸️", "🦇", "⚰️", "🔮", "🌙", "🖤", "👑", "🏆"];
const SCORE_DESCRIPTIONS = [
    "Pésimo... la muerte acecha", "Casi sin esperanza", "Tejerás telarañas de frustración",
    "Suerte mediocre como vampiro con alergia al sol", "Podrías terminar en un féretro",
    "Un destello de esperanza... o espejismo", "Las estrellas susurran tu nombre",
    "La oscuridad te sonríe", "Casi perfecto como ritual completo", "¡El horario del demonio mismo!"
];

async function calculateHourData() {
    const db = getDbConnection();
    const rows = await new Promise((resolve, reject) => {
        db.all(`
            SELECT run_timestamp, time_fortress, time_bastion, time_finish, time_nether
            FROM all_splits_history 
            WHERE time_nether IS NOT NULL
            AND run_timestamp > datetime('now', '-7 days')
        `, (err, rows) => {
            if (err) reject(err);
            resolve(rows || []);
        });
    });

    if (!rows.length) return null;

    const dates = new Set();
    const hourMetrics = new Array(24).fill().map(() => ({
        runs: 0, completions: 0, netherEntries: 0, fastionRuns: 0,
        fastionUnder3min: 0, fastionUnder4min: 0, fastionUnder5min: 0
    }));

    rows.forEach(row => {
        if (row.run_timestamp) {
            const date = new Date(row.run_timestamp);
            if (!isNaN(date.getTime())) {
                const localHour = date.getHours();
                dates.add(date.toISOString().split('T')[0]);
                
                hourMetrics[localHour].runs++;
                if (row.time_finish) hourMetrics[localHour].completions++;
                if (row.time_nether) hourMetrics[localHour].netherEntries++;
                
                if (row.time_fortress && row.time_bastion) {
                    const fortressSec = timeStringToSeconds(row.time_fortress);
                    const bastionSec = timeStringToSeconds(row.time_bastion);
                    
                    if (fortressSec !== null && bastionSec !== null) {
                        const diff = Math.abs(fortressSec - bastionSec);
                        hourMetrics[localHour].fastionRuns++;
                        if (diff <= 180) hourMetrics[localHour].fastionUnder3min++;
                        if (diff <= 240) hourMetrics[localHour].fastionUnder4min++;
                        if (diff <= 300) hourMetrics[localHour].fastionUnder5min++;
                    }
                }
            }
        }
    });

    const totalDays = Math.max(1, dates.size);
    
    const hourScores = hourMetrics.map((metrics, hour) => {
        let score = 0;
        let fastionLevel = 0;
        let completionLevel = 0;
        let netherLevel = 0;
        
        const under3minPerDay = metrics.fastionUnder3min / totalDays;
        const under4minPerDay = metrics.fastionUnder4min / totalDays;
        const under5minPerDay = metrics.fastionUnder5min / totalDays;
        
        if (under3minPerDay >= 4) { score += 3; fastionLevel = 3; }
        else if (under4minPerDay >= 6) { score += 2; fastionLevel = 2; }
        else if (under5minPerDay >= 8) { score += 1; fastionLevel = 1; }
        
        const completionsPerDay = metrics.completions / totalDays;
        if (completionsPerDay >= 8) { score += 3; completionLevel = 3; }
        else if (completionsPerDay >= 5) { score += 2; completionLevel = 2; }
        else if (completionsPerDay >= 3) { score += 1; completionLevel = 1; }
        
        const netherPerDay = metrics.netherEntries / totalDays;
        if (netherPerDay >= 150) { score += 3; netherLevel = 3; }
        else if (netherPerDay >= 100) { score += 2; netherLevel = 2; }
        else if (netherPerDay >= 75) { score += 1; netherLevel = 1; }
        
        const bonusMultiplo = (hour % 3 === 0) ? 1 : 0;
        score += bonusMultiplo;
        
        return {
            score: Math.min(10, Math.max(0, score)),
            fastionLevel,
            completionLevel,
            netherLevel,
            bonusMultiplo,
            fastionUnder3min: metrics.fastionUnder3min,
            fastionUnder4min: metrics.fastionUnder4min,
            fastionUnder5min: metrics.fastionUnder5min,
            under3minPerDay: under3minPerDay.toFixed(2),
            under4minPerDay: under4minPerDay.toFixed(2),
            under5minPerDay: under5minPerDay.toFixed(2),
            completions: metrics.completions,
            completionsPerDay: completionsPerDay.toFixed(2),
            netherEntries: metrics.netherEntries,
            netherPerDay: netherPerDay.toFixed(2),
            totalRuns: metrics.runs,
            fastionRuns: metrics.fastionRuns,
            totalDays: totalDays
        };
    });

    // CONSOLE LOGS COMPLETOS
    console.log(`\n=== ANALÍTICA DE HORAS ===`);
    console.log(`Total de runs con Nether: ${rows.length}`);
    console.log(`Total de días: ${totalDays}`);
    
    const hourData = hourMetrics.map((metrics, hour) => ({
        Hora: `${hour}:00-${hour+1}:00`,
        Runs: metrics.runs,
        Porcentaje: rows.length > 0 ? ((metrics.runs / rows.length) * 100).toFixed(2) : '0',
        Score: hourScores[hour].score
    }));

    console.table(hourData);
    console.log('\n');

    console.log(`=== ANALÍTICA DETALLADA POR HORAS ===`);
    
    const detailedData = hourScores.map((data, hour) => ({
        Hora: `${hour}:00-${hour+1}:00`,
        Score: data.score,
        Fastion: `${data.fastionLevel} (<3min:${data.under3minPerDay}/día, <4min:${data.under4minPerDay}/día, <5min:${data.under5minPerDay}/día)`,
        Completion: `${data.completionLevel} (${data.completionsPerDay}/día)`,
        Nether: `${data.netherLevel} (${data.netherPerDay}/día)`,
        Bonus: data.bonusMultiplo,
        TotalRuns: data.totalRuns,
        FastionRuns: data.fastionRuns
    }));

    console.table(detailedData);
    console.log('\n');

    const currentHour = new Date().getHours();
    console.log(`=== MÉTRICAS HORA ACTUAL (${currentHour}:00) ===`);
    console.log(`Score Total: ${hourScores[currentHour].score}`);
    console.log(`Nivel Fastion: ${hourScores[currentHour].fastionLevel}`);
    console.log(`- Runs <3min: ${hourScores[currentHour].fastionUnder3min} (${hourScores[currentHour].under3minPerDay}/día)`);
    console.log(`- Runs <4min: ${hourScores[currentHour].fastionUnder4min} (${hourScores[currentHour].under4minPerDay}/día)`);
    console.log(`- Runs <5min: ${hourScores[currentHour].fastionUnder5min} (${hourScores[currentHour].under5minPerDay}/día)`);
    console.log(`Nivel Completion: ${hourScores[currentHour].completionLevel} (${hourScores[currentHour].completionsPerDay} completadas/día)`);
    console.log(`Nivel Nether: ${hourScores[currentHour].netherLevel} (${hourScores[currentHour].netherPerDay} entradas/día)`);
    console.log(`Bonus Multiplo3: ${hourScores[currentHour].bonusMultiplo}`);
    console.log(`Total Runs: ${hourScores[currentHour].totalRuns}`);
    console.log(`Runs con Fastion: ${hourScores[currentHour].fastionRuns}`);
    console.log(`Total Días: ${hourScores[currentHour].totalDays}`);
    console.log('\n');

    return { 
        hourScores, 
        totalDays, 
        totalRuns: rows.length,
        hourMetrics // Para debugging completo
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lacosa')
        .setDescription('Revela tu energía de speedrun actual')
        .setContexts([0, 1, 2])
        .setIntegrationTypes([1]),
        
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const now = Date.now();
            if (!cachedData || now - lastCacheUpdate > CACHE_DURATION) {
                console.log('🔄 Actualizando cache de datos...');
                cachedData = await calculateHourData();
                lastCacheUpdate = now;
                console.log('✅ Cache actualizado');
            }

            if (!cachedData) {
                return interaction.editReply('No hay datos disponibles...');
            }

            const currentHour = new Date().getHours();
            const currentScore = cachedData.hourScores[currentHour]?.score || 0;
            const scoreIndex = Math.min(9, Math.max(0, currentScore));

            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            const unixTimestamp = Math.floor(nextHour.getTime() / 1000);

            const embed = new EmbedBuilder()
                .setColor('#0d0d0d')
                .setTitle('**Suerte de Seedluck**')
                .addFields(
                    { 
                        name: '\u200B', 
                        value: `**${SCORE_EMOJIS[scoreIndex]} - Nivel ${currentScore}** (*${SCORE_DESCRIPTIONS[scoreIndex]}*)`,
                        inline: false
                    },
                    { 
                        name: '\u200B',
                        value: `Próxima Seedluck <t:${unixTimestamp}:R>`,
                        inline: false
                    }
                )
                .setFooter({
                    text: `Seedluck • ${new Date().toLocaleTimeString('es-ES')} - ${new Date().toLocaleDateString('es-ES')}`,
                    iconURL: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/a/ac/Luck_JE3.png/revision/latest?cb=20210223130512'
                });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('Error en comando /lacosa:', err);
            await interaction.editReply('Algo oscuro falló en la predicción...');
        }
    }
};