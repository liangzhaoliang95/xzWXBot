var commonErrCode = {
    COMMON_SUCCESS:0,
    COMMON_ACCESS_TOKEN_ERROR:1,
    COMMON_SERVER_INTERNAL_ERROR:500,
    INPUT_DATA_ERROR:501
}

function successResult(obj) {
    var res = {};
    var code = commonErrCode.COMMON_SUCCESS
    res.code = code;
    if (obj != undefined) {
        res.obj = obj;
    }
    return res;
}

function errorResult(errCode, errMsg, errObj) {
    var res = {};
    var code = errCode || commonErrCode.COMMON_SERVER_INTERNAL_ERROR;
    if (errMsg) {
        res.message = errMsg;
    }
    res.code = code;
    if (errObj != undefined) {
        res.obj = errObj || '';
    }
    return res;
}

module.exports = {
    code: commonErrCode,
    suc: successResult,
    err: errorResult
};
