/*
 * @Author: jxj
 * @Date:   2016-10-17 18:18:49
 * @Last Modified by:   jxj
 * @Last Modified time: 2016-10-17 20:26:40
 */

'use strict';
var uglify = null;
// var stripComments=null;

module.exports = {
    uglify: function(name, arg, jsStr) {
        if (uglify === null) {
            try {
                uglify = require("uglify-js");
            } catch (e) {
                uglify = null;
                return jsStr;
            }
        }
        var mangle = false;
        if (arg[0] === "mangle") {
            mangle = true;
        }
        var out = {};
        try {
            out = uglify.minify(jsStr, {
                fromString: true,
                mangle: mangle
            });
        } catch (e) {
            console.log("uglify-js temporary can not parse this jsString,no handle by uglify");
            return jsStr;
        }
        if (out.code) {
            return out.code;
        } else {
            return jsStr;
        }
    }
}