const gulp = require('gulp');
const sass = require('gulp-sass');
const cached = require('gulp-cached');
const sassPartialsImported = require('gulp-sass-partials-imported');

let scss_dir = 'src/scss/';
let includePaths = ['src/scss/vendors'];

gulp.task('sass', () => {
    gulp.src('src/*.scss')
        .pipe(cached('sassfiles'))
        .pipe(sassPartialsImported(scss_dir, includePaths))
        .pipe(sass({ includePaths: scss_dir }).on('error', sass.logError))
        .pipe(gulp.dest('dist'));
});


gulp.task('watch', function () {

    gulp.watch('src/*.scss', ['sass'])

});
