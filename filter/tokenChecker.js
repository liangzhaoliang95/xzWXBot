const Cache = require("../cache/cache")
module.exports = async function (params, req, res, ctx) {
    let token
    try {
        token = ctx.cookies.get("token") || req.get("token") || req.body.token || req.query.token;
    } catch (e) {
        return false
    }
    let rs = await Cache.getJson(`${Cache.KEY.login}:${token}`)
    return !!rs;
}
