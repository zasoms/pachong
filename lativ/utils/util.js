const fs = require("fs")
const path = require("path")
const gm = require("gm")


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

function addMark({path, width=500, base='base.jpg'}){
  return new Promise((resolve, reject) => {
    let oldPath = path
    path = path.replace(/tbi$/, 'jpg')
    gm(oldPath)
    .trim()
    .write(path, function(err){
      if( !err ){
        gm(path)
          .size({bufferStream: true}, function(err, size) {
            if( !err ){
              let height = parseInt((width / size.width) * size.height)
              this.resize(width, height, '!')
              this.write(path, function (err) {
                if( !err ){
                  gm()
                  .in('-page', '+0+0')
                  .in(base)
                  .in('-page', '+25+114')
                  .in(path)
                  .mosaic()
                  .write(path, function(){
                    resolve()
                    console.log( '添加水印成功' )
                  })
                }else{
                  reject('fail:mark')
                }
              })
            }else{
              reject('fail:get Image info')
            }
          })
      }else{
        reject('fail:shear')
      }
    })
  })
}


module.exports = {
  mkdirsSync,
  makeHex,
  saveFile,
  saveFormatFile,
  addMark
}