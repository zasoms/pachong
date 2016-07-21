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

var getInitUrlList = function(category) {
    request.get("http://www.lativ.com/WOMEN")
        .end(function(err, res) {
            if (err) {
                console.log(err);
            } else {
                var text = res.text.toString(),
                    index = text.indexOf("cacheID");
                cacheID = text.slice(index + 9, index + 20).toString().match(/\d+/)[0];

                getAjaxUrlList(category, 0, cacheID);
            }
        });
};

var getAjaxUrlList = function(category, pageIndex, cacheID) {
    var url = "http://www.lativ.com/Product/GetNewProductCategoryList?MainCategory=" + category + "&pageIndex=" + pageIndex + "&cacheID=" + cacheID;
    request.get(url)
        .set(config)
        .end(function(err, res) {
            if (err) {
                console.log(err);
            } else {
                // console.log(res.text);
                var data = JSON.parse(res.text);
                if (data && data.length) {
                    products = products.concat(data);
                    // setTimeout(function(){
                    //     pageIndex += 1;
                    console.log("已成功抓取" + products.length + "产品");
                    //     getAjaxUrlList(category, pageIndex, cacheID);
                    // }, 300);
                } else {
                    console.log("全部获取完毕", products.length);
                }
            }
        });
};


var detailConfig = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, sdch",
    "Accept-Language": "zh-CN,zh;q=0.8",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Host": "www.lativ.com",
    // "If-Modified-Since": "Tue, 15 Mar 2016 11:53:29 GMT",
    // "Referer": "http://www.lativ.com/Detail/28853011",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
};

var getProductDetail = function(num) {
    var obj = {};
    var url = "http://www.lativ.com/Detail/" + num;
    request.get(url)
        .end(function(err, res) {
            if (err) return callback(err);

            res.text.replace("\\r", "").replace("\\n", "");
            var $ = cheerio.load(res.text),
                text = res.text.toString(),
                index = text.indexOf("$.product.Generate"),
                html = "",
                id = "",
                title = "",
                description = "",
                price = $("#price").text();

            $("img").each(function(i, item) {
                $(item).attr("src", $(item).attr("data-original"));
            });

            title = $(".title1").text().trim();
            title = title.slice(0, title.indexOf("（"));
            description = $(".label").html() + $(".oldPic.show").html();

            obj.title = title;
            obj.subtitle = title;
            obj.price = $("#price").text();
            obj.description = description;

            id = text.slice(index, index + 40).toString().match(/\d+/)[0];

            detailConfig.Referer = url;
            request.get("http://www.lativ.com/Product/ProductInfo/?styleNo=" + id)
                .set(detailConfig)
                .end(function(err, res) {
                    if (err) return callback(err);

                    var data = JSON.parse(JSON.parse(res.text).info);
                    // data.forEach(function(item, i) {
                    //     obj[i] = obj[i] || {};
                    //     obj[i].color = item.color;
                    //     obj[i].colorImg = "http://www.lativ.com" + item.colorImg;
                    //
                    //     obj[i].ItemList = [];
                    //     item.ItemList.forEach(function(type, j) {
                    //         obj[i].ItemList[j] = {
                    //             size: type.size,
                    //             Size: type["體型尺寸"],
                    //             invt: type.invt
                    //         };
                    //     });
                    // });


                    dataMatch(obj);
                });
        });
};

var dataMatch = function(data){
    data.stuff_status = 1;
    data.location_state = "上海";
    data.location_city = "上海";
    data.item_type = 1;
    data.auction_increment = "";
    data.valid_thru = 0;
    data.freight_payer = 0;
    data.post_fee = "2.8026e-45";
    data.ems_fee = "2.8026e-45";
    data.express_fee = 0;
    data.has_invoice = 0;
    data.approve_status = 1;
    data.has_showcase = 1;
    data.list_time = "";
    data.postage_id = 5478758160;
    data.has_discount = 0;
    data.modified = "2016/7/20  22:04:35";


    fs.writeFile("./update.js", "var data = "+JSON.stringify(data));
};

// 宝贝属性
var cateProps = function(data){

    return;
};
var description = function(data){

    return;
};

var color = {

};

var size = {
    "145/80A": "20509:649458002;",
    "150/80A": "20509:66579689;",
    "155/80A": "20509:3959184;",
    "160/84A": "20509:6215318;",
    "165/88A": "20509:3267942;",
    "170/92A": "20509:3267943;",
    "175/96A": "20509:3267944;",
    "175/100A": "20509:71744989;",
    "180/108B": "20509:-1001;",
    "185/112C": "20509:-1002;"
};

// getAjaxUrlList("MEN", "0", "2858");
getProductDetail("28853011");
