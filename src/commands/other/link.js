module.exports = {
    name: 'link',
    aliases: ['invite'],
    description: "Sends a link to invite the bot.",
    long: "Sends a link to invite the bot.",
    args: {},
    examples: [],
    ignoreHelp: false,
    requiresAcc: false,
    requiresActive: false,
    guildModsOnly: false,
    
    execute(app, message){
        const invite = new app.Embed()
        .setDescription("You can invite Lootcord using this [link](https://discordapp.com/oauth2/authorize?client_id=493316754689359874&permissions=388160&scope=bot 'Click to invite Lootcord')!")
        .setColor(13215302)

        message.channel.createMessage(invite);
    },
}