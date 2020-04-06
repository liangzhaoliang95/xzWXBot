const fs = require("fs");
let baseConfig = {
    log: {
        dir: "xxxxxx/xxxx/xxxx/xxxx" //日志保存地址
    },
    host:"0.0.0.0",//监听地址
    port:"56664",//监听端口
    checkPorts:[3306],//需要检查启动情况的端口
    GitUrl : "https://github.com/haizlin/fe-interview",//获取每日问题的接口
    WeatherUrl : "https://tianqi.moji.com/weather/china/",//获取天气情况的接口
    OneUrl : "http://wufazhuce.com/",//获取每日好句的接口
    mysql:{//mysql数据库的配置
        host:"xxx.xxx.xxx.xxx",
        port:"xxxx",
        user:"root",
        charset: 'utf8mb4',
        password:"xxxxxxxxx",
        connectionLimit:5,
        dateStrings:true,
        database:"xxxx",
        decimalNumbers: true,
    },
    redis:{//redis的配置
        host: "xxxxxxx",
        password: 'xxxxxxx',
        db:"x",
    },
    wechaty:{//weChat配置
        Token:"xxxxxxx",
        name:"xxxxxxx"
    },
    env:"http://192.168.10.111:56664/",//登录链接发送的基础地址
    masterName:"梁小灶。"//填你自己的微信昵称

}
function getConfig(baseConfig,path){
    let conf_value = {}
    let state = fs.statSync(path);
    if (state) {
       conf_value = require(path)
    }
    return Object.assign(baseConfig,conf_value)
}

module.exports= getConfig(baseConfig,"/xiaozao/node/conf/weChatBot.js")



