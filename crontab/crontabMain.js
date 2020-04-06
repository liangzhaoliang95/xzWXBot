//启动定时任务
const schedule = require("node-schedule"); //定时器任务库
const cronJobFunc = require("./cronJob")
const friendDB = require("../mongo/model/friend")
const cronJobDB = require("../mongo/model/cronJob");
const logger = require("../support/log")(__filename)
let cronJobArray = [];

async function cronJobStart() {
    await cronJobCancle()
    //执行一次找出所有要执行的任务
    let cronJobS = await cronJobDB.find({enable: true})
    cronJobS.forEach(function (item) {
        let func = cronJobFunc[item.funcName];
        if (!func) {
            logger.warn("no fun found,please check your cronJobName",item.name)
            return
        }
        let job = schedule.scheduleJob(item.cron, async function () {
            let friends;
            if (!item.private) {
                friends = await friendDB.find({enable: true})
            }
            await func(friends);
        });
        cronJobArray.push(job)
    });
}

async function cronJobCancle() {
    for (let i = 0; i < cronJobArray.length; i++) {
        let job = cronJobArray[i]
        await job.cancel()
        cronJobArray.length=0
    }
}

async function cronJobRestart() {
    await cronJobStart()
}

module.exports = {
    cronJobStart,
    cronJobCancle,
    cronJobRestart
}