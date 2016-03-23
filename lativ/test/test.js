var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    path = require("path"),
    fs = require("fs");

var config = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, sdch",
    "Accept-Language": "zh-CN,zh;q=0.8",
    "Connection": "keep-alive",
    "Host": "www.lativ.com",
    "Referer": "http://www.lativ.com/WOMEN",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
};

var products = [];

var getInitUrlList = function(category){
    request.get("http://www.lativ.com/WOMEN")
            .end(function(err, res){
                if(err){
                    console.log(err);
                }else{
                    var text = res.text.toString(),
                        index = text.indexOf("cacheID");
                        cacheID = text.slice(index+9, index+20).toString().match(/\d+/)[0];

                    getAjaxUrlList(category, 0, cacheID);
                }
            });
};

var getAjaxUrlList = function(category, pageIndex, cacheID){
    var url = "http://www.lativ.com/Product/GetNewProductCategoryList?MainCategory="+ category +"&pageIndex="+ pageIndex +"&cacheID="+ cacheID;
    request.get(url)
            .set(config)
            .end(function(err, res){
                if(err){
                    console.log(err);
                }else{
                    var data = JSON.parse(res.text);
                    if( data && data.length ){
                        products = products.concat(data);
                        setTimeout(function(){
                            pageIndex += 1;
                            console.log("已成功抓取" + products.length + "产品");
                            getAjaxUrlList(category, pageIndex, cacheID);
                        }, 300);
                    }else{
                        console.log("全部获取完毕", products.length);
                    }
                }
            });
};

getInitUrlList("WOMEN");