const log = require("./log")(__filename)
const Koa = require("koa")
const bodyParser = require('koa-bodyparser');
const Router = require("koa-router")

function jsonToString(result) {
    if (typeof result != "object" || result == null) {
        return result;
    }
    return JSON.stringify(result, function (k, v) {
        if (v === null) return undefined;
        return v;
    })
}

function get(method) {
    return async function (ctx, next) {
        let request = ctx.request;
        let response = ctx.response
        try {
            let param = request.query;
            log.info("%s GETDATA %s", request.path, JSON.stringify(param));
            let res = await method(param, request, response, ctx, next);
            let resString = jsonToString(res);
            log.info('%s RESULTDATA %s', request.path, resString)
            if (resString == null) {
                return;
            }
            ctx.set('Content-Type', 'application/json');
            response.body = resString
        } catch (err) {
            log.error("error with stack info '%s'", err.stack)
            ctx.set('Content-Type', 'application/json');
            response.body = {
                code: errorCode.COMMON_SERVER_INTERNAL_ERROR,
                err: err.message || err.stack,
                "reqTime": Date.now()
            }
        }
    }
}

function post(method) {
    return async function (ctx, next) {
        let request = ctx.request
        let response = ctx.response
        try {
            let param = request.body;
            log.info("%s %s POSTDATA %s", "", request.path, JSON.stringify(param));
            let res = await method(param, request, response, ctx);
            let resString = jsonToString(res);
            if (resString == null) {
                return;
            }
            log.info("%s %s RESULTDATA %s", "", request.path, resString);
            ctx.set('Content-Type', 'application/json');
            response.body = resString;
        } catch (err) {
            log.error("%s error with stack info '%s'", "", err.stack)
            ctx.set('Content-Type', 'application/json');
            response.body = {code: 100, err: err.message || err.stack}
        }
    }
}


module.exports = function (configs, options) {
    let app = new Koa()
    let {staticPath} = options
    if (staticPath) {
        app.use(require("koa-static")(staticPath))
    }
    let router = new Router();
    app.use(bodyParser());
    configs.forEach(function (config) {
        if (typeof config == "function") {
            app.use(config);
            return;
        }
        let servlets = config[0];
        let pathPrefix = config[1] || "";
        servlets.forEach(function (servlet) {
            if (pathPrefix) {
                servlet[0] = pathPrefix + servlet[0];
            }
            console.log(servlet[0])
            router.post(servlet[0], post(servlet[1]))
            router.get(servlet[0], get(servlet[1]))
        });
    })
    app.use(router.routes()).use(router.allowedMethods())
    return app
}

process.on('uncaughtException', function (err) {
    log.error("in uncaught:" + err.stack);
})
