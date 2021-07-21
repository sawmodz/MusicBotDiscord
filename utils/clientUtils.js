const clientHasPermissions = async (guild) => {
    let _client = await guild.members.fetch("858492022217637949")
    if(_client.hasPermission("MANAGE_CHANNELS") && _client.hasPermission("MANAGE_MESSAGES") && _client.hasPermission("SEND_MESSAGES") && _client.hasPermission("EMBED_LINKS") && _client.hasPermission("ADD_REACTIONS") && _client.hasPermission("CONNECT") && _client.hasPermission("SPEAK")){
        return true
    }else{
        const invite = "https://discord.com/oauth2/authorize?client_id=858492022217637949&scope=bot&permissions=3173392&guild_id="

        let member = await guild.members.fetch(guild.ownerID)
        member.send("An error has occurred, the Bot does not have permission to **read** and **send** messages and **manage**, **connect**, **speak**, **view** channels.\n\nPlease follow the link to add permissions to it.\n"+invite+guild.id)
        return false
    }
}

module.exports = {clientHasPermissions}