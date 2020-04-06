const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const GitUrl = "https://github.com/haizlin/fe-interview";
const WeatherUrl = "https://tianqi.moji.com/weather/china/";
const OneUrl = "http://wufazhuce.com/";
const common = require("../support/common")
const logger = require("../support/log")(__filename)
const {FileBox} = require("file-box")
const soloDB = require("../mysql/solo")
// 获取天气提醒
function getWeatherTips(userData) {
    return new Promise(function (resolve, reject) {
        superagent.get(WeatherUrl + userData.local).end(function (err, res) {
            if (err) {
                reject(err);
            }
            let weatherTip = "";
            let $ = cheerio.load(res.text);
            $(".wea_tips").each(function (i, elem) {
                weatherTip = $(elem)
                    .find("em")
                    .text();
            });
            resolve(weatherTip)
        });
    })
}

// 获取天气预报
function getWeatherData(userData) {
    return new Promise(function (resolve, reject) {
        superagent.get(WeatherUrl + userData.local).end(function (err, res) {
            if (err) {
                resolve(null)
                //reject(err);
            }
            let threeDaysData = [];
            let $ = cheerio.load(res.text);
            $(".forecast .days").each(function (i, elem) {
                const SingleDay = $(elem).find("li");
                threeDaysData.push({
                    Day: $(SingleDay[0])
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    WeatherImgUrl: $(SingleDay[1])
                        .find("img")
                        .attr("src"),
                    WeatherText: $(SingleDay[1])
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    Temperature: $(SingleDay[2])
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    WindDirection: $(SingleDay[3])
                        .find("em")
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    WindLevel: $(SingleDay[3])
                        .find("b")
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    Pollution: $(SingleDay[4])
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    PollutionLevel: $(SingleDay[4])
                        .find("strong")
                        .attr("class")
                });
            });
            resolve(threeDaysData)
        });
    })
}

function getDay(userData) {
    let today = new Date();
    let initDay = new Date(userData.startDay);
    let lastDay = Math.floor((today - initDay) / 1000 / 60 / 60 / 24);
    let todaystr =
        today.getFullYear() +
        " / " +
        (today.getMonth() + 1) +
        " / " +
        today.getDate();
    return {lastDay, todaystr}
}

function getOneData() {
    return new Promise(function (resolve, reject) {
        superagent.get(OneUrl).end(function (err, res) {
            if (err) {
                resolve(null)
                // reject(err);
            }
            let $ = cheerio.load(res.text);
            let selectItem = $("#carousel-one .carousel-inner .item");
            let todayOne = selectItem[0];
            let todayOneData = {
                imgUrl: $(todayOne)
                    .find(".fp-one-imagen")
                    .attr("src"),
                type: $(todayOne)
                    .find(".fp-one-imagen-footer")
                    .text()
                    .replace(/(^\s*)|(\s*$)/g, ""),
                text: $(todayOne)
                    .find(".fp-one-cita")
                    .text()
                    .replace(/(^\s*)|(\s*$)/g, "")
            };
            resolve(todayOneData)
        });
    })
}

//生成天气消息
async function genWeatherMessage(userData, todayWeather, bot, tomorrow) {
    let message = ""
    if (tomorrow) {
        message = "明天" + userData.city + "天气预报:\r\n";
        message += "天气概况:" + todayWeather[1].WeatherText + " " + todayWeather[1].WindDirection + " " + todayWeather[1].WindLevel + "\r\n"
        message += "温度为:" + todayWeather[1].Temperature + "\r\n"
        message += "空气指数:" + todayWeather[1].Pollution + "\r\n"
        await bot.say(message)
        await sleep(2000)
    } else {
        message = "今日" + userData.city + "天气预报:\r\n";
        message += "天气概况:" + todayWeather[0].WeatherText + "\r\n"
        message += "温度为:" + todayWeather[0].Temperature + "\r\n"
        message += "空气指数:" + todayWeather[0].Pollution + "\r\n"
        message += "天气提示:" + await getWeatherTips(userData)
        await bot.say(message)
        await sleep(2000)
    }


}

