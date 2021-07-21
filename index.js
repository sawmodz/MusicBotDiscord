const Discord = require('discord.js')
const storageManager = require("./utils/storageManager")
const client = new Discord.Client()
const disbut = require('discord-buttons')(client)
const {MessageButton, MessageActionRow} = require("discord-buttons")
const fs = require("fs")

const guildCreate = require("./event/guildCreate")
const messageEvent = require("./event/message")

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
    messageEvent.messages(client, message)
})

client.login(storageManager.getSettings("auth", "discord_bot_token"))