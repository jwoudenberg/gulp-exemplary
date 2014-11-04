suite('example.input');

var assert = require('assert');
var mylib = require('mylib');

test('The foo method returns a number.', function(done) {
    var result = mylib.foo();
    assert.strictEqual(typeof result, 'number');
    done();
});

test('The bar method takes a method that gets a number.', function(done) {
    mylib.bar(function(err, result) {
        assert.strictEqual(typeof result, 'number');
        done();
    });
});
