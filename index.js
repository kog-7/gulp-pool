/*
 * @Author: jxj
 * @Date:   2016-10-01 17:28:44
 * @Last Modified by:   jxj
 * @Last Modified time: 2016-11-10 17:14:13
 */
var path = require("path");
var main = require("./lib/main.js");

var through = require("through2");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
const PLUGIN_NAME = "gulp-packjs";


function gulpPackjs(opt) {//直接取根文件
    var cwd = process.cwd();
    if (!opt) {
        opt = {url:"index.js"}
    }
    var stream = through.obj(function(ck, enc, cb) {
        if (ck.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }
        var ph=ck.path;

        var pkJs = new main();
        var ts = this;
        content = ck.contents.toString("utf8");
        pkJs.export({
            callback: function(jsStr) {
                jsStr = new Buffer(jsStr);
                ck.contents = Buffer.concat([jsStr]);
                ts.push(ck);
                cb();
            },
            baseUrl:ph,
            data: opt.data,
            filter: opt.filter,
            noExport: true //不内置再输出一个文件
        }, content);

    })
    return stream;
}

gulpPackjs.export = function(opt, content) {
    var pkJs = new main();

    pkJs.export(opt, content);
}

module.exports = gulpPackjs;
