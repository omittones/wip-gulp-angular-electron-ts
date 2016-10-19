var _ = require('lodash');
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
var fs = require('fs');
var packager = require('electron-packager')
var tslintCustom = require('tslint'); // for tslint-next https://github.com/panuhorsmalahti/gulp-tslint#specifying-the-tslint-module
var asar = require('asar');
require('dotbin');

var tsFilesGlob = (function(c) {
    return c.filesGlob || c.files || 'src/**/*.ts';
})(require('./tsconfig.json'));

gulp.task('clean', 'Cleans the generated js files from obj directory', function() {
    return del([
        'obj/**/*',
        'bin/**/*'
    ]);
});

gulp.task('lint', 'Lints all TypeScript source files.', function() {
    return gulp.src(tsFilesGlob)
        .pipe(tslint({
            tslint: tslintCustom,
            formatter: 'verbose'
        }))
        .pipe(tslint.report());
});

gulp.task('html', 'Copies all html source files.', function() {
    return gulp.src('src/*.html')
        .pipe(print())
        .pipe(gulp.dest('obj'));
});

gulp.task('fonts', 'Copies all font source files.', function() {
    return gulp.src('src/bower_components/bootstrap/dist/fonts/*')
        .pipe(print())
        .pipe(gulp.dest('obj/fonts'));
});

gulp.task('js', 'Copies all js source files.', function() {
    var js = [
        'src/bower_components/jquery/dist/jquery.js',
        'src/js/initialize.js',
        'src/bower_components/bootstrap/dist/js/bootstrap.js'
    ];
    return gulp.src(js)
        .pipe(order(['jquery.js', 'initialize.js', '*.js']))
        .pipe(print())
        .pipe(concat('js/bundle.js'))
        .pipe(gulp.dest('obj'));
});

gulp.task('css', 'Copies all css source files.', function() {
    var css = [
        'src/bower_components/bootstrap/dist/css/bootstrap.css',
        'src/css/*.css'
    ];
    return gulp.src(css)
        .pipe(print())
        .pipe(concat('css/bundle.css'))
        .pipe(gulp.dest('obj'));
});

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

gulp.task('publish', 'Publishes app', ['build'], function(cb) {
    var options = {
        dir : '.',
        arch: 'x64',
        asar: true,
        prune: true,
        ignore: function(path) {

            if (path.endsWith('package.json'))
                return false;
            if (path.endsWith('.md'))
                return true;
            if (path.endsWith('.d.ts'))
                return true;
            if (path.endsWith('.js.map'))
                return true;
            if (path.startsWith('/.git/'))
                return true;
            if (path.startsWith('/src/'))
                return true;
            if (path.startsWith('/node_modules/.bin/'))
                return true;
            if (path.startsWith('/node_modules/angular-chart.js/examples'))
                return true;
            if (path.startsWith('/node_modules/angular-chart.js/test'))
                return true;
            if (path.startsWith('/node_modules/angular-chart.js/tmp'))
                return true;
            if (path.startsWith('/node_modules/chart.js/test'))
                return true;
            if (path.startsWith('/node_modules/chart.js/samples'))
                return true;
            if (path.startsWith('/node_modules/chart.js/samples'))
                return true;
            if (path.startsWith('/node_modules/lodash/') && !path.endsWith('lodash.js'))
                return true;
            if (path.startsWith('/node_modules/moment/') && !path.endsWith('moment.js'))
                return true;
            if (path.indexOf('is-my-json-valid/test') > -1)
                return true;

            return false;
        },
        out: './bin/',
        overwrite: true,
        platform: 'win32'
    };
    packager(options, function (err, appPaths) {
        _.each(appPaths, p => {
            console.log('Published to ' + p);
            var asarFile = '.\\' + p + '\\resources\\app.asar';
            var files = asar.listPackage(asarFile);
            var output = files.join('\n');
            fs.writeFileSync('.\\filelist.txt', output);
        });

        cb(err);
    });
});

gulp.task('rebuild', 'Rebuilds everything.', ['clean', 'build'], function() {
});

gulp.task('build', 'Builds everything.', ['ts', 'js', 'fonts', 'html', 'css'], function() {
});

gulp.task('test', 'Runs the Jasmine test specs.', ['build'], function() {
    return gulp.src('test/*.ts')
        .pipe(mocha({
            require: ['ts-node/register']
        }));
});

gulp.task('watch', 'Watches ts source files and runs build on change.', function() {
    gulp.watch('src/**/*', ['build']);
});