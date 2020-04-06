const ApiReturn = require("../util/ApiReturn")
const Errcode = ApiReturn.code
const Cache = require("../cache/cache");
const nodeUuid = require('node-uuid');
const BOT = require("../cache/Bot")
const Bot = new BOT()
const config = require("../config")
const common = require("../support/common")
async function login(params,req,res,ctx){
	let {wxId,randomId} = params;
	if (!wxId || !randomId) {
		return ApiReturn.err(Errcode.INPUT_DATA_ERROR,"输入错误")
	}
	await Cache.setJson(`${Cache.KEY.login}:${wxId}:${randomId}`,{wxId,randomId},60)
	let str = await common.genCheckStr(randomId)
	await Bot.sendYourSelf(`点击链接完成登录\n${config.env}login/nc/confirmLogin?wxId=${wxId}&randomId=${randomId}&checkStr=${str}`)
	return ApiReturn.suc({wxId,randomId})
}
async function checkLoginState(params,req,res,ctx){
	let {wxId,randomId} = params
	let rs = await Cache.getJson(`${Cache.KEY.login}:${wxId}:${randomId}`)
	if (rs.token) {
		await Bot.sendYourSelf("登录成功,有效期两小时")
		return ApiReturn.suc(rs)
	} else {
		return ApiReturn.suc()
	}
}
async function confirmLogin(params){
	let {randomId,wxId,checkStr} = params
	let str = await common.genCheckStr(randomId)
	if (str === checkStr) {
		let rs = await Cache.getJson(`${Cache.KEY.login}:${wxId}:${randomId}`)
		if (rs) {
			rs.token = nodeUuid.v1()
			await Cache.setJson(`${Cache.KEY.login}:${wxId}:${randomId}`,rs,60)
			await Cache.setJson(`${Cache.KEY.login}:${rs.token}`,{state:true},2*60*60)
			return ApiReturn.suc({desc:"确认成功"})
		} else {
			ApiReturn.suc({desc:"此链接已失效"})
		}
	}
	return ApiReturn.err(Errcode.COMMON_ACCESS_TOKEN_ERROR,"非法请求")
}
module.exports = [
	["/nc/login",login],
	["/nc/checkLoginState",checkLoginState],
	["/nc/confirmLogin",confirmLogin]
]