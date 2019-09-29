const gulp = require("gulp");
const autoprefixer = require('gulp-autoprefixer');

//default task
gulp.task("default", function() {
  gulp.watch('css/*.css', ['styles']);
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