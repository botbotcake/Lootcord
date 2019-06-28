const Discord = require('discord.js');
const methods = require('../methods/methods.js');
const helpJSON = require('../json/_help_commands.json');

module.exports = {
    name: 'help',
    aliases: [''],
    description: 'Displays information about commands.',
    hasArgs: false,
    worksInDM: true,
    requiresAcc: false,
    modOnly: false,
    adminOnly: false,
    
    execute(message, args, lang, prefix){
        let helpCommand = args[0];

        if(helpCommand !== undefined){
            return methods.commandhelp(message, helpCommand, prefix);
        }

        var itemCmds = [];
        var gameCmds = [];
        var infoCmds = [];
        var utilCmds = [];
        var otherCmds = [];

        console.log(helpJSON.length);
        for(var i = 0; i < helpJSON.length; i++){
            if(!helpJSON[i].ignoreHelp){
                if(helpJSON[i].category == 'items') itemCmds.push('`' + helpJSON[i].command.toLowerCase() + '`')
                else if(helpJSON[i].category == 'games') gameCmds.push('`' + helpJSON[i].command.toLowerCase() + '`')
                else if(helpJSON[i].category == 'info') infoCmds.push('`' + helpJSON[i].command.toLowerCase() + '`')
                else if(helpJSON[i].category == 'utility') utilCmds.push('`' + helpJSON[i].command.toLowerCase() + '`')
                else if(helpJSON[i].category == 'other') otherCmds.push('`' + helpJSON[i].command.toLowerCase() + '`')
            }
        }

        const helpInfo = new Discord.RichEmbed()
        .setTitle(lang.help[0].replace('{0}', `\`${prefix}play\``))
        .addField(lang.help[2], itemCmds.join(', '), true)
        .addField(lang.help[3], gameCmds.join(', '), true)
        .addField(lang.help[4], infoCmds.join(', '),true)
        .addField(lang.help[5], utilCmds.join(', '),true)
        .addField(lang.help[6], otherCmds.join(', '),true)
        .setColor(13215302)
        .setFooter(lang.help[7].replace('{0}', prefix))
        
        message.channel.send(helpInfo);
    },
}