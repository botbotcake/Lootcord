const itemdata  = require('../../resources/json/items/completeItemList');
const badgedata = require('../../resources/json/badges');

module.exports = {
    name: 'mysettings',
    aliases: ['usersettings', 'settings'],
    description: "View your settings and how to change them.",
    long: "View your current settings and how to change them.",
    args: {},
    examples: ["mysettings"],
    ignoreHelp: false,
    requiresAcc: true,
    requiresActive: false,
    guildModsOnly: false,
    
    async execute(app, message){
        const userRow = await app.player.getRow(message.author.id);

        let notifyBmStr = userRow.notify1 ? '(Disable with `togglebmnotify`)' : '(Enable with `togglebmnotify`)';
        let notifyDeathStr = userRow.notify2 ? '(Disable with `toggleattacknotify`)' : '(Enable with `toggleattacknotify`)';
        let notifyRaidedStr = userRow.notify3 ? '(Disable with `toggleraidnotify`)' : '(Enable with `toggleraidnotify`)';
        
        const settings = new app.Embed()
        .setAuthor('Settings for: ' + message.author.tag, message.author.avatarURL)
        .addField(`Notify you when your listing on the Black Market sells:`, userRow.notify1 ? '✅ Enabled ' + notifyBmStr : '❌ Disabled ' + notifyBmStr)
        .addField(`Notify you when you've been attacked:`, userRow.notify2 ? '✅ Enabled ' + notifyDeathStr : '❌ Disabled ' + notifyDeathStr)
        .addField(`Notify you when your clan is raided:`, userRow.notify3 ? '✅ Enabled ' + notifyRaidedStr: '❌ Disabled ' + notifyRaidedStr)
        .addField('Preferred Ammo (Will prioritize this ammo type when attacking other players)', itemdata[userRow.ammo] ? itemdata[userRow.ammo].icon + '`' + userRow.ammo + '`' : '❌ Not set (Set with `setammo <ammo>`)', true)
        .addField('Display Badge', badgedata[userRow.badge] ? badgedata[userRow.badge].icon + '`' + userRow.badge + '`' : '❌ Not set (Set with `setbadge <badge>`)')

        message.channel.createMessage(settings);
    },
}