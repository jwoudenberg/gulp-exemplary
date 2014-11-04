var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var through = require('through2');
var colors = require('colors/safe');
var exampleToTest = require('./');

function onError(error) {
    gutil.log(error);
    process.exit(1);
}

gulp.task('test', function() {
    //Compare the uglified input file to the uglified output file.
    //We don't care if the code is not identical, just functionally equivalent.
    return gulp.src('./test/*.input.js')
        .pipe(exampleToTest())
        .on('error', onError)
        .pipe(uglify())
        .pipe(checkOutput());
});

function checkOutput() {
    var stream = through.obj(function(file, enc, callback) {
        var filePath = file.path;
        var expectedResultPath = filePath.replace('input.js', 'output.js');
        var fileContents = file.contents.toString(enc);
        gulp.src(expectedResultPath)
            .pipe(uglify())
            .on('data', function(expectedFile) {
                var expectedContents = expectedFile.contents.toString(enc);
                if (fileContents === expectedContents) {
                    console.log(colors.green('%s matches its output file'),
                                filePath);
                }
                else {
                    console.log(
                        colors.red('%s does not match its output file.'),
                        filePath);
                    process.exit(1);
                }
            })
            .on('finish', callback);
    });
    return stream;
}
