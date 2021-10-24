const Discord = require('discord.js');
const Canvas = require('canvas');
module.exports = {
	name: 'geminogenre',
	description: '',
	args: false, 				//mettre a true quand la commande nécésite des arguments
	//usage: '<arg1> <arg2>',	//décrit les arguments nécéssaires a la commande
	guildOnly: true,			//définit si la commande doit etre utilisé seulement sur le serveur
	cooldown: 5,				//cooldown en nombres de secondes
	aliases: ["gemino"],	//autres manières d'appeler la commande
	async execute(message, args) {
        const canvas = Canvas.createCanvas(512, 512);
        const context = canvas.getContext('2d');
        let avatar = await Canvas.loadImage( message.author.avatarURL({format : "png",size : 512}));
        let gemino = await Canvas.loadImage("https://media.discordapp.net/attachments/652186356231045120/901939614334468226/gemino.png");
        context.drawImage(avatar,0,0,canvas.width, canvas.height);
        context.drawImage(gemino,0,0,canvas.width, canvas.height);
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'Gemino_pp.png');
        message.channel.send("<@"+message.author.id+">",{ files: [attachment] });
	},
};