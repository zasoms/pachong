var async = require("async"),
  csv = require("fast-csv"),
  argv = require('argv'),
  read,
  json2csv = require("json2csv"),
  iconv = require("iconv-lite"),
  fs = require("fs"),
  images = require("images"),
  _ = require("underscore"),
  debug = require("debug")("lativ:update:all");

var args = argv.option({
  name: 'style',
  short: 's',
  type: 'string',
  description: 'Defines an style for your srcript',
  example: '"script --style=value" or "script -s value"'
}).run();

var style = args.options.style || 'normal';


var lastData = require("../lastData").data;

var classList,
  productList = [],
  productDetail = [],
  zhutu = {},
  desc = [],
  online = [];

var queue = [
  function(done) {
    // 自定义产品
    read = require("./read");
    if (style == 'add') {
      productList = require("./addProduct").data;
    } else {
      productList = require("./online").data;
    }
    console.log(productList.length);
    done();
  },
  // 获取产品详情
  function(done) {
    console.log("获取产品详情");
    if (lastData && lastData.productDetail) {
      productDetail = lastData.productDetail;
      zhutu = lastData.zhutu;
      desc = lastData.desc;
      done();
    } else {
      async.mapLimit(productList, 5, function(c, next) {
        var url = "http://m.lativ.com/Detail/" + c;
        read.productDetail(url, function(err, data, zhutuPhoto, descPhoto) {
          console.log(c)
          if (data.title) {
            productDetail.push(data);
            _.extend(zhutu, zhutuPhoto);
            desc = desc.concat(descPhoto);
          }
          next(err);
        });
      }, done);
    }
  },
  // 主图片下载
  function(done) {
    console.log("主图片下载");
    if (!lastData) {
      fs.writeFile("./lastData.js", "exports.data={" +
        "productDetail:" + JSON.stringify(productDetail) + "," +
        "zhutu:" + JSON.stringify(zhutu) + "," +
        "desc:" + JSON.stringify(desc) +
        "}");
    }
    read.downloadImg(zhutu, 5, "./data/", function() {
      done();
    });
  },
  // 描述图片下载
  function(done) {
    console.log("描述图片下载");
    read.downloadImg(desc, 5, "./data/img/", function() {
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
      "cpv_memo", "input_custom_cpv", "qualification", "add_qualification", "o2o_bind_service"
    ];

    var zh = ["宝贝名称", "宝贝类目", "店铺类目", "新旧程度", "省", "城市", "出售方式", "宝贝价格", "加价幅度", "宝贝数量", "有效期", "运费承担",
      "平邮", "EMS", "快递", "发票", "保修", "放入仓库", "橱窗推荐", "开始时间", "宝贝描述", "宝贝属性", "邮费模版ID", "会员打折", "修改时间",
      "上传状态", "图片状态", "返点比例", "新图片", "视频", "销售属性组合", "用户输入ID串", "用户输入名-值对", "商家编码", "销售属性别名",
      "代充类型", "数字ID", "本地ID", "宝贝分类", "用户名称", "宝贝状态", "闪电发货", "新品", "食品专项", "尺码库", "采购地", "库存类型",
      "国家地区", "库存计数", "物流体积", "物流重量", "退换货承诺", "定制工具", "无线详情", "商品条形码", "sku 条形码", "7天退货", "宝贝卖点",
      "属性值备注", "自定义属性值", "商品资质", "增加商品资质", "关联线下服务"
    ];

    json2csv({
      data: productDetail,
      fields: en,
      fieldNames: zh,
      quotes: "",
      del: "\t"
    }, function(err, csv) {
      if (err) {
        console.log(err);
      } else {
        var newCsv = iconv.encode(csv, 'GBK');
        fs.writeFile("data.csv", newCsv, function(err) {
          if (err) throw err;
          console.log("file saved");
          done();
        });
      }
    });
  },
  // function(done) {
  //   console.log("水印添加");
  //   var rootPath = "data/img/";
  //   fs.readdir(rootPath, function(err, files) {
  //     async.mapLimit(files, 5, function(file, next) {
  //       var path = rootPath + file;
  //       if (/gif|_size\.png$/.test(file)) {
  //         next();
  //       } else {
  //         console.log(rootPath, file, path)
  //         images(path)
  //           .draw(images("logo.png"), 200, 200)
  //           .saveAsync(path, {
  //             quality: 80
  //           }, null, function() {
  //             next();
  //           });
  //       }
  //     }, done);
  //   });
  // },
  function() {
    fs.writeFile("./lastData.js", "");
    console.log("完成");
    process.exit(0);
  }
];

if (style == 'normal') {
  queue.unshift(function(done) {
    console.log("拿取lativ.csv中的数据");
    var config = {};
    var stream = fs.createReadStream('./lativ.csv');

    csv.fromStream(stream, { delimiter: '\t' })
      .on("data", function(arr) {
        if (/^[0-9]{8}/.test(arr[33])) {
          var key = arr[33],
            value = arr[36];
          online.push(key);
          config[key] = value;
        }
      })
      .on("end", function() {
        fs.writeFile("./update/config.js", "exports.data=" + JSON.stringify(config), function() {
          done();
        });
      });
  }, function(done) {
    console.log("获取lativ中的产品");
    read = require("./read");
    read.getCategoryProduct(function(err, ids, products) {
      if (ids) {
        fs.writeFile("./update/data.js", "exports.data=" + JSON.stringify(ids), function() {
          fs.writeFile("./update/category.js", "exports.data=" + JSON.stringify(products), function() {
            done();
          });
        });
      }
    });
  }, function(done) {
    console.log("对比数据");
    var down = require("./data").data;
    var dlen = down.length;
    var plen = online.length;

    var collection = [];

    for (var i = 0; i < plen; i++) {
      var item1 = online[i];
      for (var j = 0; j < dlen; j++) {
        var item2 = down[j];
        if (item1.slice(0, 5) == item2.slice(0, 5)) {

          collection.push(item1);
          break;
        }
      }
    }

    function deleteProducts(callback) {
      var difference = [],
        onlineData = [];
      for (var k = 0; k < plen; k++) {
        var item3 = online[k];
        if (!(~collection.indexOf(item3))) {
          difference.push(item3);
        } else {
          onlineData.push(item3);
        }
      }
      fs.writeFile("./update/deleteProducts.js", "exports.data=" + JSON.stringify(difference), function() {
        fs.writeFile("./update/online.js", "exports.data=" + JSON.stringify(onlineData), callback);
      });
    }

    function addProduct(callback) {
      var difference = [];
      for (var k = 0; k < dlen; k++) {
        var item3 = down[k];
        if (!(~collection.indexOf(item3))) {
          difference.push(item3);
        }
      }
      fs.writeFile("./update/addProduct.js", "exports.data=" + JSON.stringify(difference), callback);
    }
    deleteProducts(function() {
      addProduct(function() {
        done();
      });
    });
  });
}

async.series(queue);
