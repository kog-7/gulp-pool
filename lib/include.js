/*
 * @Author: jxj
 * @Date:   2016-09-30 22:05:41
 * @Last Modified by:   jxj
 * @Last Modified time: 2016-11-03 13:37:16
 */

'use strict';



//基础工具
var tool = require("./base.js");
var fs = require("fs");
var npmLib = require("./npmlib_filter.js")



var typeHim = tool.typeHim,
    isEmptyObject = tool.isEmptyObject,
    miniExtend = tool.miniExtend,
    createInherit = tool.createInherit;
var getValue = tool.getValue;
var urlAim = tool.urlAim;
var path=require("path");



//这里后面采用的方式为，include，多个异步的ajax，并且每一次运载为一个节点，一个col会在当前结点运行并载入到下一个节点。
//如果是url，在遍历数组的时候，首先


// |uglify:mangle|ab:k

var handJsFilter = function(handStr, str) {
    var arr = handStr.split("|");
    arr.shift();
    var brr;
    var name, arg;
    arr.forEach(function(hdstr) {
        brr = hdstr.split(":");
        name = brr[0]; //得到npm名字
        arg = brr.slice(1); //得到参数
        if (name in npmLib) { //如果存了这个name才能用
            str = npmLib[name](name, arg, str);
        }
    })
    return str;
};

var regAll = function(reg, str, cback) { //还要得到fitler
    var match;
    var temp = null;
    reg.lastIndex = 0;
    var arr = [];
    var ctr = 0;
    var lastIndex = 0;
    var url="";
    // var lastStart=0;
    //还要得到filter
    while (match = reg.exec(str)) {
        ctr = 1;
        arr.push({
            type: true,
            html: str.slice(lastIndex, match.index)
        });
        url=match[1];
        //把url的空格取消掉，不存在
        url=url.replace(/\s+/g,function(){
            return "";
        });
        arr.push({
            type: false,
            url: url,
            jsFilter: match[3]
        })
        lastIndex = reg.lastIndex;
    }
    if (ctr === 0) {
        return false;
    }

    arr.push({
        type: true,
        html: str.slice(lastIndex)
    });

    reg.lastIndex = 0;
    return arr;
}


var noBlankNoLine=function(str){
    var reg=/^[\r\n\s]+/;
    var reg2=/[\r\n\s]+$/;
    var match=reg.exec(str);
    var match2=reg2.exec(str);
    var lg,lg2;
    if(!match&&!match2){return str;}
    else{
        if(match){
            lg=match[0].length;
        }
        if(match2){
            lg2=match2[0].length;
        }
        if(lg){
            str=str.slice(lg);
        }
        if(lg2){
            str=str.slice(0,-lg2);
        }
        return str;
    }
}



var anaInclude = function(opt) {
    var html = opt.template,
        url = opt.url,
        callback = opt.callback;
    var baseUrl=opt.baseUrl;
    var includeReg = /\'?\@include\(([\w\.\-\/\s]+)((\|[\w\-]+(\:[\w\-]+)*)*)\)[\;]*\'?/g;
    var oriOb;
    var first = 0;


    if(!html&&!url){
        callback({html:"",type:true});
        return;
    }


    if(html){

//  console.log(1291281982182,"fuck")


        if(!includeReg.exec(html)){
            // console.log(2834932483743847384738473847,"fuck")
            includeReg.lastIndex=0;
            callback({html:html,type:true});
            return;
        }
        else{
  includeReg.lastIndex=0;
        }
    }




    //最开始的include是最外层js直接指向这个html，是没有basePath的，后面的才有
    if (html) {
        oriOb = {
            type: false,
            html: html,
            baseUrl:baseUrl,
            url:""
        };
    } else {
        oriOb = {
            type: false,
            url: url,
            baseUrl: ""
        };
    }

    var htmlArr = [oriOb] //false为没有解析，true为解析了
    var mark = [];



    var f = function(htmlArr, lastOb, cback) { //这里的cback指的是上一个的回调。item表示第几个

        var baseUrl = lastOb.baseUrl;
        var jsFilter;
        var ctr = 0;
        var html = "";
        var match = null;
        var url = null;
        var newBaseUrl = "";
        htmlArr.forEach(function(ob, ind) {
            if (ob.type === false) {


                url = ob.url =path.join(baseUrl,ob.url);

                ob.baseUrl = path.dirname(url);
                if (url) {
                    if (mark.indexOf(url) !== -1) {
                        console.warn("模版循环引用");
                        ob.html = "";
                        ob.type = true;
                        return;
                    }

                        fs.readFile(url, 'utf8', function(err, ajaxHtml) {
                            ajaxHtml=noBlankNoLine(ajaxHtml);

                            if (err) {
                                console.log("read " + url + " wrong");
                                console.log(err);
                                callback({
                                    html: ""
                                })
                                return;
                            }
                            if (ob.jsFilter) {
                                ajaxHtml = handJsFilter(ob.jsFilter, ajaxHtml);
                            }
                            var match = regAll(includeReg, ajaxHtml);

                            if (match) {
                                mark.push(url);
                                f(match, ob, nowCallback);
                            } else {
                                //这里直接判断如果是全部的html没有url的直接给ob绑定，并且运行上一次回调。
                                ob.type = true;
                                ob.html = ajaxHtml;
                                nowCallback(ob.jsFilter);
                            }
                        })

                    ctr = 1;
                } else {

                    match = regAll(includeReg, ob.html);

                    if (match) {
                        f(match, ind, nowCallback);
                        ctr = 1;
                    } else {
                        ob.type = true;
                        html += ob.html;
                    }

                }

            } else {
                html += ob.html;
            }
        });

        if (ctr === 0) {
            //判断上一个ob是否有，如果有的话，就给他的html添加赋予当前的这个值
            if (typeof lastOb === "object") {
                lastOb.type = true;
                lastOb.html = html;
            }
            if (cback === undefined) {
                callback(lastOb);
            } else {
                cback();
            }
        }

        function nowCallback() {
            var ctr = 0;
            var html = "";
            var i = 0,
                n = htmlArr.length;
            for (; i < n; i += 1) {
                if (htmlArr[i].type === false) {
                    return;
                } else {
                    html += htmlArr[i].html;
                }
            }
            lastOb.type = true;
            lastOb.html = html;
            //如果前面没有return的话
            if (cback === undefined) {
                callback(lastOb);
            } else {
                // console.log(lastOb)
                // '|uglify:mangle|ab:k',类似
                // if (jsFilter) { //有过滤也有压缩
                //     lastOb.html = handJsFilter(jsFilter, lastOb.html);
                // }
                cback();
            }
        };
    };

    f(htmlArr, oriOb)

}

module.exports = {
    anaInclude: anaInclude
};
