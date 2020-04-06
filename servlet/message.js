const ApiReturn = require("../util/ApiReturn")
const BOT = require("../cache/Bot")
const Bot = new BOT()
//给指定好友发送消息
async function friendMsg(params,req,res,ctx){
	let {name,message} = params
	let user =await Bot.getUserBot(name)
	await user.say(message)
	return ApiReturn.suc()
}
module.exports = [
	["/friendMsg",friendMsg]
];