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

var selColor = [];
request.get( 'http://item.vancl.com/6374384.html' )
  .end(function(err, res) {
    var $ = cheerio.load(res.text, { decodeEntities: false });
    var $selColor = $('.selColorArea .selColor li');

    // 处理商品颜色
    $selColor.each( (i, item) => {
      selColor.push( {
        name: $(item)[0].attribs.title,
        id: $(item).find('a')[0].attribs.href.slice(0, 7),
        size: {}
      });
    } );

    // 商品详情
    var $sideBarSettabArea = $('.sideBarSettabArea');
    var descImgs = [];

    $sideBarSettabArea.find('img').each( (i, item) => {
      var imgSrc = $(item)[0].attribs.original;
      descImgs.push( imgSrc );
      $(item).attr('src', './data/img/' + imgSrc.substr(27).replace('/', '_'));
    });

    console.log( selColor );
    getSize();
  });


function getSize(){
  var colorItem = selColor[0];
  request.get( `http://item.vancl.com/styles/AjaxChangeProduct.aspx?productcode=${colorItem.id}` )
    .end( (err, res) => {
      var $ = cheerio.load(res.text, { decodeEntities: false });
      var $selSize = $('.selSize li');

      $selSize.each( (i, item) => {
        var $item = $(item);
        colorItem.size[ $item.text().replace(/[\r\n\s]/g, '') ] = $item[0].attribs.onclick.match(/',(.*?)\)/)[1]
        colorItem.img = $('#midimg')[0].attribs.src;
      } );

      console.log( selColor );
    });
}

// getCategory();