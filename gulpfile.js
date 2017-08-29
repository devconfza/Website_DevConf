var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('style', function() {
  return gulp
    .src('./public/css/_less/style.less')
    .pipe(
      less({
        paths: ['./node_modules/bootstrap-less/bootstrap'],
      })
    ).pipe(gulp.dest('./public/css'));
});

gulp.task('update', done => {
  gulp.src('./node_modules/bootstrap-less/js/bootstrap.min.js').pipe(gulp.dest('./public/scripts'));
  done();
});
