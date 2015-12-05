# gulp-exemplary
[![NPM version](http://img.shields.io/npm/v/gulp-exemplary.svg?style=flat-square)](https://www.npmjs.com/package/gulp-exemplary)
[![Build status](http://img.shields.io/travis/jwoudenberg/gulp-exemplary/master.svg?style=flat-square)](https://travis-ci.org/jwoudenberg/gulp-exemplary)

It can be extremely helpfull to new users if a library comes with some examples.
Sadly though, it often happens that examples stop working as the code base moves
forward. This can create a lot of confusion.

This gulp task takes your example files and turns them into test suites. That
way you can be sure your examples and library work as specified.

## Usage

You can install `gulp-exemplary` as a development dependency.

    npm install gulp-exemplary --save-dev

Now add it to your `gulpfile.js`. The generated testcases can be executed with
mocha, using the `qunit` interface.

```js
var exampleToTest = require('gulp-exemplary');
gulp.task('test-examples', function () {
    gulp.src('./examples/*.js')
        .pipe(exampleToTest())
        .on('error', console.log)
        .pipe(gulp.dest('./example-tests'))
        .pipe(mocha({
            ui: 'qunit',
            reporter: 'spec'
        }));
```

## Example Format

The plugin understands a very basic example-format. Unindented single line
comments are interpeted as test descriptions and split the file into test cases.
`console.log()`s are turned into assertions. The `done()` callback that
signifies a test case is completed, is called after the last assertion.

Take the following example in a file `mylib-methods.js`.

```js
var mylib = require('mylib');

//The foo method returns a number.
var result = mylib.foo();
console.log(typeof result);     //=> 'number'

//The bar method takes a method that gets a number.
mylib.bar(function(err, result) {
    console.log(typeof result);     //=> 'number'
});
```

It gets transformed into something like this (though less nicely formatted).

```js
suite('mylib methods');
var assert = require('assert');
var mylib = require('mylib');

test('The foo method returns a number.', function(done) {
    var result = mylib.foo();
    assert.strictEqual(typeof result, 'number');
    done();
}

test('The bar method takes a method that gets a number.', function(done) {
    mylib.bar(function(err, result) {
        assert.strictEqual(typeof result, 'number');
        done();
    });
}
```
