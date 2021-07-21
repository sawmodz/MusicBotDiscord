const storageManager = require("../storageManager")
const search = require('youtube-search')
const ytdl = require('ytdl-core')
let timer

const opts = {
    maxResults: 1,
    key: storageManager.getSettings("auth", "youtube_key"),
    type: 'video'
}

const playSong = async (song, queue, guildID) => {
    clearInterval(timer)
    secondes = 0

    if (song == undefined || song == null || !song) {
        //change Box
        queue.voiceChannel.leave()
        return
    }

    if(song.url == "SPOTIFY"){
        let _song = await search(song.title + " " + song.musicAuthor, opts)
        song.url = _song.results[0].link
        song.image = _song.results[0].thumbnails.high
        queue.songs[0].url = _song.results[0].link
        queue.songs[0].image = _song.results[0].thumbnails.high
    }

    timer = setInterval(() => {
        secondes++
        if(secondes % 5 == 0){
            //changeBox(true, queueConstruct.songs[0].title, queueConstruct.songs[0].image.url)
        }
    }, 1000)

    const dispatcher = queue.connection.play(ytdl(song.url))
        .on('finish', () => {
            clearInterval(timer)
            if(!queue.repeat){
                queue.songs.shift()
            }
            if(queue.random){
                let array = queue.songs
                let currentIndex = array.length,  randomIndex;
  
                while (0 !== currentIndex) {
            
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
            
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
                }
                
                queue.songs = array
            }
            playSong(queue.songs[0], queue, guildID)
            if(queue.songs[0]){
                //changeBox(true, queue.songs[0].title, queue.songs[0].image.url)
            }
        })
        .on('error', error => console.error(error))
    dispatcher.setVolumeLogarithmic(queue.volume / 5)

    storageManager.setData("guilds/"+guildID, "songs", queue.songs)
}

module.exports = {playSong}