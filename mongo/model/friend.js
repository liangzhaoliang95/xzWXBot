const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const friend = new Schema({
    wxId:String,//微信号
    name:String,//好友真实昵称
    alias:String,//备注的昵称
    avatar:String,//头像地址
    sex:Number,//好友性别，男1女2
    local:String,//天气定位
    city:String,//所在城市
    startDay:String,//加入机器人的日期
    message:String,//开头问候语
    // sendIt:Boolean,//是否发送每日学习前端
    cronJobs:[],//拥有的定时任务
    enable:Boolean,//是否启用机器人
    use:Boolean //记录好友是否发送过消息给机器人
});
const friendModel = mongoose.model('friend', friend, 'friend');
module.exports = friendModel;
