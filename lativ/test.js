var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    debug = require("debug")("blog:update:read");


var cache = {};

const CATEGORY = {
    "T恤&POLO-WOMEN":       1251438469,
    "衬衫-WOMEN":           1251438470,
    "针织衫-WOMEN":         1251438471,
    "外套类-WOMEN":         1251438472,
    "裤装&裙装-WOMEN":      1251438473,
    "内衣&内裤&袜子-WOMEN": 1251438474,
    "起居服&配件-WOMEN":    1251438475,

    "T恤&POLO-MEN":       1251439047,
    "衬衫-MEN":           1251439048,
    "外套类-MEN":         1251439049,
    "裤装-MEN":           1251439050,
    "内衣&内裤&袜子-MEN": 1251439051,
    "起居服&配件-MEN":    1251439052,

    "印花T恤-TOGETHER":    1276391404,
    "上衣-TOGETHER":       1276391405,
    "POLO衫-TOGETHER":     1276391406,
    "外套-TOGETHER":       1276391407,
    "裤装-TOGETHER":       1276391408,
    "其他-TOGETHER":       1276391409,
};

/*
var arr = [
    {
        category: "123456",
        lists: [15454, 445454, 87977445, 4545, 45488],
    },
    {
        category: "123467",
        lists: [15454, 445454, 454545, 4545, 45488],
    },
];
arr.forEach(function(item){
    var category = item.category;
    item.lists.forEach(function(list){
        if( cache[list+''] ){
            console.log("add category", list);
            //如果已经存在这个产品了，那么就是给这个产品添加产品类型
            return ;
        }
        cache[list+''] = 1;

        // 进行数据的添加
        console.log(list);
    });
    // console.log(item.category);
});
 */


