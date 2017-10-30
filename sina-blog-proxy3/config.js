// Mysql数据库连接配置
var mysql  = require("mysql");//创建数据库连接

exports.db = mysql.createConnection({
    host: "127.0.0.1",          //数据库ID
    port: 3306,                 //数据库端口
    database: "sina_blog",      //数据库名称
    user: "root",               //数据库用户名
    password: "root"            //数据库密码
});

// 博客配置
exports.sinaBlog = {
    url: "http://blog.sina.com.cn/u/1776757314"
};


// web服务器端口
exports.port = process.env.port || 3000;

// 定时更新
// second: 0-59, minutes: 0-59, hours: 0-23, Day of Month: 1-31, Months: 0-11, Day of Week: 0-6
// exports.autoUpdate = '* */24 * * * *';
// 每天0点
exports.autoUpdate = '0 0 0 * * *';
