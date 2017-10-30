var cheerio = require("cheerio");
var request = require("superagent");

function extend(source, target){
    for(var attr in target){
       source[attr] = target[attr]; 
    }
}

function convertCookie(cookies){
    var cookie = {},
        str = "",
        item, index = 0;
    for(var i=0, ilen=cookies.length; i<ilen; i++){
        item = cookies[i].split(';')[0];
        str += item +"; ";
        index = item.indexOf('=');
        cookie[ item.slice(0, index) ] = item.slice(index+1);
    }
    return {
        object: cookie,
        str: str
    };
}

var params = {
	"email": "623064100@qq.com",
	"pw": "zh19930721"
};

var loginUrl = "https://m.lativ.com/Home/Login";
request.get(loginUrl)
    .set({
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1",
        "Host": "m.lativ.com"
    })
    .end(function(err, res){
        var $ = cheerio.load(res.text, {decodeEntities: false});
        params["__RequestVerificationToken"] = $('[name="__RequestVerificationToken"]').val();
        var cookies = convertCookie(res.headers['set-cookie']);
        // console.log(cookies);
        request.post(loginUrl)
            .set({
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.8",
                "Cache-Control": "max-age=0",
                "Content-Type": "application/x-www-form-urlencoded",
                "Host": "m.lativ.com",
                "Origin": "https://m.lativ.com",
                "Referer": "https://m.lativ.com/Home/Login",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
            })
            // .set("Cookie", '__RequestVerificationToken_Lw__=' + cookies.object['__RequestVerificationToken_Lw__'])
            .set("Cookie", cookies.str)
            .send(params)
            .type('form')
            .redirects(0)
            .end(function(err, res){
                var cookie = res.headers['set-cookie'];
                request.get("https://m.lativ.com/Member")
                    .set({
                        "Host": "m.lativ.com",
                        "Referer": "https://m.lativ.com/Home/Login",
                        "Upgrade-Insecure-Requests": "1",
                        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
                    })
                    .end(function(err, res){
                        console.log(res);
                        var $ = cheerio.load(res.text, {decodeEntities: false});
                        console.log( $(".order-list-content").length );
                    });
            });
    });