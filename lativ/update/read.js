var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    debug = require("debug")("blog:update:read");



var config = require("../lativConfig");

var categoryConfig = config.categoryConfig;
var detailConfig = config.detailConfig;
var COLOR = config.COLOR;
var SIZE = config.SIZE;
var SELLER_CIDS = config.SELLER_CIDS;

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
					href: $item.attr("href")
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
exports.categorytList = function(url, category, callback){
    debug("读取分类下产品: %s", url);

    categoryConfig.Referer = url;

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
            .set(categoryConfig)
            .end(function(err, res){
            	if(err) return callback(err);

                var data = JSON.parse(res.text);
                if( data && data.length ){
                    _.each(data, function(item, i){
                        var arr = item.image_140.split("/");
                        products.push({
                            urlId: arr[3],
                            productId: arr[2],
                            productName: item.ProductName
                        });
                    });
                    getAjaxUrlList(category, ++pageIndex, cacheID);
                }else{
                    callback(null, products);
                }
            });
    };
};

var zhutuPhoto = {};
var descPhoto = [];
function extend(source, target){
    for(var attr in target){
        source[attr] = target[attr];
    }
}
// 创建目录
function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split("/").forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}
// 随机创建32位16进制字符
function hex(){
    var arr = '0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f'.split(","),
        str = "",
        value = "";

    for(var i=0; i<32; i++){
        str += arr[Math.floor(Math.random()*16)];
    }
    if( hex.cache[str] ){
        arguments.callee();
    }else{
        hex.cache[str] = 1;
    }
    return str;
}
hex.cache = {};


var dataMatch = function(data) {
    data.seller_cids = seller_cids(data);

    data.stuff_status = 1;
    data.location_state = "上海";
    data.location_city = "上海";
    data.item_type = 1;
    data.auction_increment = "0";
    data.valid_thru = 7;
    data.freight_payer = 2;
    data.post_fee = "2.8026e-45";
    data.ems_fee = "2.8026e-45";
    data.express_fee = 0;
    data.has_invoice = 0;
    data.has_warranty = 0;
    data.approve_status = 1;
    data.has_showcase = 1;
    data.list_time = "";
    data.postage_id = 5478758160;
    data.has_discount = 0;
    data.list_time = "2016/7/21  21:17:33";
    data.modified = "2016/7/21  21:17:33";
    data.upload_fail_msg = 200;
    data.picture_status = "1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;";
    data.auction_point = "0";

    //宝贝类目
    // data.cid = "50000671";
    data.cid = cid(data);

    data.video = "";  //TODO

    //宝贝分类
    data.navigation_type = 1;

    data.is_lighting_consigment = "32";
    data.sub_stock_type = 2;
    data.syncStatus = "1";
    data.user_name = "623064100_00";
    data.features = "mysize_tp:-1;sizeGroupId:136553091;sizeGroupType:women_top";
    data.num_id = "0";
    data.is_xinpin = "248";
    data.auto_fill = "0";
    data.item_suze = "bulk:0.000000";
    data.global_stock_type = "-1";
    data.qualification = "%7B%20%20%7D";
    data.add_qualification = 0;
    data.o2o_bind_service = 0;
    data.newprepay = 1;

    // 自定义属性
    data.input_custom_cpv = "";
    //宝贝属性
    data.cateProps = "";
};

