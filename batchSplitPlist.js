var fs = require("fs");
var path = require("path");
var plist = require("plist");
var Jimp = require("jimp");

var directoryPath = process.argv[2]
fs.readdir(directoryPath, function (error, files) {
	if (error) {
		return console.log('Unable to scan directory' + error)
	}
    files.forEach(function (filename) {
		if (filename.endsWith('.plist')) {
			// console.log(directoryPath + filename)
			singleSplit(directoryPath + '/' + filename)
		}
	})
})

function singleSplit(filePath) {
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
			console.error(err);
			return;	
		}
        // console.log(data);
        var result = plist.parse(data);
        // console.log(result)
        // console.log(JSON.stringify(result.metadata.textureFileName));
        for (var k in result.frames) {
            let f = result.frames[k];
            f.frame = parseFrame(f.frame);
            f.offset = parseFrame(f.offset);
            f.sourceColorRect = parseFrame(f.sourceColorRect);
            f.sourceSize = parseFrame(f.sourceSize);
            // console.log(f.frame);
        }
        var fileImage = directoryPath + "/" + result.metadata.textureFileName;
        const dirName = result.metadata.textureFileName.split('.')[0]
        // console.log(dirName)
        Jimp.read(fileImage).then((p) => {
            runMapAsync(p,dirName, result.frames, writeImage);
            // console.log("success")
        }).catch(function (err) {
            // handle an exception
            console.error(err)
        });
    });
}

var writeImage = function (p,dirName, k, v, cb) {
    console.log("writeImage p: " + p + " k: " + k + " v: " + JSON.stringify(v));
    var width = v.sourceSize[0];
    var height = v.sourceSize[1];
    var dstX = v.sourceColorRect[0][0];
    var dstY = v.sourceColorRect[0][1];
    var srcX = v.frame[0][0];
    var srcY = v.frame[0][1];
    var srcW = v.frame[1][0];
    var srcH = v.frame[1][1];

    if (v.rotated) {
        [width, height] = [height, width];
        [srcW, srcH] = [srcH, srcW];
    }

    var image = new Jimp(width, height);
    image.rgba(true);
    image.background(0);
    image.blit(p, dstX, dstY, srcX, srcY, srcW, srcH);
    if(v.rotated) {
        image.rotate(-90);
    }

    var fileName = k + ".png";
    const outputDir = directoryPath + '/output/' + dirName
    image.write(outputDir + "/" + fileName)
    cb()
}

var parseFrame = function (str) {
    str = str.replace(/\{/g, "[").replace(/\}/g, "]");
    return JSON.parse(str);
}

var runMapAsync = function (p,dirName, m, f) {
    var keys = Object.keys(m)
    var next = function (i) {
        k = keys[i]
        v = m[k]
        return function () {
            if (i >= keys.length) return
            f(p,dirName, k, v, next(i + 1))
        }
    }
    next(0)()
}