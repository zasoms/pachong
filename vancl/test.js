var request = require("superagent"),
  cheerio = require("cheerio"),
  async = require("async"),
  fs = require("fs"),
  path = require("path"),
  _ = require("underscore"),
  debug = require("debug")("blog:update:read");



var products = [];

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
    var catetory = urls[mainIndex]
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
            console.log(null ,ids, urls);
          }
        }
      });
  }
  child();
}




/*
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
var productId = '6374384';
async.series([
  function(done){
    request.get( `http://item.vancl.com/${productId}.html` )
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
            console.log( product.color );
          }
        });
    }
    size();
  }
]);*/