var async = require("async"),
    config = require("../config"),
    read = require("./read"),
    save = require("./save"),
    json2csv = require("json2csv"),
    fs = require("fs"),
    debug = require("debug")("blog:update:all");

var classList,
    productList = [];

var fields = [
    "title",            //宝贝名称
    "cid",              //宝贝类目
    "seller_cids",      //店铺类目
    "stuff_status",     //新旧程度
    "location_state",   //省
    "location_city",    //城市
    "item_type",      //出售方式
    "price",            //宝贝价格
    "auction_increment",//加价幅度
    "num",              //宝贝数量
    "valid_thru",       //有效期
    "freight_payer",    //运费承担
    "post_fee",         //平邮
    "ems_fee",          //EMS
    "express_fee",      //快递
    "has_invoice",      //发票
    "has_warranty",     //保修
    "approve_status",   //放入仓库
    "has_showcase",     //橱窗推荐
    "list_time",        //开始时间
    "description",      //宝贝描述
    "cateProps",        //宝贝属性
    "postage_id",       //邮费模版ID
    "has_discount",     //会员打折
    "modified",         //修改时间
    "upload_fail_msg",  //上传状态
    "picture_status",   //图片状态
    "auction_point",    //返点比例
    "picture",          //新图片
    "video",            //视频
    "skuProps",         //销售属性组合
    "inputPids",        //用户输入ID串
    "inputValues",      //用户输入名-值对
    "outer_id",         //商家编码
    "propAlias",        //销售属性别名
    "auto_fill",        //代充类型
    "num_id",           //数字ID
    "local_cid",        //本地ID
    "navigation_type",  //宝贝分类
    "user_name",        //账户名称
    "syncStatus",       //宝贝状态
    "is_lighting_consigment",   //闪电发货
    "is_xinpin",        //新品
    "foodparame",       //食品专项
    "sub_stock_type",   //库存计数
    "item_size",        //物流体积
    "item_weight",      //物流重量
    "buyareatype",      //采购地
    "global_stock_type",    //库存类型
    "global_stock_country",//国家地区
    "wireless_desc",        //无线详情
    "barcode",          //商品条形码
    "subtitle",         //宝贝卖点
    "sku_barcode",	    //sku条形码
    "cpv_memo",         //属性值备注
    "input_custom_cpv", //自定义属性值
    "features",         //尺码库
    "buyareatype",      //采购地
    "sell_promise",     //退换货承诺
    "custom_design_flag",//定制工具
    "newprepay",        //7天退货
    "qualification",    //商品资质
    "add_qualification",//增加商品资质
    "o2o_bind_service"  //关联线下服务
];

async.series([
    //获取产品分类
    function(done) {
        console.log("获取产品分类");
        read.classList(config.lativ.url, function(err, list) {
            classList = list;
            classList.pop(); //iLook里面有cacheID
            done(err);
        });
    },
    // // 保存文章分类
    // function(done){
    // 	console.log("保存文章分类");
    // 	save.classList(classList, done);
    // },
    // 获取产品信息
    function(done) {
        console.log("获取产品信息");
        async.eachSeries(classList, function(c, next) {
            read.productList(c.href, c.rel, function(err, list) {
                productList = productList.concat(list);
                next(err);
            });
        }, done);
    },
    // 获取产品详情
    function(done) {
        console.log("获取产品详情");
        var i = 0;
        async.eachSeries(productList, function(c, next) {
            c.url = "http://www.lativ.com/Detail/" + c.image_140.split("/")[3];
            read.productDetail(c.url, function(err, data) {
                    if( data.description ){
                        next(err);
                        productList[i].description = data.description;
                    }
                    i++;
            });
        }, done);
    },
    function(done) {
        console.log("导出csv");
        json2csv({
            data: productList,
        }, function(err, csv){
            if( err ){
                console.log(err);
                done();
            }else{
                fs.writeFile("file.csv", csv, function(err){
                    if(err) throw er;
                    console.log("file saved");
                    done();
                });
            }
        });
    },
    function() {
        console.log("完成");
        process.exit(0);
    }
]);
