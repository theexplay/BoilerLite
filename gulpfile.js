var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var browserSync = require('browser-sync').create();
var del = require('del');
var imageminPngquant = require('imagemin-pngquant');
var pug = require('pug');
var runSequence = require('run-sequence');
var spritesmith = require('gulp.spritesmith');
var stylus = require('stylus');

var errorHandler = function (err) {
    $.util.log([(err.name + ' in ' + err.plugin).bold.red, '', err.message, ''].join('\n'));

    if ($.util.env.beep) {
        $.util.beep();
    }

    this.emit('end');
};


var options = {

    path: {
        build: {
            html: '',
            js: '',
            styles: '',
            assets: '',
            fonts: '',
            images: '',
            sprite: '',
            icons: ''
        },
        src: {
            html: '',
            js: '',
            styles: '',
            assets: '',
            fonts: '',
            images: '',
            sprite: '',
            icons: ''
        },
        watch: {
            html: '',
            js: '',
            styles: '',
            assets: '',
            fonts: '',
            images: '',
            sprite: '',
            icons: ''
        },

        clean: './build'
    }

};
