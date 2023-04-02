const { SlashCommandBuilder } = require('@discordjs/builders');
const data = require('data');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('editsuggest')
		.setDescription('permet à awing de modifier les propositions, seul awing peut faire cette commande')
        .addStringOption(option =>
            option.setName('id')
                  .setDescription("l'id de la suggestion")
                  .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('pierrick')
                  .setDescription('Le mot en pierrick')              
            )
        .addStringOption( option =>
            option.setName('definition')
                  .setDescription('la définition de votre mot')       
            )
        .addStringOption( option =>
            option.setName('etymologie')
                  .setDescription('d\'où provient votre mot')              
            )
        .addStringOption( option =>
            option.setName('francais')
                  .setDescription('la traduction francaise du mot (optionnel)')
            )
        .addStringOption( option =>
            option.setName('phonetique')
                  .setDescription("l'écriture de votre mot en alphabet phonétique international")
            )
        .addStringOption( option =>
            option.setName('class')
                  .setDescription('la classe gramaticale du mot')
            )
        .addStringOption(option=>
            option.setName('cyrilic')
                  .setDescription('le mot dans l\'alphabet cyrilique')
            )
        .addStringOption( option =>
            option.setName('hangeul')
                  .setDescription('l\'écriture de votre mot en hangeul')
            )
        .addStringOption( option =>
            option.setName('commentaire')
                  .setDescription("un commentaire supplémentaire (optionnel)")
            ),
	async execute(interaction) {
        //verify if the interaction come from awing
		if (interaction.user.id == data.awing_id){
            const id = interaction.options.getString('id');
            if (await data.db_linguistique.isIdValidSuggestion(id)) {
                //obtention des paramètres et ajout dans un objet
                let param = {
                    pierrick : interaction.options.getString('pierrick'),
                    definition : interaction.options.getString('definition'),
                    etymologie : interaction.options.getString('etymologie'),
                    francais : interaction.options.getString('francais'),
                    phonetique : interaction.options.getString('phonetique'),
                    commentaire : interaction.options.getString('commentaire'),
                    cyrilic : interaction.options.getString('cyrilic'),
                    hangeul : interaction.options.getString('hangeul'),
                    class : interaction.options.getString('class')
                } 
                let base = await data.db_linguistique.getSuggest(id);
                //on récupère les valeurs pour vérifier si quelque chose a été mit ou non, puis on remplace les valeurs par défaut par les valeurs utilisateurs
                for (let proprieties in param){
                    if(param[proprieties] != null){
                        base[proprieties] = param[proprieties];
                    }
                }
                //modify the suggestion
                await data.db_linguistique.editSuggest(id, base);
                await interaction.reply('suggestion modifiée')

            }
            else await interaction.reply("l'id est invalide")

        }
        else await interaction.reply('seul awing peut faire cette commande');
	},
};
