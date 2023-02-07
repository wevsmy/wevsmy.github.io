const gulp = require("gulp");
const clean = require("gulp-clean");
const cleanCSS = require('gulp-clean-css');
const htmlclean = require('gulp-htmlclean');
const htmlmin = require('gulp-html-minifier-terser');
const fontmin = require('gulp-fontmin');
const shell = require("gulp-shell");
const terser = require('gulp-terser');
const workbox = require("workbox-build");
const fs = require('fs');
const path = require('path')
const axios = require('axios').default;

// clean
gulp.task("clean", function () {
    return gulp.src("./public", { read: false, allowEmpty: true })
    .pipe(clean());
});

// 生成 sw
gulp.task('generate-service-worker', () => {
    return workbox.injectManifest({
        swSrc: './sw-template.js',
        swDest: './public/sw.js',
        globDirectory: './public',
        globPatterns: [
            "**/*.{html,css,js,json,woff2}"
        ],
        modifyURLPrefix: {
            "": "./"
        }
    });
});

// 压缩js
gulp.task('compress', () =>
  gulp.src(['./public/**/*.js', '!./public/**/*.min.js'])
    .pipe(terser())
    .pipe(gulp.dest('./public'))
)

//压缩css
gulp.task('minify-css', () => {
    return gulp.src(['./public/**/*.css'])
        .pipe(cleanCSS({
            compatibility: 'ie11'
        }))
        .pipe(gulp.dest('./public'));
});

//压缩html
gulp.task('minify-html', () => {
    return gulp.src('./public/**/*.html')
        .pipe(htmlclean())
        .pipe(htmlmin({
            removeComments: true, //清除html注释
            collapseWhitespace: true, //压缩html
            collapseBooleanAttributes: true,
            //省略布尔属性的值，例如：<input checked="true"/> ==> <input />
            removeEmptyAttributes: true,
            //删除所有空格作属性值，例如：<input id="" /> ==> <input />
            removeScriptTypeAttributes: true,
            //删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,
            //删除<style>和<link>的 type="text/css"
            minifyJS: true, //压缩页面 JS
            minifyCSS: true, //压缩页面 CSS
            minifyURLs: true  //压缩页面URL
        }))
        .pipe(gulp.dest('./public'))
});

//压缩字体
function minifyFont(text, cb) {
  gulp
    .src('./public/fonts/*.ttf') //原字体所在目录
    .pipe(fontmin({
      text: text
    }))
    .pipe(gulp.dest('./public/fontsdest/')) //压缩后的输出目录
    .on('end', cb);
}

gulp.task('minify-font', (cb) => {
  var buffers = [];
  gulp
    .src(['./public/**/*.html']) //HTML文件所在目录请根据自身情况修改
    .on('data', function(file) {
      buffers.push(file.contents);
    })
    .on('end', function() {
      var text = Buffer.concat(buffers).toString('utf-8');
      minifyFont(text, cb);
    });
});

// url 是资源地址，如，http://wximg.233.com/attached/image/20160815/20160815162505_0878.png
// filepath 是文件下载的本地目录
// name 是下载后的文件名
async function downloadFile(url, filepath, name) {
  if (!fs.existsSync(filepath)) {
      fs.mkdirSync(filepath);
  }
  const mypath = path.resolve(filepath, name);
  const writer = fs.createWriteStream(mypath);
  const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
  });
}

function getBingWallpaperInfoFile(cb){
  const uri = 'https://efs.coding.net/p/lab/shared-depot/BingWallpaper/git/raw/master/BingWallpaper/BingWallpaperInfo.json'
  downloadFile(uri,'./public/bing','BingWallpaperInfo.json').then((res)=>{
    cb()
  })
}

gulp.task('download', (cb)=>{
  getBingWallpaperInfoFile(cb)
})

// 运行 gulp build 命令时依次执行以下任务
gulp.task("build", gulp.series(
    // "clean",
    "generate-service-worker",
    "compress",
    "minify-css",
    "minify-html",
    "minify-font",
    "download",
));
