var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var browserSync = require('browser-sync').create();
var del = require('del');
var fs = require('fs');
var imageminPngquant = require('imagemin-pngquant');
var path = require('path');
var runSequence = require('run-sequence');
var spritesmith = require('gulp.spritesmith');
var autoprefixer = require('autoprefixer');
var argv = require('yargs').alias('s', 'sourcemaps').argv;

// Error handler for gulp-plumber
function errorHandler(err) {
    $.util.log([ (err.name + ' in ' + err.plugin).bold.red, '', err.message, '' ].join('\n'));

    this.emit('end');
}

var options = {
    del: [
        'build'
    ],
    path: {
        build: {
            css: './build/css'
        }
    },
    plumber: {
        errorHandler: errorHandler
    },
    browserSync: {
        server: './build',
        notify: false
    },
    pug: {
        pretty: '\t'
    },
    csso: {
        restructure: true,
        sourceMap: true
    },
    spritesmith: {
        retinaSrcFilter: '**/*@2x.png',
        imgName: 'sprite.png',
        retinaImgName: 'sprite@2x.png',
        cssName: 'sprite.styl',
        algorithm: 'binary-tree',
        padding: 8,
        cssTemplate: './src/modules/_common/_sprite/_sprite__constants.mustache'
    },
    imagemin: {
        images: [
            $.imagemin.gifsicle({
                interlaced: true,
                optimizationLevel: 3
            }),
            $.imagemin.jpegtran({
                progressive: true
            }),
            imageminPngquant(),
            $.imagemin.svgo({
                plugins: [
                    { cleanupIDs: false },
                    { removeViewBox: false },
                    { convertPathData: false },
                    { mergePaths: false }
                ]
            })
        ],

        icons: [
            $.imagemin.svgo({
                plugins: [
                    { removeTitle: true },
                    { removeStyleElement: true },
                    { removeAttrs: { attrs: [ 'id', 'class', 'data-name', 'fill', 'fill-rule' ] } },
                    { removeEmptyContainers: true },
                    { sortAttrs: true },
                    { removeUselessDefs: true },
                    { removeEmptyText: true },
                    { removeEditorsNSData: true },
                    { removeEmptyAttrs: true },
                    { removeHiddenElems: true },
                    { transformsWithOnePath: true }
                ]
            })
        ]
    }
};

gulp.task('cleanup', function(cb) {
    return del(options.del, cb);
});

gulp.task('serve', function() {
    return browserSync.init(options.browserSync);
});

gulp.task('build:css', function() {
    return gulp.src([ '*.styl', '!_*.styl' ], { cwd: 'src/modules' })
        .pipe($.plumber(options.plumber))
        .pipe($.if(argv.s, $.sourcemaps.init()))
        .pipe($.stylus())
        .pipe(gulp.dest(options.path.build.css))
        .pipe($.csso(options.csso))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.if(argv.sourcemaps, $.sourcemaps.write('.')))
        .pipe(gulp.dest(options.path.build.css))
        .pipe(browserSync.reload({
            stream: true,
            match: '**/*.css'
        }));
});

gulp.task('build:scripts', function() {

});

gulp.task('build:icons', function() {

});

gulp.task('build:sprite', function() {

});

gulp.task('build:html', function() {

});

gulp.task('build', function(cb) {
    return runSequence(
        'cleanup',
        [
            'build:html',
            'build:icons',
            'build:sprite',
            'modules:assets',
            'build:assets',
            'build:scripts'
        ],
        'build:css',
        cb
    );
});

gulp.task('dev', function(cb) {
    return runSequence(
        'build',
        [
            'serve',
            'watch'
        ],
        cb
    );
});

gulp.task('watch', function() {

    // Modules, pages
    $.watch('source/**/*.pug', function() {
        return runSequence('build:pages', browserSync.reload);
    });

    // Modules data
    $.watch([ 'source/modules/*/data/*.yml' ], function() {
        return runSequence('build:html', browserSync.reload);
    });

    // Static styles
    $.watch('source/static/styles/**/*.styl', function() {
        return gulp.start('build:css');
    });

    // Modules styles
    $.watch('source/modules/**/*.styl', function() {
        return gulp.start('build:css');
    });

    // Static scripts
    $.watch('source/static/scripts/**/*.js', function() {
        return runSequence('build:scripts', browserSync.reload);
    });

    // Modules scripts
    $.watch('source/modules/*/*.js', function() {
        return runSequence('build:scripts', browserSync.reload);
    });

    // Modules images
    $.watch('source/modules/*/assets/**/*.{jpg,gif,svg,png}', function() {
        return runSequence('modules:assets', browserSync.reload);
    });

    // Static files
    $.watch('source/static/assets/**/*', function() {
        return runSequence('build:assets', browserSync.reload);
    });

    // Svg icons
    $.watch('source/static/icons/**/*.svg', function() {
        return runSequence('build:icons', 'build:css', browserSync.reload);
    });

    // Png sprites
    $.watch('source/static/sprite/**/*.png', function() {
        return runSequence('build:sprite', browserSync.reload);
    });
});

gulp.task('default', function() {
    gulp.start('build');
});