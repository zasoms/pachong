var request = require("request");
var cheerio = require("cheerio");
var async  = require("async");
var debug = require("debug")("blog:update");

/**
 * 获取分类页面博文列表
 * @param {String}   url
 * @param {Function} callback
 */
function readArticleList(url, callback){
    debug("读取博文列表：%s", url);

    request(url, function(err, res){
        if(err) return console.err(err);

        // 根据网页内容创建DOM操作对象
        var $ = cheerio.load(res.body.toString());

        //读取博文类别列表
        var articleList = [];
        $(".articleList .articleCell").each(function(){
            var $me = $(this);

            var $title = $me.find(".atc_title a");
            var $time = $me.find(".atc_tm");
            var item = {
                name: $title.text().trim(),
                url:  $title.attr("href"),
                time: $time.text().trim()
            };

            //从url中取出文章的ID
            var s = item.url.match(/blog_([a-zA-Z0-9]+)\.html/);
            if(Array.isArray(s)){
                item.id = s[1];
                articleList.push(item);
            }
        });

        var nextUrl = $(".SG_pgnext a").attr("href");
        if(nextUrl){
            readArticleList(nextUrl, function(err, articleList2){
                if(err) return console.err(err);

                //合并结果
                callback(null, articleList.concat(articleList2));
            });
        }else{
            callback(null, articleList);
        }
    });
}

/**
 * 获取博文页面内容
 * @param {String}   url
 * @param {Function} callback
 */
function readArticleDetail(url, callback){
    debug("读取博文内容：%s", url);

    request(url, function(err, res){
        if(err) return console.err(err);

        // 根据网页内容创建DOM操作对象
        var $ = cheerio.load(res.body.toString());

        //读取文章标签
        var tags = [];
        $(".blog_tag h3 a").each(function(){
            var tag = $(this).text().trim();

            if(tag){
                tags.push(tag);
            }
        });

        var content = $(".articalContent").html().trim();

        callback(null, {tags: tags, content: content});
    });
}


readArticleList("http://blog.sina.com.cn/s/articlelist_1776757314_0_1.html", function(err, articleList){
    if(err) return console.err(err.stack);

    //依次取出articlelist数组的每个元素，调用第二个参数中传入的函数
    //函数的每一个参数及时articleList数组的其中一个袁术
    //函数的第二个函数是会掉函数
    async.eachSeries(articleList, function(article, next){

        //读取文章
        readArticleDetail(article.url, function(err, detail){
            if(err) return console.err(err.stack);

            //直接显示
            console.log(detail);

            //需要调用 next() 来返回
            next();
        });

    }, function(err){
        //当遍历完articleList后，执行回调函数

        if(err) return console.err(err.stack);

        console.log("完成");
    });

});
