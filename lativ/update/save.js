var async = require("async"),
	db = require("../config").db,
	debug = require("debug")("blog:update:save");

/**
 * 保存产品分类
 * [classList description]
 * @param  {[type]}   list     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.classList = function(list, callback){
	debug("保存产品分类到数据库: %d", list.length);

	async.eachSeries(list, function(item, next){
		db.query("SELECT * FROM `class_list` WHERE `rel`=? LIMIT 1", [item.rel], function(err, data){
			if( err ) return next(err);

			if( Array.isArray(data) && data.length >= 1 ){
				db.query(
					"UPDATE `class_list` SET `name`=?=?, `href`=?", 
					[item.name, item.href],
					next
				);
			}else{
				db.query(
					"INSERT INTO `class_list` (`id`, `name`, `ref`, `href`) VALUES('', ?, ?, ?)", 
					[item.name, item.rel, item.href],
					next
				);
			}
		});
	}, callback);
};

/**
 * 保存产品
 * [productDetail description]
 * @param  {[type]}   list     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.productList = function(list, callback){
    debug("保存产品到数据库: %d, %d", classid, list.length);

    async.eachSeries(list, function(item, next){
	    // 查询分类是否已存在
	    db.query("SELECT * FROM `product_list` WHERE `productid`=? LIMIT 1", [item.productid], function(err, data) {
	        if (err) return next(err);

	        if (Array.isArray(data) && data.length >= 1) {
	            //分类已经存在，更新一下
	            db.query(
	                "UPDATE `product_list` SET `product_name`=?, `price`=?, `value`=?, `discount`=?, WHERE `product_id`=?",
	                [item.product_name, item.price, item.value, item.discount],
	                next
	            );
	        } else {
	            //分类不存在，添加
	            db.query(
	                "INSERT INTO `product_list`(`id`, `product_id`, `product_name`, `price`, `value`, `discount`) VALUES (?, ?, ?, ?, ?, ?)",
	                ["", item.product_id, item.product_name, item.price, item.value, item.discount],
	                next
	            );
	        }
	    });

	}, callback);
};