//生成每日四问
async function genItQuestion(userData, ItQuestion, bot) {
    let message;
    message = "😄😄今日学习内容😄😄\r\n"
    message += "1️⃣[HTML]:" + ItQuestion.html.text + "\r\n" + ItQuestion.html.url + "\r\n";
    message += "2️⃣[CSS]:" + ItQuestion.css.text + "\r\n" + ItQuestion.css.url + "\r\n";
    message += "3️⃣[JS]:" + ItQuestion.js.text + "\r\n" + ItQuestion.js.url + "\r\n";
    message += "4️⃣[软技能]:" + ItQuestion.softSkill.text + "\r\n" + ItQuestion.softSkill.url;
    await bot.say(message)
    await sleep(2000)


}

//生成每日一句
async function genOneWord(userData, OneWord, bot) {
    let message = "今日好句:" + OneWord.text + "😘";
    await bot.say(message)
    await sleep(2000)
    await bot.say("今日杂图 ⬇️")
    await sleep(2000)
    await bot.say(OneWord.img)
    await sleep(2000)
}

//生成固定推送
async function genStableInfo(userData, bot) {
    await bot.say("🌸🌸" + getDay(userData).todaystr + "🌸🌸")
    await sleep(2000)
    let message = userData.message + getDay(userData).lastDay + "天❤";
    await bot.say(message)
    await sleep(2000)
}

function sleep(time) {
    return new Promise((a, r) => {
        setTimeout(a, time)
    });
}

function getItQuestion() {
    let p = new Promise(function (resolve, reject) {
        let todayItData = [];
        superagent.get(GitUrl).end(function (err, res) {
            if (err) {
                resolve(null)
            }
            let $ = cheerio.load(res.text);
            let selectItem = $('#readme .Box-body .markdown-body');
            let todayOne = selectItem[0];
            let data = $(todayOne).find("ul a")
            let htmlData = data[0]
            let cssData = data[1]
            let jsData = data[2]
            let softData = data[3]
            todayItData = {
                html: {
                    text: htmlData.children[0].data,
                    url: htmlData.attribs.href
                },
                css: {
                    text: cssData.children[0].data,
                    url: cssData.attribs.href
                },
                js: {
                    text: jsData.children[0].data,
                    url: jsData.attribs.href
                },
                softSkill: {
                    text: softData.children[0].data,
                    url: softData.attribs.href
                }
                /*  type:$(todayOne).find('.fp-one-imagen-footer').text().replace(/(^\s*)|(\s*$)/g, ""),
                  text:$(todayOne).find('.fp-one-cita').text().replace(/(^\s*)|(\s*$)/g, "")*/
            }
            resolve(todayItData)
        })

    })
    return p
}


function getDayDate() {
    let date = new Date()
    let year = date.getFullYear()
    let day = date.getDate()
    let month = date.getMonth() + 1
    // month = month < 10 ? "0" + month : month;
    // day = day < 10 ? "0" + day : day
    return "" + year + "/" + month + "/" + day
    // return date.toLocaleDateString().replace(/-/g, "")
}
async function updateSoleBlog(OneWord) {
    let oneDayData = await soloDB.getOneDayData("One Day One Words")
    let articleContent = oneDayData.articleContent;
    if (articleContent.length < 100) {
        return
    }
    let one = articleContent.substring(0, 88) + "\n"
    let two = "```\n" + common.getDayDate(null, {split: "-"}) + " " + OneWord.text + "\n```" + articleContent.substring(88)
    articleContent = one + two + ""
    await soloDB.updateOneDayData(articleContent, "One Day One Words")
}
module.exports = {
    getWeatherData: getWeatherData,
    genWeatherMessage: genWeatherMessage,

    getOneData: getOneData,
    genOneWord: genOneWord,


    getItQuestion: getItQuestion,
    genItQuestion: genItQuestion,


    genStableInfo: genStableInfo,
    getDayDate: getDayDate,
    sleep: sleep,
    updateSoleBlog:updateSoleBlog,
}