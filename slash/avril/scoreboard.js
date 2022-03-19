const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const data = require('data');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('scoreboard')
		.setDescription('recupere le classement des meilleurs')
        .addIntegerOption(option => option.setName('page').setRequired(false).setDescription('La page a visiter')),
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
	async execute(interaction) {
		let page = 0;
		if(interaction.options.getInteger("page") != undefined && interaction.options.getInteger("page") > 0){
			page = interaction.options.getInteger("page") - 1;
		}
		let list = await data.premierAvril_dao.getScoreboard(page);

		let embed = new Discord.MessageEmbed();
		embed.setTitle(" -- ScoreBoard - page " + (page+1) + " -- ");
		let i = 0
		for(let element of list){
			i++;
			let pos = page * 10 + i;
			let user = await interaction.client.users.fetch(element.IdUser)
			embed.addField(pos + " - " + user.username,"Crédit social : "+element.UserScore);
		}
		embed.setColor("BLUE");
		interaction.reply({ embeds: [embed] });
		
	},
};
