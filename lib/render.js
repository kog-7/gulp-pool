"use strict";

var tool = require("./base.js");
var typeHim = tool.typeHim,
    isEmptyObject = tool.isEmptyObject,
    miniExtend = tool.miniExtend,
    createInherit = tool.createInherit;
var getValue = tool.getValue;
var getParaName = tool.getParaName;
var compIf = tool.compIf;
var forEachOb = tool.forEachOb;
var includeObject = require("./include.js");
var anaInclude = includeObject.anaInclude;
// var templateCache = includeObject.templateCache;

var filters = {
    upper: function(str) {
        if(typeHim(str)==="array"){
            str.forEach(function(s,ind){
                str[ind]=s.toUpperCase();
            });
        }
        else{
            str=str.toUpperCase();
        }
        return str;
    },
    lower: function(str) {
        if(typeHim(str)==="array"){
            str.forEach(function(s,ind){
                str[ind]=s.toLowerCase();
            });
        }
        else{
            str=str.toLowerCase();
        }
        return str;
    },
    length: function(str) {
        if (typeHim(str) !== "array") {
            return str;
        }
        return str.length;
    }
};
var JRender = function() {};
var renderPrototype = {
    constructor: JRender
};
miniExtend(renderPrototype, {
    sn: {
        item: 0
    }
});
miniExtend(renderPrototype, {
    parseS: parseS
});
miniExtend(renderPrototype, {
    filters: filters,
    setFilter: function(opt) {
        var fil = this.filters;
        miniExtend(fil, opt)
    }
});



//分析{{  }}环境标签
var anaTag = function(htm, match) {
    var regold = new RegExp('\\{\\{(\\w+)(?=\\s)(\\' + match + '|\\{\\"|\\}|[\\:\\"\\,\\w\\s\\>\\<\\=\\|\\.\\!\\[\\]])+}}');
    var reg;
    var mat = null;
    var no = 0;
    var lf = "",
        rt = "";
    var tp = null;
    var right = "";
    var out = [];
    var temp = [];
    tp = regold.exec(htm);
    try {
        tp = regold.exec(htm);
    } catch (e) {
        console.log("loop write error");
        return;
    }
    var htmlArr = [];
    var tempHtml = "";
    do {
        if (no === 0) {
            if (!tp) {
                return false
            } else {
                tp = tp[1]
            }
            reg = new RegExp("\\{\\{" + tp + '\\s+(\\' + match + '|\\{\\"|\\}|[\\:\\[\\]\\,\\"\\w\\s\\>\\<\\!\\=\\|\\.])+}\\}|(\\{\\{\\/' + tp + 's*\\}\\})', "g");
            mat = reg.exec(htm);
            lf = [mat.index, reg.lastIndex]
        } else {
            mat = reg.exec(htm)
        }
        if (mat[2]) {
            no -= 1
        } else {
            no += 1
        }
        if (no === 0) {
            rt = [mat.index, reg.lastIndex];
            tempHtml = htm.slice(0, lf[0]);
            temp = [{
                html: tempHtml
            }, {
                html: htm.slice(lf[1], rt[0]),
                express: htm.slice(lf[0] + 2, lf[1] - 2)
            }];
            htm = right = htm.slice(rt[1]);
            tp = regold.exec(right);
            out = out.concat(temp)
        }

    } while (mat && tp);
    out.push({
        html: right
    });
    return out
};





