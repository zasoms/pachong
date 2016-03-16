var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    _ = require("underscore"),
    debug = require("debug")("blog:update:read");


var config = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, sdch",
    "Accept-Language": "zh-CN,zh;q=0.8",
    "Connection": "keep-alive",
    "Host": "www.lativ.com",
    // "Referer": "http://www.lativ.com/WOMEN",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
};


var detailConfig = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, sdch",
    "Accept-Language": "zh-CN,zh;q=0.8",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Host": "www.lativ.com",
    // "If-Modified-Since": "Tue, 15 Mar 2016 11:53:29 GMT",
    // "Referer": "http://www.lativ.com/Detail/25546021",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
};


/**
 * 获取产品分类
 * @method classList
 * @param  {[type]}   url      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.classList = function(url, callback){
    debug("读取产品分类列表: %s", url);

	request.get(url)
			.end(function(err, res){
				if(err) return callback(err);

				var $ = cheerio.load( res.text );

				var categorise = [];
				$("#nav a").each(function(i, item){
					var $item = $(item);
					categorise.push({
						rel: $item.attr("rel"),
						name: $item.text().trim(),
						href: $item.attr("href"),
						id: i+1
					});
				});

				callback(null, categorise);
			});
};

/**
 * 获取分类下的产品
 * @param  {[type]}   url      [description]
 * @param  {[type]}   category [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.productList = function(url, category, callback){
    debug("读取分类下产品: %s", url);

    config.Referer = url;

	var products = [];
	request.get(url)
            .end(function(err, res){
                if(err) return callback(err);

                var text = res.text.toString(),
                    index = text.indexOf("cacheID");
                    cacheID = text.slice(index+9, index+20).toString().match(/\d+/)[0];

                getAjaxUrlList(category, 0, cacheID);
            });


    var getAjaxUrlList = function(category, pageIndex, cacheID){
        var url = "http://www.lativ.com/Product/GetNewProductCategoryList?MainCategory="+ category +"&pageIndex="+ pageIndex +"&cacheID="+ cacheID;
        request.get(url)
                .set(config)
                .end(function(err, res){
                	if(err) return callback(err);

                    var data = JSON.parse(res.text);
                    if( data && data.length ){
                        _.each(data, function(item, i){
                            products.push({
                                title: item.ProductName,
                                stuff_status: 1,
                                location: "上海",
                                location_city: "上海",
                                item_type: 1,
                                price: +item.Price + 5,
                                auction_increment: 0,
                                valid_thru: 7,
                                navigation_type: category,
                                freight_payer: 1,
                                postage_id: 5478758160,
                                newprepay: 1,
                                sell_promise: 1,
                                image_140: item.image_140
                                // image_140: "http://s.lativ.com/"+item.image_140
                            });
                        });
                        setTimeout(function(){
                            pageIndex += 1;
                            getAjaxUrlList(category, pageIndex, cacheID);
                        }, 300);
                    }else{
                        callback(null, products);
                    }
                });
    };
};

/**
 * 获取商品详情
 * [productDetail description]
 * @param  {[type]}   url      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.productDetail = function(url, callback){
    debug("读取产品详情: %s", url);

    request.get(url)
    		.end(function(err, res){
            	if(err) return callback(err);

			    var $ = cheerio.load( res.text ),
                    text = res.text.toString(),
                    index = text.indexOf("$.product.Generate"),
			    	html = "",
                    id = "";

			    description = $(".label").html() + $(".oldPic.show").html();

                id = text.slice(index, index+40).toString().match(/\d+/)[0];

                getDetail( id, description );
    		});

    var getDetail = function(id, description){
        detailConfig.Referer = url;
        request.get("http://www.lativ.com/Product/ProductInfo/?styleNo="+ id)
                .set(detailConfig)
                .end(function(err, res){
                    if(err) return callback(err);

                    var data = JSON.parse(res.text).info;

                    callback(null, {
                        description: description,
                        // "input_custom_cpv": "",
                        // "": ""
                    });
                });
    };
};
