var ws;
const fs=require("fs");
const LEVEL={
    ERROR:1,
    WARN:2,
    INFO:3,
    DEBUG:4
}
var logtime;
var filePrefix;
function createWS(){
    ws=fs.createWriteStream(`${filePrefix}${logtime}.log`,{flags:"a"});
}

function Log(speinfo){
    if(this==global){
        return new Log(speinfo)
    }else{
        var path=require("path");
        this.speinfo=path.relative(path.dirname(__dirname),speinfo);
    }
}
Log.prototype={
    error:function(...message){
        write(LEVEL.ERROR,this.speinfo,...message);
    },
    info:function(...message){
        write(LEVEL.INFO,this.speinfo,...message);
    },
    warn:function(...message){
        write(LEVEL.WARN,this.speinfo,...message);
    },
    debug:function(...message){
        write(LEVEL.DEBUG,this.speinfo,...message);
    }
}
var tty=true;
function write(level1,speinfo,...format){
    if(Log.globalLevel<level1){
        return;
    }
    var date=new Date();
    var temp=date.getFullYear()+"-"+ ("0"+(date.getMonth()+1)).slice(-2) +"-"+ ("0"+date.getDate()).slice(-2);
    if(temp!=logtime){
        logtime=temp;
        if(ws!=null){
            ws.end();
            ws=null;
        }
    }
    var prefix="";
    switch(level1){
        case LEVEL.ERROR:
            prefix="ERROR";
            break;
        case LEVEL.WARN:
            prefix="WARN";
            break;
        case LEVEL.INFO:
            prefix="INFO";
            break;
        case LEVEL.DEBUG:
            prefix="DEBUG";
            break;
    }
    prefix=prefix+" ["+logtime+" "+ date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"] "+speinfo+" "
    var util=require("util")
    if(tty){
        if(process.stdout.isTTY){
            try{
                console.info(prefix,util.format(...format));
                return;
            }catch(e){
                tty=false;
            }
        }else{
            tty=false
        }
    }
    if(ws==null){
        createWS();
    }

    ws.write(prefix);
    ws.write(util.format(...format));
    ws.write("\n")
}
Log.globalLevel=LEVEL.DEBUG;
Log.name="entry";
Log.LOGLEVEL=LEVEL;
Log.recreate=function(){
    ws=null;
}
Log.setName=function(dirName,level){
    var common = require('./common');
    common.mkdirp(dirName);
    var path=require("path")
    var name=path.basename(dirName);
    filePrefix=path.resolve(dirName,name);
}

module.exports=Log;
