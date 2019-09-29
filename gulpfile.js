const gulp = require("gulp");
const autoprefixer = require('gulp-autoprefixer');

//default task
gulp.task("default", function() {
  gulp.watch('css/*.css', ['styles']);
});

//sets gulp to add prefixes with Autoprefixer after Dreamweaver outputs the Sass filee to CSS
gulp.task("styles", function() {
	gulp.src("css/*.css")
	.pipe(autoprefixer({
        browsers: ["last 2 versions"]
      }))
	.pipe(gulp.dest('./dist/css'))
});

