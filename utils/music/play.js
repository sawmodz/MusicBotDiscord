const storageManager = require("../storageManager")
const search = require('youtube-search')
const ytdl = require('ytdl-core')

const opts = {
    maxResults: 1,
    key: storageManager.getSettings("auth", "youtube_key"),
    type: 'video'
}

const playSong = async (song, queue, guildID, changeList, client, changeBoxs, setConnection) => {
    try {
        secondes = 0

        if (song == undefined || song == null || !song) {
            await queue.voiceChannel.leave()
            storageManager.setData("guilds/"+guildID, "playing", false)
            changeBoxs(false, null, null, null, guildID)
            return
        }

        let songss = storageManager.getSettings("guilds/"+guildID, "songs")

        if(song.url == "SPOTIFY"){
            let _song = await search(song.title + " " + song.musicAuthor, opts)
            song.url = _song.results[0].link
            song.image = _song.results[0].thumbnails.high
            queue.songs[0].url = _song.results[0].link
            queue.songs[0].image = _song.results[0].thumbnails.high
            changeBoxs(true, song.title, song.image.url, songss, guildID)
        }

        storageManager.setData("guilds/"+guildID, "playing", true)

        const dispatcher = queue.connection.play(ytdl(song.url), {quality: 'highestaudio'})
            .on('finish', () => {
                let songss = storageManager.getSettings("guilds/"+guildID, "songs")

                setConnection(guildID, queue.connection)

                songss.shift()

                if(storageManager.getSettings("guilds/"+guildID, "random")){
                    songss = shuffle(songss)
                }

                playSong(songss[0], queue, guildID, changeList, client, changeBoxs, setConnection)

                storageManager.setData("guilds/"+guildID, "songs", songss)
                queue.songs = songss
                
                changeList(true, guildID, client, songss)
                if(songss[0]){
                    changeBoxs(true, songss[0].title, songss[0].image.url, songss, guildID)
                }
            })
            .on('error', error => console.error(error))
        dispatcher.setVolumeLogarithmic(queue.volume / 5)
        
        storageManager.setData("guilds/"+guildID, "songs", queue.songs)
        setConnection(guildID, queue.connection)
    } catch (error) {
        await queue.voiceChannel.leave()
        changeBoxs(false, null, null, null, guildID)
        console.log(error)
        return
    }
}

const shuffle = (array) => {
    let currentIndex = array.length,  randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array
}

module.exports = {playSong}