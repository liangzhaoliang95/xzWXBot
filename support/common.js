const { exec } = require('child_process');
const md5 = require('md5-node');
function mkdirp(filepath) {
    var fs = require('fs')
    if (fs.existsSync(filepath)) return;
    var path = require("path")
    var dirname = path.dirname(filepath);
    if (!fs.existsSync(dirname)) {
        mkdirp(dirname);
    }
    fs.mkdirSync(filepath);
}
async function checkListeningPort(checkPorts = []) {
    return new Promise((resolve, reject) => {
        let tempData = ""
        let ports = []
        let subprocess = exec(`netstat -antu | grep "LISTEN"`);
        //边采集边处理
        subprocess.stdout.on('data', (rs) => {
            if (tempData !== "") {
                rs = tempData + rs
                tempData = ""
            }
            rs = rs.split("\n");
            for (let i = 0; i < rs.length; i++) {
                let oneLineStr = rs[i]
                oneLineStr = oneLineStr.trim().split(/\s+/)
                //如果当前行数据不足，则将数据临时保存，并与下一次数据进行拼接处理
                if (oneLineStr.length!==6) {
                    tempData = rs[i]
                    break
                }
                let tempSplit = oneLineStr[3].split(":")
                let port = tempSplit[tempSplit.length - 1]
                ports.push(Number.parseInt(port))
            }
        });
        //数据采集完成后执行判断流程
        subprocess.on('close', (code) => {
            let res = compareTwoArray(ports,checkPorts)
            resolve(res);
        });
    })
}
async function genCheckStr(randomId) {
    let str = new Date(new Date(Number.parseInt(randomId)).getTime()+ 6e4 * new Date(Number.parseInt(randomId)).getTimezoneOffset() + 36e5 * 8).getDate() + 9 + 9 ^ 10;
    str = md5(str).substring(0, 10);
    str = md5(str)
    return str
}
function sleep(millionSecond) {
    return new Promise(r => setTimeout(r, millionSecond));
}
function compareTwoArray(all,sub) {
    let notUse=[];
    let inUse=[];
    let cenObj = {};
    //把sub数组去重放入cenObj
    for (let i = 0; i < sub.length; i++) {
        cenObj[sub[i]] = sub[i];
    }
    //遍历all，查看其元素是否在cenObj中
    for (let j = 0; j < all.length; j++) {
        let checkValue = all[j]
        if (cenObj[checkValue]) {
            inUse.push(cenObj[checkValue])
            delete cenObj[checkValue]
        }
    }
    for (let v in cenObj) {
        notUse.push(cenObj[v]);
    }
    return {
        notUse,inUse
    };
}
function replaceRegExp(keyWord) {
    keyWord = keyWord || '';
    if (keyWord.length === 0) {
        return keyWord;
    }
    return keyWord.replace(/([\^\$\(\)\*\+\?\.\\\|\[\]\{\}\%\_])/g, "\\$1");
}
function getDayDate(dayNum,option) {
    let dateNum = Date.now()
    if (dayNum) {
        dateNum -= dayNum * 24 * 3600 * 1000
    }
    let {split} = option
    let date = new Date(dateNum)
    let year = date.getFullYear()
    let day = date.getDate()
    let month = date.getMonth() + 1
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day
    if (split) {
        return `${year}-${month}-${day}`
    }
    return "" + year + month + day
}
module.exports = {
    mkdirp: mkdirp,
    checkListeningPort:checkListeningPort,
    sleep: sleep,
    replaceRegExp: replaceRegExp,
    getDayDate: getDayDate,
    compareTwoArray:compareTwoArray,
    genCheckStr:genCheckStr
}
