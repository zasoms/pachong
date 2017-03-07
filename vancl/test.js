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

getCategory();