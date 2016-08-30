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
        // productList = require("./online").data;
        productList = [ 
            '25715011',
            '25804011',
            '26409011',
            '25871011',
            '28218011',
            '28224011',
            '25361011',
            '28849011',
            '28382011',
            '28387011',
            '25363011',
            '25362011',
            '28389011',
            '25224011',
            '25226011',
            '25366011',
            '25365011',
            '28402011',
            '23122031',
            '23112081',
            '25493051',
            '25471031',
            '28403011',
            '25229031',
            '25230011',
            '25228011',
            '25227031',
            '25233011',
            '25495021',
            '28417011',
            '28420011',
            '28418011',
            '28158011',
            '25452021',
            '25458011',
            '28156011',
            '26219011',
            '26221041',
            '26229041',
            '26216021',
            '26215011',
            '26218011',
            '26228021',
            '26225011',
            '26227051',
            '26223011',
            '26226011',
            '26214131',
            '28415011',
            '28850011',
            '22741041',
            '28313011',
            '23114011',
            '23120031',
            '23118051',
            '23119051',
            '28852011',
            '28227011',
            '22267041',
            '23127041',
            '26284041',
            '26287041',
            '26286021',
            '25067011',
            '26290021',
            '28191011',
            '22917011',
            '22918011',
            '22916011',
            '22863011',
            '22862011',
            '26277011',
            '28374011',
            '26187021',
            '26173031',
            '26170111',
            '26275061',
            '26327031',
            '28517011',
            '26332011',
            '28519021',
            '30260011',
            '26329011',
            '28529011',
            '26185011',
            '26183011',
            '28520031',
            '23039111',
            '28373061',
            '28616011',
            '28617011',
            '26311021',
            '22908011',
            '22906031',
            '22858031',
            '22904031',
            '22859051',
            '28215011',
            '22939011',
            '22931011',
            '28232011',
            '28013011',
            '28016011',
            '28015011',
            '28574081',
            '23056021',
            '25651071',
            '28907031',
            '23050101',
            '25652011',
            '28565051',
            '23202021',
            '23201031',
            '23200041',
            '28568011',
            '23204011',
            '25497091',
            '25234021',
            '26210051',
            '26211091',
            '28316081',
            '22252031',
            '22363021',
            '22362021',
            '22364111',
            '28120011',
            '28121011',
            '22365011',
            '22366011',
            '22330021',
            '23288011',
            '22354011',
            '22335031',
            '22334021',
            '22332011',
            '22347021',
            '22353011',
            '28349041',
            '25114021',
            '25113041',
            '25110011',
            '28350011',
            '22957041',
            '28352071',
            '25121021',
            '25126011',
            '25119021',
            '25125011',
            '28356031',
            '25109031',
            '25127021',
            '25118041',
            '25124011',
            '25476091',
            '26255071',
            '26254051',
            '25475031',
            '26266061',
            '26256021',
            '28586041',
            '26253021',
            '25498011',
            '26265021',
            '25477021',
            '26257031',
            '25478021',
            '26342061',
            '25264011',
            '25241011',
            '25236031',
            '25237051',
            '25240011',
            '25267041',
            '25239041',
            '28587021',
            '25238011',
            '28554011',
            '28552011',
            '22980071',
            '26267041',
            '22865011',
            '28025011',
            '28405011',
            '28851011',
            '28404011',
            '25243011',
            '25244011',
            '25242011',
            '26384041',
            '22185081',
            '25367031',
            '25203031',
            '25207031',
            '25206041',
            '25204021',
            '25202051',
            '25520011',
            '25521011',
            '25522011',
            '28277051',
            '25380031',
            '22702021',
            '25526021',
            '26357051',
            '28827081',
            '28829011',
            '28436051',
            '28433031',
            '28432051',
            '28437041',
            '28434031',
            '28435021',
            '26375031',
            '28847011',
            '28846021',
            '26374021',
            '26381011',
            '28309021',
            '23110061',
            '26006011',
            '25855011',
            '25858011',
            '23013011',
            '22938011',
            '22887011',
            '28210011',
            '28209011',
            '25486051',
            '25487101',
            '25213051',
            '25212041',
            '26196091',
            '25214011',
            '25218011',
            '25215011',
            '26194101',
            '26195011',
            '28249021',
            '28154011',
            '25443041',
            '25448021',
            '25446021',
            '26198011',
            '25216021',
            '26161031',
            '28306011',
            '28414011',
            '28307011',
            '28251011',
            '28252011',
            '23103061',
            '23106051',
            '26325031',
            '26270011',
            '28503021',
            '28501011',
            '26324021',
            '26326021',
            '28514021',
            '28512011',
            '28511021',
            '30259021',
            '28526021',
            '26180021',
            '26233021',
            '26234011',
            '28372011',
            '28371171',
            '28609011',
            '28610011',
            '26298021',
            '26301021',
            '28612021',
            '28611021',
            '26303021',
            '28614021',
            '28613021',
            '22854031',
            '22879021',
            '22886011',
            '28204011',
            '28201011',
            '28004011',
            '28002011',
            '28001011',
            '28572011',
            '28571021',
            '28569061',
            '25646101',
            '25648021',
            '25650021',
            '28570011',
            '25649041',
            '28560011',
            '28567011',
            '22356011',
            '28114011',
            '28115011',
            '22359031',
            '22360021',
            '23287021',
            '23267011',
            '22329011',
            '22327021',
            '22325021',
            '28345021',
            '25104011',
            '28344021',
            '25102011',
            '28343031',
            '28342031',
            '28341021',
            '25101011',
            '26264031',
            '25466031',
            '26248071',
            '28581011',
            '26250041',
            '26245091',
            '26246041',
            '26249041',
            '25220031',
            '25266011',
            '28541021',
            '25222011',
            '28823011',
            '28824011',
            '28825021',
            '28835031',
            '28833041',
            '28834021',
            '25513011',
            '23098031',
            '28259011' 
    ];
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
