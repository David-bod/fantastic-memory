const discord = require('discord.js');

const connect_discord = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

connect_discord.login(process.env.DISCORD_KEY);

connect_discord.on('ready', () => {
    console.log("\033[32mLe bot est connecté à Discord\033[37m.");
    connect_discord.user.setActivity('Pokedrop', { type: 'WATCHING' });
});

module.exports = connect_discord;