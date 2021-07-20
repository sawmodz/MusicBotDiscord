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

module.exports = {getSettings, setData}