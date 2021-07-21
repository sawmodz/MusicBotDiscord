const PATH = "./"
const fs = require("fs")

const getSettings = (file, parameters) => {
    return readData(file)[parameters]
}

const pathExist = (path) => {
    return fs.existsSync(path)
}

const setData = (file, key, value) => {
    try {
        let data = readData(file)

        data[key] = value

        fs.writeFileSync(PATH+file+".json", JSON.stringify(data))
    } catch (error) {
        console.error(error)
    }
}

const readData = (file) => {
    let path = PATH+file+".json"
    let data = {}

    if(pathExist(path))
        data = JSON.parse(fs.readFileSync(path))

    return data
}

const createDataGuild = (guildID, command_channel_id, music_list_message_id, music_message_id) => {
    try {
        let path = PATH+"guilds/"+guildID+".json"

        data = {
            "guildID":guildID,
            "command_channel_id":command_channel_id,
            "music_list_message_id":music_list_message_id,
            "music_message_id":music_message_id,
            "queueConstruct":{
                "textChannel": null,
                "voiceChannel": null,
                "connection": null,
                "songs": [],
                "volume": 2,
                "playing": false,
                "repeat": false,
                "random": false
            }
        }

        fs.writeFileSync(path, JSON.stringify(data))
        return data
    } catch (error) {
        return {}
    }
}

module.exports = {getSettings, setData, createDataGuild}