const { SlashCommandBuilder } = require('@discordjs/builders');
const {correspondance} = require("data");
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('phonetize')
		.setDescription('donne la correspondance en alphabet phonetique d\'un mot en pierrick')
        .addStringOption(option =>
            option
                .setName('mot')
                .setDescription('le mot que vous souhaitez phonétiser (vous pouvez mettre plusieurs mot séparés par des virgules)')
                .setRequired(true)    
        ),
        
	async execute(interaction) {
		let mot = interaction.options.getString('mot');
        let phonetique = "/";
        //for each char replace the API equivalent
        for (const iterator of mot) {
            phonetique += correspondance[iterator];
        }
        phonetique += "/";
        embedPhonetize = new MessageEmbed()
            .setColor('#0000FF')
            .setTitle(`${interaction.options.getString('mot')}\u200b`)
            .addField("resultat", phonetique)
        await interaction.reply({embeds: [embedPhonetize]});
	},
};
