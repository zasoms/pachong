var request = require("request"),
    cheerio = require("cheerio"),
    debug = require("debug")("lativ:update");

debug("读取分类");

request("http://www.lativ.com", function(err, res){
    if(err) return console.error(err);

    var $ = cheerio.load(res.body.toString());

    var classList = [];
    $("#nav li a").each(function(i, item){
        var $item = $(item);

        classList.push({
            id: i,
            url: $item.attr("href"),
            name: $item.attr("rel")
        });
    });

    console.log(classList);
});
