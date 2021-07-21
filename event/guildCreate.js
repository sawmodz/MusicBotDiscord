const clientUtils = require("../utils/clientUtils")
const storageManager = require("../utils/storageManager")

module.exports = async (client, guild, MessageButton, MessageActionRow, Discord) => {
    const guildID = guild.id
    const hasPermission = await clientUtils.clientHasPermissions(guild)

    if(hasPermission){
        const music_channel = await guild.channels.create("🎶Music🎶", {type: "text"})
        const command_channel_id = music_channel.id



        let list = new Discord.MessageEmbed()
        .setTitle("The playlist !")
        .setColor(0x00AE86)
        .setDescription("no songs :(")
        .setFooter("1 / 1")

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

        const message_playlist = await music_channel.send({
            embed:list,
            components: [page]
        })
        const music_message_id = message_playlist.id



        const embed_music_playing = new Discord.MessageEmbed()
        .setTitle("No music playing !")
        .setColor("#c27c0e")
        .setImage("https://static.wikia.nocookie.net/demon-hero/images/7/7c/Imagee.png/revision/latest?cb=20190531232408&path-prefix=fr")

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
        .setStyle('blurple')
        .setLabel("Pause")
        .setID("pause")

        const btnStop = new MessageButton()
        .setStyle('red')
        .setLabel("Stop")
        .setID("stop")

        const messageComponent = new MessageActionRow()
        .addComponent(btnSkip)
        .addComponent(btnReapeat)
        .addComponent(btnRandom)
        .addComponent(btnPause)
        .addComponent(btnStop)

        const message_isplaying = await music_channel.send({
            embed:embed_music_playing,
            components: [messageComponent]
        })
        const music_list_message_id = message_isplaying.id

        await storageManager.createDataGuild(guildID, command_channel_id, music_list_message_id, music_message_id)
    }
}