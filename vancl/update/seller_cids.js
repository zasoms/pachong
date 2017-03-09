var categorys = require("./category").data;
var config = require("../config");
var SELLER_CIDS = config.SELLER_CIDS;
module.exports = function(productId){
    var category,
    lists,
    id,
    seller_cids = "";
  for (var i = 0, ilen = categorys.length; i < ilen; i++) {
    category = categorys[i];
    lists = category.lists;
    for (var j = 0, jlen = lists.length; j < jlen; j++) {
      id = lists[j];
      if (id.slice(0, 5) == productId.slice(0, 5)) {
        seller_cids += SELLER_CIDS[category.categoryName] + ",";
      }
    }
  }
  this.product.seller_cids = seller_cids;
};
