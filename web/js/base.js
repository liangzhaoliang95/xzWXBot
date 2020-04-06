let url = window.location.href;
let env = ""
if (url.match(/127.0.0.1/)) {
    env = "127.0.0.1"
} else if (url.match(/xiaozao/)) {
    env = "www.xiaozao520.cn"
}
let HYIP = {};
HYIP.ajaxTryTimes = 0;
const pageSize = 10;
let TOKENNAME = "token";

function hideModal() {
    $('#waitting').modal('hide');
}

function showModal() {
    $('#waitting').modal({backdrop: 'static', keyboard: false});
}

HYIP.ajax = function (url, param, success, failed, error) {
    param.r = Math.random() * 10;
    for (let key in param) {
        if (typeof param[key] == "string") {
            param[key] = param[key].trim()
        }
    }
    if (env === "www.xiaozao520.cn") {
        url = `/weChatBot` + url
    }
    $.ajax({
        url: url, //请求访问地址
        dataType: 'json', //访问格式，如：json、html等
        timeout: 60000, //请求访问时间
        data: param,
        type: 'POST', //请求访问方式，如post、get
        cache: false, //ajax不缓存，true缓存，false不缓存
        traditional: true,//传输方式设为传统模式
        beforeSend: function (request) {
            //验证token
            showModal();
            request.setRequestHeader("token", getCookie(TOKENNAME));
        },
        success: function (data) {
            hideModal();
            if (data.code === 0) {
                (success || function () {
                })(data.obj);
            } else {
                //服务端token无效处理
                if (data.code !== 0) {
                    alert("token无效，请重新登录")
                    window.location.href = '../index.html';
                    return;
                }
                if (failed) {
                    failed(data);
                } else {
                    alert(data.message)
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (error) {
                error();
            } else {
                alert("网络异常，请稍后重试!")
            }
        }
    });
};

function SetCookie(name, value)//两个参数，一个是cookie的名子，一个是值
{
    document.cookie = name + "=" + escape(value) + ";";
}

function getCookie(name)//取cookies函数
{
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) return unescape(arr[2]);
    return null;
}

function getParams(key) {
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;

}

function compareTwoArray(all, sub) {
    let notUse = [];
    let inUse = [];
    let cenObj = {};
    //把sub数组去重放入cenObj
    for (let i = 0; i < sub.length; i++) {
        cenObj[sub[i]] = sub[i];
    }
    //遍历all，查看其元素是否在cenObj中
    for (let j = 0; j < all.length; j++) {
        let checkValue = all[j]
        if (cenObj[checkValue]) {
            inUse.push(cenObj[checkValue])
            delete cenObj[checkValue]
        }
    }
    for (let v in cenObj) {
        notUse.push(cenObj[v]);
    }
    return {
        notUse, inUse
    };
}

function createPage(total, chooseNum) {
    let pageNum;
    if (total % pageSize === 0) pageNum = total / pageSize;
    else {
        pageNum = Math.floor(total / pageSize) + 1;
    }
    let pageStr = `<ul class='pagination'><li><a href='javascript:pageInfos(0)'>首页</a></li>`;
    if (chooseNum > 5) {
        let start = chooseNum - 5
        let end = (pageNum > chooseNum + 6) ? chooseNum + 6 : pageNum
        for (let i = start; i < end; i++) {
            if (i == chooseNum) {
                pageStr += `<li ><a href='javascript:pageInfos(${i})' style="background-color: #5bc0de">${i + 1}</a></li>`
            } else {
                pageStr += `<li ><a href='javascript:pageInfos(${i})'>${i + 1}</a></li>`
            }
        }
    } else {
        let end = pageNum < 11  ? pageNum : 11;
        for (let i = 0; i < end; i++) {
            if (i == chooseNum) {
                pageStr += `<li ><a href='javascript:pageInfos(${i})' style="background-color: #5bc0de">${i + 1}</a></li>`
            } else {
                pageStr += `<li ><a href='javascript:pageInfos(${i})'>${i + 1}</a></li>`
            }
        }
    }
    // for (let i = 0; i < pageNum; i++) {
    //     if (i == chooseNum) {
    //         pageStr += `<li ><a href='javascript:pageInfos(${i})' style="background-color: #5bc0de">${i + 1}</a></li>`
    //     } else {
    //         pageStr += `<li ><a href='javascript:pageInfos(${i})'>${i + 1}</a></li>`
    //     }
    // }

    pageStr += `<li><a href='javascript:pageInfos(${pageNum - 1})'>末页</a></li></ul>`
    return pageStr
    $("#page").html(pageStr)
}