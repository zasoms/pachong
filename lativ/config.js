// Mysql数据库连接配置
var mysql  = require("mysql");//创建数据库连接

exports.db = mysql.createConnection({
    host: "127.0.0.1",          //数据库ID
    port: 3306,                 //数据库端口
    database: "lativ_shop",      //数据库名称
    user: "root",               //数据库用户名
    password: "root"            //数据库密码
});

// 博客配置
exports.lativ = {
    url: "http://www.lativ.com/"
};


// web服务器端口
exports.port = process.env.port || 3000;

// 定时更新
// exports.autoUpdate = '* */30 * * *';
