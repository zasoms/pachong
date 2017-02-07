var originRequest = require("request");
var cheerio = require("cheerio");
var debug = require("debug")("blog:update:read");

var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
};
/**
 * 请求制定URL
 * @param {String}   url
 * @param {Function} callback
 */
function request(url, callback) {
    var options = {
        url: url,
        encoding: null,
        // proxy: '',
        headers: headers
    };
    originRequest(options, callback);
}

/**
 * 获取文章分类列表
 * @param {String}   url
 * @param {Function} callback
 */
exports.classList = function(url, callback) {
    debug("读取文章分类列表: %s", url);

    request(url, function(err, res) {
        if (err) return callback(err);

        // 根据网页内容创建DOM操作对象
        var $ = cheerio.load(res.body.toString());

        //读取博文类别列表
        var classList = [];
        $(".classList li a").each(function() {
            var $me = $(this);

            var item = {
                name: $me.text().trim(),
                url: $me.attr("href")
            };

            //从url中取出分类的ID
            var s = item.url.match(/articlelist_\d+_(\d+)_\d\.html/);
            if (Array.isArray(s)) {
                item.id = s[1];
                classList.push(item);
            }
        });

        // 返回结果
        callback(null, classList);
    });
};
/**
 * 获取分类页面博文列表
 * @param {String}   url
 * @param {Function} callback
 */
exports.articleList = function(url, callback) {
    debug("读取博文列表: %s", url);

    request(url, function(err, res) {
        if (err) return callback(err);

        // 根据网页内容创建DOM操作对象
        var $ = cheerio.load(res.body.toString());

        //读取博文类别列表
        var articleList = [];
        $(".articleList .articleCell").each(function() {
            var $me = $(this);

            var $title = $me.find(".atc_title a");
            var $time = $me.find(".atc_tm");
            var item = {
                name: $title.text().trim(),
                url: $title.attr("href"),
                time: $time.text().trim()
            };

            //从url中取出文章的ID
            var s = item.url.match(/blog_([a-zA-Z0-9]+)\.html/);
            if (Array.isArray(s)) {
                item.id = s[1];
                articleList.push(item);
            }
        });

        // 检查是否有下一页
        var nextUrl = $(".SG_pgnext a").attr("href");
        if (nextUrl) {
            exports.articleList(nextUrl, function(err, articleList2) {
                if (err) return callback(err);

                //合并结果
                callback(null, articleList.concat(articleList2));
            });
        } else {
            callback(null, articleList);
        }
    });
};
/**
 * 获取博文页面内容
 * @param {String}   url
 * @param {Function} callback
 */
exports.articleDetail = function(url, callback) {
    request(url, function(err, res) {
        if (err) return callback(err);

        // 根据网页内容创建DOM操作对象
        var $ = cheerio.load(res.body.toString());

        //读取文章标签
        var tags = [];
        $(".blog_tag h3 a").each(function() {
            var tag = $(this).text().trim();

            if (tag) {
                tags.push(tag);
            }
        });

        // 获取文章内容
        var content = $(".articalContent").html().trim();

        // 返回结果
        callback(null, {
            tags: tags,
            content: content
        });
    });
};
