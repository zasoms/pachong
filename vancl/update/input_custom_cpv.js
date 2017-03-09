var config = require("../lativConfig");

var COLOR = config.COLOR;
var SIZE = config.SIZE;
var cache = {};

module.exports = function(type, value, size, sizePre){
  var data = type === 'color' ? this.COLOR : this.SIZE;

  if (type == 'color') {
    if (!data[value]) {
      data[value] = "1627207:-" + this.cNum + ";";
      product.input_custom_cpv += "1627207:-" + this.cNum + ":" + value + ";";
      this.cNum++;
    }
  }
  if (type == 'size') {
    if (!value.trim()) {
      value = size;
    }
    if (!data[value]) {
      data[value] = sizePre + ":-" + this.sNum + ";";
      product.input_custom_cpv += sizePre + ":-" + this.sNum + ":" + value + "(" + size + ");";
      this.sNum++;
    } else {
      if (!cache[value]) {
        product.cpv_memo += data[value].slice(0, -1) + ":" + size + ";";
        cache[value] = 1;
      }
    }
  }
  return data[value];
};
