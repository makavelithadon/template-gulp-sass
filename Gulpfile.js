// Load plugins
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;



/*  CONFIG Object  */

var base = "./app/";
var srcAssets = base + 'assets/';

var config = {
    browsersync: {
        server: {
            baseDir: base
        },
        options: {
            stream: true
        }
    },
    html: {
        src:  base + '*.html',
        dest: base + '*.html',
        options: {
            removeComments: true,
            collapseWhitespace: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            minifyJS: true,
            minifyCss: true,
            ignoreCustomComments: true
        },
    },
    sass: {
        src:  srcAssets + 'scss/main.scss',
        dest: srcAssets + 'css/',
        all_files: srcAssets + 'scss/**/*.*',
        options: {
            sourceMap: true
        },
        errorAlert: function(err){
            console.log(err.toString());
            this.emit("end");
        },
        rename: {
            basename: 'style',
            suffix: '.min'
        }
    },
    cssnano: {
        discardComments: {
            removeAll: true
        },
        discardDuplicates: {
            removeAll: true
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
    },
    scripts: {
        src: srcAssets + 'js/**/*.js',
        dest: srcAssets + 'js/',
        final_name: 'main.min.js',
        all_files: [srcAssets + 'js/vendors/jquery.min.js', srcAssets + 'js/vendors/ejs.min.js', srcAssets + 'js/main.js']
    },
    uglify: {
        options: {
            compress: true
        }
    },
    size: {
        options: {
            showFiles: true,
            pretty: true
        }
    },
    images: {
        src: srcAssets + 'img/**/*.*',
        dest: srcAssets + 'img/'
    },
    imagemin: {
        options: {
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }
    },
    sprites: {
      src: srcAssets + 'img/icons/*.*',
      dest: {
        css: srcAssets + 'scss/partials/others',
        image: srcAssets + 'img/sprites/'
      },
      options: {
        cssName: '_sprites.scss',
        cssFormat: 'css',
        cssOpts: {
          cssClass: function (item) {
            // If this is a hover sprite, name it as a hover one (e.g. 'home-hover' -> 'home:hover')
            if (item.name.indexOf('-hover') !== -1) {
              return '.icon-' + item.name.replace('-hover', ':hover');
              // Otherwise, use the name as the selector (e.g. 'home' -> 'home')
            } else {
              return '.icon-' + item.name;
            }
          }
        },
        imgName: 'icon-sprite.png',
        imgPath: srcAssets + 'img/sprites/icon-sprite.png'
      }
  },
  watcher : function (event, task){
      var action;
      if (event.type == 'changed') {
          action = 'modifié';
      } else if (event.type == 'added') {
          action = 'ajouté';
      }
      $.util.log($.util.colors.green('Le fichier ' + event.path + ' a été ' + action + ', lancement de la tâche ' + '\"' + task + '\"'));
  }
};



// Task Browsersync

gulp.task('browser-sync', function() {
    browserSync.init(config.browsersync);
});

// Task SASS / SCSS

gulp.task('sass', function(){
    gulp.src(config.sass.src)
    .pipe($.plumber())
    //.pipe($.cached('sass'))
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sass(config.sass.options).on('error', sass.logError))
    .pipe($.plumber())
    .pipe($.autoprefixer(config.autoprefixer))
    .pipe($.cssnano(config.cssnano))
    .pipe($.rename(config.sass.rename))
    .pipe($.size(config.size.options))
    .pipe(gulp.dest(config.sass.dest))
    .pipe(reload(config.browsersync.options));
});

// Task HTML

gulp.task('html', function(){
return gulp.src(config.html.src)
    .pipe($.cached('html'))
    .pipe($.htmlmin(config.html.options))
    .pipe($.size(config.size.options))
    .pipe(reload(config.browsersync.options));
});

// Task Javascript

gulp.task('js', function(){
    return gulp.src(config.scripts.all_files)
    .pipe($.plumber())
    .pipe($.cached('js'))
    .pipe($.plumber())
    .pipe($.remember('js'))
    .pipe($.concat(config.scripts.final_name))
    .pipe($.uglify(config.uglify.options))
    .pipe($.size(config.size.options))
    .pipe(gulp.dest(config.scripts.dest))
    .pipe(reload(config.browsersync.options));
});

// Task Images

gulp.task('images', function() {
  return gulp.src(config.images.src)
    .pipe($.cached('images'))
    .pipe($.cache($.imagemin(config.imagemin.options)))
    .pipe(gulp.dest(config.images.dest))
    .pipe(reload(config.browsersync.options));
});

// Task Sprites css

gulp.task('sprites', function() {
    var spriteData = gulp.src(config.sprites.src).pipe($.spritesmith(config.sprites.options));
    spriteData.img
    .pipe(gulp.dest(config.sprites.dest.image));
    spriteData.css
    .pipe(gulp.dest(config.sprites.dest.css));
});

// Task zip

gulp.task('zip', function(){
    return gulp.src(base + '**/*.*')
		.pipe($.zip('archive.zip'))
		.pipe(gulp.dest('./'));
});

gulp.task('watch', gulp.parallel('browser-sync', 'images', 'sass', 'js', 'html', 'zip'), function(){

    gulp.watch(config.sass.all_files, ['sass']).on('change', function(event){
        config.watcher(event, 'sass');
    });

    gulp.watch(config.html.src, ['html']).on('change', function(event){
        config.watcher(event, 'html');
    });

    gulp.watch(config.scripts.all_files, ['js']).on('change', function(event){
        config.watcher(event, 'js');
    });

    gulp.watch(config.images.src, ['images']).on('change', function(event) {
      config.watcher(event, 'img');
  });
});

gulp.task('default', gulp.series('watch'));
