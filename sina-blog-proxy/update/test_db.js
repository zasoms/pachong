var request = require("request");
var cheerio = require("cheerio");
var mysql  = require("mysql");
var debug = require("debug")("blog:update");


//创建数据库连接
var db = mysql.createConnection({
    host: "127.0.0.1",          //数据库ID
    port: 3306,                 //数据库端口
    database: "sina_blog",      //数据库名称
    user: "root",               //数据库用户名
    password: "root"            //数据库密码
});

//显示所有的数据库表
db.query("show tables", function(err, tables){
    if(err){
        console.log(err);
    }else{
        console.log(tables);
    }

    // 关闭连接
    db.end();
});

/**
 * 保存文章分类
 * @param {Object}   data
 * @param {Function} callback
 */
function saveClssItem(data, callback){
    db.query("SELECT * FROM `class_list` WHERE `id`=? LIMIT 1", [data.id], function(err, data){
        if(err) return next(err);

        if( Array.isArray(data) && data.length >= 1 ){
            //分类已经存在，更新一下
            db.query("UPDATE `class_list` SET `name`=?, `url`=? WHERE `id`=?", [data.name, data.url, data.id], callback);
        }else{
            db.query("INSERT INTO `class_list`(`id`, `name`, `url`) VALUES (?, ?, ?)", [data.name, data.url, data.id], callback);
        }
    });
}
