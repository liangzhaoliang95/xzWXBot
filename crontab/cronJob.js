const util = require("../util/util");
const common = require("../support/common")
const config = require("../config")
const logger = require("../support/log")(__filename)
const {FileBox} = require("file-box")
const { exec } = require('child_process');
const BOT = require("../cache/Bot")
const Bot = new BOT()
async function everyMorning(users) {
    let userData;
    let OneWord = await util.getOneData(); //获取每日好句
    let img = FileBox.fromUrl(OneWord.imgUrl)
    img.mimeType='image/jpeg',
    OneWord.img = img
    for (let i = 0; i < users.length; i++) {
        //如果当前好友没有这个权限就跳过
        if (!users[i].cronJobs.includes("everyMorning")) continue;
        try {
            userData = users[i];
            let userBot =await Bot.getUserBot(userData.alias || userData.name)
            //let userBot = await bot.Contact.find({alias: userData.alias}) || await bot.Contact.find({name: userData.name})
            if (!userBot) {
                //如果没有找到此好友则跳过
                continue
            }
            let todayWeather = await util.getWeatherData(userData);
            await util.genStableInfo(userData, userBot)
            if (todayWeather && todayWeather.length !== 0) {
                await util.genWeatherMessage(userData, todayWeather, userBot);
            }
            if (OneWord) {
                await util.genOneWord(userData, OneWord, userBot);
            }
        } catch (e) {
            logger.error(userData, e.stack)
        }
    }
}

async function everyNight(users) {
    let userData;
    for (let i = 0; i < users.length; i++) {
        if (!users[i].cronJobs.includes("everyNight")) continue;
        try {
            userData = users[i];
            let userBot =await Bot.getUserBot(userData.alias || userData.name)
            if (!userBot) {
                //如果没有找到此好友则跳过
                continue
            }
            let todayWeather = await util.getWeatherData(userData);
            await util.genWeatherMessage(userData, todayWeather, userBot, true)
        } catch (e) {
            logger.error(userData, e.stack)
        }
    }
}

async function checkServerLife(){
    let rs = await common.checkListeningPort(config.checkPorts);
    if (rs.notUse.length > 0 ){
        await Bot.sendYourSelf(`以下端口未启动请检查服务器:${rs.notUse}`)
    }

}
async function updateOneDayOneWords(){
    let OneWord = await util.getOneData();
    if (OneWord) await util.updateSoleBlog(OneWord);
}
async function restartSoloDocker(){
    exec(`/usr/src/startShell/soloStart.sh > /dev/null 2>&1 &`);
}
async function sendItQuestion(users){
    let ItQuestion = await util.getItQuestion();//从gitHub爬取每日学习内容
    if (!ItQuestion) {
        logger.error(`${new Date()},获取IT问题失败`)
        return
    }
    for (let i = 0; i < users.length; i++) {
        if (!users[i].cronJobs.includes("sendItQuestion")) continue;
        let userData = users[i]
        let userBot =await Bot.getUserBot(userData.alias || userData.name)
        await util.genItQuestion(userData, ItQuestion, userBot)
    }
}
module.exports = {
    everyMorning,
    everyNight,
    checkServerLife,
    sendItQuestion,
    updateOneDayOneWords,
    restartSoloDocker
}