/*
 * @Author: jxj
 * @Date:   2016-10-17 21:36:37
 * @Last Modified by:   jxj
 * @Last Modified time: 2016-11-10 17:14:27
 */

'use strict';

var fs = require("fs");

var format = require("./format.js");
var mkdirs = require("./mkdirs.js");
var render = require("./render.js");
var tool = require("./base.js");

var typeHim = tool.typeHim,
    isEmptyObject = tool.isEmptyObject,
    miniExtend = tool.miniExtend,
    createInherit = tool.createInherit;
var simpleUrl = tool.simpleUrl;
var depExtend = tool.depExtend;
var syncOb = require("./sync.js");
var sync = syncOb.sync;
var collect = syncOb.collect;

var path = require("path");

var packJs = function() {}
var packJsPrototype = new render();
var cwd=process.cwd();

var getPath = function(url) {
    if (path.isAbsolute(url)) {
        return url;
    } else {
        return path.join(cwd, url);
    }
}

miniExtend(packJsPrototype, {
    exports: function(opt) {
        var ts = this;
        var type = typeHim(opt);
        if (type === "array") {
            opt.forEach(function(ob, ind) {
                ts.export(ob);
            });
        } else {
            ts.export(opt);
        }
    },
    export: function(opt,content) {
        var ts = this;
           var data = opt.data,
            cback = opt.callback;
        var url=opt.url;
        var exportFile = opt.export;
        var filter = opt.filter; //过滤js字符串

        if (typeof filter === "function") { this.callbackFilter = filter; }
        ts.noMerge = opt.noMerge; //是否合并数据
        if (opt.match) { //如果有才设置，否则为默认的？
            ts.match = opt.match; //自己设置的正则匹配
        }
        // 生成一个新的this
        var newTs = createInherit(ts, {}); //继承一个防止以后扩展
        newTs.data = data ? data : {}; //如果没有data则为空对象
        newTs.exportFile = exportFile;
        newTs.url=url;
        newTs.callback=cback;
        newTs.noExport = opt.noExport;
        newTs.mark = newTs.mark ? newTs.mark : [];
                newTs.baseUrl=opt.baseUrl;
        newTs._preExport(content);
    }
});



miniExtend(packJsPrototype, {
    _preExport: function(content) {//
        var ts = this;
        var url=ts.url;
        url = url ? url : "index.js";
        if(content){
            ts._parse(content);
        }
        else{
        ts._readFile(url);
        }

    }
});


//被renderjs过滤掉,并且写入文件
miniExtend(packJsPrototype, {
    _parse:function(content){
        var ts = this;
        var data = ts.data;
        var noMerge = ts.noMerge;
        var match = ts.match;
        var configUrl = ts.configUrl;
        var callbackFilter = ts.callbackFilter;
        var url=ts.url;

        ts.render({
        url: url,
        data: data,
        noMerge: noMerge,
        template:content,
        match: match,
        baseUrl:ts.baseUrl,
        callback: function(jsStr) {
            var cb=function(str){
                ts._writeAll(str);
            };
            if (callbackFilter) {
                callbackFilter(jsStr,cb);
            }
            else{
                cb(jsStr);
            }
        }
    })
    },
    _readFile: function(url) {
        var ts = this;
        fs.stat(url, function(err, stat) {
            if (err) {
                console.log(url + " path is not exist");
                // return;
            }
            ts._parse();
        });
    },
    _writeAll:function(jsStr){
            var ts=this;
            var callback=ts.callback;
            //删掉相关的生成人肉一次文件的可能性
            var exportFile = ts.exportFile;
            if (exportFile && !ts.noExport) {
                exportFile = getPath(exportFile);
                mkdirs(exportFile, jsStr, function(err) {
                    if (err) {
                        console.log("write export file " + ts.exportFile + " error");
                    } else {
                        // console.log(exportFile+" is for handle");
                    }
                }, "utf8");
            }
            if (typeof callback === "function") {
                callback(jsStr);
            }
    }
});

packJs.prototype = packJsPrototype;
module.exports = packJs;