//对环境标签中{{ }}是for还是if进行具体处理
var parseS = function(str, match) {
    var tp = str.slice(0, str.indexOf(" "));//根据空格位置，取得第一个标识符是if，for还是什么
    var obs = null;
    var reg = null;
    var mat;
    if (tp === "for") {
        reg = new RegExp("for\\s+([\\w|\\|\\-]+)\\s+in\\s+\\" + match + '?([\\{\\}\\w|\\|\\.\\[\\]\\,\\"\\:]+)' + "\\" + match + "?");
        mat = reg.exec(str);
        obs = [mat[1], mat[2]];
        obs.type="for";
    } else if (tp === "if") {
        reg = new RegExp("if\\s+(\\" + match + "?[\\w|\\|\\.\\-]+\\" + match + "?)\\s+([\\<\\>\\=\\!]+[\\<\\>\\=\\!]*)\\s+(\\" + match + "?[\\w\\|\\.\\-]+\\" + match + "?)");
        mat = reg.exec(str);
        obs = [mat[1], mat[2], mat[3]];
        obs.type="if";
    } else if (tp === "copy") {
        reg = /copy\s+([\w\-]+)/;
        mat = reg.exec(str);
        obs = [mat[1]];
        obs.type="copy";//由于copy和scope的长度都为1
    }
    else if(tp==="scope"){
      //  reg= new RegExp("scope\\s+(\\" + match + "?[\\w|\\|\\.\\-]+\\" + match + "?)\\s*");
       reg=new RegExp("scope\\s+([\\w|\\|\\-]+)\\s+as\\s+\\" + match + '?([\\{\\}\\w|\\|\\.\\[\\]\\,\\"\\:]+)' + "\\" + match + "?");
       mat=reg.exec(str);
       obs=[mat[1], mat[2]];
       obs.type="scope";
    }
    return obs
};



var parseString = function(reg, str, handleCallback) {
    var indb = 0;
    var outstr = "";
    var match = null;
    var ind = null,
        lastInd = null;
    var ctr = false;
    var handleStr = "";
    while (match = reg.exec(str)) {
        ctr = true;
        ind = match.index, lastInd = reg.lastIndex;
        handleStr = handleCallback(match[1]);
        outstr += str.slice(indb, ind) + handleStr;
        indb = lastInd
    }
    if (ctr === false) {
        return str
    } else {
        outstr += str.slice(lastInd);
        return outstr
    }
};



var parseVariable = function(str) {
    var vary, filter;
    var divide = "|";
    // var potDivide = ":";
    var ind = str.indexOf(divide);
    var lg = str.length;
    var potInd;
    var filterArr = null;
    if (ind !== -1) {//操作过滤器
        vary = str.slice(0, ind);
        filter = str.slice(ind + 1);
        if (filter) {
            filterArr = filter.split(",")
        }
    } else {
        vary = str
    }
    
    return {
        filter: filterArr,
        variable: vary
    }
};





