const mongoose = require('mongoose');
const conf = require("../config");
const logger=require("../support/log")(__filename);

mongoose.plugin(require('./maxTimePlugin'));
mongoose.Promise = global.Promise;
mongoose.connect(conf.mongoUrl, {useUnifiedTopology: true, useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, useCreateIndex:true});
var db = mongoose.connection;
db.on('error', function(error) {logger.error( "connect to "+conf.mongodb.url+" failed");});
db.once('open', function() {
    logger.debug("mongo open");
});
db.on('error', function(error) {logger.error( "connect to "+conf.mongodb.url+" failed");});
db.on('reconnected', ()=>{
    logger.debug('mongo reconnected')
});
db.on('connecting', ()=>{
    logger.debug('mongo connecting')
});
db.on('connected', ()=>{
    logger.debug('mongo connected')
});
db.on('disconnecting', ()=>{
    logger.debug('mongo disconnecting')
});
db.on('disconnected', ()=>{
    logger.debug('mongo disconnected')
});

module.exports = db;
