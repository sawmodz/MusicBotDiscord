const storageManager = require("../utils/storageManager")
const clientUtils = require("../utils/clientUtils")
const play = require("../utils/music/play")
const search = require('youtube-search')
const opts = {
    maxResults: 1,
    key: storageManager.getSettings("auth", "youtube_key"),
    type: 'video'
}

module.exports = async (client, message) => {
    if(message.author.bot) return

    const guildID = message.guild.id
    const channelID = message.channel.id

    if(clientUtils.clientHasPermissions(message.guild)){
        if(storageManager.getSettings("guilds/"+guildID, "command_channel_id") == channelID){
            if(message.member.voice.channelID == null){
                message.delete()
                return
            }

            const { channel } = message.member.voice
            let songInfo

            let queueConstruct = {
                textChannel: message.channel,
                voiceChannel: channel,
                connection: null,
                songs: storageManager.getSettings("guilds/"+guildID, "songs"),
                volume: storageManager.getSettings("guilds/"+guildID, "volume"),
                playing: storageManager.getSettings("guilds/"+guildID, "playing"),
                repeat: storageManager.getSettings("guilds/"+guildID, "repeat"),
                random: storageManager.getSettings("guilds/"+guildID, "random"),
            } 

            queueConstruct.textChannel = message.channel
            queueConstruct.voiceChannel = channel

            let song
            try {
                songInfo = await ytdl.getInfo(message.toString().replace(/<(.+)>/g, '$1'))

                song = {
                    id: songInfo.videoDetails.id,
                    title: Util.escapeMarkdown(songInfo.videoDetails.title),
                    url: songInfo.videoDetails.video_url,
                    image: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1],
                    lengthSeconds: songInfo.videoDetails.lengthSeconds,
                    author: message.author.username
                }
            } catch (error) {
                if(message.toString().includes("https://open.spotify.com")){
                    if(message.toString().includes("playlist")){
                        await getPlaylistTracks(message.toString(), message.author.username)
                    }
                    message.delete()
                }else{
                    let _song = await search(message.toString().replace(/,/g,' '), opts)

                    song = {
                        id: _song.results[0].id,
                        title: _song.results[0].title,
                        url: _song.results[0].link,
                        image: _song.results[0].thumbnails.high,
                        lengthSeconds: "0",
                        author: message.author.username
                    }
                }
            }

            if(!message.toString().includes("https://open.spotify.com")){
                if (queueConstruct.songs.length != 0) {
                    queueConstruct.songs.push(song);
                    message.delete()
                    //change list
                    storageManager.setData("guilds/"+guildID, "songs", queueConstruct.songs)
                    return
                }
    
                queueConstruct.songs.push(song);
            }

            try {
                const connection = await channel.join()
                queueConstruct.connection = connection
                let song = queueConstruct.songs[0]
                message.delete()
                //changeBox(true, song.title, song.image.url)
                play(song, queueConstruct, guildID)
            } catch (error) {
                await channel.leave()
            }
        }
    }
}