var request = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore");

var postData = {
	m: "login",
	url: "/"
};
var cookie = "";

request.get("http://www.shuaishou.com/login.aspx")
	.end(function(err, res){
		var $ = cheerio.load(res.text);

		postData["__VIEWSTATE"] = $("#__VIEWSTATE").val();

		postData[ $("[value='用户名...']").attr("name") ] = "zh2302277";
		postData[ $("[type='password']").attr("name") ] = "zh19930721";

		login();
	});

function login(){
	request.post("http://www.shuaishou.com/login.aspx")
	.set({
		_1_auth: "S9Bc5scO1d8dS16GOCJ0mpkcSegR3z",
		_1_ver: "0.3.0",
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		"Accept-Encoding": "gzip, deflate",
		"Accept-Language": "zh-CN,zh;q=0.8",
		"Cache-Control": "max-age=0",
		Connection: "keep-alive",
		"Content-Length": 323,
		"Content-Type": "application/x-www-form-urlencoded",
		Host: "www.shuaishou.com",
		Origin: "http://www.shuaishou.com",
		Referer: "http://www.shuaishou.com/login.aspx",
		"Upgrade-Insecure-Requests": 1,
		"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
	})
	.send(postData)
	.end(function(err, res){
		cookie = res.headers['set-cookie'][0].split(" path")[0];
		getProduct();
	});
}

function getProduct(){
	request.post("http://kc.shuaishou.com/KCManagement/Handler/KCManagement.ashx")
	.set({
		_1_auth: "S9Bc5scO1d8dS16GOCJ0mpkcSegR3z",
		_1_ver: "0.3.0",
		Accept: "text/plain, */*; q=0.01",
		"Accept-Encoding": "gzip, deflate",
		"Accept-Language": "zh-CN,zh;q=0.8",
		"Cache-Control": "max-age=0",
		Connection: "keep-alive",
		"Content-Length": 255,
		"Content-Type": "application/x-www-form-urlencoded",
		Cookie: cookie + " Hm_lvt_1ce25aec29f08e9e4c41870df26c3850=1470752016; Hm_lpvt_1ce25aec29f08e9e4c41870df26c3850=1470758234",
		Host: "kc.shuaishou.com",
		Origin: "http://kc.shuaishou.com",
		Referer: "http://kc.shuaishou.com/KCManagement/KCManagement.aspx",
		"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
		"X-Requested-With": "XMLHttpRequest"
	})
	.send({
		action:"getKCItemList",
		itemName:"",
		itemCode:"",
		sortId:0,
		numPress:0,
		numWeight:0,
		order:0,
		isMoreSerch:false,
		exWarehouseTime:0,
		unsalableItem:0,
		shopId:0,
		synchStatus:0,
		listingStatus:0,
		itemInventoryChange:0,
		isTcItem:0,
		shopIds:7162,
		shopItemId:"",
		currentPage:1,
		pageSize:10
	})
	.end(function(err, res){
		console.log(res.text);
	});
}