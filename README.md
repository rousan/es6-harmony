# ES6 Harmony

Provides an equivalent implementation of ES6(Harmony)
in pure ES5 code and creates an ES6 environment for old browsers or
JavaScript Engines. At least ES5 is required.
To get standalone implementation of `Symbol`, `Promise`, or `Collections`(`Map`, `Set`, `WeakMap` and `WeakSet`),
please visit [symbol-es6](https://github.com/ariyankhan/symbol-es6), [es6-promise-shim](https://github.com/ariyankhan/es6-promise-shim) and [collections-es6](https://github.com/ariyankhan/collections-es6).
     
## Implemented 

* `Array`

    * `Array.from()`
    * `Array.of()`
    * `Array.prototype.fill()`
    * `Array.prototype.find()`
    * `Array.prototype.findIndex()`
    * `Array.prototype.entries()`
    * `Array.prototype.keys()`
    * `Array.prototype.copyWithin()`
    * `Array.prototype.concat()` (ES6 version, addition of `@@isConcatSpreadable` support)
    * `Array.prototype[@@iterator]`
    
* `Map`

    * `Map.prototype.size`
    * `Map.prototype.set()`
    * `Map.prototype.get()`
    * `Map.prototype.has()`
    * `Map.prototype.clear()`
    * `Map.prototype.delete()`
    * `Map.prototype.entries()`
    * `Map.prototype.forEach()`
    * `Map.prototype.keys()`
    * `Map.prototype.values()`
    * `Map.prototype[@@iterator]()` 
    * `Map.prototype[@@toStringTag]()`
    
* `Set`

    * `Set.prototype.size`
    * `Set.prototype.add()`
    * `Set.prototype.clear()`
    * `Set.prototype.delete()`
    * `Set.prototype.entries()`
    * `Set.prototype.forEach()`
    * `Set.prototype.has()`
    * `Set.prototype.keys()`
    * `Set.prototype.values()`
    * `Set.prototype[@@iterator]()`
    * `Set.prototype[@@toStringTag]()`
    
* `WeakMap`

    * `WeakMap.prototype.delete()`
    * `WeakMap.prototype.get()`
    * `WeakMap.prototype.has()`
    * `WeakMap.prototype.set()`
    * `WeakMap.prototype[@@toStringTag]()`
    
* `WeakSet`

    * `WeakSet.prototype.add()`
    * `WeakSet.prototype.delete()`
    * `WeakSet.prototype.has()`
    * `WeakSet.prototype[@@toStringTag]()`
    
* `Number`
    
    * `Number.isNaN()`
    * `Number.isFinite()`
    * `Number.isInteger()`
    * `Number.parseInt()`
    * `Number.parseFloat()`
    * `Number.EPSILON`
    * `Number.MAX_SAFE_INTEGER`
    * `Number.MIN_SAFE_INTEGER`
    * `Number.isSafeIntger()`
    
* `Object`
    
    * `Object.is()`
    * `Object.setPrototypeOf()` (It assumes that `Object.prototype.__proto__` accessor property already exists)
    * `Object.assign()`
    * `Object.getOwnPropertySymbols`
    * `Object.prototype.toString()` (ES6 version, addition of `@@toStringTag` support)

* `Promise`

    * `Promise.all()`
    * `Promise.race()`
    * `Promise.reject()`
    * `Promise.resolve()`
    * `Promise.prototype.then()`
    * `Promise.prototype.catch()`

* `String`
    
    * `String.fromCodePoint()`
    * `String.prototype.codePointAt()`
    * `String.prototype.startsWith()`
    * `String.prototype.endsWith()`
    * `String.prototype.includes()`
    * `String.prototype.repeat()`
    
* `Symbol`

    * `Symbol.for()`
    * `Symbol.keyFor()`
    * `Symbol.iterator`
    * `Symbol.hasInstance`
    * `Symbol.isConcatSpreadable`
    * `Symbol.toStringTag`
    * `Symbol.prototype.toString()`
    * `Symbol.prototype.valueOf()`
    
## Not Yet Implemented
   
Some features are not yet implemented, but can be implemented safely. Click 
[here](https://github.com/ariyankhan/es6-harmony/blob/master/not-yet-implemented.md) to view those features.
    
## Limitation

Some ES6 features can not be implemented in ES5 natively like `spread operator`, `for..of` loop, 
ES6 version of `instanceOf` operator etc. So this module exports a object named `ES6` globally,
that provides some approximate equivalent implementation of those features.
    
## `ES6` Object

This object provides,

   * `isSymbol()` (It can be used as equivalent API for `typeof symbol === 'symbol'`)
   * `instanceOf()` (Provides ES6 version of `instanceOf` operator)
   * `forOf()` (This method behaves exactly same as `for...of` loop)
   * `spreadOperator` (Gives same functionality of the `spread operator`)
   
   Others utility methods,
   
   * `isMap`
   * `isSet`
   * `isWeakMap`
   * `isWeakSet`
   * `isPromise`

    
## Examples
    
```javascript
"use strict";

var ES6 = require("es6-harmony");

var arr = [1, 2, 3];

ES6.forOf(arr, function (v) {
    console.log(v);
});
// 1
// 2
// 3

console.log(Array.from("Bar")); // [ 'B', 'a', 'r' ]

console.log(Array.of(1, 2, 3)); // [ 1, 2, 3 ]

console.log(Array.of.call(Object, 1, 2, 3)); // { [Number: 3] '0': 1, '1': 2, '2': 3, length: 3 }

console.log([1, 2, 3].fill("Bar")); // [ 'Bar', 'Bar', 'Bar' ]

console.log([1, 2, "bar"].find(function (v) {
    return typeof v === "number";
}));
// 1

console.log([1, 2, "bar"].findIndex(function (v) {
    return typeof v === "number";
}));
// 0

var it = arr.entries();

console.log(it.next()); // { done: false, value: [ 0, 1 ] }
console.log(it.next()); // { done: false, value: [ 1, 2 ] }
console.log(it.next()); // { done: false, value: [ 2, 3 ] }
console.log(it.next()); // { done: true, value: undefined }


var map = new Map([[1, 2], ["bar", "baz"]]);

console.log(map.size); // 2

map.set(0, {});
map.set(NaN, Object);

console.log(map.has(NaN)); // true
console.log(map.has(-0)); // true

it = map.keys();

console.log(it.next()); // { done: false, value: 1 }
console.log(it.next()); // { done: false, value: 'bar' }
console.log(it.next()); // { done: false, value: NaN }

ES6.forOf(map, function (v) {
    console.log(v);
});
// [ 1, 2 ]
// [ 'bar', 'baz' ]
// [ 0, {} ]
// [ NaN, [Function: Object] ]

var set = new Set([1, 2, "bar"]);

console.log(set.size); // 3

set.add(-0);
set.add(NaN);

console.log(set.has(0)); // true
console.log(set.has(NaN)); // true

it = set.values();

console.log(it.next()); // { done: false, value: 1 }
console.log(it.next()); // { done: false, value: 2 }
console.log(it.next()); // { done: false, value: 'bar' }

ES6.forOf(set, function (v) {
    console.log(v);
});
// 1
// 2
// bar
// -0
// NaN

var wm = new WeakMap();
wm.set(Object, "object");
wm.set({}, "normal object");

console.log(wm.has(Object)); // true
console.log(wm.has({})); // false

var ws = new WeakSet();

ws.add(Object);
ws.add(Math);

console.log(ws.has(Math)); // true
console.log(ws.has(new Object())); // false

console.log(Number.isNaN(NaN)); // true
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isInteger(-11)); // true
console.log(Number.isSafeInteger(Math.pow(2, 53) - 1)); // true

console.log(Object.is(-0, 0)); // false
console.log(Object.is(NaN, NaN)); // true

var a = {};
var b = {};

Object.setPrototypeOf(a, b);
console.log(Object.getPrototypeOf(a) === b); // true

console.log(Object.assign({}, "bar")); // { '0': 'b', '1': 'a', '2': 'r' }

var sym1 = Symbol("bar");
var sym2 = Symbol("baz");

a[sym1] = "This is symbol property";
a[sym2] = "This is another symbol property";

var allSymbols = Object.getOwnPropertySymbols(a);

console.log(allSymbols.length); // 2
console.log(allSymbols[0] === a); // false
console.log(allSymbols[1] === b); // false

console.log(String.fromCodePoint(0xFFFF, 0x10FFFF).length); // 3

sym1 = Symbol("BAZ");
sym2 = Symbol.for("BAZ");

console.log(sym1 === Symbol("BAZ")); // false
console.log(sym2 === Symbol.for("BAZ")); // true

var obj = {
    length: 2,
    0: "a",
    1: 122
};

it = Array.prototype[Symbol.iterator].call(obj); // { done: false, value: 'a' }

console.log(ES6.spreadOperator([]).spread("Bar", [1, 2, 3]).add(1, 2, 4).array()); // [ 'B', 'a', 'r', 1, 2, 3, 1, 2, 4 ]

function sumArgs() {
    return Array.prototype.reduce.call(arguments, function (acc, currV) {
        return acc + currV;
    }, 0);
}

console.log(ES6.spreadOperator(sumArgs).spread([1, 2, 3]).add(11, 22).call()); // 39

function Box(width, height) {
    this.width = width;
    this.height = height;
}

console.log(ES6.spreadOperator(Box).spread([1, 2.22]).new()); // Box { width: 1, height: 2.22 }

console.log(it.next()); // { done: false, value: 'a' }

var promise = new Promise(function (resolve, reject) {
    setTimeout(resolve, 0, 100);
});

promise.then(function (value) {
    console.log(value);
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, 0, 110);
    });
}).then(function (value) {
    console.log(value);
    return {
        then: function (resolve, reject) {
            setTimeout(reject, 0, "Error");
        }
    }
}).catch(console.log.bind(console));

// 100
// 110
// Error
```
    
## Installation

* In browser context, just insert this script on the top of other scripts
* For NodeJS, just install it from npm

    `npm install es6-harmony`
     
## Test

   `npm test`
     
## Contributors
   * [Rousan Ali](https://github.com/ariyankhan)
   
   Contributions are welcome
   
## License

MIT License

Copyright (c) 2017 Rousan Ali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
