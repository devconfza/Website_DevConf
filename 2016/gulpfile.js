var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

gulp.task('style', function() {
    return gulp.src('./public/css/_less/style.less')
        .pipe(less({
            paths: ['./node_modules/bootstrap-less/bootstrap']
        }))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('scripts', function() {
	return gulp.src('./node_modules/jquery/dist/jquery.min.js')
		.pipe(gulp.dest('./public/scripts'));
});
