var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
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
                        products = products.concat(data);
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
			    	html = "";
			    
			    html = $(".label").html() + $(".oldPic.show").html();

			    callback(null, {
			    	detail: html
			    });
    		});
};
