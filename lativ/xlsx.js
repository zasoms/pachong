var xlsx = require("node-xlsx"),
	fs = require("fs");

//导入xlsx
var filename='./b.xlsx';
var obj = xlsx.parse(filename);
console.log(JSON.stringify(obj));


// 导出xlsx
/*
var data = [
    [1, 2, 3],
    [true, false, null, 'sheetjs'],
    ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'],
    ['baz', null, 'qux']
];

var buffer = xlsx.build([{ 
	name: "mySheetName", 
	data: data 
}]);

fs.writeFile('b.xlsx', buffer, 'binary');
*/