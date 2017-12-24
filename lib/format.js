/*
* @Author: jxj
* @Date:   2016-09-29 16:00:40
* @Last Modified by:   jxj
* @Last Modified time: 2016-09-30 00:09:17
*/

'use strict';


var typeHim=function(dm){
if(dm===undefined){return "undefined";}
if(dm===null){return "null";}
var tp=typeof dm;
if(tp==="string"||tp==="number"||tp==="function"){
  return tp;
}
tp=Object.prototype.toString.call(dm);
if(tp.indexOf("rray")!==-1||tp.indexOf("rguments")!==-1){
    return "array";
}
else if(tp.indexOf("ragment")!==-1){
return "fragment"
}
else if(tp.indexOf("odeList")!==-1){
    return "nodelist";
}
else if(tp.indexOf("lement")!==-1){
    return "node";
}
else if(tp.indexOf("egExp")!==-1){
return "regexp";
}
else if(tp.indexOf("bject")!==-1){
    return "object";
}
else{
    return false;
}
};






var encodeBlack=function(str){
if((typeof str!=="string")||str.indexOf("\x20")===-1){return str;}
return str.replace(/\x20/g,function(s){
return "$$$";
});
};





var decodeBlack=function(str){
if((typeof str!=="string")||str.indexOf("$$$")===-1){return str;}
return str.replace(/\$\$\$/g,function(s){
return " ";
});
};






var blankObject=function(ob,encodeType){
var tp=typeHim(ob);
if(!encodeType){encodeType="encode";}
       var temp=null;
        if(tp==="array"){
            var i= 0,n=ob.length;
            for(;i<n;i+=1){//这里可以根据getOwnProperty来判断是为自有的属性，方法
                temp=ob[i];
                if(["array","object"].indexOf(typeHim(temp))!==-1){
                    temp=blankObject(temp);
                }
                else{
                	if(encodeType==="encode"){
                		ob[i]=encodeBlack(temp);
                	}
                	else{
                		ob[i]=decodeBlack(temp);
                	}
                }
            }
        }
        else if(tp==="object"){
            var i=null;
            for(i in ob){
                temp=ob[i];
                if(["array","object"].indexOf(typeHim(temp))!==-1){
                    temp=blankObject(temp);
                }
                else{
            		if(encodeType==="encode"){
                		ob[i]=encodeBlack(temp);
                	}
                	else{
                		ob[i]=decodeBlack(temp);
                	}
                }
            }
        }
};


exports.blankObject=blankObject;