
module.exports = {
    name: 'tempban',
    aliases: [''],
    description: 'Bans a user.',
    long: 'Temporarily bans a user and sends them a message containing the reason. The time can be either m (minutes), h (hours) or d (days)',
    args: {
        "User ID": "ID of user to ban.",
        "limit": "Length of ban.",
        "reason": "Reason for ban."
    },
    examples: ["tempban 168958344361541633 24h cheating", "tempban 168958344361541633 10m Warned 2+ times", "tempban 168958344361541633 7d Banned for a week"],
    ignoreHelp: false,
    requiresAcc: false,
    requiresActive: false,
    guildModsOnly: false,
    
    async execute(app, message){
        let userID = message.args[0];
        let limit = message.args[1] || '';
        let messageIn = message.args.slice(2).join(" ");
        let banLength = getTimeFromLimit(limit);

        if(message.channel.id !== app.config.modChannel){
            return message.reply('❌ You must be in the moderator channel to use this command.');
        }
        else if(!userID){
            return message.reply('❌ You forgot to include a user ID.');
        }
        else if(!banLength){
            return message.reply('❌ You must specify a length of time to ban for (use `modhelp tempban` to see examples).')
        }
        else if(!messageIn){
            return message.reply('❌ You must include a reason for banning this user. Specify what rule(s) were broken.');
        }
        else if(await app.cd.getCD(userID, 'banned')){
            return message.reply('❌ User is already banned.')
        }
        else if(await app.cd.getCD(userID, 'mod')){
            return message.reply("Hey stop trying to ban a moderator!!! >:(");
        }

        const warnings = (await app.query(`SELECT * FROM warnings WHERE userId = '${userID}'`));
        const user = await app.common.fetchUser(userID, { cacheIPC: false });

        const botMessage = await message.reply(`**${user.username}#${user.discriminator}** currently has **${warnings.length}** warnings on record.\n\nBan for \`${app.cd.convertTime(banLength)}\`?`);

        try{
            const confirmed = await app.react.getConfirmation(message.author.id, botMessage);

            if(confirmed){
                const banMsg = new app.Embed()
                .setTitle(`You have been temporarily banned by ${(message.author.username + '#' + message.author.discriminator)}`)
                .setDescription("You have been banned for `" + app.cd.convertTime(banLength) + "`. If you wish to challenge this ban, you can appeal at our website.```\n" + messageIn + "```")
                .setColor(16734296)
                .setFooter("https://lootcord.com/rules | Only moderators can send you messages.")

                try{
                    await app.cd.setCD(userID, 'banned', banLength);
                    await app.query("INSERT INTO banned (userId, reason, date) VALUES (?, ?, ?)", [userID, messageIn, (new Date()).getTime()]);

                    await app.common.messageUser(userID, banMsg, { throwErr: true });
                    botMessage.edit(`Successfully banned **${user.username}#${user.discriminator}**.`);
                }
                catch(err){
                    botMessage.edit('Unable to send message to user, they were still banned. ```js\n' + err + '```');
                }
            }
            else{
                botMessage.delete();
            }
        }
        catch(err){
            botMessage.edit('❌ Timed out.');
        }
    },
}

function getTimeFromLimit(limit){
    if(limit.endsWith('m') && !isNaN(limit.slice(0, -1)) && Number(limit.slice(0, -1))){
        return 1000 * 60 * limit.slice(0, -1)
    }
    else if(limit.endsWith('h') && !isNaN(limit.slice(0, -1)) && Number(limit.slice(0, -1))){
        return 1000 * 60 * 60 * limit.slice(0, -1)
    }
    else if(limit.endsWith('d') && !isNaN(limit.slice(0, -1)) && Number(limit.slice(0, -1))){
        return 1000 * 60 * 60 * 24 * limit.slice(0, -1)
    }
    else return undefined
}