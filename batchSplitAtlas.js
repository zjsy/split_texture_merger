var fs = require("fs");
var path = require("path");
var Jimp = require("jimp");

var directoryPath = process.argv[2]; 
fs.readdir(directoryPath, function (error, files) {
	if (error) {
		return console.log('Unable to scan directory' + error)
	}
    files.forEach(function (filename) {
		if (filename.endsWith('.atlas')) {
			// console.log(directoryPath + filename)
			singleSplit(directoryPath + '/' + filename)
		}
	})
})

function singleSplit(filePath) {
	fs.readFile(filePath, (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
	
		var sheet = JSON.parse(data);
		if (!sheet) {
			return;
		}
		// outputDir = srcDir + '/output/' + sheet.meta.prefix
		var fileImage = directoryPath + "/" + sheet.meta.image;
		const dirName = sheet.meta.image.split('.')[0]
		Jimp.read(fileImage).then(function (p) {
			runMapAsync(p, dirName, sheet.frames, writeImage);
			// console.log("success")
		}).catch(function (err) {
			// handle an exception
			console.error(err);
		});
	
	})
}

var writeImage = function (p,dirName, k, v, cb) {
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
	const outputDir = directoryPath + '/output/' + dirName
	image.write(outputDir + "/" + fileName);
	cb();
}

var runMapAsync = function (p,dirName, m, f) {
	var keys = Object.keys(m);
	var next = function (i) {
		k = keys[i];
		v = m[k];
		return function () {
			if (i >= keys.length) return;
			f(p,dirName, k, v, next(i + 1));
		}
	}
	next(0)();
}