var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    path = require("path"),
    fs = require("fs"),
    json2csv = require("json2csv"),
    iconv = require("iconv-lite");

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
            });

            $("[data-original]").attr("data-original", "");
            $("a").attr("href", "javascript:;");

            title = $(".title1").text().trim();
            title = title.slice(0, title.indexOf("（"));
            desc = $(".label").html() + $(".oldPic.show").html();

            obj.title = title;
            obj.subtitle = title;
            obj.price = $("#price").text();
            obj.description = description( desc );

            id = text.slice(index, index + 40).toString().match(/\d+/)[0];

            detailConfig.Referer = url;
            request.get("http://www.lativ.com/Product/ProductInfo/?styleNo=" + id)
                .set(detailConfig)
                .end(function(err, res) {
                    if (err) return callback(err);

                    var data = JSON.parse(JSON.parse(res.text).info);

                    cateProps(obj, data);

                    skuProps(obj, data);

                    dataMatch(obj);
                });
        });
};

var dataMatch = function(data) {
    data.seller_cids = "1194597117";

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

    data.picture = "";  //TODO
    data.video = "";  //TODO

    //宝贝分类
    data.navigation_type = "";  //TODO


    data.is_lighting_consigment = "32";
    data.syncStatus = "1";
    data.user_name = "623064100_00";
    data.features = "mysize_tp:-1;sizeGroupId:136553091;sizeGroupType:women_top";
    data.num_id = "0";
    data.is_xinpin = "248";
    data.auto_fill = "0";
    data.item_suze = "bulk:0.000000";
    data.global_stock_type = "-1";
    data.add_qualification = 1;
    data.newprepay = 1;

    result(data);
};

// 宝贝类目
var cid = function(data){
    //TODO
    return "";
};

// 宝贝属性
var cateProps = function(obj, datas) {
    obj.cateProps = "20021:105255;13328588:492838734;";
    var str = "",
        i = 0;

    datas.forEach(function(data) {
        obj.cateProps += color[data.color];

        if (i === 0) {
            i = 1;
            data.ItemList.forEach(function(item) {
                str += size[item['體型尺寸']];
            });
        }
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
        colors = color[data.color];

        data.ItemList.forEach(function(item) {
            num += item.invt;
            numPrice = price + ":" + item.invt + ";";
            sizes = size[item['體型尺寸']];
        });
        str += numPrice + colors + sizes;
    });

    obj.skuProps = str;
    obj.num = num;
};
var description = function(desc) {
    var photos = [];
    desc = desc.trim();
    desc =  desc.replace(/\r|\n/gm, "")
            .replace(/\"/gm, "'")
            .replace(/data-original=\'\'/gm, "")
            .replace(/http(s?):\/\/s[0-9].lativ.com\/(.*?).(jpg|png|gif)/gm, function(match, escape, interpolate, evaluate, offset){
                photos.push(match);
                var arr = interpolate.split("/");
                return "./data/img/"+ arr[arr.length - 1] + "." + evaluate;
            });
    downloadImg(photos, 2, "./data/img/");
    return desc;
};


var downloadImg = function(photos, num, root){
    async.mapLimit(photos, num, function(photo, callback){
        requestAndwrite(photo, root, callback);
    }, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    });
};

var requestAndwrite = function(url, root, callback) {
    request.get(url).end(function(err, res) {
        if (err) {
            console.log(err);
            console.log("有一张图片请求失败啦...");
        } else {
            var fileName = path.basename(url);
            fs.writeFile(root + fileName, res.body, function(err) {
                if (err) {
                    console.log(err);
                    console.log("有一张图片写入失败啦...");
                } else {
                    callback(null, "successful !");
                    /*callback貌似必须调用，第二个参数为下一个回调函数的result参数*/
                }
            });
        }
    });
};


var result = function(obj){
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
        data: [obj],
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
};


var color = {
    "乳白色": "1627207:28321;",
    "白色": "1627207:28320;",
    "米白色": "1627207:4266701;",

    "浅麻灰": "1627207:28332;",
    "深麻灰": "1627207:3232478;",
    "灰色": "1627207:28334;",
    "银色": "1627207:28330;",

    "黑色": "1627207:28341;",

    "桔红色": "1627207:4950473;",
    "玫红色": "1627207:3594022;",
    "粉红色": "1627207:3232480;",
    "红色": "1627207:28326;",
    "浅粉红": "1627207:4464174;",
    "西瓜红": "1627207:3743025;",
    "酒红色": "1627207:28327;",

    "卡其色": "1627207:28331;",
    "姜黄色": "1627207:15409374;",
    "明黄色": "1627207:20412615;",
    "杏色": "1627207:30155;",
    "柠檬黄": "1627207:132476;",
    "橘色": "1627207:90554;",
    "浅黄色": "1627207:60092;",
    "荧光黄": "1627207:6134424;",
    "金色": "1627207:28328;",
    "香槟色": "1627207:130166;",
    "黄色": "1627207:28324;",

    "墨绿色": "1627207:3232483;",
    "墨绿色": "1627207:80557;",
    "浅绿色": "1627207:30156;",
    "绿色": "1627207:28335;",
    "翠绿色": "1627207:8588036;",
    "荧光绿": "1627207:6535235;",
    "青色": "1627207:3455405;",

    "天蓝色": "1627207:3232484;",
    "亮蓝": "1627207:5138330;",
    "宝蓝": "1627207:3707775;",
    "水蓝": "1627207:28337;",
    "深蓝": "1627207:28340;",
    "湖蓝色": "1627207:5483105;",
    "蓝色": "1627207:28338;",
    "藏青": "1627207:28866;",

    "浅紫色": "1627207:4104877;",
    "深紫色": "1627207:3232479;",
    "紫红色": "1627207:5167321;",
    "紫罗兰": "1627207:80882;",
    "紫色": "1627207:28329;",

    "咖啡色": "1627207:129819;",
    "巧克力色": "1627207:3232481;",
    "栗色": "1627207:6071353;",
    "浅棕色": "1627207:30158;",
    "深卡其布色": "1627207:3232482;",
    "深棕色": "1627207:6588790;",
    "褐色": "1627207:132069;",
    "驼色": "1627207:3224419;",

    "花色": "1627207:130164;",

    "透明": "1627207:107121;",

    "珊瑚红": "-12286",
};

var size = {
    "145/80A": "20509:649458002;",
    "150/80A": "20509:66579689;",
    "155/80A": "20509:3959184;",
    "160/84A": "20509:6215318;",
    "165/84A": "20509:-1001;",
    "165/88A": "20509:3267942;",
    "170/92A": "20509:3267943;",
    "175/96A": "20509:3267944;",
    "175/100A": "20509:71744989;",
    "180/108B": "20509:-1002;",
    "185/112C": "20509:-1003;"
};

// getAjaxUrlList("MEN", "0", "2858");
getProductDetail("28853011");
