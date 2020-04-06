let User = {}
const friendDB = require("../mongo/model/friend")
const util = require("../util/util")
async function getUserInfo(wxId){
    if (User[wxId]) {
        return User[wxId]
    } else {
        let userInfo = await friendDB.findOne({wxId:wxId})
        if (userInfo) {
            User[wxId] = userInfo
        } else {
            User[wxId] = {
                use:false
            }
        }
        return User[wxId]
    }
}
async function loadAllUserInfo(){
    let userInfos = await friendDB.find({})
    for (let i = 0; i < userInfos.length; i++) {
        let userInfo = userInfos[i]
        User[userInfo.wxId] = userInfo
    }
}
async function updateUserInfo(context,enable){
    let userInfo = context.from().payload
    let {weixin,alias,avatar,city,gender,id,name,province,type} = userInfo
    weixin = weixin || id
    let rs = await friendDB.findOne({wxId:weixin})
    if (!rs) {
        let newUserInfo = {
            wxId:weixin || id,
            name:name,
            alias:alias || name,
            avatar:avatar,
            sex:gender,
            //startDay:util.getDayDate(),
            //message:
            enable:false,
            use:true
        };
        rs = new friendDB(newUserInfo)
        await rs.save()
    } else {
        if (enable) {
            //开启机器人
            rs.startDay=util.getDayDate()
            rs.message=`爱${alias||name}的第`
            rs.enable=true;
            rs.use=true
        } else {
            //关闭机器人
            rs.enable =rs.enable || false;
            rs.use=true
        }
        await rs.save();
    }
    await delUserInfo(weixin)
}
async function delUserInfo(wxId){
    delete User[wxId]
}
module.exports = {
    getUserInfo,
    loadAllUserInfo,
    updateUserInfo
}