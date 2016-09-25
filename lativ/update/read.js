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

var DATA = require("./config").data;

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
function hex(productId){
    var arr = '0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f'.split(","),
        str = productId +"",
        value = "";
    for(var i=0; i<24; i++){
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

var productDetail = function(url, callback){
    this.product = {};

    this.COLOR = _.extend({}, COLOR);
    this.SIZE = {};

    this.cNum = 1001;
    this.sNum = 1001;
    this.cache = {};

    this.callback = callback || function(){};

    this.zhutuPhoto = {};
    this.descPhoto = [];

    this.sizePre = "20509";

    this.init(url);
};

productDetail.prototype = {
    /**
     * 获取商品详情
     * [productDetail description]
     * @param  {[type]}   url      [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    init: function(url){
        var product = this.product,
            _this = this;
        request.get(url)
            .end(function(err, res){
                if(err) return console.log(err);

                res.text.replace("\\r", "").replace("\\n", "");
                var $ = cheerio.load(res.text, {decodeEntities: false}),
                    text = res.text.toString(),
                    index = text.indexOf("$.product.Generate"),
                    html = "",
                    id = "",
                    title = "",
                    desc = "",
                    price = $("#price").text();

                var showPic = [];
                $(".product_s_img > a").each(function(){
                    showPic.push(this.attribs.href);
                });
                $(".right_col").remove();

                $("img").each(function(i, item) {
                    var $item = $(item);
                    $item.attr("src", $item.attr("data-original"));
                });

                $(".oldPic img").attr("style", "WIDTH: 750px;").prepend("<p>");

                $("[data-original]").attr("data-original", "");
                $("a").attr("href", "javascript:;");
                $(".tag").remove();

                title = $(".title1").text().trim();
                title = "台湾诚衣正品lativ2016热销" + title.slice(0, title.indexOf("（"));
                desc = $(".label").html() + $(".oldPic.show").html();

                console.log(url);
                id = text.slice(index, index + 40).toString().match(/\d+/)[0];

                product.price = $("#price").text();
                product.title = title;
                product.subtitle = title;
                _this.disposeDescription(id, desc, function(){
                    detailConfig.Referer = url;
                    _this.getProduct(url.split("Detail/")[1], showPic);
                });
            });
    },
    // 获得该商品的数目、尺寸和颜色
    getProduct: function(productId, showPic){
        var product = this.product,
            _this = this;
        request.get("http://www.lativ.com/Product/ProductInfo/?styleNo=" + productId.slice(0, 5))
            .set(detailConfig)
            .end(function(err, res) {
                if (err) return console.log(err);

                var data = JSON.parse(JSON.parse(res.text).info);
                var activity = JSON.parse(JSON.parse(res.text).activity);

                // if( activity.Discount ){
                //     if( /1件/.test(activity.ActivityName) ){
                //         if( activity.Discount < 1 ){
                //             product.price = Math.ceil(product.price * activity.Discount);
                //         }else{
                //             product.price = parseInt(activity.Discount);
                //         }
                //     }
                // }
                // product.price = Number(product.price);

                _this.dataMatch(productId);

                //宝贝类目
                _this.cid();

                _this.cateProps(data);

                _this.skuProps(data);

                _this.picture(data, showPic, productId);
                _this.callback(err, _this.product, _this.zhutuPhoto, _this.descPhoto);
            });
    },
    // 数据处理
    dataMatch: function(productId) {
        var product = this.product;
        // 属性值备注
        product.cpv_memo = "";

        product.stuff_status = 1;
        product.location_state = "上海";
        product.location_city = "上海";
        product.item_type = 1;
        product.auction_increment = "0";
        product.valid_thru = 7;
        product.freight_payer = 2;
        product.post_fee = "1.4139E-38";
        product.ems_fee = "2.8026e-45";
        product.express_fee = 0;
        product.has_invoice = 0;
        product.has_warranty = 0;
        product.approve_status = 1;
        product.has_showcase = 1;
        product.list_time = "";
        //邮费模板
        // product.postage_id = 5478758160;
        // 59包邮
        product.postage_id = 8151607820;

        product.has_discount = 0;
        product.list_time = "";
        product.modified = "";
        product.upload_fail_msg = 200;
        product.picture_status = "1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;";
        product.auction_point = "0";

        product.video = "";  //TODO

        // 这是为了货店通的需要，所以加上
        product.outer_id = productId;

        //宝贝分类
        product.navigation_type = 2;

        product.is_lighting_consigment = "32";
        product.sub_stock_type = 2;
        product.syncStatus = "1";
        product.user_name = "623064100_00";
        product.features = "mysize_tp:-1;sizeGroupId:136553091;sizeGroupType:women_top";


        // 数字ID

        product.num_id = DATA[productId];

        product.is_xinpin = "248";
        product.auto_fill = "0";
        product.item_suze = "bulk:0.000000";
        product.global_stock_type = "-1";
        product.qualification = "%7B%20%20%7D";
        product.add_qualification = 0;
        product.o2o_bind_service = 0;
        product.newprepay = 1;

        // 自定义属性
        product.input_custom_cpv = "";
        //宝贝属性
        product.cateProps = "";

        product.propAlias = "";



        this.seller_cids();
    },
    // 宝贝描述处理
    disposeDescription: function(id, desc, callback){
        var product = this.product,
            _this = this;
        var photos = [],
            style = "",
            reminder = "";
        desc = desc.trim();
        desc =  desc.replace(/\r|\n/gm, "")
                .replace(/\"/gm, "'")
                .replace(/,/gm, "，")
                .replace(/data-original=\'\'/gm, "")
                .replace(/http(s?):\/\/s[0-9].lativ.com\/(.*?).(jpg|png|gif)/gm, function(match, escape, interpolate, evaluate, offset){
                    photos.push(match);
                    var arr = interpolate.split("/");
                    return "FILE:\/\/\/E:/github/pachong/lativ/data/img/"+ arr[arr.length - 1] + "." + evaluate;
                });

        reminder = "<P align='center'><IMG src='https:\/\/img.alicdn.com/imgextra/i1/465916119/TB25486tpXXXXa.XpXXXXXXXXXX_!!465916119.png'><\/P>";

        _this.getReport("Size", id, function(err, sizeStr){
            _this.getReport("Try", id, function(err, tryStr){
                desc = reminder + sizeStr + tryStr + desc;
                product.description = desc;

                _this.descPhoto = _this.descPhoto.concat(photos);

                callback();
            });
        });
    },
    // 宝贝类目
    cid: function(){
        var product = this.product,
            title = product.title,
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
                cid = "50010402";
                product.cateProps += "20000:29534;42722636:20213;122216345:29457;122216507:3226292;122216515:29535;122216586:29947;";
            }
            if( /T恤/i.test(title) ){
                cid = "50000436";
                product.cateProps += "20551:22252803;20663:29447;42722636:248572013;122216345:29457;122216348:29445;122216507:3226292;122216515:29535;122216586:29947;";
            }
            if( /背心/.test(title) ){
                cid = "50011153";
                product.cateProps += "20000:29534;42722636:20213;122216515:29535;122216586:29947;122276315:3273241;";
            }
            if( /衬衫/.test(title) ){
                cid = "50011123";
                product.cateProps += "20000:29534;20663:20213;42722636:20213;122216345:29938;122216348:29444;122216507:3226292;122216515:29535;122216586:29947;";
            }
            if( /牛仔裤/.test(title) ){
                cid = "50010167";
                product.cateProps += "20000:29534;42722636:248572013;122216515:29535;122276111:20525;";
                //尺寸 20518
                this.sizePre = "20518";
            }
            if( /短裤|中裤|沙滩裤|五分裤|七分裤|松紧短裤/.test(title) ){
                cid = "50023108";
                product.cateProps += "20000:29534;122216608:20532;";
                product.inputPids = "20000610347613000000";
                product.inputValues = "lativ,"+ product.price +",短裤";
                product.subtitle = "";
            }
            if( /三角短裤|平角短裤|平脚短裤|棉质短裤|印花短裤/.test(title) ){
                cid = "50008882";
                product.cateProps += "20000:29534;24477:20532;";
                product.inputPids = "166332348";
                product.inputValues = "1条";
                product.subtitle = "";
            }
            if( /长裤|松紧裤|休闲裤/.test(title) ){
                cid = "3035";
                product.cateProps += "20000:29534;42722636:248572013;122216515:29535;122216586:29947;122276111:20525;";
                //尺寸 20518
                this.sizePre = "20518";
            }
            if( /运动T恤/i.test(title) ){
                cid = "50013228";
                product.cateProps += "20000:29534;20663:29447;122216348:29445;122216608:20532;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price + ",other";

                this.sizePre = "20509";
                // 尺寸 20509
                // propAlias   这里要把自定义属性值改成销售属性别名
                // 20509:29696:其它尺码
            }
            if( /运动短裤/i.test(title) ){
                cid = "50023108";
                product.cateProps += "20000:29534;122216608:20532;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price + ",短裤";
            }
            if( /运动(.*?)长裤|运动(.*?)紧身裤|紧身裤/i.test(title) ){
                cid = "50023107";
                product.cateProps += "20000:29534;122216608:20532;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price + ",长裤";
            }
            if( /羽绒/.test(title) ){
                cid = "50011167";
                product.cateProps += "20000:29534;6861561:20213;42722636:20213;122216515:29535;122216562:3226292;";
            }
            if( /风衣/.test(title) ){
                 cid = "50011159";
                product.cateProps += "20000:29534;31611:26486055;42722636:20213;122216345:29938;122216515:29535;122216562:3226292;122216586:29947;";
            }
            if( /西服/.test(title) ){
                 cid = "50010160";
                product.cateProps += "20000:29534;31611:3267617;42722636:20213;122216507:3226292;122216515:29535;122216586:29947;122276377:3267910;";
            }
            if( /茄克|外套/.test(title) ){
                cid = "50011739";
                product.cateProps += "20000:29534;122216608:20532;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price +",茄克/外套";
            }
            if( /羽绒/.test(title) ){
                cid = "50011167";
                product.cateProps += "20000:29534;6861561:20213;42722636:20213;122216515:29535;122216562:3226292;";
            }
            if( /棉衣/.test(title) ){
                cid = "50011165";
                product.cateProps += "20000:29534;42722636:20213;122216515:29535;122216562:3226292;122216586:29947;";
            }
        }

        // 衬衫-女  162104
        // T恤-女 50000671
        // 吊带-背心-女 50010394
        // 短裤-女 50023108
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

        if( /女|bra/i.test(title) ){
            if( /T恤|中袖|长衫|七分袖/i.test(title) ){
                cid = "50000671";
                product.cateProps += "20021:105255;13328588:492838734;";
            }
            if( /POLO/i.test(title) ){
                cid = "50022889";
                product.cateProps += "20000:109712276;122216608:20533;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price +",POLO衫";
            }
            if( /吊带|背心/.test(title) ){
                cid = "50010394";
                product.cateProps += "20000:29534;20021:105255;24477:20533;";
            }
            if( /文胸/.test(title) ){
                cid = "50008881";
                product.cateProps += "20000:29534;5260022:113084;122216483:103092;122216591:3269820;122216608:3269958;122442403:3269842;122508284:607964276;";

                // 尺寸 122508275
                this.sizePre = "122508275";
            }
            if( /雪纺/.test(title) ){
                cid = "162116";
                product.cateProps += "122216347:828914351;";
            }
            if( /针织/.test(title) ){
                cid = "50000697";
                product.cateProps += "20551:105255;13328588:492838732;122216347:828914351;";
            }
            if( /衬衫/.test(title) ){
                cid = "162104";
                product.cateProps += "20021:105255;13328588:492838731;";
            }
            if( /西装/.test(title) ){
                cid = "50008897";
                product.cateProps += "122216347:728146012;";
            }
            if( /连衣裙/.test(title) ){
                cid = "50010850";
                product.cateProps += "122216347:828914351;";
            }

            if( /运动(.*?)短裤|短裤|中裤|七分裤|宽腿裤/.test(title) ){
                cid = "50023108";
                product.cateProps += "20000:29534;122216608:20533;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price + ",短裤";

                // 尺寸 20509
                this.sizePre = "20509";
            }
            if( /内裤|三角短裤|平脚短裤|生理裤|安全裤|平口裤/.test(title) ){
                cid = "50008882";
                product.cateProps += "20000:29534;24477:20533;122216608:3267959;";
                product.inputPids = "166332348";
                product.inputValues = "1条";
                product.subtitle = "";
            }
            if( /短裙|牛仔(.*?)裙|紧身裙|窄裙|迷你裙|中裙|裤裙|裙裤|喇叭裙|印花长裙/.test(title) ){
                cid = "1623";
                product.cateProps += "122216347:828914351;";
            }
            if( /长裤|休闲裤|紧身裤|九分裤|紧身裤|踩脚裤|带裤紧身窄裙|百搭裤|松紧裤/.test(title) ){
                cid = "162201";
                //尺寸 20518
                this.sizePre = "20518";
            }
            if( /牛仔裤|牛仔(.*?)裤/.test(title) ){
                cid = "162205";
                product.cateProps += "122216347:828914351;";
                //尺寸 20518
                this.sizePre = "20518";
            }
            if( /运动(.*?|[^POLO])衫/i.test(title) ){
                cid = "50011717";
                product.cateProps += "20000:29534;122216608:20533;";
                product.inputPids = "1302175161034760000000";
                product.inputValues = product.price + ",运动卫衣/套头衫";
            }
            if( /运动(.*?)T恤|运动(.*?)吊带衫|运动(.*?)背心/.test(title) ){
                cid = "50013228";
                product.cateProps += "20000:29534;20663:29448;122216348:29445;122216608:20533;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price + ",T恤";
            }
            if( /运动(.*?)长裤|运动(.*?)裤/.test(title) ){
                cid = "50023107";
                product.cateProps += "20000:29534;122216608:20533;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price + ",长裤";
            }

            if( /羽绒大衣|羽绒(.*?)外套/.test(title) ){
                cid = "50008899";
                product.cateProps += "20000:29534;122216347:740138901;";
            }
            if( /茄克|外套|连帽/.test(title) ){
                cid = "50011739";
                product.cateProps += "20000:29534;122216608:20533;";
                product.inputPids = "610347613021751";
                product.inputValues = product.price +",茄克/外套";
            }
            if( /风衣|连帽外套/.test(title) ){
                cid = "50008901";
                product.cateProps += "122216347:728146012;";
            }
            if( /大衣/.test(title) ){
                cid = "50013194";
                product.cateProps += "20021:20213;13328588:492838731;122216347:728146012;";
            }
            if( /羽绒/.test(title) ){
                cid = "50008899";
                product.cateProps += "20000:29534;122216347:740138901;1627207:28332;20509:6215318;";
            }
            if( /棉衣/.test(title) ){
                cid = "50008900";
                product.cateProps += "20000:29534;122216347:740138901;";
            }
        }
        if( !cid ){
            cid = "50000671";
            product.cateProps += "20021:105255;13328588:492838734;";
        }
        product.cid = cid;
    },
    //宝贝分类
    seller_cids: function(){
        var product = this.product,
            title = product.title;
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
            product.seller_cids = SELLER_CIDS[type][attr];
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
            product.seller_cids = value;
        }
    },
    input_custom_cpv: function(type, value, size){
        var cache = this.cache,
            product = this.product,
            sizePre = this.sizePre;

        var data = type === 'color' ? this.COLOR : this.SIZE;

        if( type == 'color' ){
            if( !data[value] ){
                data[value] = "1627207:-"+ this.cNum + ";";
                product.input_custom_cpv += "1627207:-" + this.cNum + ":"+ value +";";
                this.cNum++;
            }
        }
        if( type == 'size' ){
            if( !value.trim() ){
                value = size;
            }
            if( !data[value] ){
                data[value] = sizePre +":-"+ this.sNum + ";";
                product.input_custom_cpv += sizePre +":-" + this.sNum + ":"+ value + "("+ size +");";
                this.sNum++;
            }else{
                if( !cache[value] ){
                    product.cpv_memo += data[value].slice(0, -1) + ":" + size +";";
                    cache[value] = 1;
                }
            }
        }
        return data[value];
    },
    propAlias: function(value, size){
        var cache = this.cache,
            product = this.product,
            sizePre = this.sizePre;

        var SIZE = this.SIZE,
            item = "20509:";

        if( !value.trim() ){
            value = size;
        }
        if( !SIZE[value] ){
            item += this.propPrex++;
            SIZE[value] = item + ";";
            product.propAlias += item + ":"+ value + "("+ size +");";
        }
        return SIZE[value];
        // 20509:28313:XS(XS);
        // 20509:28314:155/80A(S);
        // 20509:28315:160/84A(M);
        // 20509:28316:160/88A(L);
        // 20509:28317:165/92A(XL);
        // 20509:28318:170/96A(XXL);
        // 20509:28319:XXXL(XXXL);
        // 20509:29696:其它尺码(xxs);
    },
    // 宝贝属性
    cateProps: function(datas) {
        var _this = this,
            product = this.product;
        product.cateProps += "";
        // product.cateProps += "20021:105255;13328588:492838733;";
        var str = "",
            i = 0;

        if( /50022889|50013228|162104|50011739|50011717|50023108|50023107/.test(product.cid) ){
            this.propPrex = 28313;
            datas.forEach(function(data) {
                product.cateProps += _this.input_custom_cpv("color", data.color);

                data.ItemList.forEach(function(item) {
                    str += _this.propAlias(item['體型尺寸'], item.size);
                });
            });
        }else{
            datas.forEach(function(data) {
                product.cateProps += _this.input_custom_cpv("color", data.color);

                data.ItemList.forEach(function(item) {
                    str += _this.input_custom_cpv("size", item['體型尺寸'], item.size);
                });
            });
        }
        product.cateProps += str;
    },
    // 销售属性组合
    skuProps: function(datas) {
        var str = "",
            numPrice = "",
            sizes = "",
            colors = "",
            num = 0;
        var _this = this,
            product = this.product,
            price = product.price,
            COLOR = this.COLOR,
            SIZE = this.SIZE;

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

        product.skuProps = str;
        product.num = num;
    },
    // 图片处理
    picture: function(datas, showPic, productId){
        var photos = {},
            pics = {},
            colors = [],
            zhutu = "",
            colorImg = "",
            i = 0,
            k = 0,
            s = 0;
        var product = this.product,
            COLOR = this.COLOR;

        for(var j=0, len = showPic.length; len > j; j++){
            pics[showPic[j]] = hex(productId);
        }
        datas.forEach(function(data, i) {
            colors.push(data.color);
            var id = "";
            for(var item in data.ItemList){
                var size = data.ItemList[item];
                id = "http://s2.lativ.com" + size.img280;
                break;
            }
            photos[id] = hex(productId);
        });
        for(var pic in pics){
            if( i < 5 ){
                zhutu +=  pics[ showPic[i] ] + ":1:" + i + ":|;" ;
            }
            i++;
        }
        for(var attr in photos){
            if( i < 5 ){
                zhutu += photos[attr] + ":1:" + i + ":|;" ;
            }
            colorImg += photos[attr] + ":2:0:" + COLOR[colors[k]].slice(0, -1) + "|;" ;
            i++;
            k++;
        }
        product.picture = zhutu + colorImg;
        _.extend(this.zhutuPhoto, photos, pics);
    },
    //获取商品的尺寸表/试穿表
    /**
     * [getReport description]
     * @param  {[type]}   type     Size\Try
     * @param  {[type]}   id       [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    getReport: function(type, id, callback){
        request.get("http://www.lativ.com/Product/"+ type +"Report?styleNo="+ id +"&hasModelInfo=True&hasFeatherContent=False")
            .end(function(err, res){
                if(err) return callback(err);

                var $ = cheerio.load( res.text , {decodeEntities: false});
                if( type == "Size" ){
                    $("img").attr("src", "https://img.alicdn.com/imgextra/i3/465916119/TB2AzL5tVXXXXXcXpXXXXXXXXXX_!!465916119.gif");
                }else if(type == "Try"){
                    $("img").attr("src", "https://img.alicdn.com/imgextra/i2/465916119/TB2X766tVXXXXbDXpXXXXXXXXXX_!!465916119.gif");
                }

                $("table").attr({
                    cellspacing: 0,
                    border: 1,
                    align: "center",
                    width: "100%"
                });

                callback(null, $(".panes").html().replace(/\r|\n/gm, "").trim());
            });
    }
};

exports.productDetail = function(url, callback){
    new productDetail(url, callback);
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
exports.downloadImg = function(photos, num, root, callback){
    downloadImg(photos, num, root, callback);
};

// 获取活动中的产品
exports.getActivity = function(activityNo, cacheID, callback){
    var cache = {},
        ids = [],
        category = ["WOMEN", "MEN", "SPORTS"],
        categoryIndex = 0,
        pageIndex = 1;
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
                    categoryIndex += 1;
                    if( category[categoryIndex] ){
                        pageIndex = 1;
                        getParam(activityNo, category[categoryIndex], pageIndex, cacheID, callback);
                    }else{
                        callback(null, ids);
                    }
                }

            });
    }
    getParam(activityNo, category[categoryIndex], pageIndex, cacheID, callback);
};


exports.getCategoryProduct = function(callback){
    var main = ["WOMEN", "MEN"],
        mainIndex = 0,
        cache = {},
        ids = [],
        urls = [],
        index = 0;
    function getCategory(category){
        request.get("http://www.lativ.com/" + category)
            .end(function(err, res){
                var $ = cheerio.load( res.text , {decodeEntities: false});
                var $a = $(".category").slice(0, -1).find("a");
                // console.log($(".category"));
                $a.each(function(i, item){
                    urls.push(item.attribs.href);
                });
                if( mainIndex < 2 ){
                    getCategory( main[++mainIndex] );
                }else{
                    getPageProducts(urls[index]);
                }
            });
    }
    getCategory(main[mainIndex]);

    function getPageProducts(url){
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
