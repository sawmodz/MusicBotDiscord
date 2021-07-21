const storageManager = require("../storageManager")
const search = require('youtube-search')
const ytdl = require('ytdl-core')

const opts = {
    maxResults: 1,
    key: storageManager.getSettings("auth", "youtube_key"),
    type: 'video'
}

const playSong = async (song, queue, guildID, changeList, client, changeBoxs, setConnection) => {
    secondes = 0

    if (song == undefined || song == null || !song) {
        await queue.voiceChannel.leave()
        changeBoxs(false, null, null, null, guildID)
        return
    }

    if(song.url == "SPOTIFY"){
        let _song = await search(song.title + " " + song.musicAuthor, opts)
        song.url = _song.results[0].link
        song.image = _song.results[0].thumbnails.high
        queue.songs[0].url = _song.results[0].link
        queue.songs[0].image = _song.results[0].thumbnails.high
    }

    const dispatcher = queue.connection.play(ytdl(song.url))
        .on('finish', () => {
            setConnection(guildID, queue.connection)
            songss = storageManager.getSettings("guilds/"+guildID, "songs")
            songss.shift()
            playSong(songss[0], queue, guildID, changeList, client, changeBoxs, setConnection)
            changeList(true, guildID, client, songss)
            if(songss[0]){
                changeBoxs(true, songss[0].title, songss[0].image.url, songss, guildID)
            }
            storageManager.setData("guilds/"+guildID, "songs", songss)
        })
        .on('error', error => console.error(error))
    dispatcher.setVolumeLogarithmic(queue.volume / 5)

    storageManager.setData("guilds/"+guildID, "songs", queue.songs)
    setConnection(guildID, queue.connection)
}

module.exports = {playSong}