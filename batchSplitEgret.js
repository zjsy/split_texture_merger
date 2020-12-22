var fs = require("fs");
var path = require("path");
var Jimp = require("jimp");

var directoryPath = process.argv[2]; 
fs.readdir(directoryPath, function (error, files) {
	if (error) {
		return console.log('Unable to scan directory' + error)
	}
	files.forEach(function (filename) {
		if (filename.endsWith('.json')) {
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
		var sheet = JSON.parse(data)
		if (!sheet) {
			return;
		}
		var fileImage = directoryPath + "/" + sheet.file;
		const dirName = sheet.file.split('.')[0]
		console.log(fileImage)
		Jimp.read(fileImage).then(function (p) {
			runMapAsync(p, dirName, sheet.frames, writeImage)  // 这里有问题
			// console.log(fileImage)
		}).catch(function (err) {
			console.error(err);
		})
	})
	// console.log(filePath)
}

var writeImage = function (p,dirName, k, v, cb) {
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

