const cornJobDB = require("../mongo/model/cronJob")
const ApiReturn = require("../util/ApiReturn")
const mongoose = require("mongoose")
const ObjectId=mongoose.Types.ObjectId;
const cronJobUtil = require("../crontab/crontabMain")
async function getAllCronJob(params){
	let {pageSize = 10,pageNum = 0,private} = params
	let opt = {}
	if (private === "false") {
		opt.private = false
	}
	let size = Number.parseInt(pageSize)
	let start = Number.parseInt(pageNum) * size
	let query = cornJobDB.find(opt)
	let total = await query.count()
	let list = await query.limit(size).skip(start).find()
	return ApiReturn.suc({total, list})
}
async function updateCronJob(params,req,res,ctx){
	let {_id,cron,desc,name,private,enable,funName} = params
	let cronJobInfo = await cornJobDB.findOne({_id:ObjectId(_id)})
	if (cron) {
		cronJobInfo.cron = cron
	}
	if (desc) {
		cronJobInfo.desc = desc
	}
	if (name) {
		cronJobInfo.name = name
	}
	if (funName) {
		cronJobInfo.funName = funName
	}
	cronJobInfo.private = private
	cronJobInfo.enable = enable
	await cronJobInfo.save()
	await cronJobUtil.cronJobRestart()
	return ApiReturn.suc()
}
async function newCronJob(params){
	let cronJobInfo = new cornJobDB(params)
	await cronJobInfo.save();
	await cronJobUtil.cronJobRestart()
	return ApiReturn.suc()
}
module.exports = [
	["/updateCronJob",updateCronJob],
	["/getAllCronJob",getAllCronJob],
	["/newCronJob",newCronJob]
]