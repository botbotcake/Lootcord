const config = require('./json/_config.json');
const Discord = require('discord.js');
const { query } = require('./mysql.js');
const DM = require('./utils/sendtomods.js');

exports.handleCmd = async function(message, prefix, lang){
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));


    if(!command && message.channel.type !== 'dm') return;//command doesnt exist

    else if(!command && message.channel.type == 'dm') return DM.sendToMods(message, lang);//send message to mod channel

    else if(!command.worksInDM && message.channel.type !== 'text') return message.reply(lang.general[5]);

    const row       = await query(`SELECT * FROM scores WHERE userId = ${message.author.id}`);
    const CDrow     = await query(`SELECT * FROM cooldowns WHERE userId = ${message.author.id}`);
    const activeRow = await query(`SELECT * FROM userGuilds WHERE userId = ${message.author.id} && guildId = ${message.guild !== null ? message.guild.id : 0}`);

    if(message.client.sets.spamCooldown.has(message.author.id)){
        let spamSeconds = CDrow.length && CDrow[0].spamTime > 0 ? ((2000 - ((new Date()).getTime() - CDrow[0].spamTime)) / 1000).toFixed(0) : 2;
        let secondAmount = (spamSeconds > 1) ? " seconds`" : (spamSeconds > 0) ? " second`" : " seconds` (now)";
        message.reply(lang.general[6].replace('{0}', spamSeconds + secondAmount)).then(spamMsg => {
            spamMsg.delete(3000);
        }).catch();
        return;
    }
    else if(message.client.sets.peckCooldown.has(message.author.id)){//SENDS MESSAGE IF USER IS CHICKEN AND PREVENTS THEM FROM USING COMMANDS
        message.delete();
        const embedChicken = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setTitle(lang.general[7])
        .setColor(0)
        .setFooter(lang.general[8].replace('{0}', ((7200 * 1000 - ((new Date()).getTime() - CDrow[0].peckTime)) / 60000).toFixed(1)))
        message.channel.send(embedChicken);
        return;
    }
    
    else if(command.requiresAcc && !row.length) return message.reply(lang.general[0].replace('{0}', prefix));

    
    else if(command.requiresAcc && !activeRow.length) return message.reply(lang.general[1].replace('{0}', prefix));


    else if(command.guildModsOnly && !message.member.hasPermission("MANAGE_GUILD")) return message.reply(lang.errors[6]);

    
    else if(command.modOnly && !message.client.sets.moddedUsers.has(message.author.id) && !message.client.sets.adminUsers.has(message.author.id)) return message.reply(lang.general[2]);

    
    else if(command.adminOnly && !message.client.sets.adminUsers.has(message.author.id)) return message.reply(lang.general[3]);

    
    else if(command.hasArgs && !args.length) return message.reply(lang.general[4].replace('{0}', prefix).replace('{1}', command.name));

    try{
        command.execute(message, args, lang, prefix);//CALL COMMAND HERE
        message.client.commandsUsed++;
        
        if(config.debug == true || message.client.sets.adminUsers.has(message.author.id)) return;

        message.client.shard.broadcastEval(`this.sets.spamCooldown.add('${message.author.id}')`);
        query(`UPDATE cooldowns SET spamTime = ${(new Date()).getTime()} WHERE userId = ${message.author.id}`);
        setTimeout(() => {
            message.client.shard.broadcastEval(`this.sets.spamCooldown.delete('${message.author.id}');`);
            query(`UPDATE cooldowns SET spamTime = ${0} WHERE userId = ${message.author.id}`);
        }, 2000);//2 second spam cooldown
        
    }
    catch(err){
        console.error(err);
        message.reply('Command failed to execute!');
    }
}