// 宝贝类目
var cid = function(data){
    var title = data.title,
        cid = "";
    

    // POLO-男  50020237
    // T恤-男  50000436
    // 背心-男  50011153
    // 短裤-男  124702002
    // 牛仔裤-男  50010167
    // 休闲裤-男  3035
    // 内裤-男  50008882
    // 运动T恤-男  50013228
    // 运动短裤-男  50023108
    // 运动长裤-男  50023107


    if( ~title.indexOf("男") ){
        if( /POLO/i.test(title) ){
            // cid = "50020237";
            cid = "50000436";
        }
        if( /T恤/i.test(title) ){
            cid = "50000436";
            data.cateProps += "20551:22252803;20663:29447;42722636:248572013;122216345:29457;122216348:29445;122216507:3226292;122216515:29535;122216586:29947;";
        }
        if( /背心/.test(title) ){
            cid = "50011153";
            data.cateProps += "20000:29534;42722636:20213;122216515:29535;122216586:29947;122276315:3273241;";
        }
        if( /三角短裤|平角短裤|棉质短裤|印花短裤/.test(title) ){
            cid = "50008882";
            data.cateProps += "20000:29534;24477:20532;";
            data.inputPids = "166332348";
            data.inputValues = "1条";
        }
        if( /牛仔裤/.test(title) ){
            cid = "50010167";
            data.cateProps += "20000:29534;42722636:248572013;122216515:29535;122276111:20525;";
            //尺寸 20518
        }
        if( /短裤|中裤|沙滩裤|五分裤|七分裤|松紧短裤/.test(title) ){
            cid = "124702002";
        }
        if( /长裤|松紧裤|休闲裤/.test(title) ){
            cid = "3035";
            data.cateProps += "20000:29534;42722636:248572013;122216515:29535;122216586:29947;122276111:20525;";
            //尺寸 20518
        }
        if( /运动T恤/i.test(title) ){
            cid = "50013228";
            data.cateProps += "20000:29534;20663:29447;122216348:29445;122216608:20532;";
            data.inputPids = "610347613021751";
            data.inputValues = data.price + ",T恤";

            // 尺寸 20509
            // propAlias   这里要把自定义属性值改成销售属性别名
            // 20509:29696:其它尺码
        }
        if( /运动短裤/i.test(title) ){
            cid = "50023108";
            data.cateProps += "20000:29534;122216608:20532;";
            data.inputPids = "610347613021751";
            data.inputValues = data.price + ",短裤";
        }
        if( /运动长裤/i.test(title) ){
            cid = "50023107";
            data.cateProps += "20000:29534;122216608:20532;";
            data.inputPids = "610347613021751";
            data.inputValues = data.price + ",长裤";
        }
    }


    // 衬衫-女  162104
    // T恤-女 50000671
    // 吊带-背心-女 50010394
    // 短裤-女 124244007
    // 短裙-女 1623
    // 连衣裙-女 50010850
    // 牛仔裤-女 162205
    // 文胸-女 50008881
    // 休闲裤-女 162201
    // 雪纺-女 162116
    // 针织-女 50000697
    // 内裤-女 50008882
    // 运动T恤-女 50013228
    // 运动短裤-女 50023108
    // 运动长裤-女 50023107

    if( ~title.indexOf("女") ){
        if( /T恤|中袖|七分袖/i.test(title) ){
            cid = "50000671";
            data.cateProps += "20021:105255;13328588:492838734;";
        }
        if( /吊带|背心/.test(title) ){
            cid = "50010394";
            data.cateProps += "20000:29534;20021:105255;24477:20533;";
        }
        if( /文胸/.test(title) ){
            cid = "50008881";
            data.cateProps += "20000:29534;5260022:113084;122216483:103092;122216591:3269820;122216608:3269958;122442403:3269842;122508284:607964276;";

            // 尺寸 122508275
        }
        if( /内裤|三角短裤|平脚短裤|生理裤|安全裤/.test(title) ){
            cid = "50008882";
            data.cateProps += "20000:29534;24477:20533;122216608:3267959;";
            data.inputPids = "166332348";
            data.inputValues = "1条";
        }
        if( /雪纺/.test(title) ){
            cid = "162116";
            data.cateProps += "122216347:828914351;";
        }
        if( /针织/.test(title) ){
            cid = "50000697";
            data.cateProps += "20551:105255;13328588:492838732;122216347:828914351;";
        }
        if( /衬衫/.test(title) ){
            cid = "162104";
            data.cateProps += "20021:105255;13328588:492838731;";
        }
        if( /连衣裙/.test(title) ){
            cid = "50010850";
            data.cateProps += "122216347:828914351;";
        }
        if( /短裤|中裤|七分裤|宽腿裤/.test(title) ){
            cid = "124244007";
            data.cateProps += "122216347:828914351;";
            data.inputPids = "20000";
            data.inputValues = "lativ";
        }
        if( /短裙|牛仔(.*?)裙|紧身裙|迷你裙|中裙|裙裤|喇叭裙|印花长裙/.test(title) ){
            cid = "1623";
            data.cateProps += "122216347:828914351;";
        }
        if( /牛仔裤|牛仔(.*?)裤/.test(title) ){
            cid = "162205";
            data.cateProps += "122216347:828914351;";
            //尺寸 20518
        }
        if( /长裤|休闲裤|紧身裤|九分裤|紧身裤/.test(title) ){
            cid = "162201";
            //尺寸 20518
        }
        if( /运动T恤|运动吊带衫|运动(.*?)背心/.test(title) ){
            cid = "50013228";
            data.cateProps += "20000:29534;20663:29448;122216348:29445;122216608:20533;";
            data.inputPids = "610347613021751";
            data.inputValues = data.price + ",T恤";
        }
        if( /运动中长裤|短裤/.test(title) ){
            cid = "50023108";
            data.cateProps += "20000:29534;122216608:20533;";
            data.inputPids = "610347613021751";
            data.inputValues = data.price + ",短裤";

            // 尺寸 20509
        }
        if( /运动长裤|运动(.*?)裤/.test(title) ){
            cid = "50023107";
            data.cateProps += "20000:29534;122216608:20533;";
            data.inputPids = "610347613021751";
            data.inputValues = data.price + ",长裤";
        }
    }

    // 话说这些类别都不好，只能使用T恤了。
    return cid;
};
//宝贝分类
var seller_cids = function(data){
    var title = data.title;
    var isSports = ~title.indexOf("运动");
    var type = "",
        attr = "";
    if( isSports ){
        type = "SPORTS";
        if( /女|bra/i.test(title) ){
            attr = "女装";
        }else{
            attr = "男装";
        }
        return SELLER_CIDS[type][attr];
    }else{
        if( /女/i.test(title) ){
            type = "WOMEN";
        }else{
            type = "MEN";
        }
        var items = SELLER_CIDS[type],
            value = "";
        for(var item in items){
            item.split("/").forEach(function(str){
                if(~title.indexOf(str)){
                    value = items[item];
                    return;
                }
            });
        }
        return value;
    }
};

