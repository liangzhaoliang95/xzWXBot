const config = require("./config")
require("./mongo/connection")

//设置log组件
const log = require("./support/log");
log.setName(config.log.dir, log.LOGLEVEL.DEBUG);
const logger = require("./support/log")(__filename)

//设置weChaty相关参数
const {Wechaty} = require('wechaty')
const {PuppetPadplus} = require('wechaty-puppet-padplus')
const puppet = new PuppetPadplus({token: config.wechaty.Token})
const bot = new Wechaty({
    puppet,
    name: config.wechaty.name
});

//引入事件处理函数
const {onMessage} = require("./dealEvent/onMessage")
const {onScan} = require("./dealEvent/onScan")
const {onLogin} = require("./dealEvent/onLogin")
bot.on('scan', onScan)
    .on('login', onLogin)
    .on('message', onMessage)
    .start()
    .then(console.log("机器人已启动"))
    .catch(function (err) {
    logger.error("botError:" + err.stack);
})

//载入全局Bot缓存
const BOT = require("./cache/Bot")
new BOT(bot)

//启动定时任务
const cronJob = require("./crontab/crontabMain")
cronJob.cronJobStart()
    .then(console.log("定时任务启动成功"))
    .catch(function (err) {logger.error("cronJobError:" + err.stack);})

//启动web服务
const init = require("./support/servletBot")
let options = {
    staticPath: __dirname + '/web'
}
const app = init(require("./servlet"), options)
const server = app.listen(config.port, config.host);
server.keepAliveTimeout = 300000;

//全局异常抓取
process.on('uncaughtException', function (err) {
    logger.error("in uncaught:" + err.stack);
});
process.on('unhandledRejection', event => console.info(event));

