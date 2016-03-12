var request = require("request"),
    cheerio = require("cheerio"),
    debug = require("debug")("lativ:update");


debug("读取商品");

function readProductList(url, callback){
    request(url, function(err, res){
        if(err) return callback && callback(err, null);

        var $ = cheerio.load(res.body.toString());

        var productList = [];
        /**
         {
             id: 1,
             url: a > href,
             name: .productname,
             categoryid:
         }
         */

        $("#newProductList li").each(function(i, item){
            var $item = $(item);

            productList.push({
                id: i+1,
                url: $item.find("a.imgd").attr("href"),
                name: $item.find("span.productname").text(),
                categoryid: 1
            });
        });

        callback && callback(null, productList);
    });
}

readProductList("http://www.lativ.com/WOMEN", function(err, list){
    if(err ) {
        console.log(err); return;
    }
    console.log(list);
})
