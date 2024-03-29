const storageManager = require("../utils/storageManager")
const SpotifyWebApi = require('spotify-web-api-node')
const clientUtils = require("../utils/clientUtils")
const play = require("../utils/music/play")
const search = require('youtube-search')
const { Util } = require('discord.js')
const Discord = require('discord.js')
const ytdl = require('ytdl-core')

const lengthOfPage = 10
const maxPagePremium = 2

const opts = {
    maxResults: 1,
    key: storageManager.getSettings("auth", "youtube_key"),
    type: 'video'
}

const spotifyApi = new SpotifyWebApi({
    clientId: storageManager.getSettings("auth", "spotify_client_id"),
    clientSecret: storageManager.getSettings("auth", "spotify_client_secret"),
    redirectUri: 'http://localhost:8888/callback'
})

spotifyApi.setAccessToken(storageManager.getSettings("auth", "spotify_token"))
spotifyApi.setRefreshToken(storageManager.getSettings("auth", "spotify_refresh_token"))

const messages = async (client, message, changeList, changeBox, setConnection) => {
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
                        queueConstruct = await getPlaylistTracks(message.toString(), message.author.username, queueConstruct, message.guild, client, changeList)
                        storageManager.setData("guilds/"+guildID, "songs", queueConstruct.songs)
                    }
                    await message.delete()
                }else{
                    let _song = await search(message.toString().replace(/,/g,' '), opts)
                    
                    if(_song.length == 0){
                        message.delete()
                    }

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
                message.delete()
                if (queueConstruct.songs.length != 0) {
                    let _music = []
                    queueConstruct.songs.forEach(music => {
                        _music.push(music)
                    })
                    
                    queueConstruct.songs.push(song)
                    changeList(true, guildID, client, queueConstruct.songs)

                    let maxPage = storageManager.getSettings("guilds/"+guildID, "maxPage")
                    if(maxPage > maxPagePremium && storageManager.getSettings("guilds/"+guildID, "premium")){
                        queueConstruct.songs = _songs
                        let member = await message.guild.members.fetch(message.guild.ownerID)
                        member.send("you need the premium to have more than"+ maxPagePremium +"page of music")
                        changeList(true, guildID, client, queueConstruct.songs)
                    }

                    storageManager.setData("guilds/"+guildID, "songs", queueConstruct.songs)
                    return
                }
    
                queueConstruct.songs.push(song);
            }

            changeList(true, guildID, client, queueConstruct.songs)

            try {
                const connection = await channel.join()
                queueConstruct.connection = connection
                let song = queueConstruct.songs[0]
                play.playSong(song, queueConstruct, guildID, changeList, client, changeBox, setConnection)
            } catch (error) {
                console.log(error)
                await channel.leave()
            }
        }
    }
}

const getPlaylistTracks = async (playlistId, author, queueConstruct, guild, client, changeList) => {
    message = playlistId
    try {
        playlistId = playlistId.split("/")[4].split("?")[0]
        const data = await spotifyApi.getPlaylistTracks(playlistId, {
        offset: 1,
        limit: 100,
        fields: 'items'
        })
        let _songss = []

        queueConstruct.songs.forEach(music => {
            _songss.push(music)
        })

        for (let track_obj of data.body.items) {
            const track = track_obj.track
            song = {
                id: track.id,
                title: track.name,
                url: "SPOTIFY",
                image: "SPOTIFY",
                lengthSeconds: (track.duration_ms/1000),
                musicAuthor: track.artists[0].name,
                author: author
            }

            
            queueConstruct.songs.push(song)
        }
        changeList(true, guild.id, client, queueConstruct.songs)
        let maxPage = storageManager.getSettings("guilds/"+guild.id, "maxPage")
        if(maxPage > maxPagePremium && !storageManager.getSettings("guilds/"+guild.id, "premium")){
            queueConstruct["songs"] = _songss
            let member = await guild.members.fetch(guild.ownerID)
            member.send("you need the premium to have more than"+ maxPagePremium +"page of music")
            changeList(true, guild.id, client, queueConstruct.songs)
        }

        return queueConstruct
    } catch (error) {
        console.log(error)
        await spotifyApi.refreshAccessToken().then(
            function(data) {
                console.log('The access token has been refreshed!');

                spotifyApi.setAccessToken(data.body['access_token']);
            },
            function(err) {
                console.log('Could not refresh access token', err);
            }
        )
        return await getPlaylistTracks(message, author, queueConstruct, guild, client, changeList)
    }
    
}


module.exports = {messages}