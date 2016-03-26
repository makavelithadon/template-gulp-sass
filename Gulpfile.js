var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    cached = require('gulp-cached'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

var base = './',
    app = 'app/',
    assets = app + 'assets/';

var paths = {
    scss: assets + 'scss/',
    css: assets + 'css/',
    js: assets + 'js/',
    html: app,
    img: assets + 'img/',
    sprites: assets + 'img/sprites',
    fonts: assets + 'fonts'
};

var config = {
    browsersync: {
        server: {
            baseDir: base + app
        },
        options: {
            stream: true
        }
    },
    sass: {
        options: {
            sourceMap: true,
            outputStyle: 'compressed'
        },
        rename: {
            basename: 'style',
            suffix: '.min'
        }
    },
    autoprefixer: {
        browsers: [
            'last 2 versions',
            'safari 5',
            'ie 8',
            'ie 9',
            'opera 12.1',
            'ios 6',
            'android 4'
          ],
        cascade: true
    }
};

gulp.task('browser-sync', function() {
    browserSync.init(config.browsersync);
});

gulp.task('html', function(){
return gulp.src(paths.html + '*.html')
    .pipe(plumber())
    .pipe(cached('html'))
    .pipe(reload(config.browsersync.options));
});

gulp.task('styles', function () {
  return gulp.src(paths.scss + '**/*.scss')
    .pipe(plumber())
    .pipe(sass(config.sass.options).on('error', sass.logError))
    .pipe(autoprefixer(config.autoprefixer))
    .pipe(rename(config.sass.rename))
    .pipe(gulp.dest(paths.css))
    .pipe(reload(config.browsersync.options));
});

gulp.task('scripts', function () {
  return gulp.src(paths.js + 'main.js')
    .pipe(plumber())
    .pipe(cached('js'))
    .pipe(uglify())
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest(base + 'assets/js'))
    .pipe(reload(config.browsersync.options));
});

gulp.task('watch', function () {

    gulp.watch(paths.html + '*.html', gulp.series('html'));

    gulp.watch(paths.scss + '**/*', gulp.series('styles'));

    gulp.watch(paths.js + 'main.js', gulp.series('scripts'));
});


gulp.task('watch', gulp.parallel('watch'));

gulp.task('default', gulp.parallel('watch', 'browser-sync'));
