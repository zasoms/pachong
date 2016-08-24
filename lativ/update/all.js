var async = require("async"),
    config = require("../config"),
    read = require("./read"),
    save = require("./save"),
    json2csv = require("json2csv"),
    iconv = require("iconv-lite"),
    fs = require("fs"),
    _ = require("underscore"),
    debug = require("debug")("lativ:update:all");

var classList,
    productList = [],
    productDetail = [],
    zhutu = {},
    desc = [];

async.series([
    // //获取产品分类
    // function(done) {
    //     console.log("获取产品分类");
    //     read.classList(config.lativ.url, function(err, list) {
    //         classList = list;
    //         classList.pop(); //iLook里面有cacheID
    //         classList.length = 1;
    //         done(err);
    //     });
    // },
    // // 获取产品信息
    // function(done) {
    //     console.log("获取产品信息");
    //     async.eachSeries(classList, function(c, next) {
    //         read.categorytList(c.href, c.rel, function(err, list) {
    //             productList = productList.concat(list);
    //             next(err);
    //         });536973083073
    //     }, done);
    // },

    // 自定义产品
    function(done){
        productList = require("./online").data;
        // productList = [];
        // console.log(productList.length);
        done();
    },

    // 获取活动产品
    // function(done){
    //     console.log("获取活动产品");
    //     read.getActivity("2P88D", 3188, function(err, ids){
    //         productList = ids;
    //         fs.writeFile("active.js", "exports.data=" +JSON.stringify(ids));
    //         // done();
    //     });
    // },
    
    // function(done){
    //     console.log("获取产品");
    //     read.getCategoryProduct(function(err, ids){
    //         if( ids ){
    //             productList = ids;
    //             fs.writeFile("data.js", "exports.data=" +JSON.stringify(ids));
    //             // done();
    //         }
    //     });
    // },

    // 获取产品详情
    function(done) {
        console.log("获取产品详情");
        async.mapLimit(productList, 5, function(c , next){
            var url = "http://www.lativ.com/Detail/" + c;
            read.productDetail(url, function(err, data, zhutuPhoto, descPhoto) {
                if( data.title ){
                    productDetail.push(data);
                    _.extend(zhutu, zhutuPhoto);
                    desc = desc.concat(descPhoto);
                }
                next(err);
            });
        }, done);
        // async.eachSeries(productList, function(c, next) {
        //     // c.url = "http://www.lativ.com/Detail/" + c.urlId;
        //     var url = "http://www.lativ.com/Detail/" + c;
        //     read.productDetail(url, function(err, data, zhutuPhoto, descPhoto) {
        //         if( data.title ){
        //             productDetail.push(data);
        //             _.extend(zhutu,  zhutuPhoto);
        //             desc = desc.concat(descPhoto);
        //         }运动(.*?)T恤|运动(.*?)吊带衫|运动(.*?)背心
        //         next(err);
        //     });
        // }, done);
    },
    // 主图片下载
    function(done){
         console.log("主图片下载");
         read.downloadImg(zhutu, 5, "./data/", function(){
            done();
         });
    },
    // 描述图片下载
    function(done){
        console.log("描述图片下载");
        read.downloadImg(desc, 5, "./data/img/", function(){
            done();
        });
    },
    function(done) {
        console.log("导出csv");
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
            data: productDetail,
            fields: en,
            fieldNames: zh,
            quotes: "",
            del: "\t"
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
    },
    function() {
        console.log("完成");
        process.exit(0);
    }
]);
