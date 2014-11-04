var path = require('path');
var format = require('util').format;
var through = require('through2');
var gutil = require('gulp-util');

var PLUGIN_NAME = 'gulp-example-to-test';
var CONSOLE_LOG_FORMAT = 'console.log(foo); //=> \'bar\'';
var CONSOLE_LOG_REGEX = /^(\s*)console\.log\((.*)\).*=>(.*)$/;

function gulpExampleToTest() {
    var stream = through.obj(function(file, enc, callback) {
        var testFile = null;
        if (file.isStream()) {
            return this.emit('error', new gutil.PluginError(PLUGIN_NAME,
                                                     'No support for streams'));
        }
        if (file.isBuffer()) {
            testFile = exampleToTest(file.clone());
        }

        this.push(testFile);
        callback();
    });


    return stream;
}

function exampleToTest(file, enc) {
    var _this = this;
    var fileName = path.basename(file.path, '.js');
    var contents = file.contents.toString(enc);

    //Identify testcases. They start with a non-indented comment.
    var testCases = contents.split(/\n\/\//);
    //Put apart the file prelude (not a testcase).
    var prelude = testCases.shift();


    //Add data to the prelude.
    var header = format('suite(\'%s\');\n', fileName.replace('-', ' '));
    prelude = [
        header,
        'var assert = require(\'assert\');',
        prelude
    ].join('\n');

    //Wrap the testcases in a mocha-harness.
    testCases = testCases.map(function(testCase) {
        var lines = testCase.trim().split('\n');
        var title = lines.shift();
        var lastAssertionLineIndex = -1;
        var assertionWhitespace = '';
        //Console logs will be replaced with assertions.
        lines = lines.map(function(line, index) {
            var hasLineComment = (line.indexOf('console.log') !== -1);
            if (!hasLineComment) {
                return line;
            }
            //Find console logs (see format at the top of this file).
            var regexResult = CONSOLE_LOG_REGEX.exec(line);
            assertionWhitespace = regexResult && regexResult[1];
            var assertedValue = regexResult && regexResult[2].trim();
            var expectedValue = regexResult && regexResult[3].trim();
            if (!assertedValue || !expectedValue) {
                _this.emit('error', new gutil.PluginError(
                    PLUGIN_NAME,
                    [
                        'Line cannot be turned into assertion:',
                        '  ' + line.trim(),
                        'Expected format:',
                        '  ' + CONSOLE_LOG_FORMAT
                    ].join('\n'))
                );
            }
            lastAssertionLineIndex = index;
            var assertLine = format(
                '%sassert.strictEqual(%s, %s);',
                assertionWhitespace,
                assertedValue,
                expectedValue
            );
            return assertLine;
        });
        var doneLine = assertionWhitespace + 'done();';
        if (lastAssertionLineIndex === -1) {
            //Append done() to the end of the testcase.
            lines.push(doneLine);
        } else {
            //Append done() after the last assertion.
            lines.splice(lastAssertionLineIndex+1, 0, doneLine);
        }
        //Wrap the entire testcase in a test() function.
        testCase = [
            format('test(\'%s\', function(done) {', title),
            lines.join('\n'),
            '});\n'
        ].join('\n');
        return testCase;
    });

    //Put everything back together.
    testCases.unshift(prelude);
    contents = testCases.join('\n');

    file.contents = new Buffer(contents);
    return file;
}

module.exports = gulpExampleToTest;
