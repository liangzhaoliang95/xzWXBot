var conf = require("../config");
var defaultMaxTimeMs = conf.defaultMaxTimeMs || 1000;
function setMaxTimeMs(next){
    if(this.option&&!this.options.maxTimeMS){
        this.option({maxTimeMS: defaultMaxTimeMs})
    }
    if(this.maxTime&&!this.options.maxTimeMS){
        this.maxTime(defaultMaxTimeMs);
    }
    next();
}

module.exports = exports = function maxTimeMsPlugin(schema, options) {
    schema.pre(/^find/, setMaxTimeMs);
    schema.pre('aggregate', setMaxTimeMs);
}