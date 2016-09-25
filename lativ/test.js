var images = require("images");
var path = "data/img/28415_L_61.jpg";
images(path)
	.draw( images("logo.png"), 10, 10 )
	.save( path, {
		quality: 60
	} );