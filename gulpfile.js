var gulp = require('gulp');
gulp = require('gulp-help')(gulp);
var order = require('gulp-order');
var concat = require('gulp-concat');
var tslint = require('gulp-tslint');
var exec = require('child_process').exec;
var mocha = require('gulp-mocha');
var print = require('gulp-print');
var path = require('path');
var del = require('del');
var tslintCustom = require('tslint'); // for tslint-next https://github.com/panuhorsmalahti/gulp-tslint#specifying-the-tslint-module
require('dotbin');

var tsFilesGlob = (function(c) {
    return c.filesGlob || c.files || 'src/**/*.ts';
})(require('./tsconfig.json'));

gulp.task('clean', 'Cleans the generated js files from dist directory', function() {
    return del([
        'dist/**/*'
    ]);
});

gulp.task('lint', 'Lints all TypeScript source files', function() {
    return gulp.src(tsFilesGlob)
        .pipe(tslint({
            tslint: tslintCustom,
            formatter: 'verbose'
        }))
        .pipe(tslint.report());
});

gulp.task('html', 'Copies all html source files', function() {
    return gulp.src('src/*.html')
        .pipe(print())
        .pipe(gulp.dest('dist'));
});

gulp.task('fonts', 'Copies all font source files', function() {
    return gulp.src('src/bower_components/bootstrap/dist/fonts/*')
        .pipe(print())
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('js', 'Copies all js source files', function() {
    var js = [
        'src/bower_components/jquery/dist/jquery.js',
        'src/js/initialize.js',
        'src/bower_components/bootstrap/dist/js/bootstrap.js'
    ];
    return gulp.src(js)
        .pipe(order(['jquery.js', 'initialize.js', '*.js']))
        .pipe(print())
        .pipe(concat('js/bundle.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('css', 'Copies all css source files', function() {
    var css = [
        'src/bower_components/bootstrap/dist/css/bootstrap.css',
        'src/css/*.css'
    ];
    return gulp.src(css)
        .pipe(print())
        .pipe(concat('css/bundle.css'))
        .pipe(gulp.dest('dist'));
});

//gulp.task('build', 'Compiles all TypeScript source files', ['html', 'lint'], function (cb) {
gulp.task('ts', 'Compiles all TypeScript source files', [], function(cb) {
    exec('tsc --version', function(err, stdout, stderr) {
        console.log('Using TypeScript ', stdout);
        if (stderr) {
            console.log(stderr);
        }
    });
    return exec('tsc', function(err, stdout, stderr) {
        console.log(stdout);
        if (stderr) {
            console.log(stderr);
        }
        cb(err);
    });
});

gulp.task('publish', 'Publishes asar package', ['build'], function(cb) {
    return exec('asar pack ./dist dist.asar', function(err, stdout, stderr) {
        console.log(stdout);
        if (stderr) {
            console.log(stderr);
        }
        cb(err);
    });
});

gulp.task('rebuild', 'Rebuilds everything', ['clean', 'build'], function() {
});

gulp.task('build', 'Builds everything', ['ts', 'js', 'fonts', 'html', 'css'], function() {
});

gulp.task('test', 'Runs the Jasmine test specs', ['build'], function() {
    return gulp.src('test/*.ts')
        .pipe(mocha({
            require: ['ts-node/register']
        }));
});

gulp.task('watch', 'Watches ts source fiSles and runs build on change', function() {
    gulp.watch('src/**/*', ['build']);
});