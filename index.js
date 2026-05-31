const { Client, GatewayIntentBits, Partials, Collection, ButtonBuilder, ActionRowBuilder, ActivityType, EmbedBuilder } = require("discord.js");

const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.DirectMessageReactions],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User,],
})

const { loadEvents } = require("./Handlers/eventHandler");

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();

loadEvents(client);

// Establecer actividad del bot
client.on('ready', () => {
  const customActivity = {
    name: '📚 Explorando nuevos mangas...',
    type: ActivityType.Custom,
    emoji: '📖',
  };

  client.user.setPresence({ status: 'dnd', activities: [customActivity] });
});


client.login(client.config.token);
