var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    debug = require("debug")("blog:update:read");


var cache = {};

const CATEGORY = {
    "女-T恤&POLO":       1251438469,
    "女-衬衫":           1251438470,
    "女-针织衫":         1251438471,
    "女-外套类":         1251438472,
    "女-裤装&裙装":      1251438473,
    "女-内衣&内裤&袜子": 1251438474,
    "女-起居服&配件":    1251438475,

    "男-T恤&POLO":       1251439047,
    "男-衬衫":           1251439048,
    "男-外套类":         1251439049,
    "男-裤装":           1251439050,
    "男-内衣&内裤&袜子": 1251439051,
    "男-起居服&配件":    1251439052,

    "亲子装-印花T恤":    1276391404,
    "亲子装-上衣":       1276391405,
    "亲子装-POLO衫":     1276391406,
    "亲子装-外套":       1276391407,
    "亲子装-裤装":       1276391408,
    "亲子装-其他":       1276391409,
};
/*

 */


var arr = [
    {
        category: "123456",
        lists: [15454, 445454, 87977445, 4545, 45488],
    },
    {
        category: "123456",
        lists: [15454, 445454, 454545, 4545, 45488],
    }
];

arr.forEach(function(item){
    var category = item.category;
    item.lists.forEach(function(list){
        if( cache[list+''] ){
            console.log("add category", list);
            //如果已经存在这个产品了，那么就是给这个产品添加产品类型
            return ;
        }
        cache[list+''] = 1;

        // 进行数据的添加
        console.log(list);
    });
    // console.log(item.category);
});


var getCategoryProduct = function(callback){
    var main = ["WOMEN", "MEN", "SPORTS"],
        mainIndex = 0,
        cache = {},
        ids = [],
        urls = [],
        index = 0;
    function getCategory(category){
        request.get("http://www.lativ.com/" + category)
            .end(function(err, res){
                var $ = cheerio.load( res.text , {decodeEntities: false});
                var $a = $(".category").find("a");

                $a.each(function(i, item){
                    urls.push({
                        category: $(item).closest("ul").siblings("h2").text(),
                        href: item.attribs.href
                    });
                });
                if( mainIndex < 2 ){
                    getCategory( main[++mainIndex] );
                }else{
                    getPageProducts(urls[index]);
                }
            });
    }
    getCategory(main[mainIndex]);

    function getPageProducts(urls){
        request.get("http://www.lativ.com"+ url)
            .end(function(err, res){
                if(err){
                    return callback(err);
                }
                var $ = cheerio.load( res.text);
                var $imgs = $(".specialmain img");

                    $imgs.each(function(i, item){
                        var info = item.attribs["data-original"].split("/"),
                            productId = info[4],
                            product = "" + info[5];
                        if( !cache[productId] ){
                            cache[productId] = 1;
                            ids.push( product );
                        }
                    });
                if( index < urls.length - 1 ){
                    getPageProducts(urls[++index]);
                }else{
                    callback(null, ids);
                }
            });
    }
};
getCategoryProduct();