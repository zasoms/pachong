var async = require("async"),
    config = require("../config"),
    read = require("./read"),
    save = require("./save"),
    xlsx = require("node-xlsx"),
    debug = require("debug")("blog:update:all");

var classList,
    productList = [];

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
        async.eachSeries(productList, function(c, next) {
            c.url = "http://www.lativ.com/Detail/" + c.image_140.split("/")[3];
            read.productDetail(c.url, function(err, data) {
            	console.log(data);
                productList[c.detail] = data.detail;
                next(err);
            });
        }, done);
    },
    function(done) {
        console.log("读取数据");
        console.log(productList[0].detail);
        done();
    },
    function() {
        console.log("完成");
        process.exit(0);
    }
]);

