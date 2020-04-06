var DB = require("./connection").DBW.promise()
module.exports = {
    getOneDayData : async function(article){
        let sql = `select * from b3_solo_article where articleTitle = ?`
        let args = [article]
        let res = await DB.query(sql, args)
        return res[0][0]
    },
    updateOneDayData : async function(articleContent,article){
        let now = Date.now()
        let sql = `update b3_solo_article set articleContent = ? , articleUpdated = ? where articleTitle = ?`
        let args = [articleContent,now,article]
        let res = await DB.query(sql, args)
        return res[0][0]
    }
}