const log = require("../support/log")(__filename);
const {code} = require("../util/ApiReturn")
module.exports=function(params){
    for (let filter of params) {
        let name=filter[0];
        if(!name.startsWith("/")){
            name="/"+name;
        }
        if(!name.endsWith("/")){
            name=name+"/";
        }
        filter[0]=name;
    }
    return async function(ctx,next){
        let req = ctx.request;
        req.session = ctx.session
        let res = ctx.response
        let reqParams;
        if(req.method=="POST"){
            reqParams=req.body;
        }else{
            reqParams=req.query;
        }
        try{
            for (let filter of params) {
                let urlPath = filter[0];
                let func = filter[1]
                if(req.originalUrl.indexOf(urlPath)>=0){
                    let result=await func(reqParams,req,res,ctx)
                    if(result){
                        await next();
                        return;
                    }
                } 
            }
            ctx.set('Content-Type', 'application/json');
            res.body=({code:code.COMMON_ACCESS_TOKEN_ERROR,msg:"权限丢失或访问路径错误"});
        }catch(error) {
            log.error(error);
            ctx.set('Content-Type', 'application/json');
            res.body=({code:code.COMMON_SERVER_INTERNAL_ERROR,msg:"inerteral error in servleChecker"});
        }
    };
}