var csv = require("fast-csv"),
    json2csv = require("json2csv"),
    iconv = require("iconv-lite"),
    fs = require("fs"),
    _ = require("underscore");

function online(){
	var data = [];
	fs.createReadStream('online.csv')
		.pipe(csv())
		.on("data", function(arr){
			var line = unescape(arr[0].replace(/\\u/g, "%u"));
			console.log(line.match(/()/))

			if( /^[0-9]/.test(arr[30]) || /^BN-/.test(arr[33]) ){

			}
	    })
	    .on("end", function(){
	         console.log(data, "done");
	    });
	}
online();

function compare(){
	var data = [];
	fs.createReadStream('data.csv')
		.pipe(csv())
		.on("data", function(arr){
			if( /^[0-9]/.test(arr[30]) || /^BN-/.test(arr[33]) ){
				data.push({
					cateProps: arr[21],
					skuProps: arr[30],
					outer_id: arr[33],
					cpv_memo: arr[58],
					input_custom_cpv: arr[59]
				});
			}
	    })
	    .on("end", function(){
	         console.log(data, "done");
	    });
}
// compare();