var input_custom_cpv = (function(obj, type, value, size){
    var cNum = 1001,
        sNum = 1001,
        cache = {};
    return function(obj, type, value, size){
        var data = type === 'color' ? COLOR : SIZE;
    
        if( type == 'color' ){
            if( !data[value] ){
                data[value] = "1627207:-"+ cNum + ";";
                obj.input_custom_cpv += "1627207:-" + cNum + ":"+ value +";";
                cNum++;
            }
        }
        if( type == 'size' ){
            if( !value.trim() ){
                value = size;
            }
            if( !data[value] ){
                data[value] = "20509:-"+ sNum + ";";
                obj.input_custom_cpv += "20509:-" + sNum + ":"+ value + "("+ size +");";
                sNum++;
            }else{
                if( !cache[value] ){
                    obj.cpv_memo += data[value].slice(0, -1) + ":" + size +";";
                    cache[value] = 1;
                }
            }
        }
        return data[value];
    };
})();
// 宝贝属性
var cateProps = function(obj, datas) {
    obj.cateProps += "20021:105255;13328588:492838733;";
    // 属性值备注
    obj.cpv_memo = "";
    var str = "",
        i = 0;

    datas.forEach(function(data) {
        obj.cateProps += input_custom_cpv(obj, "color", data.color);

        data.ItemList.forEach(function(item) {
            str += input_custom_cpv(obj, "size", item['體型尺寸'], item.size);
        });
    });
    obj.cateProps += str;
};
// 销售属性组合
var skuProps = function(obj, datas) {
    var str = "",
        numPrice = "",
        sizes = "",
        colors = "",
        num = 0;
    var price = obj.price;

    datas.forEach(function(data) {
        colors = COLOR[data.color];

        data.ItemList.forEach(function(item) {
            num += item.invt;
            numPrice = price + ":" + item.invt + "::";
            if( item['體型尺寸'].trim() ){
                sizes = SIZE[item['體型尺寸']];
            }else{
                sizes = SIZE[item['size']];
            }
            str += numPrice + colors + sizes;
        });
    });

    obj.skuProps = str;
    obj.num = num;
};
// 图片处理
var picture = function(obj, datas){
    var photos = {},
        colors = [],
        zhutu = "",
        colorImg = "",
        i = 0;
    datas.forEach(function(data, i) {
        colors.push(data.color);
        var id = "";
        for(var item in data.ItemList){
            var size = data.ItemList[item];
            id = "http://s2.lativ.com" + size.img280;
            break;
        }
        photos[id] = hex();
    });

    for(var attr in photos){
        if( i < 5 ){
            zhutu += photos[attr] + ":1:" + i + ":|;" ;
        }
        colorImg += photos[attr] + ":2:0:" + COLOR[colors[i]].slice(0, -1) + "|;" ;
        ++i;
    }
    obj.picture = zhutu + colorImg;
    extend(zhutuPhoto, photos);
    // downloadImg(photos, 100, "./data/");
};
// 宝贝描述处理
var description = function(obj, id, desc) {
    var photos = [], style = "", reminder = "";
    desc = desc.trim();
    desc =  desc.replace(/\r|\n/gm, "")
            .replace(/\"/gm, "'")
            .replace(/data-original=\'\'/gm, "")
            .replace(/http(s?):\/\/s[0-9].lativ.com\/(.*?).(jpg|png|gif)/gm, function(match, escape, interpolate, evaluate, offset){
                photos.push(match);
                var arr = interpolate.split("/");
                return "FILE:\/\/\/E:/github/pachong/lativ/data/img/"+ arr[arr.length - 1] + "." + evaluate;
            });

    reminder = "<P align='center'><IMG src='https:\/\/img.alicdn.com/imgextra/i1/465916119/TB25486tpXXXXa.XpXXXXXXXXXX_!!465916119.png'><\/P>";
    
    getReport("Size", id, function(err, sizeStr){
        getReport("Try", id, function(err, tryStr){
            desc = reminder + sizeStr + tryStr + desc;
            obj.description = desc;
        });
    });

    descPhoto = descPhoto.concat(photos);
    // downloadImg(photos, 100, "./data/img/");
};

//获取商品的尺寸表/试穿表
/**
 * [getReport description]
 * @param  {[type]}   type     Size\Try
 * @param  {[type]}   id       [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var getReport = function(type, id, callback){
    request.get("http://www.lativ.com/Product/"+ type +"Report?styleNo="+ id +"&hasModelInfo=True&hasFeatherContent=False")
        .end(function(err, res){
            if(err) return callback(err);

            var $ = cheerio.load( res.text , {decodeEntities: false});
            if( type == "Size" ){
                $("img").attr("src", "https://img.alicdn.com/imgextra/i3/465916119/TB2AzL5tVXXXXXcXpXXXXXXXXXX_!!465916119.gif");
            }else if(type == "Try"){
                $("img").attr("src", "https://img.alicdn.com/imgextra/i2/465916119/TB2X766tVXXXXbDXpXXXXXXXXXX_!!465916119.gif");
            }

            $("table").css({
                borer: "1px solid #eee",
                width: "100%" 
            }).attr({
                cellspacing: 0,
                border: 1,
                align: "center"
            });

            callback(null, $(".panes").html().replace(/\r|\n/gm, "").trim());
        });
};


// 图片下载
var downloadImg = function(photos, num, root, callback){
    if( !(this instanceof downloadImg) ){
        return new downloadImg(photos, num, root, callback);
    }
    var _this = this;
    this._arr = [];
    if( mkdirsSync(root) ){
        var imgs = [];
        if( Object.prototype.toString.call(photos) === "[object Object]" ){
            _this._arr = photos;
            for(var attr in photos){
                imgs.push( attr );
            }
        }else{
            imgs = photos;
        }
        async.mapLimit(imgs, num, function(photo, cb){
            _this.requestAndwrite(photo, root, cb);
        }, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                callback && callback();
                console.log(result);
            }
        });
    }
};
downloadImg.prototype.requestAndwrite = function(url, root, callback){
    var _arr = this._arr;
    request.get(url).end(function(err, res) {
        if (err) {
            console.log("有一张图片请求失败啦...");
        } else {
            var fileName = "";
            if( _arr && _arr[url] ){
                fileName = _arr[url]+ ".tbi";
            }else{
                fileName = path.basename(url);
            }
            fs.writeFile(root + fileName, res.body, function(err) {
                if (err) {
                    console.log("有一张图片写入失败啦...");
                } else {
                    callback(null, "successful !");
                    /*callback貌似必须调用，第二个参数为下一个回调函数的result参数*/
                }
            });
        }
    });
};

