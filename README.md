# 图片切分工具

可以单个或者批量切割图集,支持常见的三种格式,

命令格式

node xxx.js 文件或者文件夹 [输出目录]

输出目录可以不填,默认为,切割文件所在目录的下的 output文件夹



## 安装依赖

```
npm run install
```





## egret 图集

### configure file

使用 egret TextureMerger 工具的 json 格式

```
 {
  'frames': {
  'subfilename': {
   {x, y, w, h}
  },
  ...
 }
}
```

### run

```sh
node splitEgret.js inputfileOrinputDir [output]
```

### example:

```shell
node .\splitEgret.js .\sample\betlog_sheet.json
```





## level helper Plist 文件

### configure file

使用 plist 文件

### run

```sh
node  .\splitPlist.js inputfileOrinputDir [output]
```

### example:

```sh
node .\splitPlist.js .\sample\Sheet1.plist
```



## atlas 文件 laya

### configure file

使用 atlas 文件

### run

```sh
node .\splitAtlas.js .\sample\Poker.atlas 
```



example:

```bash
node .\splitAtlas.js .\sample\Poker.atlas 
```



## TODO

自动判断文件类型进行切分
