const Discord = require('discord.js')
const storageManager = require("./utils/storageManager")
const client = new Discord.Client()

client.on("ready", ()=>{
    console.log(`Logged in as ${client.user.tag} on ${client.guilds.cache.size} serveurs!`)
    client.user.setActivity('Boom Boom Boom', { type: 'LISTEN' })
})

client.login(storageManager.getSettings("auth", "discord_bot_token"))