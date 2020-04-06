let Bot = {}
const logger = require("../support/log")(__filename)
const config = require("../config")
let BOT;
class WXBot {
    constructor(bot){
        if (bot) {
            BOT = bot
        }
        if (!BOT) {
            console.log("no Bot set")
            process.exit(0)
        }
    }
    async flushBot(){
        Bot = {}
    }
    async getUserBot(userName){
        let userBot = Bot[userName]
        if (!userBot) {
            userBot = await BOT.Contact.find({alias: userName}) || await BOT.Contact.find({name: userName})
            if (!userBot) {
                logger.warn(`no userBot found,${userName}`)
                return null;
            } else {
                Bot[userName] = userBot
            }
        }
        return userBot
    }
    async getAllFriend(){
        return await BOT.Contact.findAll()
    }
    async sendYourSelf(message){
        let userBot = await this.getUserBot(config.masterName)
        await userBot.say(message)
    }
}
module.exports=WXBot
