var request = require("superagent"),
  cheerio = require("cheerio"),
  async = require("async"),
  fs = require("fs"),
  path = require("path"),
  _ = require("underscore"),
  debug = require("debug")("blog:update:read");

const host = 'http://s.vancl.com';

var products = [];

var urls = [];

function getCategory() {
  request.get(`${host}/27531-s1-p1.html`)
    .end(function(err, res) {
      var $ = cheerio.load(res.text, { decodeEntities: false });
      $('.selectareaRight').eq(0).find('li').each((i, item) => {
        var $item = $(item).find('a');
        urls.push({
          name: '男装-' + $item.text().replace(/[\d\s\(\)]/g, ''),
          url: host + '/' + $(item).find('a')[0].attribs.href.replace(/\.html/, '-p{page}.html'),
          products: []
        });
      });
      getProducts();
    });
}


function getProducts() {
  var mainIndex = 0;
  var pageIndex = 1;
  return function(){
    var catetory = urls[mainIndex]
    request.get( catetory.url.replace(/{page}/, pageIndex) )
      .end(function(err, res) {
        var $ = cheerio.load(res.text, { decodeEntities: false });
        var $li = $("#vanclproducts li");
        if ($li.length) {
          $li.each((i, item) => {
            var $item = $(item)
            var $presale = $item.find('.presale')
            if (!$presale.length) {
              catetory.products.push( $item.find('a')[0].attribs.href )
            }
          });
          ++pageIndex;
          getProducts();
        }else{
          console.log(mainIndex);
          ++mainIndex;
          pageIndex = 1;
          if( urls[mainIndex] ){
            getProducts();
          }else{
            console.log(urls);
          }
        }
      });
  };
}

var defaults = {
  // 属性值备注
  cpv_memo: "",

  stuff_status: 1,
  location_state: "上海",
  location_city: "上海",
  item_type: 1,
  auction_increment: "0",
  valid_thru: 7,
  freight_payer: 2,
  post_fee: "1.4139E-38",
  ems_fee: "2.8026e-45",
  express_fee: 0,
  has_invoice: 0,
  has_warranty: 0,
  approve_status: 1,
  has_showcase: 1,
  list_time: "",
  //邮费模板
  // postage_id: 5478758160,
  // 119包邮
  postage_id: 8151607820,

  has_discount: 0,
  modified: "",
  upload_fail_msg: 200,
  picture_status: "1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;",
  auction_point: "0",

  video: "", //TOD

  // 这是为了货店通的需要，所以加上
  // outer_id: productId,

  //宝贝分类
  navigation_type: 2,

  is_lighting_consigment: "32",
  sub_stock_type: 2,
  syncStatus: "1",
  user_name: "623064100_00",
  features: "mysize_tp:-1;sizeGroupId:136553091;sizeGroupType:women_top",

  // 数字ID
  num_id: '',

  is_xinpin: "248",
  auto_fill: "0",
  item_suze: "bulk:0.000000",
  global_stock_type: "-1",
  qualification: "%7B%20%20%7D",
  add_qualification: 0,
  o2o_bind_service: 0,
  newprepay: 1,

  // 自定义属性
  input_custom_cpv: "",
  //宝贝属性
  cateProps: "",

  propAlias: ""
};



var product = {
  id: '6374384',
  title: '',
  price: '',
  desc: '',
  zhutu: [],
  descImgs: [],

  color: [
    // {
    //   name: '',
    //   img: '',
    //   id: '',
    //   size: {
    //     S: '10'
    //   }
    // }
  ]
};

async.series([
  function(done){
    request.get( 'http://item.vancl.com/6374384.html' )
      .end(function(err, res) {
        var $ = cheerio.load(res.text, { decodeEntities: false });

        var title = $('h2').eq(0).text().trim();
        product.title = title.slice(0,  title.lastIndexOf(' '));
        product.price = $('.priceLayout').eq(2).text().replace(/[\r\n\s]/g, '');
        var $selColor = $('.selColorArea .selColor li');

        // 处理商品颜色
        $selColor.each( (i, item) => {
          product.color.push( {
            name: $(item)[0].attribs.title,
            id: $(item).find('a')[0].attribs.href.slice(0, 7),
            size: {}
          });
        } );

        // 商品详情
        var $RsetTabCon = $('.RsetTabCon');
        var descImgs = product.descImgs = [];

        $RsetTabCon.find('img').each( (i, item) => {
          var imgSrc = $(item)[0].attribs.original;
          descImgs.push( imgSrc );
          $(item).attr('src', './data/img/' + imgSrc.substr(27).replace('/', '_'));
          $(item).attr('original', '');
        });
        // 删除详情中的script和style和提问部分
        $RsetTabCon.find('.RsetTabCon').remove();
        $RsetTabCon.find('style').remove();
        $RsetTabCon.find('script').remove();
        product.desc = $RsetTabCon.html();

        done();
      });
  },
  function(){
    var index = 0;
    function size(){
      var colorItem = product.color[index];
      request.get( `http://item.vancl.com/styles/AjaxChangeProduct.aspx?productcode=${colorItem.id}` )
        .end( (err, res) => {
          var $ = cheerio.load(res.text, { decodeEntities: false });
          var $selSize = $('.selSize li');

          $selSize.each( (i, item) => {
            var $item = $(item);
            colorItem.size[ $item.text().replace(/[\r\n\s]/g, '') ] = $item[0].attribs.onclick.match(/',(.*?)\)/)[1]
          } );        
          product.zhutu.push( $('#midimg')[0].attribs.src );

          if( product.color[++index] ){
            size();
          }else{
            console.log( _.extend({}, product, defaults ) );
          }
        });
    }
    size();
  }
]);

// getCategory();