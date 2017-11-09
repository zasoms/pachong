const fs = require('fs')
const path = require('path')
const request = require('request')

const sleep = function(time){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  })
}

var movieDir = __dirname + '/movies',
  exts = ['.mkv', '.avi', '.mp4', '.rm', '.rmvb', '.wmv'];

var readFiles = function(){
  return new Promise((resolve, reject) => {
    fs.readdir(movieDir, (err, files) => {
      resolve( files.filter(v => exts.includes(path.parse(v).ext)) )
    })
  })
}

var getPoster = function(movieName){
  let url = `https://api.douban.com/v2/movie/search?q=${encodeURI(movieName)}`;

  return new Promise((resolve, reject) => {
    request({
      url,
      json: true
    }, (error, res, body) => {
      if(error){
        return reject(error)
      }
      resolve(body.subjects[0].images.large)
    })
  })
}

var savePoster = function( movieName, url ){
  request.get(url).pipe( fs.createWriteStream( path.join(movieDir, movieName + '.jpg') ) )
}

var start = async function () {
  let files = await readFiles()

  for(var file of files){
    let name = path.parse(file).name
    console.log(`正在获取【${name}】的海报`)
    await sleep(500)
    savePoster(name, await getPoster(name))
  }
  console.log('获取海报完成')
}
start()