var request = require("request"),
    cheerio = require("cheerio"),
    debug = require("debug")("lativ:update");


debug("读取商品详情");

function readProductDetail(url, callback){
    request(url, function(err, res){
        if(err) return callback && callback(err, null);

        var $ = cheerio.load(res.body.toString());

        /**
         * 各个颜色的大小，数量是不同的。
         * {
         * 		id: 1
         * 		productId: 1,
         * 		price: 70,
         * 		color: ["天蓝", "白色"],
         * 		size: ["155/80A (S)", "155/80A (S)"],
         * 		number: ["123", "123"],
         * 		detail: ""
         * }
         */
        var color = (function(){
            var color = [];
            console.log($(".color img"));
            $(".color img").each(function(){
                color.push( $(this).attr("title") )
            });
            return color.join(",");
        })();
        var size = (function(){
            var size = [];
            console.log($("#sizelist a"));
            $("#sizelist a").each(function(){
                size.push( $(this).text() )
            });
            return size.join(",");
        })();
        var detail = $(".label") + $(".oldPic.show")
        var productDetail = {
            id: 1,
            productid: 1,
            price: $("#price").text(),
            color: color,
            size: size,
            number: ["123", "123"],
            detail: detail
        };
        callback && callback(null, productDetail);
    });
}


readProductDetail("http://www.lativ.com/Detail/25456031", function(err, list){
    if(err ) {
        console.log(err); return;
    }
    console.log(list);
})
