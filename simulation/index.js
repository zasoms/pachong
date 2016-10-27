var cheerio = require("cheerio");
var request = require("superagent");


var base_headers = {
	"_1_auth":"13CRyDlKQOFNlzYZ0rWRNoDbePrv3T",
	"_1_ver":"0.3.0",
	"Accept":"*/*",
	"Accept-Encoding":"gzip, deflate, br",
	"Accept-Language":"zh-CN,zh;q=0.8",
	"Connection":"keep-alive",
	"Content-Length":"54",
	"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
	
	"Host":"segmentfault.com",
	"Origin":"https://segmentfault.com",
	"Referer":"https://segmentfault.com/",
	"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
	"X-Requested-With":"XMLHttpRequest"
};
var cookie;

function getToken(s){
	var $ = cheerio.load(s),
		text = $("body script").eq(4).text(),
		fn = new Function("window", text + "; return window.SF.token"),
		token = fn({});

	$ = null;
	return token;
}

var params = {
	mail: "623064100@qq.com",
	password: "zh19930721",
	remember: "1"
};

request.get("https://segmentfault.com")
	.end(function(err, res){
		var token = getToken(res.text);
		cookie = res.headers['set-cookie']
                .join(',').match(/(PHPSESSID=.+?);/)[1];


        request
        	.post("https://segmentfault.com/api/user/login")
        	.query({"_": token})
        	.set(base_headers)
        	.set("Cookie", cookie)
        	.type("form")
        	.send(params)
        	.redirects("0")
        	.end(function(err, res){
        		request.get("https://segmentfault.com/user/settings")
        			.end(function(err, res){
        				console.log(res);
        			})
        	})
	});