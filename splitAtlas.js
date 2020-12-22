var fs = require("fs");
var path = require("path");
var Jimp = require("jimp");

var srcFile = process.argv[2];
if (!srcFile) {
	console.error("Please input atlas file");
}
if (!srcFile.endsWith(".atlas")) {
	srcFile += ".atlas";
}
var srcDir = path.dirname(srcFile);

var outputDir = process.argv[3] || srcDir + "/output";

console.log("run: " + srcFile + " " + outputDir)
//"RoadbankerSix.png":{"frame":{"h":20,"idx":0,"w":20,"x":673,"y":62},"sourceSize":{"h":20,"w":20},"spriteSourceSize":{"x":0,"y":0}},
var writeImage = function (p, k, v, cb) {
	let frame = v.frame
	let sourceSize = v.sourceSize
    var image = new Jimp(sourceSize.w, sourceSize.h);
    image.rgba(true);
	image.background(0);
	// 位置暂时都默认为0
    var dstX = 0;
	var dstY = 0;
    var srcX = frame.x;
    var srcY = frame.y;
    var srcW = frame.w;
    var srcH = frame.h;
    image.blit(p, dstX, dstY, srcX, srcY, srcW, srcH);

	var fileName = k;//k.replace(/_([^_]*)$/, ".$1");
	image.write(outputDir + "/" + fileName);
	cb();
}

var runMapAsync = function (p, m, f) {
	var keys = Object.keys(m);
	var next = function (i) {
		k = keys[i];
		v = m[k];
		return function () {
			if (i >= keys.length) return;
			f(p, k, v, next(i + 1));
		}
	}
	next(0)();
}


fs.readFile(srcFile, (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	var sheet = JSON.parse(data);
	if (!sheet) {
		return;
	}
	outputDir = srcDir + '/output/' + sheet.meta.prefix
	var filePath = srcDir + "/" + sheet.meta.image;
	Jimp.read(filePath).then(function (p) {
		runMapAsync(p, sheet.frames, writeImage);
	}).catch(function (err) {
		// handle an exception
		console.error(err);
	});

})
