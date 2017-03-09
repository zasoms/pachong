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

module.exports = {
  hex: hex,
  mkdirSync: mkdirSync
};