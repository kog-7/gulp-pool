var fs=require("fs");
var path=require("path");


var mkdirs=function(dir,callback,joinstr){
if(!joinstr){
  dir=path.normalize(dir)
  dir=dir.split(path.sep);
  joinstr="";
  joinstr=dir.shift();
}
else if(dir.length===0){
  callback();
  return;
}  
else{
  joinstr=path.join(joinstr,dir.shift());
}
  fs.stat(joinstr,function(err,stat){
    if(err){
     fs.mkdir(joinstr,function(err){
       if(!err){//如果这里还错误的话，本身路径全错，不考虑
         mkdirs(dir,callback,joinstr);
       }
     })  
    }
    else{
      mkdirs(dir,callback,joinstr);
    }
  });

}


var depWriteFile=function(url,str,callback,code){
  if(!code){code="utf8";}
  var dir=path.dirname(url);
fs.stat(dir,function(err,stat){
  if(err){
    mkdirs(dir,function(err){
      if(!err){
        fs.writeFile(url,str,code,function(err){
          if(!err){
            if(typeof callback==="function"){
            callback();
          }
          }
          else{
              console.log("write "+url+" fail");
          }
        });
      }
    })
  }
  else{
    fs.writeFile(url,str,code,function(err){
      
    if(!err){
      if(typeof callback==="function"){
        callback();
      }
    }
    else{
      console.log("write "+url+" fail");
    }
    });
  }
})  
}
module.exports=depWriteFile;