const gulp = require("gulp");
const autoprefixer = require('gulp-autoprefixer');
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");

//default task
gulp.task("default", ["styles", "copy-html", "copy-imgs", "scripts", "scripts-dist"], function() {
	gulp.watch('css/*.css', ['styles']);
	gulp.watch('/index.html', ['copy-html']);
});

//prepare for distribution
gulp.task("dist", [
	"copy-html",
	"copy-imgs",
	"styles",
	"scripts-dist"
]);

//copies the html to the disribution folder
gulp.task("copy-html", function() {
	gulp.src("index.html")
	.pipe(gulp.dest('./dist'))
});

//copies the images folder to the distribution folder
gulp.task("copy-imgs", function() {
	gulp.src("img/*")
	.pipe(gulp.dest("dist/img"))
});

//sets gulp to add prefixes with Autoprefixer after Dreamweaver outputs the Sass filee to CSS
//once the prefixer finishes its job, outputs the file to the distribution folder
gulp.task("styles", function() {
	gulp.src("css/*.css")
	.pipe(autoprefixer({
        browsers: ["last 2 versions"]
      }))
	.pipe(gulp.dest('./dist/css'))
});

//deals with concating the scripts while in development mode
gulp.task("scripts", function() {
	gulp.src("js/*.js")
	.pipe(babel())
	.pipe(concat('all.js'))
	.pipe(gulp.dest("dist/js"))
});

//deals with concating the scripts while in production mode
gulp.task("scripts-dist", function() {
	gulp.src("js/*.js")
	.pipe(babel())
	.pipe(concat('all.js'))
	.pipe(uglify())
	.pipe(gulp.dest("dist/js"))
});