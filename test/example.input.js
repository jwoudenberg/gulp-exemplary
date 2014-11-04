var mylib = require('mylib');

//The foo method returns a number.
var result = mylib.foo();
console.log(typeof result);     //=> 'number'

//The bar method takes a method that gets a number.
mylib.bar(function(err, result) {
    console.log(typeof result);     //=> 'number'
});
