const friendDB = require("../mongo/model/friend")
const ApiReturn = require("../util/ApiReturn")
const common = require("../support/common")
const ObjectId = require("mongoose").Types.ObjectId
const  BOT = require("../cache/Bot")
const Bot = new BOT()
//更新好友信息
async function updateFriend(params) {
    let {wxId, local, city, startDay, message, cronJobs, enable,_id} = params
    if (!wxId || !_id) {
        ApiReturn.err(1,"没有wxId或者_id")
    }
    let userInfo
    if (wxId) {
        userInfo = await friendDB.findOne({wxId: wxId})
    }
    if (_id) {
        userInfo = await friendDB.findOne({_id: ObjectId(_id)})
    }
    if (local) {
        userInfo.local = local.toString()
    }
    if (city) {
        userInfo.city = city
    }
    if (startDay) {
        userInfo.startDay = startDay
    }
    if (message) {
        userInfo.message = message
    }
    if (cronJobs) {
        userInfo.cronJobs = cronJobs
    }
    userInfo.enable = enable;
    await userInfo.save()
    return ApiReturn.suc()
}

async function getAllFriend(params) {
    let {wxId, pageSize = 10, pageNum = 0,searchWord} = params
    let opt = {}
    if (wxId) {
        opt.wxId = wxId
    }
    if (searchWord) {
    	opt.$or = []
    	let keyword = common.replaceRegExp(searchWord)
		opt.$or.push( {name: {$regex: keyword}})
		opt.$or.push( {alias: {$regex: keyword}})
		opt.$or.push( {wxId: {$regex: keyword}})
    }
    let size = Number.parseInt(pageSize)
    let start = Number.parseInt(pageNum) * size
    let query = friendDB.find(opt)
    let total = await query.count()
    let list = await query.limit(size).skip(start).find().sort({enable: -1})
    return ApiReturn.suc({total, list})
}

async function syncAllFriend(params, req, res, ctx) {
    let allFriends = await Bot.getAllFriend()
    for (let i = 0; i < allFriends.length; i++) {
        let info = allFriends[i].payload
        if (info.friend) {
            let weixin = info.weixin || info.id
            let userInfo = await friendDB.findOne({wxId:weixin})
            if (userInfo) {
                userInfo.name = info.name;
                userInfo.avatar = info.avatar;
                userInfo.alias = info.alias || info.name;
            } else {
                userInfo = new friendDB({
                    wxId: weixin,
                    name: info.name,
                    alias: info.alias || info.name,
                    avatar: info.avatar,
                    sex: info.gender,
                    enable: false,
                    use: false
                })
            }
            await userInfo.save()
        }
    }
    return allFriends
}

module.exports = [
    ["/updateFriend", updateFriend],
    ["/getAllFriend", getAllFriend],
    ["/syncAllFriend", syncAllFriend]
];