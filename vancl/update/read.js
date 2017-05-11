var requests = require("superagent"),
  request = require("request"),
  cheerio = require("cheerio"),
  async = require("async"),
  fs = require("fs"),
  path = require("path"),
  _ = require("underscore"),
  debug = require("debug")("blog:update:read");

var webshot = require('../lib/webshot');

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
      } else {
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
function hex(productId) {
  var arr = '0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f'.split(","),
    str = productId + "",
    value = "";
  for (var i = 0; i < 24; i++) {
    str += arr[Math.floor(Math.random() * 16)];
  }
  if (hex.cache[str]) {
    arguments.callee();
  } else {
    hex.cache[str] = 1;
  }
  return str;
}
hex.cache = {};

var cacheProductId = {};

var productDetail = function(productId, callback) {
  this.product = {};

  this.COLOR = _.extend({}, COLOR);
  this.SIZE = _.extend({}, SIZE);

  this.cNum = 1001;
  this.sNum = 1001;
  this.cache = {};

  this.callback = callback || function() {};

  this.zhutuPhoto = {};
  this.descPhoto = [];

  this.sizePre = "20509";

  this.productId = productId;
  console.log(this.productId);
  this.init();
};

productDetail.prototype = {
  /**
   * 获取商品详情
   * [productDetail description]
   * @param  {[type]}   url      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  init: function(url) {
    var product = this.product,
      _this = this;

    requests.get( `http://item.vancl.com/${this.productId}.html` )
      .end(function(err, res) {
        if (err) return console.log(err);

        var $ = cheerio.load(res.text, { decodeEntities: false }),
          title = "",
          desc = "";

        title = $('h2').eq(0).text().trim();
        title = title.slice(0,  title.lastIndexOf(' '));
        product.title = title;
        product.price = parseInt($('.priceLayout').eq(2).text().replace(/[\r\n\s]/g, ''));

        // 如果是预售和韩国购的就不添加进来
        if( /预售|韩国购/g.test( title ) || cacheProductId[title] ){
          _this.callback(err, {});
          return;
        }
        // 为了不捕捉到同一件商品，做个记号
        cacheProductId[title] = 1;

        var $selColor = $('.selColorArea .selColor li');
        var colors = [];
        // 处理商品颜色
        $selColor.each( (i, item) => {
          colors.push( {
            name: $(item)[0].attribs.title,
            id: $(item).find('a')[0].attribs.href.slice(0, 7),
            size: {}
          });
        } );

        // 商品详情
        var $sideBarSettabArea = $('.sideBarSettabArea');

        // 删除详情中的script和style和提问部分
        $sideBarSettabArea.find('.productPinglun').remove();
        $sideBarSettabArea.find('style').remove();
        $sideBarSettabArea.find('script').remove();

        var photos = [];
        $sideBarSettabArea.find('img').each( (i, item) => {
          var $item = $(item);
          var imgSrc = item.attribs.original || item.attribs.src;
          if( imgSrc ){
            photos.push( imgSrc );
            $item.attr('src', '"FILE:\/\/\/E:/github/pachong/vancl/data/img/' + imgSrc.split('/').slice(-2).join('_') + '"');
            $item.attr('original', '1');
          }
        });
        $sideBarSettabArea.find('a').each( (i, item) => {
          $(item).attr('href', '1');
        });
        html = $sideBarSettabArea.html();
        _this.disposeDescription(html, photos, function() {
          _this.getProduct(colors);
        });
      });
  },
  // 获得该商品的数目、尺寸和颜色
  getProduct: function(colors) {
    var product = this.product,
      _this = this,
      productId = this.productId;


    var index = 0;
    function size(){
      var colorItem = colors[index];     
      requests.get( `http://item.vancl.com/styles/AjaxChangeProduct.aspx?productcode=${colorItem.id}` )
        .end( (err, res) => {
          var $ = cheerio.load(res.text, { decodeEntities: false });
          var $selSize = $('.selSize li');
          $selSize.each( (i, item) => {
            var $item = $(item);
            var type = $item.text().replace(/[\r\n\s]/g, '')
            var attribs = $item[0].attribs
            if( attribs.title ){
              colorItem.size[ type ] = attribs.title
            }else{
              colorItem.size[ type ] = attribs.onclick.match(/',(.*?)\)/)[1]
            }
            colorItem.img = $('#midimg')[0].attribs.src
          } );        

          if( colors[++index] ){
            size();
          }else{
            _this.dataMatch();

            // //宝贝类目
            _this.cid();

            _this.cateProps(colors);

            _this.skuProps(colors);

            _this.picture(colors);
            _this.callback(err, _this.product, _this.zhutuPhoto, _this.descPhoto);
          }
        });
    }
    size();
  },
  // 数据处理
  dataMatch: function() {
    var product = this.product,
      productId = this.productId;
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
    // 119包邮
    product.postage_id = 8151607820;

    product.has_discount = 0;
    product.list_time = "";
    product.modified = "";
    product.upload_fail_msg = 200;
    product.picture_status = "1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;";
    product.auction_point = "0";

    product.video = ""; //TODO

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

    product.num_id = DATA[productId] || '';

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
  disposeDescription: function(html, photos, callback) {
    var product = this.product;
    product.description = html.replace(/[\r\n]/g, '' );
    this.descPhoto = this.descPhoto.concat(photos);
    callback();
  },
  // 宝贝类目
  cid: function() {
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
    if (/男/g.test(title)) {
      if (/POLO/i.test(title)) {
        cid = "50010402";
        product.cateProps += "20000:29534;42722636:20213;122216345:29457;122216507:3226292;122216515:29535;122216586:29947;";
      }else if (/T恤|短袖/i.test(title)) {
        cid = "50000436";
        product.cateProps += "20000:29534;20551:22252803;20603:29452;20663:29447;42722636:248572013;122216345:29457;122216348:29445;122216507:3226292;122216515:29535;122216586:29947;";
      }else if (/背心/.test(title)) {
        cid = "50011153";
        product.cateProps += "20000:29534;42722636:20213;122216515:29535;122216586:29947;122276315:3273241;";
      }else if (/衬衫/.test(title)) {
        cid = "50011123";
        product.cateProps += "20000:29534;20663:20213;42722636:20213;122216345:29938;122216348:29444;122216507:3226292;122216515:29535;122216586:29947;";
      }else if (/牛仔裤/.test(title)) {
        cid = "50010167";
        product.cateProps += "20000:29534;42722636:248572013;122216515:29535;122276111:20525;";
        //尺寸 20518
        this.sizePre = "20518";
      }else if (/短裤|中裤|沙滩裤|五分裤|七分裤|松紧短裤/.test(title)) {
        cid = "50023108";
        product.cateProps += "20000:29534;122216608:20532;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",短裤";
        product.subtitle = "";
      }else if (/三角短裤|平角短裤|平脚短裤|棉质短裤|印花短裤/.test(title)) {
        cid = "50008882";
        product.cateProps += "20000:29534;24477:20532;";
        product.inputPids = "166332348";
        product.inputValues = "1条";
        product.subtitle = "";
      }else if (/长裤|松紧裤|休闲裤/.test(title)) {
        cid = "3035";
        product.cateProps += "20000:29534;42722636:248572013;122216515:29535;122216586:29947;122276111:20525;";
        //尺寸 20518
        this.sizePre = "20518";
      }else if (/运动T恤/i.test(title)) {
        cid = "50013228";
        product.cateProps += "20000:29534;20663:29447;122216348:29445;122216608:20532;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",other";

        this.sizePre = "20509";
        // 尺寸 20509
        // propAlias   这里要把自定义属性值改成销售属性别名
        // 20509:29696:其它尺码
      }else if (/运动短裤/i.test(title)) {
        cid = "50023108";
        product.cateProps += "20000:29534;122216608:20532;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",短裤";
      }else if (/运动(.*?)长裤|运动(.*?)紧身裤|紧身裤/i.test(title)) {
        cid = "50023107";
        product.cateProps += "20000:29534;122216608:20532;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",长裤";
      }else if (/羽绒/.test(title)) {
        cid = "50011167";
        product.cateProps += "20000:29534;6861561:20213;42722636:20213;122216515:29535;122216562:3226292;";
      }else if (/风衣/.test(title)) {
        cid = "50011159";
        product.cateProps += "20000:29534;31611:26486055;42722636:20213;122216345:29938;122216515:29535;122216562:3226292;122216586:29947;";
      }else if (/西服/.test(title)) {
        cid = "50010160";
        product.cateProps += "20000:29534;31611:3267617;42722636:20213;122216507:3226292;122216515:29535;122216586:29947;122276377:3267910;";
      }else if (/茄克|外套/.test(title)) {
        cid = "50011739";
        product.cateProps += "20000:29534;122216608:20532;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",茄克/外套";
      }else if (/羽绒/.test(title)) {
        cid = "50011167";
        product.cateProps += "20000:29534;6861561:20213;42722636:20213;122216515:29535;122216562:3226292;";
      }else if (/棉衣/.test(title)) {
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

    else if (/女|bra/i.test(title)) {
      if (/T恤|中袖|长衫|七分袖/i.test(title)) {
        cid = "50000671";
        product.cateProps += "20021:105255;13328588:492838734;";
      }
      if (/POLO/i.test(title)) {
        cid = "50022889";
        product.cateProps += "20000:109712276;122216608:20533;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",POLO衫";
      }
      if (/吊带|背心/.test(title)) {
        cid = "50010394";
        product.cateProps += "20000:29534;20021:105255;24477:20533;";
      }
      if (/文胸/.test(title)) {
        cid = "50008881";
        product.cateProps += "20000:29534;5260022:113084;122216483:103092;122216591:3269820;122216608:3269958;122442403:3269842;122508284:607964276;";

        // 尺寸 122508275
        this.sizePre = "122508275";
      }
      if (/雪纺/.test(title)) {
        cid = "162116";
        product.cateProps += "122216347:828914351;";
      }
      if (/针织/.test(title)) {
        cid = "50000697";
        product.cateProps += "20551:105255;13328588:492838732;122216347:828914351;";
      }
      if (/衬衫/.test(title)) {
        cid = "162104";
        product.cateProps += "20021:105255;13328588:492838731;";
      }
      if (/西装/.test(title)) {
        cid = "50008897";
        product.cateProps += "122216347:728146012;";
      }
      if (/连衣裙/.test(title)) {
        cid = "50010850";
        product.cateProps += "122216347:828914351;";
      }

      if (/运动(.*?)短裤|短裤|中裤|七分裤|宽腿裤/.test(title)) {
        cid = "50023108";
        product.cateProps += "20000:29534;122216608:20533;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",短裤";

        // 尺寸 20509
        this.sizePre = "20509";
      }
      if (/内裤|三角短裤|平脚短裤|生理裤|安全裤|平口裤/.test(title)) {
        cid = "50008882";
        product.cateProps += "20000:29534;24477:20533;122216608:3267959;";
        product.inputPids = "166332348";
        product.inputValues = "1条";
        product.subtitle = "";
      }
      if (/短裙|牛仔(.*?)裙|紧身裙|窄裙|迷你裙|中裙|裤裙|裙裤|喇叭裙|印花长裙/.test(title)) {
        cid = "1623";
        product.cateProps += "122216347:828914351;";
      }
      if (/长裤|休闲裤|紧身裤|九分裤|紧身裤|踩脚裤|带裤紧身窄裙|百搭裤|松紧裤/.test(title)) {
        cid = "162201";
        //尺寸 20518
        this.sizePre = "20518";
      }
      if (/牛仔裤|牛仔(.*?)裤/.test(title)) {
        cid = "162205";
        product.cateProps += "122216347:828914351;";
        //尺寸 20518
        this.sizePre = "20518";
      }
      if (/运动(.*?|[^POLO])衫/i.test(title)) {
        cid = "50011717";
        product.cateProps += "20000:29534;122216608:20533;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",运动卫衣/套头衫";
      }
      if (/运动(.*?)T恤|运动(.*?)吊带衫|运动(.*?)背心/.test(title)) {
        cid = "50013228";
        product.cateProps += "20000:29534;20663:29448;122216348:29445;122216608:20533;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",T恤";
      }
      if (/运动(.*?)长裤|运动(.*?)裤/.test(title)) {
        cid = "50023107";
        product.cateProps += "20000:29534;122216608:20533;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",长裤";
      }

      if (/羽绒大衣|羽绒(.*?)外套/.test(title)) {
        cid = "50008899";
        product.cateProps += "20000:29534;122216347:740138901;";
      }
      if (/茄克|外套|连帽/.test(title)) {
        cid = "50011739";
        product.cateProps += "20000:29534;122216608:20533;";
        product.inputPids = "6103476,13021751";
        product.inputValues = product.price + ",茄克/外套";
      }
      if (/风衣|连帽外套/.test(title)) {
        cid = "50008901";
        product.cateProps += "122216347:728146012;";
      }
      if (/大衣/.test(title)) {
        cid = "50013194";
        product.cateProps += "20021:20213;13328588:492838731;122216347:728146012;";
      }
      if (/羽绒/.test(title)) {
        cid = "50008899";
        product.cateProps += "20000:29534;122216347:740138901;1627207:28332;20509:6215318;";
      }
      if (/棉衣/.test(title)) {
        cid = "50008900";
        product.cateProps += "20000:29534;122216347:740138901;";
      }
    }
    if (!cid) {
      cid = "50000671";
      product.cateProps += "20021:105255;13328588:492838734;";
    }
    product.cid = cid;
  },
  //宝贝分类
  seller_cids: function() {
    // TODO
    // var categorys = require("./category").data,
    //   category,
    //   lists,
    //   id,
    //   productId = this.productId,
    //   seller_cids = "";
    // for (var i = 0, ilen = categorys.length; i < ilen; i++) {
    //   category = categorys[i];
    //   lists = category.lists;
    //   for (var j = 0, jlen = lists.length; j < jlen; j++) {
    //     id = lists[j];
    //     if (id.slice(0, 5) == productId.slice(0, 5)) {
    //       seller_cids += SELLER_CIDS[category.categoryName] + ",";
    //     }
    //   }
    // }
    // this.product.seller_cids = seller_cids;
  },
  input_custom_cpv: function(type, value) {
    var cache = this.cache,
      product = this.product,
      sizePre = this.sizePre;

    var data = type === 'color' ? this.COLOR : this.SIZE;

    if (type == 'color') {
      if (!data[value]) {
        data[value] = "1627207:-" + this.cNum + ";";
        product.input_custom_cpv += "1627207:-" + this.cNum + ":" + value + ";";
        this.cNum++;
      }
    }
    if (type == 'size') {
      if (!data[value]) {
        data[value] = sizePre + ":-" + this.sNum + ";";
        product.input_custom_cpv += sizePre + ":-" + this.sNum + ":" + value + ";";
        this.sNum++;
      } else {
        if (!cache[value]) {
          product.cpv_memo += data[value].slice(0, -1) + ":" + value + ";";
          cache[value] = 1;
        }
      }
    }
    return data[value];
  },
  propAlias: function(value) {
    var cache = this.cache,
      product = this.product,
      sizePre = this.sizePre;

    var SIZE = this.SIZE,
      item = "20509:";

    if (!SIZE[value]) {
      item += this.propPrex++;
      SIZE[value] = item + ";";
      product.propAlias += item + ":" + value + ";";
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

    if (/50022889|50013228|162104|50011739|50011717|50023108|50023107/.test(product.cid)) {
      this.propPrex = 28313;

      datas.forEach(function(data) {
        product.cateProps += _this.input_custom_cpv("color", data.name);

        for(var attr in data.size){
          str += _this.propAlias(attr);
        }
      });
    } else {
      datas.forEach(function(data) {
        product.cateProps += _this.input_custom_cpv("color", data.name);

        for(var attr in data.size){
          str += _this.input_custom_cpv('size', attr);
        }
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
      colors = COLOR[data.name];

      for(var attr in data.size){
        var val = data.size[attr];
        num += +val;

        numPrice = price + ":" + val + "::";
        sizes = SIZE[ attr ];
        str += numPrice + colors + sizes;
      }
    });

    product.skuProps = str;
    product.num = num;
  },
  // 图片处理
  picture: function(datas) {
    var photos = {},
      colors = [],
      zhutu = "",
      colorImg = "",
      i = 0,
      k = 0,
      s = 0;
    var product = this.product,
      COLOR = this.COLOR,
      productId = this.productId;

    datas.forEach(function(data, i) {
      colors.push(data.name);
      photos[data.img] = hex(productId);
    });
    for (var attr in photos) {
      if (i < 5) {
        zhutu += photos[attr] + ":1:" + i + ":|;";
        i++;
      }
      colorImg += photos[attr] + ":2:0:" + COLOR[colors[k]].slice(0, -1) + "|;";
      k++;
    }
    product.picture = zhutu + colorImg;
    _.extend(this.zhutuPhoto, photos);
  }
};

exports.productDetail = function(url, callback) {
  new productDetail(url, callback);
};


// 图片下载
var downloadImg = function(photos, num, root, callback) {
  if (!(this instanceof downloadImg)) {
    return new downloadImg(photos, num, root, callback);
  }
  var _this = this;
  this._arr = [];
  if (mkdirsSync(root)) {
    var imgs = [];
    if (Object.prototype.toString.call(photos) === "[object Object]") {
      _this._arr = photos;
      for (var attr in photos) {
        imgs.push(attr);
      }
    } else {
      imgs = photos;
    }
    async.mapLimit(imgs, num, function(photo, cb) {
      _this.requestsAndwrite(photo, root, cb);
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
downloadImg.prototype.requestsAndwrite = function(url, root, callback) {
  var _arr = this._arr;

  var fileName = "";
  if (_arr && _arr[url]) {
    fileName = _arr[url] + ".tbi";
  } else {
    fileName = url.split('/').slice(-2).join('_');
  }
  fs.exists(root + fileName, function(isexists) {
    if (!isexists) {
      try {
        if(url != 'undefined'){
          url = /^http/.test(url) ? url : 'http:'+url
          requests.get(url).end(function(err, res) {
            if (err) {
              console.log(url, "有一张图片请求失败啦...");
                  callback(null, "successful !");
            } else {
              fs.writeFile(root + fileName, res.body, function(err) {
                if (err) {
                  console.log(url, "有一张图片写入失败啦...");
                } else {
                  callback(null, "successful !");
                  // callback貌似必须调用，第二个参数为下一个回调函数的result参数
                }
              });
            }
          });
        }else{
          callback(null, "successful !");
        }
      } catch (e) {
        callback(null, "successful !");
      }
    } else {
      callback(null, "successful !");
    }
  });

};
exports.downloadImg = function(photos, num, root, callback) {
  downloadImg(photos, num, root, callback);
};

exports.getCategoryProduct = function(callback) {
  const host = 'http://s.vancl.com';

  var main = ["27531-s1-p1", "27532-s1-p1", "28968-s1-p1", "27537-s1-p1", "27533-s1-p1"],
    mainIndex = 0,
    urls = [],
    ids = [],
    categories = [],
    index = 0,
    cache = {};

  function getCategory(category) {
    request.get(`${host}/${category}.html`)
      .end(function(err, res) {
        var $ = cheerio.load(res.text, { decodeEntities: false });
        var categoryName  = $('.selectareaLeft').text().replace(/[\\r\\n\s]/g, '');
        $('.selectareaRight').eq(0).find('li').each((i, item) => {
          var $item = $(item).find('a');
          urls.push({
            categoryName: categoryName + '-' + $item.text().replace(/[\d\s\(\)]/g, ''),
            href: host + '/' + $(item).find('a')[0].attribs.href.replace(/\.html/, '-p{page}.html'),
            lists: []
          });
        });
        if (main[++mainIndex]) {
          getCategory(main[mainIndex]);
        } else {
          getPageProducts();
        }
      });
  }

  getCategory(main[mainIndex]);

  function getPageProducts() {
    var mainIndex = 0;
    var pageIndex = 1;
    function child(){
      var catetory = urls[mainIndex];
      request.get( catetory.href.replace(/{page}/, pageIndex) )
        .end(function(err, res) {
          var $ = cheerio.load(res.text, { decodeEntities: false });
          var $li = $("#vanclproducts li");
          if ($li.length) {
            $li.each((i, item) => {
              var $item = $(item);
              var $presale = $item.find('.presale');
              var id = $item.find('a')[0].attribs.href.match(/\d+/g)[0];
              if (!$presale.length) {
                catetory.lists.push( id );
                ids.push( id );
              }
            });
            ++pageIndex;
            console.log(pageIndex);
            child();
          }else{
            console.log(mainIndex);
            ++mainIndex;
            pageIndex = 1;
            if( urls[mainIndex] ){
              child();
            }else{
              callback(null ,ids, urls);
            }
          }
        });
    }
    child();
  }
};
