var originRequest = require("request");
var cheerio = require("cheerio");
var fs = require('fs');

var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
};
/**
 * 请求制定URL
 * @param {String}   url
 * @param {Function} callback
 */
function request(url, callback) {
    var options = {
        url: url,
        encoding: null,
        // proxy: '',
        headers: headers
    };
    originRequest(options, callback);
}

function download(url, callback){
    request(url, function(err, res){
        var fileName = url.split('/').slice(-1);
        var suffix = res.headers['content-type'].split('/')[1];
        fs.writeFile(fileName + '.' + suffix, res.body, function(err) {
            if (err) {
                console.log(fileName, "写入失败啦...");
            } else {
                callback && callback();
                console.log(fileName, "successful !");
            }
        });
    });  
}
download('http://s9.sinaimg.cn/mw690/001Wf5K2zy788Q8Ctf2e8&690');
download('http://mvideo.spriteapp.cn/video/2017/0206/b9ace088-ec74-11e6-a583-d4ae5296039d_wpcco.mp4');
