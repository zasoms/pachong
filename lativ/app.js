var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    path = require("path"),
    fs = require("fs"),
    json2csv = require("json2csv"),
    iconv = require("iconv-lite");


var config = require("./lativConfig");

var detailConfig = config.detailConfig;
var COLOR = config.COLOR;
var SIZE = config.SIZE;
var SELLER_CIDS = config.SELLER_CIDS;

function extend(source, target){
    for(var attr in target){
        source[attr] = target[attr];
    }
}
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
function hex(){
    var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "a", "b", "c", "d", "e", "f"],
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

var input_custom_cpv = function(obj, type, value){
    var data = type === 'color' ? COLOR : SIZE;

    if( type == 'color' ){
        if( !data[value] ){
            data[value] = "1627207:-"+ input_custom_cpv.color + ";";
            obj.input_custom_cpv += "1627207:-" + input_custom_cpv.color + ":"+ value +";";
            input_custom_cpv.color++;
        }
    }
    if( type == 'size' ){
        if( !data[value] ){
            data[value] = "20509:-"+ input_custom_cpv.size + ";";
            obj.input_custom_cpv += "20509:-" + input_custom_cpv.size + ":"+ value +";";
            input_custom_cpv.size++;
        }
    }
    return data[value];
};
input_custom_cpv.color= 1001;
input_custom_cpv.size= 1008;


var products = [];

var detailImgs = {};
var productImgs = {};


