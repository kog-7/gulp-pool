/*
 * @Author: jxj
 * @Date:   2016-09-30 22:11:25
 * @Last Modified by:   jxj
 * @Last Modified time: 2016-11-08 01:36:20
 */

'use strict';

var typeHim = function(dm) {
    if (dm === undefined) {
        return "undefined";
    }
    if (dm === null) {
        return "null";
    }
    var tp = typeof dm;
    if (tp === "string" || tp === "number" || tp === "function") {
        return tp;
    }
    tp = Object.prototype.toString.call(dm);
    if (tp.indexOf("rray") !== -1 || tp.indexOf("rguments") !== -1) {
        return "array";
    } else if (tp.indexOf("ragment") !== -1) {
        return "fragment"
    } else if (tp.indexOf("odeList") !== -1) {
        return "nodelist";
    } else if (tp.indexOf("lement") !== -1) {
        return "node";
    } else if (tp.indexOf("egExp") !== -1) {
        return "regexp";
    } else if (tp.indexOf("bject") !== -1) {
        return "object";
    } else {
        return false;
    }
};



exports.typeHim = typeHim;



var isEmptyObject = function(ob) {
    var ctr = true;
    for (var i in ob) {
        ctr = false;
    }
    return ctr;
}

exports.isEmptyObject = isEmptyObject;


var miniExtend = function(aob, ob) {
    var i = null;
    for (i in ob) {
        if (!(i in aob)) {
            aob[i] = ob[i];
        }
    }
    return aob;
}





exports.miniExtend = miniExtend;


var coverExtend = function(aob, ob) {
    var i = null;
    for (i in ob) {
        aob[i] = ob[i];
    }
    return aob;
}

exports.coverExtend = coverExtend;


var createInherit = function(from, opt) {
    // if(Object.create){return Object.create(from);}
    var f = function() {};
    var ob = null;
    f.prototype = from;
    ob = new f();
    if (opt) {
        coverExtend(ob, opt);
    }
    return ob;
};

exports.createInherit = createInherit;



var getValue = function(name, ob, item, blg) {
    if (name === ".NUMBER") {
        return item;
    }
    if (["number", "string"].indexOf(typeof ob) !== -1) {
        return ob;
    }
    var ar = name.split("."),
        n = ar.length;
    var temp = "";
    var i = 0;
    if (ar[0] === "JRootScope") { //可以设置任意的艮目录，那么会识别并过滤掉他
        ar.shift();
        n = ar.length;
        var nowOb;
        while (ob && (!(isEmptyObject(ob)))) {
            nowOb = Object.getPrototypeOf(ob);
            if (isEmptyObject(nowOb)) {
                break;
            } else {
                ob = nowOb;
            }
        }
    }
    var protoOb = ob,
        out = null;
    while (protoOb && !(isEmptyObject(protoOb))) {
        i = 0;
        ob = protoOb;
        for (; i < n; i += 1) {
            temp = ar[i];
            if (ob.hasOwnProperty(temp)) {
                ob = ob[temp];
                if (ob === undefined) {
                    break;
                }
            } else {
                ob = null;
                break;
            }
        }
        if (!ob) {
            protoOb = Object.getPrototypeOf(protoOb);

            continue;
        } else {
            out = ob;
            break;
        }
    }
    out = out ? out : false;
    return out;
};




exports.getValue = getValue;



var getParaName = function(f) {
    var str = f.toString();
    var s1 = str.indexOf("("),
        s2 = str.indexOf(")");
    str = str.slice(s1 + 1, s2);
    return str.split(",");
};

exports.getParaName = getParaName;



var compIf = function(vara, expre, varb) { //条件对比
    var tf = null;
    if (vara === true || vara === "true") {
        vara = "true";
    }
    if (vara === false || vara === "false") {
        vara = "false";
    }
    if (varb === true || varb === "true") {
        varb = "true";
    }
    if (varb === false || varb === "false") {
        varb = "false";
    }
    if (expre === "==" || expre === "=") {
        expre = "=";
    }
    if(expre==="!="||expre==="!=="){
        expre="!"; 
    }
    
    if (!(isNaN(+vara))) {
        vara = +vara;
    }
    if (!(isNaN(+varb))) {
        varb = +varb;
    }

    switch (expre) {
        case "<":
            tf = (vara < varb);
            break;
        case ">":
            tf = (vara > varb);
            break;
        case ">=":
            tf = (vara >= varb);
            break;
        case "<=":
            tf = (vara <= varb);
            break;
        case "=":
            tf = (vara === varb);
            break;
        case "!":
            tf = (vara !== varb);
            break;
    }
    return tf;
}


exports.compIf = compIf;





var urlAim = function(url) {
    var ind = url.lastIndexOf("\/");
    if (ind === -1) {
        return {
            base: "",
            name: url
        };
    } else {
        var base = url.slice(0, ind + 1);
        var name = url.slice(ind + 1);
        return {
            base: base,
            name: name
        };
    }
};



exports.urlAim = urlAim;



var simpleUrl = function(url) {
    var str = url.charAt(0);
    if (str === ".") {
        return url.slice(2);
    } else if (str === "\/") {
        return url.slice(1);
    } else {
        return url;
    }
}
exports.simpleUrl = simpleUrl;



var forEachOb = function(ob, callback) {
    var i = null;
    for (i in ob) {
        callback(i, ob[i]);
    }
}

exports.forEachOb = forEachOb;



var depExtend = function(ob2, ob1) {
    var tp = typeHim(ob1);
    var temp = null;
    var out = null;
    var tp2 = typeHim(ob2);
    if (tp !== tp2) {
        return;
    }
    if (tp === "array") {
        var i = 0,
            n = ob1.length;
        for (; i < n; i += 1) { //这里可以根据getOwnProperty来判断是为自有的属性，方法
            temp = ob1[i]; //是否为对象等
            if (ob2[i] === undefined) {
                ob2[i] = temp;
                continue;
            } else if (["array", "object"].indexOf(typeHim(temp)) !== -1) {
                depExtend(ob2[i], temp);
            }
        }
    } else if (tp === "object") {
        var i = null;
        for (i in ob1) {
            temp = ob1[i];
            if (ob2[i] === undefined) {
                ob2[i] = temp;
                continue;
            } else if (["array", "object"].indexOf(typeHim(temp)) !== -1) {
                depExtend(ob2[i], temp);
            }
        }
    }
}

exports.depExtend = depExtend;