var csv = require("fast-csv"),
    json2csv = require("json2csv"),
    iconv = require("iconv-lite"),
    fs = require("fs"),
    _ = require("underscore");

function compare(){
	var ids = [],
		online = {},
		i = 0;
	var stream = fs.createReadStream('../lativ.csv');

	csv.fromStream( stream, { delimiter: '\t' } )
		.on("data", function(arr){
			// var data = unescape(arr[0].replace("\\u", "%")).replace("\\0", "");
			i++;
			console.log(i);
			console.log(arr[33]);
			// if( /^[0-9]{8}/.test(arr[33])){
			// 	ids.push(arr[33]);
			// }
	    })
	    .on("end", function(){
	    	fs.writeFile("online.js", "exports.data=" +JSON.stringify(ids));
	    });
	}
// compare();

function abc(){
	var down = require("./data").data;
	var productList = require("./online").data;

	var dlen = down.length;
	var plen = productList.length;

	var collection = [];
	var difference = [];
	var online = [];

	for(var i=0; i<plen; i++){
	    var item1 = productList[i];
	    for(var j=0; j<dlen; j++){
	        var item2 = down[j];
	        if( item1.slice(0, 5) == item2.slice(0, 5) ){
	            // console.log(item2);
	            collection.push(item1);
	            break;       
	        }
	    }
	}
	for(var k=0; k<plen; k++){
	    var item3 = productList[k];
	    if( !(~collection.indexOf( item3 )) ){
	        difference.push( item3 );
	    }else{
	    	online.push( item3 );
	    }
	}
	// for(var k=0; k<dlen; k++){
	//     var item3 = down[k];
	//     if( !(~collection.indexOf( item3 )) ){
	//         difference.push( item3 );
	//     }
	// }

	console.log(online);
}
abc();
