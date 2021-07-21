const Discord = require('discord.js')
const storageManager = require("./utils/storageManager")
const client = new Discord.Client()
const disbut = require('discord-buttons')(client)
const {MessageButton, MessageActionRow} = require("discord-buttons")
const fs = require("fs")

const guildCreate = require("./event/guildCreate")
const messageEvent = require("./event/message")

const lengthOfPage = 10

client.on("ready", ()=>{
    console.log(`Logged in as ${client.user.tag} on ${client.guilds.cache.size} serveurs!`)

    let files = fs.readdirSync("./guilds")

    files.forEach((result)=>{
        result = result.replace(".json", "")
        storageManager.setData("guilds/"+result, "songs", [])
    })

    client.user.setActivity('Boom Boom Boom', { type: 'Listening' })
})

client.on("guildCreate", (guild)=>{
    guildCreate(client, guild, MessageButton, MessageActionRow, Discord)
})

client.on("guildDelete", (guild)=>{
    storageManager.removeGuild(guild.id)
})

client.on("message", (message)=>{
    messageEvent.messages(client, message, changeList, changeBox)
})

client.on("voiceStateUpdate", (oldMember, newMember) => {
    if(newMember.id == "858492022217637949" && newMember.channelID == null){
        storageManager.setData("guilds/"+newMember.guild.id, "songs", [])
        changeList(false, newMember.guild.id, client, null)
    }
})

const changeList = (isMusic, guildID, client, song) => {
    let _songs = []

    let currentPage = storageManager.getSettings("guilds/"+guildID, "currentPage")
    let maxPage = storageManager.getSettings("guilds/"+guildID, "maxPage")

    if(!isMusic){
        _songs = ["No Music :("]
    }else{
        let id = 0
        for(const _song of song){
            if(id <= (lengthOfPage*currentPage) && id >= ((lengthOfPage*currentPage) - lengthOfPage)){
                if(id == 0){
                    _songs.push(" > 🔴 " + _song.title + " (" +  _song.author + ")")
                }else{
                    _songs.push(" > "+ id +" : " + _song.title + " (" +  _song.author + ")")
                }
            }
            id++
        }

        if(song.length > 0){
            _maxpage = ((song.length-1)/lengthOfPage)+1
            maxPage = parseInt(_maxpage.toString().split(",")[0])
        }else{
            maxPage = 1
        }
        
        if(currentPage != maxPage){
            if(song.length > 30){
                _songs.push("...")
            }
        }

        storageManager.setData("guilds/"+guildID, "currentPage", currentPage)
        storageManager.setData("guilds/"+guildID, "maxPage", maxPage)
    }

    client.channels.cache.get(storageManager.getSettings("guilds/"+guildID, "command_channel_id")).messages.fetch(storageManager.getSettings("guilds/"+guildID, "music_message_id")).then(bip=>{
        let list = new Discord.MessageEmbed()
        .setTitle("The playlist !")
        .setColor(0x00AE86)
        .setDescription(_songs.join("\n"))
        .setFooter(currentPage + " / " + maxPage)

        const pageSuivant = new MessageButton()
        .setStyle('blurple')
        .setLabel("Next")
        .setID("nextPage")
    
        const pagePrecedente = new MessageButton()
        .setStyle('blurple')
        .setLabel("Previous")
        .setID("bellowPage")

        const page = new MessageActionRow()
        .addComponent(pagePrecedente)
        .addComponent(pageSuivant)

        bip.edit("", {
            embed: list,
            components: [page]
        })
    })
}

const changeBox = (isPlay, title, image, songs, guildID) => {
    client.channels.cache.get(storageManager.getSettings("guilds/"+guildID, "command_channel_id")).messages.fetch(storageManager.getSettings("guilds/"+guildID, "music_list_message_id")).then(msg =>{
        let embed
        if(isPlay){
            embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setColor("#c27c0e")
            .setImage(image)
            //.setFooter(new Date(secondes * 1000).toISOString().substr(11, 8) + " / " + new Date(songs[0].lengthSeconds * 1000).toISOString().substr(11, 8))

            if(songs[0].url.includes("www.youtube.com")){
                embed.setURL(songs[0].url)
            }
            
        }else{
            embed = new Discord.MessageEmbed()
            .setTitle("Aucun titre en cour !")
            .setColor("#c27c0e")
            .setImage("https://static.wikia.nocookie.net/demon-hero/images/7/7c/Imagee.png/revision/latest?cb=20190531232408&path-prefix=fr")
        }

        const btnSkip = new MessageButton()
        .setStyle('blurple')
        .setLabel("Skip")
        .setID("skip")

        let btnReapeat = new MessageButton()
        .setStyle('blurple')
        .setLabel("Repeat")
        .setID("repeatStart")

        let btnRandom = new MessageButton()
        .setStyle('blurple')
        .setLabel("Random")
        .setID("randomStart")

        let btnPause = new MessageButton()
        .setStyle('red')
        .setLabel("Play")
        .setID("resume")

        const btnStop = new MessageButton()
        .setStyle('red')
        .setLabel("Stop")
        .setID("stop")

        const skip = new MessageActionRow()
        .addComponent(btnSkip)
        .addComponent(btnReapeat)
        .addComponent(btnRandom)
        .addComponent(btnPause)
        .addComponent(btnStop)

        msg.edit({
            embed: embed,
            components: [skip]
        })
    })
}

client.login(storageManager.getSettings("auth", "discord_bot_token"))