miniExtend(renderPrototype, {
    anaTag: anaTag,
    match: "?",
    regMatch: function() {
        var lf = this.match;
        return new RegExp("\\" + lf + "([\\w\\.\\-\\:\\|\\,\\#\\s\\u4e00-\\u9fa5]+)\\" + lf, "gm")
    },
    stringEachArr: function(str, obs, item, blg) {
        var ts = this;
        var reg = ts.regMatch();
        var outstr = parseString(reg, str, function(tempstr) {
            return ts.handleStr(tempstr, obs, item, blg)
        });
        return outstr
    },
    handleStr: function(str, obs, item, blg) {
        var ts = this;
        var mat = ts.handVal(str, obs, item, blg);
        if (["number", "string"].indexOf(typeof mat) !== -1) {
            return mat
        } else {
            return ts._render(mat, "middle")
        }
    },
    _handVary: function(varyOb, ob, item, blg) {//处理变量
       var ts = this;
       var varyAttr = varyOb.variable,
          //  varyDef = varyOb.default,
           varyFilter = varyOb.filter; 
       var tmpob,lastTmpob;
       var tmpArr=[];
       var fun = null;
       var flsFun = ts.filters;
       var ifArr=varyAttr.indexOf(",");
       
       if(ifArr!==-1){//是否有,表示多变量
           varyAttr=varyAttr.split(",");  
       }
       else{
         varyAttr=[varyAttr];
       }
      //  var hasData=false;//判断是否有数据被变量化出来
      var defInd,defVal;
         varyAttr.forEach(function(attr,ind){
           defVal="";
           defInd=attr.indexOf(":");
           if(defInd!==-1){//有默认值的情况
             defVal=attr.slice(defInd+1);
             attr=attr.slice(defInd);
           }
           var out=getValue(attr,ob,item,blg);
           if(out===false){//如果为假则为“”
             out=defVal;
           }
           tmpArr.push(out);
         });

         if(ifArr===-1){
           tmpArr=tmpArr[0];
         }

       if (varyFilter) {
         tmpob=tmpArr;
           varyFilter.forEach(function(fil) {
               fun = flsFun[fil];
               if (typeof fun === "function") {//如果为function的时候,带入进去运行
                 lastTmpob=tmpob;
                   tmpob = fun.apply(null,[tmpob,item,blg]);
                   if(tmpob===undefined){//没有返回时候,不做处理
                     tmpob=lastTmpob;
                   }
               }
           });
           if (!tmpob && tmpob !== 0) {//如果返回为空，则为过滤无效，返回空
               tmpob = ""
           }
       }
       else{
            tmpob=tmpArr;
       }
       return tmpob;
   },
    handVal: function(str, ob, item, blg) {
        var ts = this;
        var varyOb = parseVariable(str);
        var match = ts.match;
        if (!item) {
            item = 0
        }
        if (!blg) {
            blg = 1
        }
        var filter = varyOb.filter,
            attr = varyOb.variable;
        var iref = null;
        var storeExp = ts.storeExp;
        var matchVal = null;
        var tmpob;
        if (filter && filter[0] === "EXPRESS") {
            var res = storeExp[attr];
            var expob = parseS(res.express, match);
            if (expob.type === "for") {
                var forVal = expob[1];
                try {
                    tmpob = JSON.parse(forVal)
                } catch (e) {
                    var forVaryOb = parseVariable(forVal);
                    tmpob = ts._handVary(forVaryOb, ob, item, blg);

                    if (!tmpob) {
                        tmpob = ""
                    }
                }
                if (typeof tmpob !== "object") {
                    return ""
                } else {
                    return {
                        data: tmpob,
                        template: res.html,
                        prefix: expob[0],
                        lastData: ob
                    }
                }
            } else if (expob.type === "if") {
                var vary1 = expob[0],
                    vary2 = expob[2];
                var match1 = ts.regMatch().exec(vary1);
                var match2 = ts.regMatch().exec(vary2);
                if (match1) {
                    vary1 = match1[1];
                    vary1 = ts._handVary(parseVariable(vary1), ob, item, blg)
                }
                if (match2) {
                    vary2 = match2[1];
                    vary2 = ts._handVary(parseVariable(vary2), ob, item, blg)
                }
                var tf = compIf(vary1, expob[1], vary2);
                if (!tf) {
                    return ""
                } else {
                    return {
                        data: ob,
                        template: res.html
                    }
                }
            } else if (expob.type === "copy") {
                ts.copyOb[expob[0]] = res.html;
                return res.html
            }
            else if(expob.type==="scope"){
                var scopeVal=expob[1];
                
                try {
                tmpob = JSON.parse(scopeVal)
            } catch (e) {
                var scopeVaryOb = parseVariable(scopeVal);
                tmpob = ts._handVary(scopeVaryOb, ob, item, blg);

                if (!tmpob) {
                    tmpob = ""
                }
            }
            var outOb={};
            outOb[expob[0]]=tmpob;
                    return {
                        data:outOb,
                        template:res.html,
                        lastData:ob
                    }
            }
        } 
        else {//单变量解析
            tmpob = ts._handVary(varyOb, ob, item, blg);
            if(typeof tmpob==="object"){tmpob=tmpob.toString();}
            return tmpob
        }
    },
    _renderNoData: function(html) {
        var ts = this;
        var match = ts.match;
        var strarr = ts.anaTag(html, match);
        if (!strarr) {
            return html
        }
        var n = strarr.length,
            i = 0;
        var temp = null;
        var expOut = null;
        var out = "";

        for (; i < n; i += 1) {
            temp = strarr[i];
            if (temp.express) {
                expOut = parseS(temp.express, match);
                if (expOut && expOut.length === 1) {
                    temp.html = ts._renderNoData(temp.html);
                    ts.copyOb[expOut[0]] = temp.html
                }
            }
            out += temp.html
        }
        return out
    },
    _render: function(opt, mid) {
        var strhtml = opt.template,
            data = opt.data;
        var prefix = opt.prefix;
        var noMerge = opt.noMerge;
        var ts = this;
        var match = this.match;
        var strarr = ts.anaTag(strhtml, match);
        var callback = opt.callback;
        var lastData = opt.lastData;
        var template = "";
        var newItem;
        var tempData = null;
        var temp = null;


        if (typeHim(strarr) === "array") {
            var i = 0,
                n = strarr.length,
                temp = null;
            var tpob = {};
            var item = 0;
            var exp = "";
            for (; i < n; i += 1) {
                temp = strarr[i];
                if (temp.express) {
                    newItem = ts.sn.item += 1;
                    exp = "XJ" + newItem;
                    ts.storeExp[exp] = temp;
                    template += match + exp + "|EXPRESS" + match
                } else {
                    template += temp.html
                }
            }
        } else if (strarr === false) {
            template = strhtml
        }
        var tp = typeHim(data);
        temp = null;
        var outstr = "";
        var i = 0,
            n;
        if (tp === "array" && mid === null) {
            i = 0, n = data.length;
            for (; i < n; i += 1) {
                temp = data[i];
                if (typeof temp === "object") {
                    temp.NUMBER = i.toString()
                }
                tempData = temp;
                if (lastData) {
                    tempData = createInherit(lastData, tempData)
                }
                outstr += ts.stringEachArr(template, tempData, i, n)
            }
        } else if (tp === "array" && prefix) {
            i = 0, n = data.length;
            for (; i < n; i += 1) {
                temp = data[i];
                if (typeof temp === "object") {
                    temp.NUMBER = i.toString()
                }
                tempData = {};
                tempData[prefix] = temp;
                if (lastData) {
                    tempData = createInherit(lastData, tempData)
                }
                outstr += ts.stringEachArr(template, tempData, i, n)
            }
        } else if (tp === "object" && prefix) {
            var attrStr = "";
            for (attrStr in data) {
                temp = data[attrStr];
                temp = {
                    value: temp,
                    attr: attrStr
                };
                tempData = {};
                tempData[prefix] = temp;
                if (lastData) {
                    tempData = createInherit(lastData, tempData)
                }
                outstr += ts.stringEachArr(template, tempData)
            }
        } else {
            if (lastData) {
                data = createInherit(lastData, data)
            }
            outstr = ts.stringEachArr(template, data, 0, 1)
        }
        if (typeof callback === "function"&&!mid) {
            callback(outstr, ts.copyOb)
        }
        return outstr
    },
    render: function(opt) {
        var ts = this;
        var data = opt.data,
            strhtml = opt.template;
        var url = opt.url;
        var cache = opt.cache;
        var callback = opt.callback;
        var noMerge = opt.noMerge;
        var baseUrl=opt.baseUrl;
        var match = opt.match;
        var f = function() {};
        f.prototype = ts;
        var newTs = new f;
        newTs.storeExp = {};
        newTs.refOb = [];
        newTs.copyOb = {};
        // newTs.store = data;
        if (match) {
            ts.match = match
        }
        // if (url && url in templateCache) {
        //     strhtml = templateCache[url]
        // }
        var outData = {
            template: strhtml,
            data: data,
            callback: callback
        };
           anaInclude({
                url: url,
                template:strhtml,
                baseUrl:baseUrl,
                callback: function(ob) {
                    var html = ob.html;
                    if (noMerge === true) {
                        html = newTs._renderNoData(html);
                        callback(html, newTs.copyOb);
                        return
                    }
                    outData.template = html;
                    newTs._render(outData, null, "render")
                }
            }, cache)


    }
});
JRender.prototype = renderPrototype;

module.exports = JRender;