var mysql = require('mysql2');
var conf = require("../config");
DBW = mysql.createPool(conf.mysql);
module.exports = {
    DBW
};