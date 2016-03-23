var json2csv = require("json2csv"),
    fs = require("fs"),
    fields = ["car", "price", "color"];

/*
// 存储csv
var myCar = [{
    "car": "Audi",
    "price": 40000,
    "color": "blue"
}, {
    "car": "BMW",
    "price": 35000,
    "color": "black"
}, {
    "car": "Porsche",
    "price": 60000,
    "color": "green"
}];

json2csv({
	data: myCar,
	fields: fields
}, function(err, csv){
	if( err ){
		console.log(err);
	}else{
		fs.writeFile("file.csv", csv, function(err){
			if(err) throw er;
			console.log("file saved");
		});
	}
});
*/