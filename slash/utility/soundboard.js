const {SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('soundboard')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .setDescription('Gère la soundboard du serveur')
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disactive la soundboard pour ce salon')
                .addChannelOption(option =>
                     option.setName('salon')
                        .setDescription('Le salon dans lequel désactiver la soudboard')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Réactive la soundboard pour ce salon')
                .addChannelOption(option =>
                    option.setName('salon')
                        .setDescription('Le salon dans lequel réactiver la soudboard')
                        .setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('salon');
        if (!channel.isVoiceBased()){
            return interaction.reply({content: `Le salon ${channel} n'est pas un salon vocal valide`, ephemeral: true});
        }
        if (subcommand === 'disable'){
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {UseSoundboard: false});
            return interaction.reply({content: `La soundboard a été désactivée dans le salon ${channel}`, ephemeral: true});
        } else if (subcommand === 'enable'){
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {UseSoundboard: null});
            return interaction.reply({content: `La soundboard a été réactivée dans le salon ${channel}`, ephemeral: true});
        }
    }
}