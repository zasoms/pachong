var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    debug = require("debug")("blog:update:read");

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
