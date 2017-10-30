const fs = require("fs")
const path = require("path")


// 创建目录
function mkdirsSync(dirpath, mode) {
  if (!fs.existsSync(dirpath)) {
    var pathtmp;
    dirpath.split("/").forEach(function (dirname) {
      if (pathtmp) {
        pathtmp = path.join(pathtmp, dirname);
      } else {
        pathtmp = dirname;
      }
      if (!fs.existsSync(pathtmp)) {
        if (!fs.mkdirSync(pathtmp, mode)) {
          return false;
        }
      }
    });
  }
  return true;
}

// 随机创建32位16进制字符
function makeHex(productId) {
  var cache = {}
  return function(){
    var hex = '0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f'.split(","),
      strArr = [productId],
      str;
    for (var i = 0; i < 24; i++) {
      strArr.push( hex[Math.floor(Math.random() * 16)] );
    }
    str = strArr.join()
    if (cache[str]) {
      makeHex(productId)
    } else {
      cache[str] = 1;
    }
    return str;
  }
}


function saveFile (url, data){
  return new Promise((resolve, reject) => {
    fs.writeFile(url, data, err => {
      if(err)  {
        reject(err)
      }else{
        resolve()
      }
    })
  })
}

function saveFormatFile(url, data){
  return saveFile(url, "exports.data=" + JSON.stringify(data))
}

module.exports = {
  mkdirsSync,
  makeHex,
  saveFile,
  saveFormatFile
}