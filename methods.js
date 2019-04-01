const Discord = require("discord.js");
const helpCmd = require('./json/_help_commands.json'); //opens help commands .json file
const itemImg = require('./json/_item_images.json');
const seedrandom = require('seedrandom');
const itemdata = require("./json/completeItemList");
const fs = require("fs");
var rng = seedrandom();

class Methods {
    //GENERAL FUNCTIONS, CAN BE USED BY MULTIPLE COMMANDS
    additem(sql, userId, item, amount){
        sql.get(`SELECT * FROM items WHERE userId ="${userId}"`).then(row => {
            if(Array.isArray(item)){
                if(item.length == 0){
                    return;
                }
                for(var i=0; i < item.length; i++){
                    //do stuff for each item
                    //store amounts in array as ["rock|5","ak47|2"] then use split("|")
                    let itemToCheck = item[i].split("|");
                    sql.run(`UPDATE items SET ${itemToCheck[0]} = ${eval(`row.${itemToCheck[0]}`) + parseInt(itemToCheck[1])} WHERE userId = ${userId}`);
                }
            }
            else{
                sql.run(`UPDATE items SET ${item} = ${eval(`row.${item}`) + amount} WHERE userId = ${userId}`);
            }
        });
    }
    addmoney(sql, userId, amount){
        sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
            console.log((row.money + amount) + " money after addition");
            sql.run(`UPDATE scores SET money = ${row.money + amount} WHERE userId = ${userId}`);
        });
    }
    removemoney(sql, userId, amount){
        sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
            console.log((row.money - amount) + " money after subtraction");
            sql.run(`UPDATE scores SET money = ${row.money - amount} WHERE userId = ${userId}`);
        });
    }
    trademoney(sql, user1Id, user1Amount, user2Id, user2Amount){
        sql.get(`SELECT * FROM scores WHERE userId ="${user1Id}"`).then(row1 => {
            sql.run(`UPDATE scores SET money = ${row1.money - user1Amount} WHERE userId = ${user1Id}`);
            sql.get(`SELECT * FROM scores WHERE userId ="${user1Id}"`).then(row2 => {
                sql.run(`UPDATE scores SET money = ${row2.money + user2Amount} WHERE userId = ${user1Id}`);
                sql.get(`SELECT * FROM scores WHERE userId ="${user2Id}"`).then(row3 => {
                    sql.run(`UPDATE scores SET money = ${row3.money - user2Amount} WHERE userId = ${user2Id}`);
                    sql.get(`SELECT * FROM scores WHERE userId ="${user2Id}"`).then(row3 => {
                        sql.run(`UPDATE scores SET money = ${row3.money + user1Amount} WHERE userId = ${user2Id}`);
                    });
                });
            });
        });
    }
    removeitem(sql, userId, item, amount){
        sql.get(`SELECT * FROM items WHERE userId ="${userId}"`).then(row => {
            if(Array.isArray(item)){
                if(item.length == 0){
                    return;
                }
                for(var i=0; i < item.length; i++){
                    //do stuff for each item
                    //store amounts in array as ["rock|5","ak47|2"] then use split("|")
                    let itemToCheck = item[i].split("|");
                    sql.run(`UPDATE items SET ${itemToCheck[0]} = ${eval(`row.${itemToCheck[0]}`) - parseInt(itemToCheck[1])} WHERE userId = ${userId}`);
                }
            }
            else{
                sql.run(`UPDATE items SET ${item} = ${eval(`row.${item}`) - amount} WHERE userId = ${userId}`);
            }
        });
    }
    hasmoney(sql, userId, amount){//PROMISE FUNCTION
        return sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
            if(row.money >= amount){
                return true;
            }
            else{
                return false;
            }
        });
    }
    hasitems(sql, userId, item, amount){//PROMISE FUNCTION
        return sql.get(`SELECT * FROM items WHERE userId ="${userId}"`).then(row => {
            if(Array.isArray(item)){
                if(item.length == 0){
                    return true;
                }
                for (var i = 0; i < item.length; i++) {
                    //do stuff for each item
                    let itemToCheck = item[i].split("|");
                    if(eval(`row.${itemToCheck[0]}`) >= parseInt(itemToCheck[1])){
                        if(i == item.length - 1){
                            return true;
                        }
                    }
                    else{
                        return false;
                    }
                }
            }
            else{
                if(eval(`row.${item}`) >= amount){
                    return true;
                }
                else{
                    return false;
                }
            }
        });
    }
    getCorrectedItemInfo(itemName="", isImage, isEvaled){
        let itemImg = "";
        let itemSearched = itemName.toLowerCase();
        isEvaled = (isEvaled == undefined) ? true : isEvaled;
        if(itemSearched == "rpg"){
            itemImg = "https://cdn.discordapp.com/attachments/454163538886524928/462539395078029313/Pixel_RPG.png";
        }
        else if(itemSearched == "item_box" || itemSearched == "box" || itemSearched == "item"){
            if(isEvaled) itemSearched = "BOX";
            else itemSearched = "ITEM_BOX";
            
            itemImg = "https://cdn.discordapp.com/attachments/454163538886524928/499746695370768408/thanbox_emptysmall.png";
        }
        else if(itemSearched == "ammo_box" || itemSearched == "ammo"){
            if(isEvaled) itemSearched = "AMMOBOX";
            else itemSearched = "AMMO_BOX";
            itemImg = "https://cdn.discordapp.com/attachments/313880100934385666/493258973160407040/Military_health_kit_custom.png";
        }
        else if(itemSearched == "ultra" || itemSearched == "ultrabox" || itemSearched =="ultra_box"){
            itemSearched = "ULTRA_BOX";
        }
        else if(itemSearched == "rail" || itemSearched == "cannon" || itemSearched == "railcannon" || itemSearched == "rail_cannon"){
            itemSearched = "RAIL_CANNON";
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501195476775993355/Rail_Cannon.png";
        }
        else if(itemSearched == "thompson"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501129603536912395/Thanpson.png";
        }
        else if(itemSearched == "javelin"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501129550617509918/Javelin.png";
        }
        else if(itemSearched == "rifle_bullet"){
            if(isEvaled) itemSearched = "RIFLEBULLET";
            else itemSearched = "RIFLE_BULLET";
        }
        else if(itemSearched == "bmg" || itemSearched == "50cal" || itemSearched =="bmg_50cal"){
            itemSearched = "BMG_50CAL";
        }
        else if(itemSearched == "ray" || itemSearched == "raygun" || itemSearched =="ray_gun"){
            itemSearched = "RAY_GUN";
        }
        else if(itemSearched.startsWith("stick")){
            itemSearched = "STICK";
            itemImg = "https://cdn.discordapp.com/attachments/454163538886524928/543899419276214277/455435423200575500.png";
        }
        else if(itemSearched.startsWith("golf")){
            itemSearched = "GOLF_CLUB";
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501129547316461578/Golf_club_aka_stick_for_those_who_dont_know_what_a_golf_club_is.png";
        }
        else if(itemSearched.startsWith("ultra_a") || itemSearched.startsWith("ultraa")){
            itemSearched = "ULTRA_AMMO";
        }
        else if(itemSearched == "fiber" || itemSearched == "optics" || itemSearched =="fiberoptics" || itemSearched =="fiber_optics"){
            itemSearched = "FIBER_OPTICS";
        }
        else if(itemSearched == "gold" || itemSearched == "goldshield" || itemSearched == "gold_shield"){
            itemSearched = "GOLD_SHIELD";
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501961870706737182/Armor_of_Gold.png";
        }
        else if(itemSearched == "iron" || itemSearched == "shield"){
            itemSearched = "IRON_SHIELD";
        }
        else if(itemSearched == "peck" || itemSearched == "peckseed" || itemSearched == "peck_seed"){
            itemSearched = "PECK_SEED";
        }
        else if(itemSearched == "awp"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501129528911855657/AWP_green.png";
        }
        else if(itemSearched == "fish"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501129543340261398/Fish_AI.png";
        }
        else if(itemSearched == "plasma"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501272967909605376/Plasma_mags.png";
        }
        else if(itemSearched == "arrow"){
            itemImg = "https://cdn.discordapp.com/attachments/454163538886524928/501139012912676889/arrow.png";
        }
        else if(itemSearched == "fork"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501129596838739969/Thanfork.png";
        }
        else if(itemSearched == "club"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501129591629414400/Simple_Club.png";
        }
        else if(itemSearched == "sword"){
            
        }
        else if(itemSearched == "bow"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/501129557609283585/Long_Bow.png";
        }
        else if(itemSearched == "pistol_bullet"){
            if(isEvaled) itemSearched = "PISTOLBULLET";
            else itemSearched = "PISTOL_BULLET";
        }
        else if(itemSearched == "ak47"){
            itemImg = "https://cdn.discordapp.com/attachments/501120454136692737/508391183676997632/Ak47.png";
        }
        else if(itemSearched == "crossbow"){
            
        }
        else if(itemSearched == "spear"){
            
        }
        else if(itemSearched == "health_pot" || itemSearched == "health"){
            if(isEvaled) itemSearched = "HEALTH";
            else itemSearched = "HEALTH_POT";
        }
        else if(itemSearched.startsWith("xp")){
            itemSearched = "XP_POTION";
            itemImg = "https://cdn.discordapp.com/attachments/454163538886524928/550331631521628172/xp_potion.png";
        }
        else if(itemSearched.startsWith("reroll")){
            itemSearched = "REROLL_SCROLL";
        }
        else if(itemSearched.startsWith("canvas")){
            itemSearched = "CANVAS_BAG";
        }
        else if(itemSearched.startsWith("light")){
            itemSearched = "LIGHT_PACK";
        }
        else if(itemSearched.startsWith("hiker")){
            itemSearched = "HIKERS_PACK";
        }
        //RETURN VALUES BELOW
        if(isImage){
            //return image url
            return itemImg;
        }
        else{
            //return item name corrected if misspelled
            return itemSearched.toLowerCase();
        }
    }
    commandhelp(message, command, prefix){
        try{
            for(var i = 0; i < Object.keys(helpCmd).length; i++){
                if(helpCmd[i].lookup.includes(command.toLowerCase())){
                    let cmdUsage = [];
                    let cmdExamples = [];
                    for(var i2 = 0; i2 < helpCmd[i].usage.length; i2++){
                        cmdUsage.push("`"+prefix+helpCmd[i].usage[i2])
                    }
                    for(var i3 = 0; i3 < helpCmd[i].example.length; i3++){
                        cmdExamples.push("`"+prefix+helpCmd[i].example[i3]+"`")
                    }
                    const helpInfo = new Discord.RichEmbed()
                    .setTitle(helpCmd[i].command+" Command Info 🔎")
                    .setColor(13215302)
                    if(helpCmd[i].example[0].length > 0){helpInfo.setDescription("Example: "+cmdExamples.join(", ") + "\n\n**" + helpCmd[i].description+"**")}else{helpInfo.setDescription("**"+helpCmd[i].description+"**")}
                    helpInfo.addField("Usage", cmdUsage.join("\n"))
                    if(helpCmd[i].options !== ""){helpInfo.addField("Options", helpCmd[i].options)}
                    if(helpCmd[i].cooldown !== ""){helpInfo.addField("Cooldown", helpCmd[i].cooldown)}
                    if(helpCmd[i].imageURL && helpCmd[i].imageURL !== ""){helpInfo.setImage(helpCmd[i].imageURL)}
                    message.channel.send(helpInfo);
                    return;
                }
                else if(Object.keys(helpCmd).length - 1 === i){
                    message.reply("❌ That command doesn't exist!");
                }
            }
        }
        catch(err){
            //continue to post help command
            console.log(err)
        }
    }
    getitemcount(sql, userId){//RETURNS PROMISE
        return sql.get(`SELECT * FROM items WHERE userId ="${userId}"`).then(row => {
            return sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row2 => {
                var totalItemCt = 0;
                Object.keys(row).forEach(key => {
                    if(key !== "userId"){
                        totalItemCt += row[key];
                        //console.log(row[key] + " | " + key);
                    }
                });
                return {
                    itemCt : totalItemCt,
                    capacity : (totalItemCt + "/" + row2.inv_slots)
                }
            });
        });
    }
    hasenoughspace(sql, userId, amount = 0){//RETURNS PROMISE
        return this.getitemcount(sql, userId).then(itemCt => {
            return sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
                console.log((itemCt.itemCt + parseInt(amount)) + " <= " + row.inv_slots);
                if((itemCt.itemCt + parseInt(amount)) <= row.inv_slots) return true;
                else return false;
            });
        });
    }
    getitems(rarity = "all", {type = "", type2 = "", exclude = [], excludeItem = []}){
        rarity = rarity.toLowerCase();
        let items = [];

        Object.keys(itemdata).forEach(key => {
            if(itemdata[key].rarity.toLowerCase() == rarity && !excludeItem.includes(key)){
                if(type == ""){
                    items.push(key);
                }
                else if(type2 ==""){
                    if((type == "weapon" || type == "weap") && itemdata[key].isWeap == true){
                        items.push(key);
                    }
                    else if(type == "ammo" && itemdata[key].isAmmo.length >= 1){
                        items.push(key);
                    }
                    else if((type == "item" || type == "consumable") && itemdata[key].isItem == true){
                        items.push(key);
                    }
                    else if((type == "craft" || type == "craftable") && itemdata[key].craftedWith !== ""){
                        items.push(key);
                    }
                    else if((type == "unboxable") && itemdata[key].unboxable == true){
                        if(exclude.includes("ammo") && itemdata[key].isAmmo.length == 0){
                            items.push(key);
                        }
                        else if(exclude == ""){
                            items.push(key);
                        }
                    }
                }
                else if(type2 == "weapon" && itemdata[key].isWeap == true){
                    if((type == "weapon" || type == "weap") && itemdata[key].isWeap == true){
                        items.push(key);
                    }
                    else if(type == "ammo" && itemdata[key].isAmmo.length >= 1){
                        items.push(key);
                    }
                    else if((type == "item" || type == "consumable") && itemdata[key].isItem == true){
                        items.push(key);
                    }
                    else if((type == "craft" || type == "craftable") && itemdata[key].craftedWith !== ""){
                        items.push(key);
                    }
                    else if((type == "unboxable") && itemdata[key].unboxable == true){
                        items.push(key);
                    }
                }
                else if(type2 == "ammo" && itemdata[key].isAmmo.length >= 1){
                    if((type == "weapon" || type == "weap") && itemdata[key].isWeap == true){
                        items.push(key);
                    }
                    else if(type == "ammo" && itemdata[key].isAmmo.length >= 1){
                        items.push(key);
                    }
                    else if((type == "item" || type == "consumable") && itemdata[key].isItem == true){
                        items.push(key);
                    }
                    else if((type == "craft" || type == "craftable") && itemdata[key].craftedWith !== ""){
                        items.push(key);
                    }
                    else if((type == "unboxable") && itemdata[key].unboxable == true){
                        items.push(key);
                    }
                }
                else if(type2 == "unboxable" && itemdata[key].unboxable == true){
                    if((type == "weapon" || type == "weap") && itemdata[key].isWeap == true){
                        items.push(key);
                    }
                    else if(type == "ammo" && itemdata[key].isAmmo.length >= 1){
                        items.push(key);
                    }
                    else if((type == "item" || type == "consumable") && itemdata[key].isItem == true){
                        items.push(key);
                    }
                    else if((type == "craft" || type == "craftable") && itemdata[key].craftedWith !== ""){
                        items.push(key);
                    }
                    else if((type == "unboxable") && itemdata[key].unboxable == true){
                        items.push(key);
                    }
                }
                else if(type2 == "craft" && itemdata[key].craftedWith !== ""){
                    if((type == "weapon" || type == "weap") && itemdata[key].isWeap == true){
                        items.push(key);
                    }
                    else if(type == "ammo" && itemdata[key].isAmmo.length >= 1){
                        items.push(key);
                    }
                    else if((type == "item" || type == "consumable") && itemdata[key].isItem == true){
                        items.push(key);
                    }
                    else if((type == "craft" || type == "craftable") && itemdata[key].craftedWith !== ""){
                        items.push(key);
                    }
                    else if((type == "unboxable") && itemdata[key].unboxable == true){
                        items.push(key);
                    }
                }
                else if(type2 == "item" && itemdata[key].isItem == true){
                    if((type == "weapon" || type == "weap") && itemdata[key].isWeap == true){
                        items.push(key);
                    }
                    else if(type == "ammo" && itemdata[key].isAmmo.length >= 1){
                        items.push(key);
                    }
                    else if((type == "item" || type == "consumable") && itemdata[key].isItem == true){
                        items.push(key);
                    }
                    else if((type == "craft" || type == "craftable") && itemdata[key].craftedWith !== ""){
                        items.push(key);
                    }
                    else if((type == "unboxable") && itemdata[key].unboxable == true){
                        items.push(key);
                    }
                }
            }
            else if(rarity == "all" && !exclude.includes(itemdata[key].rarity.toLowerCase()) && !excludeItem.includes(key)){
                items.push(key);
            }
        });
        return items;
    }
    getuseritems(sql, userId, {sep = "",amounts= false, icon = false}){
        return sql.get(`SELECT * FROM items WHERE userId ="${userId}"`).then(row => {
            let commonItems = [];
            let uncommonItems = [];
            let rareItems = [];
            let epicItems = [];
            let legendItems = [];
            let ultraItems = [];
            let limitedItems = [];
            Object.keys(itemdata).forEach(key => {
                if(row[key] >= 1){
                    if(icon){
                        if(itemdata[key].rarity == "Common") commonItems.push(itemdata[key].icon + sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Uncommon") uncommonItems.push(itemdata[key].icon + sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Rare") rareItems.push(itemdata[key].icon + sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Epic") epicItems.push(itemdata[key].icon + sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Legendary") legendItems.push(itemdata[key].icon + sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Ultra") ultraItems.push(itemdata[key].icon + sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Limited") limitedItems.push(itemdata[key].icon + sep + key + sep + "("+row[key]+")");
                    }
                    else{
                        if(itemdata[key].rarity == "Common") commonItems.push(sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Uncommon") uncommonItems.push(sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Rare") rareItems.push(sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Epic") epicItems.push(sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Legendary") legendItems.push(sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Ultra") ultraItems.push(sep + key + sep + "("+row[key]+")");
                        else if(itemdata[key].rarity == "Limited") limitedItems.push(sep + key + sep + "("+row[key]+")");
                    }
                }
            });
            return {
                common: commonItems,
                uncommon: uncommonItems,
                rare: rareItems,
                epic: epicItems,
                legendary: legendItems,
                ultra: ultraItems,
                limited: limitedItems,
            }
        });
    }
    formatMoney(money){
        /*
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return formatter.format(money);
        */
       return "$" + (money).toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&,');
    }

    //USE COMMAND
    randomItems(sql, killerId, victimId, amount){
        return sql.get(`SELECT * FROM items WHERE userId ="${victimId}"`).then(victimItems => {
            return sql.get(`SELECT * FROM items WHERE userId ="${killerId}"`).then(killerItems => { 
                if(amount <= 0){
                    return selected = "They had no items you could steal!";
                }
                let victimItemsList = [];

                Object.keys(itemdata).forEach(key => {
                    if(victimItems[key] >= 1){
                        if(itemdata[key].canBeStolen){
                            victimItemsList.push(key);
                        }
                    }
                });

                const shuffled = victimItemsList.sort(() => 0.5 - Math.random()); //shuffles array of items
                var selected = shuffled.slice(0, amount); //picks random items
                
                for (var i = 0; i < selected.length; i++) {
                    //add items to killers inventory, take away from victims
                    sql.run(`UPDATE items SET ${selected[i]} = ${eval(`killerItems.` + selected[i]) + 1} WHERE userId = ${killerId}`);
                    sql.run(`UPDATE items SET ${selected[i]} = ${eval(`victimItems.` + selected[i]) - 1} WHERE userId = ${victimId}`);
                }
                return selected.join("\n");
            });
        });
    }
    randomUser(message, sql){//returns a random userId from the attackers guild
        return sql.all(`SELECT * FROM userGuilds WHERE guildId ="${message.guild.id}" ORDER BY LOWER(userId)`).then(rows => {
            var guildUsers = [];
            rows.forEach(function (row) {
                try{
                    if(message.guild.members.get(row.userId).displayName){
                        if(row.userId != message.author.id){//make sure message author isn't attacked by self
                            guildUsers.push(row.userId);
                        }
                        
                    }
                }
                catch(err){
                    console.log("error in server");
                }
            });
            var rand = guildUsers[Math.floor(Math.random() * guildUsers.length)];
            return rand;
        });
    }
    addxp(message, sql, amount, userId){
        sql.get(`SELECT * FROM items i
                JOIN scores s
                ON i.userId = s.userId
                WHERE s.userId="${userId}"`).then(row => {  
            if(xpPotCooldown.has(message.author.id)){
                message.reply("You need to wait  `" + ((180 * 1000 - ((new Date()).getTime() - row.xpTime)) / 1000).toFixed(0) + " seconds`  before using another `xp_potion`.");
                return;
            }
            sql.run(`UPDATE scores SET xpTime = ${(new Date()).getTime()} WHERE userId = ${message.author.id}`);
            xpPotCooldown.add(message.author.id);
            setTimeout(() => {
                xpPotCooldown.delete(message.author.id);
                sql.run(`UPDATE scores SET xpTime = ${0} WHERE userId = ${message.author.id}`);
            }, 180 * 1000);

            sql.run(`UPDATE items SET xp_potion = ${row.xp_potion - 1} WHERE userId = ${userId}`);
            sql.run(`UPDATE scores SET points = ${row.points + amount} WHERE userId = ${userId}`);
            let msgEmbed = new Discord.RichEmbed()
            .setAuthor(message.member.displayName, message.author.avatarURL)
            .setTitle("Successfully used `xp_potion`")
            .setDescription("Gained **"+amount+" XP**!")
            .setColor(14202368)
            message.channel.send(msgEmbed);
        });
    }
    resetSkills(message, sql, userId){
        sql.get(`SELECT * FROM items i
                JOIN scores s
                ON i.userId = s.userId
                WHERE s.userId="${userId}"`).then(row => {
            let usedStatPts = row.used_stats;
            sql.run(`UPDATE items SET reroll_scroll = ${row.reroll_scroll - 1} WHERE userId = ${userId}`);
            sql.run(`UPDATE scores SET stats = ${row.stats + usedStatPts} WHERE userId = ${userId}`);
            sql.run(`UPDATE scores SET maxHealth = ${100} WHERE userId = ${userId}`);
            sql.run(`UPDATE scores SET luck = ${0} WHERE userId = ${userId}`);
            sql.run(`UPDATE scores SET scaledDamage = ${1.00} WHERE userId = ${userId}`);
            sql.run(`UPDATE scores SET used_stats = ${0} WHERE userId = ${userId}`);
            if(row.health > 100){
                sql.run(`UPDATE scores SET health = ${100} WHERE userId = ${userId}`);
            }
            let msgEmbed = new Discord.RichEmbed()
            .setAuthor(message.member.displayName, message.author.avatarURL)
            .setTitle("Successfully used 📜`reroll_scroll`")
            .setDescription("Restored **"+usedStatPts+"** skill points.")
            .setFooter("Attributes reset.")
            .setColor(14202368)
            message.channel.send(msgEmbed);
        });
    }
    openbox(message, sql, type, amount = 1){
        sql.get(`SELECT * FROM items i
        JOIN scores s
        ON i.userId = s.userId
        WHERE s.userId="${message.author.id}"`).then(row => {
            this.hasenoughspace(sql, message.author.id).then(result => {
                if(!result){
                    return message.reply("**You don't have enough space in your inventory!** You can clear up space by selling some items.");
                }

                let itemsOpened = [];
                let multiItemArray = [];
                let pureItemArray = [];
                let lastItem = "";
                let lastRarity = "";
                let lastQual = "";

                if(type == "item_box"){
                    for(var i = 0; i < amount; i++){
                        //iterates for each box user specifies
                        let chance = Math.floor(Math.random() * 201) + (row.luck * 2);
                        let rand = "";
            
                        if(chance <= 120){                                   //COMMON ITEMS % chance
                            let newCommonItems = this.getitems("common", {type: "unboxable", exclude: ["ammo"], excludeItem: ["item_box"]});
                            rand = newCommonItems[Math.floor(Math.random() * newCommonItems.length)];
                            multiItemArray.push("<:UnboxCommon:526248905676029968> `" + rand + "`");
                            itemsOpened.push("You just got a common `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 10197915;
                            lastQual = "common";
                            
                        }
                        else if(chance <= 175){                               //UNCOMMON ITEMS 35% chance
                            let newuncommonItems = this.getitems("uncommon", {type: "unboxable", exclude: ["ammo"]});
                            rand = newuncommonItems[Math.floor(Math.random() * newuncommonItems.length)];
                            multiItemArray.push("<:UnboxUncommon:526248928891371520> `" + rand + "`");
                            itemsOpened.push("You just got an uncommon `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 4755200;
                            lastQual = "uncommon";
                        }
                        else if(chance <= 190){                               //RARE ITEMS 12% chance
                            let newRareItems = this.getitems("rare", {type: "unboxable", exclude: ["ammo"]});
                            rand = newRareItems[Math.floor(Math.random() * newRareItems.length)];
                            multiItemArray.push("<:UnboxRare:526248948579434496> `" + rand + "`");
                            itemsOpened.push("You just got a RARE `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 30463;
                            lastQual = "rare";
                        }
                        else if(chance <= 199){                                //EPIC ITEMS  2% chance
                            let newEpicItems = this.getitems("epic", {type: "unboxable", exclude: ["ammo"]});
                            rand = newEpicItems[Math.floor(Math.random() * newEpicItems.length)];
                            multiItemArray.push("<:UnboxEpic:526248961892155402> `" + rand + "`");
                            itemsOpened.push("You just got an **EPIC** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 12390624;
                            lastQual = "epic";
                        }
                        else{
                            let newLegendItems = this.getitems("legendary", {type: "unboxable", exclude: ["ammo"]});
                            rand = newLegendItems[Math.floor(Math.random() * newLegendItems.length)];   //LEGENDARY ITEMS 1% chance
                            multiItemArray.push("<:UnboxLegendary:526248970914234368> `" + rand + "`");
                            itemsOpened.push("You just got a **LEGENDARY** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 16312092;
                            lastQual = "legendary";
                        }
                    }
                    sql.run(`UPDATE items SET item_box = ${row.item_box - amount} WHERE userId = ${message.author.id}`);
                }
                else if(type == "ultra_box"){
                    for(var i = 0; i < amount; i++){
                        let chance = Math.floor(Math.random() * 201) + (row.luck * 2) //1-200
                        let rand = "";

                        if(chance <= 132){                               //RARE ITEMS 65% chance
                            let newRareItems = this.getitems("rare", {type: "unboxable", exclude: ["ammo"]});
                            rand = newRareItems[Math.floor(Math.random() * newRareItems.length)];
                            multiItemArray.push("<:UnboxRare:526248948579434496> `" + rand + "`");
                            itemsOpened.push("You just got a RARE `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 30463;
                            lastQual = "rare";

                        }

                        else if(chance <= 178){                                //EPIC ITEMS  23% chance
                            let newEpicItems = this.getitems("epic", {type: "unboxable", exclude: ["ammo"], excludeItem: ["ultra_box"]});
                            rand = newEpicItems[Math.floor(Math.random() * newEpicItems.length)];
                            multiItemArray.push("<:UnboxEpic:526248961892155402> `" + rand + "`");
                            itemsOpened.push("You just got an **EPIC** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 12390624;
                            lastQual = "epic";
                        }

                        else if(chance <= 199){
                            let newLegendItems = this.getitems("legendary", {type: "unboxable", exclude: ["ammo"]});
                            rand = newLegendItems[Math.floor(Math.random() * newLegendItems.length)];   //LEGENDARY ITEMS 10.5% chance
                            multiItemArray.push("<:UnboxLegendary:526248970914234368> `" + rand + "`");
                            itemsOpened.push("You just got a **LEGENDARY** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 16312092;
                            lastQual = "legendary";
                        }
                        else{
                            //ultra item here
                            let newUltraItems = this.getitems("ultra", {type: "unboxable", exclude: ["ammo"]});
                            rand = newUltraItems[Math.floor(Math.random() * newUltraItems.length)];   //ULTRA ITEMS 0.5% chance
                            multiItemArray.push("<:UnboxUltra:526248982691840003> `" + rand + "`");
                            itemsOpened.push("You just got an **ULTRA** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 16711778;
                            lastQual = "ultra";
                        }
                    }
                    sql.run(`UPDATE items SET ultra_box = ${row.ultra_box - amount} WHERE userId = ${message.author.id}`);
                }
                else if(type == "ammo_box"){
                    for(var i = 0; i < amount; i++){
                        let chance = Math.floor(Math.random() * 101) + (row.luck) //1-100
                        let rand = "";

                        if(chance <= 40){                                   //COMMON AMMO 44% chance
                            let newCommonAmmo = this.getitems("common", {type: "ammo", type2: "unboxable"});
                            rand = newCommonAmmo[Math.floor(Math.random() * newCommonAmmo.length)];
                            multiItemArray.push("<:UnboxCommon:526248905676029968> `" + rand + "`");
                            itemsOpened.push("You just got a common `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 10197915;
                            lastQual = "common";
                        }
                        else if(chance <= 72){                               //UNCOMMON AMMO 30% chance
                            let newUncommonAmmo = this.getitems("uncommon", {type: "ammo", type2: "unboxable"});
                            rand = newUncommonAmmo[Math.floor(Math.random() * newUncommonAmmo.length)];
                            multiItemArray.push("<:UnboxUncommon:526248928891371520> `" + rand + "`");
                            itemsOpened.push("You just got an uncommon `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 4755200;
                            lastQual = "uncommon";
                        }

                        else if(chance <= 94){                               //RARE AMMO 20% chance
                            let newRareAmmo = this.getitems("rare", {type: "ammo", type2: "unboxable"});
                            rand = newRareAmmo[Math.floor(Math.random() * newRareAmmo.length)];
                            multiItemArray.push("<:UnboxRare:526248948579434496> `" + rand + "`");
                            itemsOpened.push("You just got a RARE `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 30463;
                            lastQual = "rare";
                        }

                        else if(chance <= 98) {                                //EPIC AMMO  8% chance
                            let newEpicAmmo = this.getitems("epic", {type: "ammo", type2: "unboxable"});
                            rand = newEpicAmmo[Math.floor(Math.random() * newEpicAmmo.length)];
                            multiItemArray.push("<:UnboxEpic:526248961892155402> `" + rand + "`");
                            itemsOpened.push("You just got an **EPIC** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 12390624;
                            lastQual = "epic";
                        }
                        else{                                                  //LEGENDARY AMMO 2% chance
                            let newLegendAmmo = this.getitems("legendary", {type: "ammo", type2: "unboxable"});
                            rand = newLegendAmmo[Math.floor(Math.random() * newLegendAmmo.length)];
                            multiItemArray.push("<:UnboxLegendary:526248970914234368> `" + rand + "`");
                            itemsOpened.push("You just got a **LEGENDARY** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 16312092;
                            lastQual = "legendary";
                        }
                    }
                    sql.run(`UPDATE items SET ammo_box = ${row.ammo_box - amount} WHERE userId = ${message.author.id}`);
                }
                else if(type == "ultra_ammo"){
                    for(var i = 0; i < amount; i++){
                        let chance = Math.floor(Math.random() * 101) + (row.luck) //1-100
                        let rand = "";
                        
                        if(chance <= 10){                               //UNCOMMON AMMO 10% chance
                            let newUncommonAmmo = this.getitems("uncommon", {type: "ammo", type2: "unboxable"});
                            rand = newUncommonAmmo[Math.floor(Math.random() * newUncommonAmmo.length)];
                            multiItemArray.push("<:UnboxUncommon:526248928891371520> `" + rand + "`");
                            itemsOpened.push("You just got an uncommon `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 4755200;
                            lastQual = "uncommon";
                        }

                        else if(chance <= 60){                               //RARE AMMO 50% chance
                            let newRareAmmo = this.getitems("rare", {type: "ammo", type2: "unboxable"});
                            rand = newRareAmmo[Math.floor(Math.random() * newRareAmmo.length)];
                            multiItemArray.push("<:UnboxRare:526248948579434496> `" + rand + "`");
                            itemsOpened.push("You just got a RARE `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 30463;
                            lastQual = "rare";
                        }

                        else if(chance <= 90) {                                //EPIC AMMO  30% chance
                            let newEpicAmmo = this.getitems("epic", {type: "ammo", type2: "unboxable"});
                            rand = newEpicAmmo[Math.floor(Math.random() * newEpicAmmo.length)];
                            multiItemArray.push("<:UnboxEpic:526248961892155402> `" + rand + "`");
                            itemsOpened.push("You just got an **EPIC** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 12390624;
                            lastQual = "epic";
                        }
                        else{                                                  //LEGENDARY AMMO 10% chance
                            let newLegendAmmo = this.getitems("legendary", {type: "ammo", type2: "unboxable"});
                            rand = newLegendAmmo[Math.floor(Math.random() * newLegendAmmo.length)];
                            multiItemArray.push("<:UnboxLegendary:526248970914234368> `" + rand + "`");
                            itemsOpened.push("You just got a **LEGENDARY** `" + rand + "`");
                            pureItemArray.push(rand);
                            lastItem = rand;
                            lastRarity = 16312092;
                            lastQual = "legendary";
                        }
                    }
                    sql.run(`UPDATE items SET ultra_ammo = ${row.ultra_ammo - amount} WHERE userId = ${message.author.id}`);
                }

                var counts = {};
                pureItemArray.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

                Object.keys(counts).forEach(key => {
                    //key is the item
                    //counts[key] is the item amount in array
                    sql.run(`UPDATE items SET ${key} = ${row[key] + counts[key]} WHERE userId = ${message.author.id}`);
                });
                
                const embedInfo = new Discord.RichEmbed()
                .setAuthor(message.member.displayName, message.author.avatarURL)
                .setColor(lastRarity)
                if(amount == 1){
                    embedInfo.setTitle(itemsOpened);
                    if(itemImg[lastItem] != undefined){
                        embedInfo.setImage(itemImg[lastItem]);
                    }
                    else{
                        embedInfo.setImage(itemImg[lastQual]);
                    }
                }
                else{
                    embedInfo.setDescription(multiItemArray);
                    embedInfo.setFooter(amount + " boxes opened.");
                }
                message.channel.send(embedInfo);
            });
        });
    }
    addToHealCooldown(sql, userId, itemUsed){
        sql.run(`UPDATE scores SET ${itemdata[itemUsed].cooldown.scoreRow} = ${(new Date()).getTime()} WHERE userId = ${userId}`);

        healCooldown.add(userId);

        setTimeout(() => {

            healCooldown.delete(userId);
            sql.run(`UPDATE scores SET ${itemdata[itemUsed].cooldown.scoreRow} = ${0} WHERE userId = ${userId}`);
            
        }, itemdata[itemUsed].cooldown.seconds * 1000);
    }
    getHealCooldown(sql, userId){
        return sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
            if(row._10mHEALCD > 0){
                return "`" + ((600 * 1000 - ((new Date()).getTime() - row._10mHEALCD)) / 60000).toFixed(1) + " minutes`"
            }
            else if(row._20mHEALCD > 0){
                return "`" + ((1200 * 1000 - ((new Date()).getTime() - row._20mHEALCD)) / 60000).toFixed(1) + " minutes`"
            }
            else if(row._40mHEALCD > 0){
                return "`" + ((2400 * 1000 - ((new Date()).getTime() - row._40mHEALCD)) / 60000).toFixed(1) + " minutes`"
            }
            else{
                return "`[REDACTED]`";
            }
        });
    }
    addToWeapCooldown(sql, userId, itemUsed){
        sql.run(`UPDATE scores SET ${itemdata[itemUsed].cooldown.scoreRow} = ${(new Date()).getTime()} WHERE userId = ${userId}`);

        weapCooldown.add(userId);

        setTimeout(() => {

            weapCooldown.delete(userId);
            sql.run(`UPDATE scores SET ${itemdata[itemUsed].cooldown.scoreRow} = ${0} WHERE userId = ${userId}`);
            
        }, itemdata[itemUsed].cooldown.seconds * 1000);
    }
    getAttackCooldown(sql, userId){
        return sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
            if(row._15mCD > 0){
                return "`" + ((900 * 1000 - ((new Date()).getTime() - row._15mCD)) / 60000).toFixed(1) + " minutes`"
            }
            else if(row._30mCD > 0){
                return "`" + ((1800 * 1000 - ((new Date()).getTime() - row._30mCD)) / 60000).toFixed(1) + " minutes`"
            }
            else if(row._45mCD > 0){
                return "`" + ((2700 * 1000 - ((new Date()).getTime() - row._45mCD)) / 60000).toFixed(1) + " minutes`"
            }
            else if(row._60mCD > 0){
                return "`" + ((3600 * 1000 - ((new Date()).getTime() - row._60mCD)) / 60000).toFixed(1) + " minutes`"
            }
            else if(row._80mCD > 0){
                return "`" + ((4800 * 1000 - ((new Date()).getTime() - row._80mCD)) / 60000).toFixed(1) + " minutes`"
            }
            else if(row._100mCD > 0){
                return "`" + ((6000 * 1000 - ((new Date()).getTime() - row._100mCD)) / 60000).toFixed(1) + " minutes`"
            }
            else if(row._120mCD > 0){
                return "`" + ((7200 * 1000 - ((new Date()).getTime() - row._120mCD)) / 60000).toFixed(1) + " minutes`"
            }
            else{
                return "`[REDACTED]`";
            }
            //idea for making each weapon have separate cd, (row[itemUsed].cooldown.scoreRow) so... ((itemdata[itemUsed].cooldown.seconds * 1000 - ((new Date()).getTime() - row[itemdata[itemUsed].cooldown.scoreRow])) / 60000).toFixed(1) + " minutes`"
        });
    }

    //TRADE COMMAND METHODS
    getTotalItmCountFromList(list){
        if(list.length == 0){
            return 0;
        }
        let totalItemCt = 0;
        for(var i=0; i < list.length; i++){
            //do stuff for each item
            //store amounts in array as ["rock|5","ak47|2"] then use split("|")
            let itemToCheck = list[i].split("|");
            totalItemCt += parseInt(itemToCheck[1]);
        }
        return totalItemCt;
    }

    //BUY COMMAND
    buyitem(message, sql, buyItem, buyAmount, itemPrice, currency, isGame = false){
        let displayPrice = currency == 'money' ? this.formatMoney(itemPrice * buyAmount) : itemPrice * buyAmount + " `" + currency + "`";
        console.log(itemPrice + " " + buyAmount);
        message.reply("Purchase "+ buyAmount+ "x `" + buyItem + "` for " + displayPrice + "?").then(botMessage => {
            botMessage.react('✅').then(() => botMessage.react('❌'));
            const filter = (reaction, user) => {
                return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
            };
            botMessage.awaitReactions(filter, {max: 1, time: 15000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if(reaction.emoji.name === '✅'){
                    botMessage.delete();

                    this.hasenoughspace(sql, message.author.id, parseInt(buyAmount)).then(result => {
                        this.hasmoney(sql, message.author.id, itemPrice * buyAmount).then(hasmoney => {
                            if(hasmoney && result){
                                this.additem(sql, message.author.id, buyItem, buyAmount);
                                this.removemoney(sql, message.author.id, itemPrice * buyAmount);
                                message.reply("You bought " + buyAmount + "x " + buyItem + "!");
                            }
                            else if(!hasmoney){
                                message.reply("You don't have enough money!");
                            }
                            else{
                                message.reply("**You don't have enough space in your inventory!** You can clear up space by selling some items.");
                            }
                        });
                    });
                }
                else{
                    botMessage.delete();
                }
            }).catch(collected => {
                botMessage.delete();
                message.reply("You didn't react in time!");
            });
        });
    }

    //GAMBLE SUBCOMMANDS
    roulette(message, sql, userId, amount){
        let multiplier = 1.2;
        let winnings = Math.floor(amount * multiplier);
        sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
            let luck = row.luck >= 20 ? 10 : Math.floor(row.luck/2);
            let chance = Math.floor(Math.random() * 100) + luck; //return 1-100
            if(chance <= 20){
                let healthDeduct = 50;
                if(row.health <= 50){
                    healthDeduct = row.health - 1;
                    sql.run(`UPDATE scores SET health = ${1} WHERE userId = ${userId}`);
                }
                else{
                    sql.run(`UPDATE scores SET health = ${row.health - 50} WHERE userId = ${userId}`);
                }
                message.reply("***Click***").then(msg => {
                    setTimeout(() => {
                        msg.edit(message.author + ", 💥 The gun fires! You took *" + healthDeduct + "* damage and now have **" + (row.health - healthDeduct) + " health**. Oh, and you also lost $" + amount);
                    }, 1500);
                });
            }
            else{
                sql.run(`UPDATE scores SET money = ${row.money + winnings} WHERE userId = ${message.author.id}`);
                message.reply("***Click***").then(msg => {
                    setTimeout(() => {
                        msg.edit(message.author + ", You survived! Your winnings are: $" + winnings + " 💵");
                    }, 1500);
                });
            }
        });
    }
    slots(message, sql, userId, amount){
        sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
            let mainRowGif = "<a:_slots:547282654920179722>";
            let topRowGif = "<a:_slotsBOT:547787994258472980>";
            let botRowGif = "<a:_slotsTOP:547787986696142848>";
            let slotEmotes = ["<:UnboxCommon:526248905676029968>","<:UnboxRare:526248948579434496>","<:UnboxEpic:526248961892155402>","<:UnboxLegendary:526248970914234368>"];
            let col1 = [];
            let col2 = [];
            let col3 = [];
            let slotFinal = [];
            
            let winnings = 0;
            let rewardMltp = 0.00; //used to check if user wins, also multiplies the amount user entered

            let template = "⬛"+topRowGif+topRowGif+topRowGif+"⬛\n▶"+mainRowGif+mainRowGif+mainRowGif+"◀\n⬛"+botRowGif+botRowGif+botRowGif+"⬛";
            let slotEmbed = new Discord.RichEmbed()
            .setAuthor(message.member.displayName, message.author.avatarURL)
            .setTitle(" --**SLOT MACHINE**--")
            .setDescription(template)
            let luck = row.luck >= 30 ? 30 : Math.floor(row.luck);
            console.log(luck);
            for(var i = 1; i <= 3; i++){
                let chance = Math.floor(rng() * 200) + luck;
                console.log("chance : "+ chance)
                if(chance <= 100){
                    //unbox common
                    eval("col"+i+".push(slotEmotes[3],slotEmotes[0],slotEmotes[1]);");
                    slotFinal.push("common");
                }
                else if(chance <= 150){
                    //unbox rare
                    eval("col"+i+".push(slotEmotes[0],slotEmotes[1],slotEmotes[2]);");
                    slotFinal.push("rare");
                }
                else if(chance <= 180){
                    eval("col"+i+".push(slotEmotes[1],slotEmotes[2],slotEmotes[3]);");
                    slotFinal.push("epic");
                }
                else{
                    //legend
                    eval("col"+i+".push(slotEmotes[2],slotEmotes[3],slotEmotes[0]);");
                    slotFinal.push("legend");
                }
            }
            if(slotFinal[0] == slotFinal[1] && slotFinal[1] == slotFinal[2]){
                //all 3 match
                if(slotFinal[0] == "common"){
                    //1x
                    rewardMltp = 2.00;
                }
                else if(slotFinal[0] == "rare"){
                    //3x
                    rewardMltp = 3.00;
                }
                else if(slotFinal[0] == "epic"){
                    //4x
                    rewardMltp = 6.00;
                }
                else if(slotFinal[0] =="legend"){
                    //10x
                    rewardMltp = 10.00;
                }
                console.log("ALL 3 MATCH!")
            }
            else if(slotFinal[0] == slotFinal[1] || slotFinal[1] == slotFinal[2]){
                //2 of the same on left or right sides
                if(slotFinal[1] == "common"){
                    rewardMltp = 0.80;
                }
                else if(slotFinal[1] == "rare"){
                    //1.5x
                    rewardMltp = 1.50;
                }
                else if(slotFinal[1] == "epic"){
                    //3x
                    rewardMltp = 3.00;
                }
                else if(slotFinal[1] =="legend"){
                    //4x
                    rewardMltp = 5.00;
                }
            }
            winnings = Math.floor(amount * rewardMltp);
            sql.run(`UPDATE scores SET money = ${row.money + winnings} WHERE userId = ${message.author.id}`);
            message.channel.send(slotEmbed).then(msg => {
                let slots1 = "⬛"+col1[0]+topRowGif+topRowGif+"⬛\n"+
                                "▶"+col1[1]+mainRowGif+mainRowGif+"◀\n"+
                                "⬛"+col1[2]+botRowGif+botRowGif+"⬛";
                let slots2 = "⬛"+col1[0]+col2[0]+topRowGif+"⬛\n"+
                                "▶"+col1[1]+col2[1]+mainRowGif+"◀\n"+
                                "⬛"+col1[2]+col2[2]+botRowGif+"⬛";
                let slots3 = "";
                if(rewardMltp !== 0.00){
                    slots3 = "⬛"+col1[0]+col2[0]+col3[0]+"⬛\n"+
                                "▶"+col1[1]+col2[1]+col3[1]+`◀ You won **$${winnings}**! (${rewardMltp.toFixed(2)}x)\n`+
                                "⬛"+col1[2]+col2[2]+col3[2]+"⬛";
                }
                else{
                    slots3 = "⬛"+col1[0]+col2[0]+col3[0]+"⬛\n"+
                                "▶"+col1[1]+col2[1]+col3[1]+`◀ You lost!\n`+
                                "⬛"+col1[2]+col2[2]+col3[2]+"⬛ Better luck next time.";
                }
                slotEmbed.setDescription(slots1);
                //send messages
                setTimeout(() => {
                    msg.edit(slotEmbed).then(msg => {setTimeout(() => {
                        slotEmbed.setDescription(slots2);
                        msg.edit(slotEmbed).then(msg => {setTimeout(() => {
                                slotEmbed.setColor(rewardMltp !== 0.00 ? 720640 : 13632027)
                                slotEmbed.setDescription(slots3);
                                msg.edit(slotEmbed);
                            }, 1400);});
                    }, 1000);});
                }, 1000);
            });
        });
    }
    coinflip(message, sql, userId, amount, coinSide){
        sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => {
            //if(coinSide !== "heads" && coinSide !== "tails") coinSide = "heads";
            //let oppoSide = coinSide == "heads" ? "tails" : "heads";
            let luck = row.luck >= 20 ? 5 : Math.floor(row.luck/4);
            let chance = Math.floor(Math.random() * 100) + luck; //return 1-100
            if(chance > 50){
                sql.run(`UPDATE scores SET money = ${row.money + parseInt(amount)} WHERE userId = ${message.author.id}`);
                message.reply("You just won $" + (amount * 2) + "!");
            }
            else{
                message.reply("You just lost $" + amount + "!");
                sql.run(`UPDATE scores SET money = ${parseInt(row.money - amount)} WHERE userId = ${message.author.id}`);
            }
        });
    }

    //SCRAMBLE COMMAND
    scrambleWinMsg(message, itemReward){
        const embedScramble = new Discord.RichEmbed()
        .setTitle("**You got it correct!**")
        .setDescription("Reward : ```" + itemReward+"```")
        .setColor(9043800);
        message.channel.send(message.author, embedScramble);
    }

    //SHOP COMMAND
    getHomePage(sql){
        return sql.all(`SELECT * FROM gamesData`).then(gameRows => {
            let gameCount = 0;

            const firstEmbed = new Discord.RichEmbed()
            firstEmbed.setTitle(`**ITEM SHOP**`);
            firstEmbed.setDescription("📥 Buy 📤 Sell\nUse `buy (ITEM)` to purchase and `sell (ITEM)` to sell items.\n\nLimit 1 per person");
            firstEmbed.setThumbnail("https://cdn.discordapp.com/attachments/454163538886524928/497356681139847168/thanbotShopIcon.png");
            firstEmbed.setFooter(`Home page`);
            firstEmbed.setColor(0);

            gameRows.forEach(function (gameRow) {
                if(gameRow !== null){
                    if(gameRow.gameCurrency == "money"){
                        firstEmbed.addField(gameRow.gameDisplay,"Price: $" + gameRow.gamePrice + " | **" + gameRow.gameAmount + "** left! Use `buy " + gameRow.gameName + "` to purchase!");
                    }
                    else{
                        firstEmbed.addField(gameRow.gameDisplay,"Price: " + gameRow.gamePrice + " `" + gameRow.gameCurrency + "` | **" + gameRow.gameAmount + "** left! Use `buy " + gameRow.gameName + "` to purchase!");
                    }
                    gameCount += 1;
                }
            });
            if(gameCount == 0){
                firstEmbed.addField("Unfortunately, there are no steam keys for sale at this time.","Check back at a later time.");
                return firstEmbed;
            }
            else{
                return firstEmbed;
            }
        });
    }
    getGamesData(sql){
        return sql.all(`SELECT * FROM gamesData`).then(gameRows => {
            let gameCount = 0;
            let gameData = {};
            gameRows.forEach(function (gameRow) {
                if(gameRow !== null){
                    gameData[gameRow.gameName] = gameRow;
                    gameCount += 1;
                }
            });
            if(gameCount == 0){
                return false;
            }
            else{
                return gameData;
            }
        });
    }

    //MODERATING FUNCTIONS
    getinventorycode(message, sql, cryptor, userId, isHidden = false){
        return sql.get(`SELECT * FROM items i
        JOIN scores s
        ON i.userId = s.userId
        WHERE s.userId="${userId}"`).then(row => {
            let keys = Object.keys(row);
            let userObjectArray = [];
            let userInvCode = [];
            let invCount = 0;
            for(keys in row){
                if(row[keys] == null){
                    userObjectArray.push("`"+invCount+"`| `"+keys+"`: `0`");
                    userInvCode.push(0);
                }
                else if(row[keys] !== 0){
                    userObjectArray.push("`"+invCount+"`| `"+keys+"`: `"+row[keys]+"`");
                    userInvCode.push(row[keys]);
                }
                else{
                    userInvCode.push(row[keys]);
                }
                invCount += 1;
            }
            var encoded = cryptor.encode(userInvCode.join("|"));
            return {
                invCode : encoded, 
                objArray : userObjectArray,
                objArrayLength : userInvCode.length
            };
        }).catch((err) => {
            if(!isHidden){
                message.reply("Error getting inventory: ```"+err+"```")
            }
        });
    }
    inventorywipe(sql,  userId){
        sql.run(`UPDATE items SET item_box = ${1}, rpg = ${0}, rocket = ${0}, ak47 = ${0}, rifle_bullet = ${0}, 
        rock = ${0}, arrow = ${0}, fork = ${0}, club = ${0}, sword = ${0}, bow = ${0}, pistol_bullet = ${0}, glock = ${0}, crossbow = ${0}, spear = ${0}, thompson = ${0},
        health_pot = ${0}, ammo_box = ${0}, javelin = ${0}, awp = ${0}, m4a1 = ${0}, spas = ${0}, medkit = ${0}, revolver = ${0}, buckshot = ${0}, blunderbuss = ${0},
        grenade = ${0}, pills = ${0}, bat = ${0}, baseball = ${0}, peck_seed = ${0}, iron_shield = ${0}, gold_shield = ${0}, ultra_box = ${0}, rail_cannon = ${0}, plasma = ${0}, 
        fish = ${0}, bmg_50cal = ${0}, token = ${0}, candycane = ${0}, gingerbread = ${0}, mittens = ${0}, stocking = ${0}, snowball = ${0}, nutcracker = ${0}, screw = ${0}, 
        steel = ${0}, adhesive = ${0}, fiber_optics = ${0}, module = ${0}, ray_gun = ${0}, golf_club = ${0}, ultra_ammo = ${0}, stick = ${0}, reroll_scroll = ${0}, 
        xp_potion = ${0} WHERE userId = ${userId}`);
        sql.run(`UPDATE scores SET money = ${0}, level = ${1}, points = ${0}, stats = ${0}, used_stats = ${0}, scaledDamage = ${1.00}, 
        luck = ${0}, maxHealth = ${100}, health = ${100}, kills = ${0}, deaths = ${0} WHERE userId = ${userId}`);
    }
    monthlywipe(sql){//WIPE ALL BUT LIMITED ITEMS
        sql.run(`UPDATE items SET item_box = ${1}, rpg = ${0}, rocket = ${0}, ak47 = ${0}, rifle_bullet = ${0}, 
        rock = ${0}, arrow = ${0}, fork = ${0}, club = ${0}, sword = ${0}, bow = ${0}, pistol_bullet = ${0}, glock = ${0}, crossbow = ${0}, spear = ${0}, thompson = ${0},
        health_pot = ${0}, ammo_box = ${0}, javelin = ${0}, awp = ${0}, m4a1 = ${0}, spas = ${0}, medkit = ${0}, revolver = ${0}, buckshot = ${0}, blunderbuss = ${0},
        grenade = ${0}, pills = ${0}, bat = ${0}, baseball = ${0}, peck_seed = ${0}, iron_shield = ${0}, gold_shield = ${0}, ultra_box = ${0}, rail_cannon = ${0}, plasma = ${0}, 
        fish = ${0}, bmg_50cal = ${0}, screw = ${0}, steel = ${0}, adhesive = ${0}, fiber_optics = ${0}, module = ${0}, ray_gun = ${0}, golf_club = ${0}, 
        ultra_ammo = ${0}, stick = ${0}, reroll_scroll = ${0}, xp_potion = ${0}`);
        sql.run(`UPDATE scores SET money = ${0}, level = ${1}, points = ${0}, stats = ${0}, used_stats = ${0}, scaledDamage = ${1.00}, 
        luck = ${0}, maxHealth = ${100}, health = ${100}, kills = ${0}, deaths = ${0}`);
    }


    //NOT USED BY ANY COMMAND, can be called with eval
    addtoJSON(jsonFile){
        Object.keys(jsonFile).forEach(key => {
            if(jsonFile[key].buy !== ""){
                jsonFile[key].buy = {amount: jsonFile[key].buy, currency: "money"}
            }
        });
        fs.writeFile('testJSONfile2.json',JSON.stringify(jsonFile, null, 4), function(err) {
            console.log("complete");
        });
    }
}

module.exports = new Methods();