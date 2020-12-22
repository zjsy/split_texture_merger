var fs = require("fs");
var path = require("path");
var Jimp = require("jimp");

var srcFile = process.argv[2];

if (!srcFile) {
	console.error("Please input json file");
}

if (!srcFile.endsWith(".json")) {
	srcFile += ".json";
}

var srcDir = path.dirname(srcFile);

console.log(srcDir)

var filename = path.basename(srcFile,'.json')

var outputDir = process.argv[3] || srcDir + "/output/" + filename;

// console.log("run: " + srcFile + " " + outputDir)

//{"offY":7,"offX":5,"sourceH":128,"sourceW":128,"w":117,"h":117,"y":621,"x":2}
var writeImage = function (p, k, v, cb) {
    var image = new Jimp(v.sourceW, v.sourceH);
    image.rgba(true);
    image.background(0);
    var dstX = v.offX;
    var dstY = v.offY;
    var srcX = v.x;
    var srcY = v.y;
    var srcW = v.w;
    var srcH = v.h;
    image.blit(p, dstX, dstY, srcX, srcY, srcW, srcH);

	// 如果带后缀，用后缀，如果没后缀，TODO: 但是现在只时判断了_png后缀
	// 新版本似乎都是不带后缀的
	if (k.indexOf('_png') !== -1) {
		var fileName = k.replace(/_([^_]*)$/, ".$1");
	} else { 
		fileName = k+'.png'
	}
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

	var filePath = srcDir + "/" + sheet.file;
	// console.log(filePath)
	Jimp.read(filePath).then(function (p) {
		runMapAsync(p, sheet.frames, writeImage);
	}).catch(function (err) {
		// handle an exception
		console.error(err);
	});

})
