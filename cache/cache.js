const config=require("../config")
const redis = require("redis");
const client = redis.createClient({
    host: config.redis.host,
    password: config.redis.password,
    db: config.redis.db,
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 100) {
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

const {promisify} = require('util');
const hgetallAsync = promisify(client.hgetall).bind(client);
const hmsetAsync = promisify(client.hmset).bind(client);
const scan = promisify(client.scan).bind(client);
const del = promisify(client.del).bind(client);
const set = promisify(client.set).bind(client);
const get = promisify(client.get).bind(client);
const expire = promisify(client.expire).bind(client);
const incr = promisify(client.incr).bind(client);
const flatten = require('flat')
const mget = promisify(client.mget).bind(client);

module.exports={
    keys: async function(p) {
        if(!p) p = '*'
        var [, r] = await scan(0, 'match', p)
        return r;
    },
    del: async function(key) {
        await del(key)
    },
    setJson: async function(key, value, timeout) {
        value = JSON.stringify(value);
        let res = await set(key, value);
        if (timeout) await expire(key, timeout)
        return res;
    },
    getJson: async function(key) {
        let value = await get(key);
        value = JSON.parse(value);
        return value;
    },
    set: async function(key, value, timeout) {
        let res = await set(key, value);
        if (timeout) await expire(key, timeout);
        return res;
    },
    get: async function(key) {
        return await get(key);
    },
    setObj: async function(key, obj, timeout) {
        await del(key);
        let res = await hmsetAsync(key, flatten(obj));
        if (timeout) await expire(key, timeout);
        return res;
    },
    getObj: async function(key, fun, timeout) {
        let obj = await hgetallAsync(key);
        if(!obj && fun) {
            obj = fun();
            if (!obj) return ;
            this.setObj(key, obj, timeout);
        }
        return flatten.unflatten(obj);
    },
    incr: async function(key, timeout) {
        let res = await incr(key);
        if (timeout) await expire(key, timeout);
        return res;
    },
    mget: async function(keys) {
        return await mget(keys);
    },
    TIMEOUT:{
        DEFAULT: 24*60*60
    },
    KEY:{
      login:`loginId`
    }
}