/**
 * 获取商品详情
 * [productDetail description]
 * @param  {[type]}   url      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.productDetail = function(url, productid, callback){
    debug("读取产品详情: %s", url);

    var product = {};
    request.get(url)
		.end(function(err, res){
        	if(err) return callback(err);

            res.text.replace("\\r", "").replace("\\n", "");
            var $ = cheerio.load(res.text, {decodeEntities: false}),
                text = res.text.toString(),
                index = text.indexOf("$.product.Generate"),
                html = "",
                id = "",
                title = "",
                desc = "",
                price = $("#price").text();

            
            $("img").each(function(i, item) {
                var $item = $(item);
                $item.attr("src", $item.attr("data-original"));
            });

            $(".oldPic img").attr("style", "WIDTH: 750px;").prepend("<p>");

            $("[data-original]").attr("data-original", "");
            $("a").attr("href", "javascript:;");
            $(".tag").remove();

            title = $(".title1").text().trim();
            title = "台湾lativ正品2016夏季热销新款" + title.slice(0, title.indexOf("（"));
            desc = $(".label").html() + $(".oldPic.show").html();

            id = text.slice(index, index + 40).toString().match(/\d+/)[0];

            product.price = $("#price").text();
            product.title = title + productid;
            product.subtitle = title;

            description(product, id, desc);

            detailConfig.Referer = url;
            getProduct(id,  product, callback);
		});
};
// 获得该商品的数目、尺寸和颜色
var getProduct = function(id, product, callback){
    request.get("http://www.lativ.com/Product/ProductInfo/?styleNo=" + id)
        .set(detailConfig)
        .end(function(err, res) {
            if (err) return console.log(err);

            var data = JSON.parse(JSON.parse(res.text).info);
            var activity = JSON.parse(JSON.parse(res.text).activity);

            if( activity.Discount ){
                if( /1件/.test(activity.ActivityName) ){
                    if( activity.Discount < 1 ){
                        product.price = Math.ceil(product.price * activity.Discount);
                    }else{
                        product.price = parseInt(activity.Discount);
                    }
                }
            }
            product.price = Number(product.price) + 5;

            dataMatch(product);

            cateProps(product, data);

            skuProps(product, data);

            picture(product, data);

            callback(err, product, zhutuPhoto, descPhoto);
        });
};
exports.downloadImg = function(photos, num, root, callback){
    downloadImg(photos, num, root, callback);
};

// 获取活动中的产品
exports.getActivity = function(activityNo, mainCategory, pageIndex, cacheID, callback){
    var cache = {},
        ids = [];

    function getParam(activityNo, mainCategory, pageIndex, cacheID){
        var url = "http://www.lativ.com/Product/GetOnSaleList?activityNo="+ activityNo +"&mainCategory="+ mainCategory +"&pageIndex="+ pageIndex +"&cacheID="+ cacheID;
        request.get(url)
            .set({
                "_1_auth": "S9Bc5scO1d8dS16GOCJ0mpkcSegR3z",
                "_1_ver": "0.3.0",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Encoding": "gzip, deflate, sdch",
                "Accept-Language": "zh-CN,zh;q=0.8",
                "Cache-Control": "max-age=0",
                "Connection": "keep-alive",
                "Cookie": "mCart=1470413101221; ASP.NET_SessionId=3mdq1hf3cpb0c5dyibxac10m; lativ_=dc25406f-aaf3-43ac-b351-2aca75b34c4e; fav_item=%7B%22login%22%3Afalse%2C%22item%22%3A%22%22%7D; Hm_lvt_56ad3bce3340fedae44bef6312d6df70=1470228492,1470312869,1470405270,1470413101; Hm_lpvt_56ad3bce3340fedae44bef6312d6df70=1470413204",
                "Host": "www.lativ.com",
                "Referer": "http://www.lativ.com/OnSale/" + activityNo,
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
                "X-Requested-With": "XMLHttpRequest"
            })
            .end(function(err, res){
                if(err) {
                    callback(err);
                    return;
                }
                var SaleInfo = JSON.parse(JSON.parse(res.text).SaleInfo);
                if( SaleInfo.length ){
                    SaleInfo.forEach(function(item){
                        var arr = item["圖片"].split("/");
                        if( !cache[arr[2]] ){
                            ids.push(arr[3]);
                            cache[arr[2]] = 1;
                        }
                    });

                    getParam(activityNo, mainCategory, ++pageIndex, cacheID);
                }else{
                    callback(null, ids);
                }

            });
    }

    getParam(activityNo, mainCategory, pageIndex, cacheID, callback);
    
};
