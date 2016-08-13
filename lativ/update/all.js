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
    //         });
    //     }, done);
    // },

    // 自定义产品
    function(done){
        
        productList = [
            "20358021",
            "22185081",
            "22702021",
            "22741031",
            "22957041",
            "22963021",
            "22968011",
            "22980031",
            "23039161",
            "23043041",
            "23050091",
            "23056021",
            "23062031",
            "23209051",
            "23210041",
            "23217041",
            "23228021",
            "23229011",
            "23275011",
            "25041011",
            "25063021",
            "25064031",
            "25065011",
            "25066011",
            "25068011",
            "25069011",
            "25070011",
            "25101021",
            "25102031",
            "25103091",
            "25104011",
            "25109011",
            "25113071",
            "25114011",
            "25121011",
            "25122021",
            "25123011",
            "25124011",
            "25126011",
            "25127031",
            "25203031",
            "25204011",
            "25211011",
            "25212011",
            "25213031",
            "25214011",
            "25215021",
            "25216011",
            "25217011",
            "25218011",
            "25219011",
            "25232011",
            "25234041",
            "25266041",
            "25268011",
            "25361111",
            "25362071",
            "25363011",
            "25364021",
            "25367021",
            "25371011",
            "25372011",
            "25374011",
            "25375011",
            "25376011",
            "25377011",
            "25379011",
            "25380021",
            "25381011",
            "25382011",
            "25383011",
            "25400031",
            "25401011",
            "25403011",
            "25404011",
            "25405011",
            "25406011",
            "25407011",
            "25441011",
            "25442011",
            "25443011",
            "25444011",
            "25445011",
            "25446011",
            "25447011",
            "25448011",
            "25449011",
            "25451011",
            "25453011",
            "25454021",
            "25455011",
            "25456011",
            "25457011",
            "25459011",
            "25470021",
            "25471011",
            "25472011",
            "25479011",
            "25480021",
            "25481011",
            "25486061",
            "25487031",
            "25488041",
            "25489071",
            "25490011",
            "25491031",
            "25492021",
            "25493051",
            "25494011",
            "25495011",
            "25496011",
            "25497091",
            "25499021",
            "25501021",
            "25502021",
            "25506021",
            "25509021",
            "25510021",
            "25511031",
            "25512031",
            "25513051",
            "25514011",
            "25515011",
            "25516011",
            "25517011",
            "25518011",
            "25519081",
            "25520041",
            "25521071",
            "25522011",
            "25524021",
            "25525011",
            "25526021",
            "25539031",
            "25646071",
            "25648021",
            "25649021",
            "25650021",
            "25652031",
            "25661011",
            "25662011",
            "25668011",
            "25716011",
            "25727011",
            "25767011",
            "25779011",
            "25804011",
            "25815011",
            "25823011",
            "25825011",
            "25848011",
            "25851011",
            "25855011",
            "25858011",
            "25859011",
            "25860011",
            "25871011",
            "25872011",
            "25873011",
            "25885011",
            "25889011",
            "25892011",
            "25896011",
            "25899011",
            "25946011",
            "25952011",
            "25953011",
            "25955011",
            "25956011",
            "25957011",
            "25961011",
            "25962011",
            "25963011",
            "25968011",
            "25973011",
            "25974011",
            "25991011",
            "25993011",
            "25996011",
            "25997011",
            "25998011",
            "25999011",
            "26000011",
            "26001011",
            "26002011",
            "26006011",
            "26007011",
            "26008011",
            "26009011",
            "26010011",
            "26011011",
            "26013011",
            "26015011",
            "26016011",
            "26017011",
            "26022011",
            "26023011",
            "26036011",
            "26037011",
            "26044011",
            "26045011",
            "26047011",
            "26048011",
            "26050011",
            "26062011",
            "26064011",
            "26072011",
            "26075011",
            "26077011",
            "26081011",
            "26085011",
            "26087011",
            "26094011",
            "26096011",
            "26097011",
            "26103011",
            "26111011",
            "26112011",
            "26116011",
            "26118011",
            "26120011",
            "26121011",
            "26122011",
            "26125011",
            "26128011",
            "26130011",
            "26131011",
            "26132011",
            "26140011",
            "26141011",
            "26143011",
            "26149011",
            "26158011",
            "26158011",
            "26159011",
            "26160021",
            "26161031",
            "26162021",
            "26163011",
            "26164021",
            "26165011",
            "26166011",
            "26169131",
            "26170121",
            "26171011",
            "26173021",
            "26179021",
            "26180021",
            "26181021",
            "26182011",
            "26183021",
            "26184011",
            "26185031",
            "26186011",
            "26187011",
            "26188021",
            "26189011",
            "26190011",
            "26194021",
            "26195011",
            "26196091",
            "26197011",
            "26198011",
            "26199011",
            "26200011",
            "26201011",
            "26202011",
            "26203011",
            "26209011",
            "26210061",
            "26211011",
            "26214081",
            "26224031",
            "26226021",
            "26233011",
            "26234021",
            "26237021",
            "26238011",
            "26241031",
            "26244061",
            "26252031",
            "26259011",
            "26260011",
            "26261011",
            "26267031",
            "26270021",
            "26271011",
            "26272031",
            "26275011",
            "26276031",
            "26284031",
            "26285011",
            "26286031",
            "26287011",
            "26288021",
            "26297021",
            "26298021",
            "26300021",
            "26301031",
            "26302011",
            "26309011",
            "26311011",
            "26312011",
            "26313011",
            "26315021",
            "26322041",
            "26325021",
            "26326011",
            "26327041",
            "26331011",
            "26332021",
            "26333011",
            "26334021",
            "26340011",
            "26357051",
            "26386011",
            "26388011",
            "26389011",
            "26398011",
            "26399011",
            "26400011",
            "26405011",
            "26409011",
            "26410011",
            "28111011",
            "28112011",
            "28113011",
            "28114011",
            "28115011",
            "28116011",
            "28117011",
            "28118011",
            "28119011",
            "28120011",
            "28121011",
            "28122011",
            "28123011",
            "28249051",
            "28250011",
            "28262011",
            "28263011",
            "28264011",
            "28277061",
            "28302011",
            "28303011",
            "28304011",
            "28305011",
            "28311011",
            "28312011",
            "28315011",
            "28316021",
            "28343061",
            "28345011",
            "28349011",
            "28352081",
            "28356011",
            "28371121",
            "28372021",
            "28389011",
            "28390011",
            "28392011",
            "28393011",
            "28434031",
            "28435031",
            "28501041",
            "28502021",
            "28503031",
            "28504031",
            "28511041",
            "28512011",
            "28513011",
            "28514011",
            "28516011",
            "28517021",
            "28519031",
            "28520031",
            "28527021",
            "28528021",
            "28529021",
            "28530011",
            "28531011",
            "28560041",
            "28563021",
            "28565031",
            "28568021",
            "28570011",
            "28582011",
            "28583011",
            "28584011",
            "28585011",
            "28588011",
            "28604011",
            "28605011",
            "28606011",
            "28643011",
            "28644011",
            "28645011",
            "28646011",
            "28659011",
            "28660011",
            "28665011",
            "28708011",
            "28709011",
            "28710011",
            "28711011",
            "28712011",
            "28713011",
            "28749011",
            "28750011",
            "28752011",
            "28753011",
            "28754011",
            "28762011",
            "28763011",
            "28764011",
            "28765011",
            "28766011",
            "28770011",
            "28771011",
            "28772011",
            "28773011",
            "28774011",
            "28775011",
            "28776011",
            "28777011",
            "28778011",
            "28779011",
            "28780011",
            "28823031",
            "28824021",
            "28825011",
            "28826031",
            "28848011",
            "28853011",
            "28858011",
            "30259011",
            "30260011"
        ];

        // console.log(productList.length);
        done();
    },

    // 获取活动产品
    // function(done){
    //     console.log("获取活动产品");
    //     read.getActivity("1P59", 3029, function(err, ids){
    //         productList = ids;
    //         done();
    //     });
    // },
    // 
    // function(done){
    //     console.log("获取产品");
    //     read.getCategoryProduct(function(err, ids){
    //         if( ids ){
    //             productList = ids;
    //             fs.writeFile("data.js", ids);
    //             // done();
    //         }
    //     });
    // },

    // 获取产品详情
    function(done) {
        console.log("获取产品详情");
        // async.mapLimit(productList, 10, function(c , next){
        //     var url = "http://www.lativ.com/Detail/" + c;
        //     read.productDetail(url, function(err, data, zhutuPhoto, descPhoto) {
        //         if( data.title ){
        //             productDetail.push(data);
        //             _.extend(zhutu, zhutuPhoto);
        //             desc = desc.concat(descPhoto);
        //         }
        //         next(err);
        //     });
        // }, done);
        async.eachSeries(productList, function(c, next) {
            // c.url = "http://www.lativ.com/Detail/" + c.urlId;
            var url = "http://www.lativ.com/Detail/" + c;
            read.productDetail(url, function(err, data, zhutuPhoto, descPhoto) {
                if( data.title ){
                    productDetail.push(data);
                    _.extend(zhutu,  zhutuPhoto);
                    desc = desc.concat(descPhoto);
                }
                next(err);
            });
        }, done);
    },
    // 主图片下载
    // function(done){
    //      console.log("主图片下载");
    //      read.downloadImg(zhutu, 5, "./data/", function(){
    //         done();
    //      });
    // },
    // // 描述图片下载
    // function(done){
    //     console.log("描述图片下载");
    //     read.downloadImg(desc, 5, "./data/img/", function(){
    //         done();
    //     });
    // },
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
            del: ","
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