async.series([
    function(done){
        var i = 0,
            len = 0;
        var getProductDetail = function() {
            var list = [].slice.call(arguments);
            len = list.length;
            list.forEach(function(num){
                var obj = {};
                var url = "http://www.lativ.com/Detail/" + num;
                request.get(url)
                    .end(function(err, res) {
                        if (err) return console.log(err);

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
                            $(item).attr("src", $(item).attr("data-original"));
                            $(item).css("style", "max-width: 750px");
                        });

                        $("[data-original]").attr("data-original", "");
                        $("a").attr("href", "javascript:;");
                        $(".tag").remove();

                        title = $(".title1").text().trim();
                        title = "2016夏季新款" + title.slice(0, title.indexOf("（"));
                        desc = $(".label").html() + $(".oldPic.show").html();

                        obj.price = $("#price").text();
                        obj.title = title;
                        obj.subtitle = title;

                        description(obj, desc);

                        id = text.slice(index, index + 40).toString().match(/\d+/)[0];

                        detailConfig.Referer = url;
                        request.get("http://www.lativ.com/Product/ProductInfo/?styleNo=" + id)
                            .set(detailConfig)
                            .end(function(err, res) {
                                if (err) return callback(err);

                                var data = JSON.parse(JSON.parse(res.text).info);
                                var activity = JSON.parse(JSON.parse(res.text).activity);

                                if( activity.Discount ){
                                    if( activity.Discount < 1 ){
                                        obj.price = Math.ceil(obj.price * activity.Discount);
                                    }else{
                                        obj.price = parseInt(activity.Discount);
                                    }
                                }

                                dataMatch(obj);

                                cateProps(obj, data);

                                skuProps(obj, data);

                                picture(obj, data);

                                products.push(obj);
                                if( i == len - 1 ){
                                    done();
                                }else{
                                    i++;
                                }
                            });
                    });
            });
        };

        getProductDetail(
            "23217044",


            "26252012"
            );

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
            data.input_custom_cpv = "20509:-1004:155/84A;20509:-1005:160/88A;20509:-1001:165/84A;20509:-1006:165/92A;20509:-1007:170/96A;20509:-1002:180/108B;20509:-1003:185/112C;";
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
                    cid = "50020237";
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
                    data.cateProps += "20000:29534;24477:20533;";
                }
                if( /文胸/.test(title) ){
                    cid = "50008881";
                    data.cateProps += "20000:29534;5260022:113084;122216483:103092;122216591:3269820;122216608:3269958;122442403:3269842;122508284:607964276;";

                    // 尺寸 122508275
                }
                if( /内裤|三角短裤|平脚短裤|生理裤|安全裤/.test(title) ){
                    cid = "50008881";
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

            data.cid = cid;
        };

        //宝贝分类
        var seller_cids = function(data){
            var title = data.title;
            var isSports = ~title.indexOf("运动");
            var type = "",
                attr = "";
            if( isSports ){
                type = "SPORTS";
                if( ~title.indexOf("女") ){
                    attr = "女装";
                }else{
                    attr = "男装";
                }
                return SELLER_CIDS[type][attr];
            }else{
                if( ~title.indexOf("女") ){
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


        // 宝贝属性
        var cateProps = function(obj, datas) {
            obj.cateProps = "";
            var str = "",
                i = 0;

            datas.forEach(function(data) {
                obj.cateProps += input_custom_cpv(obj, "color", data.color);

                data.ItemList.forEach(function(item) {
                    str += input_custom_cpv(obj, "size", item['體型尺寸']);
                });
            });
            obj.cateProps += str;

        };
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
                    sizes = SIZE[item['體型尺寸']];
                    str += numPrice + colors + sizes;
                });
            });

            obj.skuProps = str;
            obj.num = num;
        };


        var picture = function(obj, datas){
            var imgs = {},
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
                imgs[id] = hex();
            });

            for(var attr in imgs){
                if( i < 5 ){
                    zhutu += imgs[attr] + ":1:" + i + ":|;" ;
                }
                colorImg += imgs[attr] + ":2:0:" + COLOR[colors[i]].slice(0, -1) + "|;" ;
                ++i;
            }
            obj.picture = zhutu + colorImg;
            downloadImg(imgs, 100, "./data/");
        };
        var description = function(obj, desc) {
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
            if( ~obj.title.indexOf("女") ){
                reminder += "<P align='center'><IMG src='https:\/\/img.alicdn.com/imgextra/i2/465916119/TB2UayntpXXXXcPXXXXXXXXXXXX_!!465916119.png'><\/P>";
            }else{
                reminder += "<P align='center'><IMG src='https:\/\/img.alicdn.com/imgextra/i4/465916119/TB2fSX2tpXXXXbJXpXXXXXXXXXX_!!465916119.png'><\/P>";
            }
            desc = reminder + desc;

            obj.description = desc;

            downloadImg(photos, 100, "./data/img/");
        };

        var downloadImg = function(photos, num, root){
            if( !(this instanceof downloadImg) ){
                return new downloadImg(photos, num, root);
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
                async.mapLimit(imgs, num, function(photo, callback){
                    _this.requestAndwrite(photo, root, callback);
                }, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
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
    },
    function(done){
        var en = ["title", "cid", "seller_cids", "stuff_status", "location_state", "location_city", "item_type", "price", "auction_increment", "num",
                        "valid_thru", "freight_payer", "post_fee", "ems_fee", "express_fee", "has_invoice", "has_warranty", "approve_status", "has_showcase",
                        "list_time", "description", "cateProps", "postage_id", "has_discount", "modified", "upload_fail_msg", "picture_status", "auction_point",
                        "picture", "video", "skuProps", "inputPids", "inputValues", "outer_id", "propAlias", "auto_fill", "num_id", "local_cid", "navigation_type",
                        "user_name", "syncStatus", "is_lighting_consigment", "is_xinpin", "foodparame", "features", "buyareatype", "global_stock_type", "global_stock_country",
                        "sub_stock_type", "item_size", "item_weight", "sell_promise", "custom_design_flag", "wireless_desc", "barcode", "sku_barcode", "newprepay", "subtitle",
                        "cpv_memo", "input_custom_cpv", "qualification", "add_qualification", "o2o_bind_service"];

        var zh = ["宝贝名称", "宝贝类目", "店铺类目", "新旧程度",  "省", "城市", "出售方式", "宝贝价格", "加价幅度", "宝贝数量","有效期", "运费承担",
                    "平邮", "EMS", "快递","发票", "保修", "放入仓库", "橱窗推荐", "开始时间", "宝贝描述", "宝贝属性", "邮费模版ID", "会员打折", "修改时间",
                    "上传状态", "图片状态", "返点比例", "新图片", "视频", "销售属性组合", "用户输入ID串", "用户输入名-值对", "商家编码", "销售属性别名",
                    "代充类型", "数字ID", "本地ID", "宝贝分类", "用户名称", "宝贝状态", "闪电发货", "新品", "食品专项", "尺码库", "采购地", "库存类型",
                    "国家地区", "库存计数", "物流体积", "物流重量", "退换货承诺", "定制工具", "无线详情", "商品条形码", "sku 条形码", "7天退货", "宝贝卖点",
                    "属性值备注", "自定义属性值", "商品资质", "增加商品资质", "关联线下服务"];

        json2csv({
            data: products,
            fields: en,
            fieldNames: zh,
            quotes: "",
            // del: ","
        }, function(err, csv){
            if( err ){
                console.log(err);
            }else{
                var newCsv = iconv.encode(csv, 'GBK');
                fs.writeFile("data.csv", newCsv, function(err){
                    if(err) throw err;
                    console.log("file saved");
                });
            }
        });
    }
])
