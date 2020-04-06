const logger = require("../support/log")(__filename)
const userCache = require("../cache/userCache")
async function onMessage(context) {
    // if (context.self()) {
    //     //个人消息不做处理
    //     return
    // }
    let room = context.room()
    if (room) {
        //目前不对群消息做任何处理，只处理个人消息
        return null
    } else { //全面上线测试
        console.log(context.from().payload.id,context.from().payload.weixin,context.text())
        let wxId = context.from().payload.weixin || context.from().payload.id
        let userInfo = await userCache.getUserInfo(wxId);
        if (!userInfo.use) {
            //机器人上线后好友第一次找你，需要告诉对方，本微信已启用机器人，问他是否使用
            let message = `哈喽，QQ机器人已经试运行迁移到微信咯，目前提供以下功能\n1. 上午8点发送好友问候、当日天气、每日好句、每日好图、每日学习打卡\n2. 晚上9点预报你所在地第二日的天气\n为避免打扰，本消息只会发一次，如果想启用可以发送消息我想使用,每日学习属于定制化功能，开启需要私聊哦！如果机器人不被封后续会提供更多定制化功能！`
            await context.say(message);
            await userCache.updateUserInfo(context);
            return null;
        }
        let text = context.text()
        switch (text) {
            case "开启机器人":
                //一旦确认开启机器人就需要刷新缓存
                await userCache.updateUserInfo(context,true)
                await context.say("开启成功")
                break;
            case "关闭机器人":
                await userCache.updateUserInfo(context,false)
                await context.say("关闭成功")
                break;
            case "帮助":
                break;
            default:
                return null;
        }
    }
}
module.exports={
    onMessage
}