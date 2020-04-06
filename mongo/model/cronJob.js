const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cronJob = new Schema({
    cron:String,//定时表达式
    name:String,//定时任务名称
    funcName:String,//和代码中的函数名要一致
    private:Boolean,//是否仅发送给自己
    desc:String,//任务描述
    enable:Boolean,//是否开启定时任务
});
const cronJobModel = mongoose.model('cronJob', cronJob, 'cronJob');
module.exports = cronJobModel;
