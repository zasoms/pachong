
var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    debug = require("debug")("blog:update:read");

/*
request.get("http://m.lativ.com/Detail/25544011")
	.set({
		// Referer: http://m.lativ.com/WOMEN/accessories/belts
		"Upgrade-Insecure-Requests": 1,
		"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
	})
    .end(function(err, res){
        if(err) return console.log(err);
            var $ = cheerio.load(res.text, {decodeEntities: false});

            console.log( $(".product-report .product-size").html() );
    });

//获取手机端的页面详情，这样请求就会少很多。
*/
/*
var parser = require('node-csv-parse'),
    fs = require('fs'),
    row = 62,
    arr = [],
    online = [],
    config = {},
    i = 0,
    sum = 0;

fs.readFile('./lativ.csv', 'utf8', (err, data) => {
    if(err) { throw err; }
    data = data.split("\t");
    // console.log( data.length )
    sum = Math.floor(data.length / row);
    while ( i < sum ) {
        i++;
        var line = data.splice(i * row, row);
        line.length && arr.push(line);
    }
    for(var j=0, jlen=arr.length; j<jlen; j++){
        var key = arr[j][33];
        var value = arr[j][36];

        if( key ){
            key = key.replace(/\"/g,"");
            online.push( key );
            config[ key ] = value;
        }
    }
    fs.writeFile("./update/online.js", "exports.data=" + JSON.stringify(online));
    fs.writeFile("./update/config.js", "exports.data=" + JSON.stringify(config));
});
*/
function findData(category, arr) {
    for (var i = arr.length - 1, item; item = arr[i]; i--) {
        if (item.category == category) {
            return i;
        }
    }
    return -1;
}
function findTogether(callback){
    var categories = [],
        ids = [];
    request.get("http://www.lativ.com/SpecialIssue/together")
        .end(function(err, res){
            var $ = cheerio.load(res.text, { decodeEntities: false });

            $(".specialcontent [name^=category] img").each(function(){
                var category = {
                    categoryName: this.attribs.alt + "-TOGETHER"
                };
                categories.push( category );
            });
            $(".list_display_5").each(function(i){
                var lists = [];
                $(this).find("a").each(function(){
                    var id = this.attribs.href.match(/\d{1,}/g)[0];
                    lists.push( id );
                    ids.push( id );
                });
                categories[i].lists = lists;
            });
            callback( ids, categories );
        });
}

function getIds( ids ){
    var cache = {},
        id = "",
        prefix = "",
        lists = [];
    for(var i=0, len = ids.length; i<len; i++){
        id = ids[i];
        prefix = id.slice(0, 5);
        if( !cache[prefix] ){
            lists.push(id);
            cache[prefix] = 1;
        }
    }
    return lists;
}

var getCategoryProduct = function(callback) {
    var main = ["WOMEN", "MEN", "BABY"],
        mainIndex = 0,
        urls = [],
        ids = [],
        datas = [],
        categories = [],
        index = 0;

    function getCategory(category) {
        request.get("http://www.lativ.com/" + category)
            .end(function(err, res) {
                var $ = cheerio.load(res.text, { decodeEntities: false });
                var $a = $(".category").find("a");
                $a.each(function(i, item) {
                    urls.push({
                        categoryName: $(item).closest("ul").siblings("h2").text() + '-' + main[mainIndex],
                        href: item.attribs.href
                    });
                    datas.push(item.attribs.href);
                });
                if (mainIndex < 2) {
                    getCategory(main[++mainIndex]);
                } else {
                    getPageProducts(urls[index]);
                }
            });
    }
    getCategory(main[mainIndex]);

    function getPageProducts(params){
        var lists = [],
            cache = {};
        request.get("http://www.lativ.com"+ params.href)
            .end(function(err, res){
                if(err){
                    return callback && callback(err);
                }
                var $ = cheerio.load(res.text);
                var $imgs = $(".specialmain img");

                $imgs.each(function(i, item) {
                    var info = item.attribs["data-original"].split("/"),
                        productId = info[4],
                        product = "" + info[5];
                    if (!cache[productId]) {
                        cache[productId] = 1;
                        ids.push(product);
                        lists.push(product);
                    }
                });
                var productIndex = findData(params.categoryName, categories);

                if (productIndex >= 0) {
                    categories[productIndex].lists = categories[productIndex].lists.concat(lists);
                } else {
                    categories.push({
                        categoryName: params.categoryName,
                        lists: lists
                    });
                }
                if (index < urls.length - 1) {
                    getPageProducts(urls[++index]);
                } else {
                    findTogether(function(ids, cats){
                        ids = getIds(ids.concat( ids ));
                        categories = categories.concat( cats );
                        callback(null, ids, categories);
                    });
                }
            });
    }
};

getCategoryProduct(function( err ,ids, products){
    console.log(ids, products);
});