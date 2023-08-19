const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Discord = require('discord.js');
const { soundex } = require('data')
require("dotenv").config();

const { Client, Intents } = require('discord.js');
const myIntents = [
	Intents.FLAGS.GUILDS,
]

const client = new Client({intents: myIntents, allowedMentions: { parse: ['users', 'roles'], repliedUser: true} });


//commandes slash
client.slashCommands = new Discord.Collection();
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
slashCommands = [];
const slashCommandFolders = fs.readdirSync('./slash');
for (const folder of slashCommandFolders) {
	const slashCommandFiles = fs.readdirSync(`./slash/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of slashCommandFiles) {
		const slashCommand = require(`./slash/${folder}/${file}`);
		client.slashCommands.set(slashCommand.data.name, slashCommand)
		slashCommands.push(slashCommand.data.toJSON());
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		if(process.env.DEV_ENV == "TRUE"){
			await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: slashCommands },
			);
		} else {
			await rest.put(
				Routes.applicationCommands(clientId),
				{ body: slashCommands },
			);
		}

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

//gestion des events

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.slashCommands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(process.env.BOT_TOKEN);