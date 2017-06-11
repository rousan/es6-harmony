/*!
 * ES6 v1.0.0
 * This module provides an approximate equivalent implementation of ES6(Harmony)'s
 * new features in pure ES5 for backward compatibility. This API has no dependencies.
 *
 * @license Copyright (c) 2017 Ariyan Khan, MIT License
 *
 * Codebase: https://github.com/ariyankhan/es6
 * Date: Jun 10, 2017
 */


var isBrowser = false;
var testing = true;
var _global = testing ? (isBrowser ? window : exports) : (isBrowser ? window : global);

(function (global, factory) {

    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {

        // For the environment like NodeJS, CommonJS etc where module or
        // module.exports objects are available to export ES6 APIs.
        if (testing)
            module.exports.ES6 = factory(global);
        else
            module.exports = factory(global);
    } else {

        // For browser context, where global object is window
        // and the ES6 APIs is exported as 'ES6' property in window object.
        // If 'ES6' property already exists then scripts returns immediately,
        // it ensures that script will be executed once per environment
        if (global.ES6 === null || typeof global.ES6 !== "object")
            global.ES6 = factory(global);
    }

    /* window is for browser environment and global is for NodeJS environment */
})(typeof window !== "undefined" ? window : _global, function (global) {

    "use strict";

    var defineProperty = Object.defineProperty;

    var defineProperties = Object.defineProperties;

    var symbolHiddenCounter = 0;

    var globalSymbolRegistry = [];

    var slice = Array.prototype.slice;

    var isArray = Array.isArray;

    var objectToString = Object.prototype.toString;

    var push = Array.prototype.push;

    var match = String.prototype.match;

    var max = Math.max;

    var min = Math.min;

    var create = Object.create;

    var emptyFunction = function () {};

    var simpleFunction = function (arg) {
        return arg;
    };

    var isCallable = function (fn) {
        return typeof fn === 'function';
    };

    var isConstructor = function (fn) {
        return isCallable(fn);
    };

    var Iterator = function () {};

    var ArrayIterator = function ArrayIterator(array, flag) {
        this._array = array;
        this._flag = flag;
        this._nextIndex = 0;
    };

    var StringIterator = function StringIterator(string, flag) {
        this._string = string;
        this._flag = flag;
        this._nextIndex = 0;
    };

    var MapIterator = function MapIterator(map, flag) {
        this._map = map;
        this._flag = flag;
    };

    var SetIterator = function SetIterator(set, flag) {
        this._set = set;
        this._flag = flag;
    };

    var isES6Running = function() {
        return false; /* Now 'false' for testing purpose */
    };

    var isObject = function (value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };

    var es6FunctionPrototypeHasInstanceSymbol = function (instance) {
        if (typeof this !== "function")
            return false;
        return instance instanceof this;
    };

    var es6InstanceOfOperator = function (object, constructor) {
        if (!isObject(constructor))
            throw new TypeError("Right-hand side of 'instanceof' is not an object");

        var hasInstanceSymbolProp = constructor[Symbol.hasInstance];
        if (typeof hasInstanceSymbolProp === "undefined") {
            return object instanceof constructor;
        } else if(typeof hasInstanceSymbolProp !== "function") {
            throw new TypeError(typeof hasInstanceSymbolProp + " is not a function");
        } else {
            return hasInstanceSymbolProp.call(constructor, object);
        }
    };

    // Generates name for a symbol instance and this name will be used as
    // property key for property symbols internally.
    var generateSymbolName = function (id) {
        return "@@_____" + id + "_____";
    };

    // Generates id for next Symbol instance
    var getNextSymbolId = function () {
        return symbolHiddenCounter++;
    };

    var setupSymbolInternals = function (symbol, desc) {
        defineProperties(symbol, {
            _description: {
                value: desc
            },
            _isSymbol: {
                value: true
            },
            _id: {
                value: getNextSymbolId()
            }
        });
        return symbol;
    };

    var checkSymbolInternals = function (symbol) {
        return symbol._isSymbol === true && typeof symbol._id === "number" && typeof symbol._description === "string";
    };

    var isSymbol = function (symbol) {
        return symbol instanceof Symbol && checkSymbolInternals(symbol);
    };

    var symbolFor = function (key) {
        key = String(key);
        var registryLength = globalSymbolRegistry.length,
            record,
            i = 0;

        for(; i<registryLength; ++i) {
            record = globalSymbolRegistry[i];
            if (record.key === key)
                return record.symbol;
        }

        record = {
            key: key,
            symbol: Symbol(key)
        };
        globalSymbolRegistry.push(record);
        return record.symbol;
    };

    var symbolKeyFor = function (symbol) {
        if (!ES6.isSymbol(symbol))
            throw new TypeError(String(symbol) + " is not a symbol");
        var registryLength = globalSymbolRegistry.length,
            record,
            i = 0;

        for(; i<registryLength; ++i) {
            record = globalSymbolRegistry[i];
            if (record.symbol === symbol)
                return record.key;
        }
    };

    /* It affects array1 and appends array2 at the end of array1 */
    var appendArray = function (array1, array2) {
        // Returns immediately if these are not array or not array-like objects
        if (!(typeof array1.length === "number" && array1.length >= 0 && typeof array2.length === "number" && array2.length >= 0))
            return;
        var length1 = Math.floor(array1.length),
            length2 = Math.floor(array2.length),
            i = 0;

        array1.length = length1 + length2;
        for (; i<length2; ++i)
            if (array2.hasOwnProperty(i))
                array1[length1 + i] = array2[i];
    };

    var es6ObjectPrototypeToString = function toString() {
        if (this === undefined || this === null)
            return objectToString.call(this);
        // Add support for @@toStringTag symbol
        if (typeof this[Symbol.toStringTag] === "string")
            return "[object " + this[Symbol.toStringTag] + "]";
        else
            return objectToString.call(this);
    };

    var es6ArrayPrototypeConcat = function concat() {
        if (this === undefined || this === null)
            throw new TypeError("Array.prototype.concat called on null or undefined");

        // Boxing 'this' value to wrapper object
        var self = Object(this),
            targets = slice.call(arguments),
            outputs = []; // Later it may affected by Symbol

        targets.unshift(self);

        targets.forEach(function (target) {
            // If target is primitive then just push
            if (!isObject(target))
                outputs.push(target);
            // Here Symbol.isConcatSpreadable support is added
            else if (typeof target[Symbol.isConcatSpreadable] !== "undefined") {
                if (target[Symbol.isConcatSpreadable]) {
                    appendArray(outputs, target);
                } else {
                    outputs.push(target);
                }
            } else if (isArray(target)) {
                appendArray(outputs, target);
            } else {
                outputs.push(target);
            }
        });
        return outputs;
    };

    var es6ForOfLoop = function (iterable, callback, thisArg) {
        callback = typeof callback !== "function" ? emptyFunction : callback;
        if (typeof iterable[Symbol.iterator] !== "function")
            throw new TypeError("Iterable[Symbol.iterator] is not a function");
        var iterator = iterable[Symbol.iterator](),
            iterationResult;
        if (typeof iterator.next !== "function")
            throw new TypeError(".iterator.next is not a function");
        while (true) {
            iterationResult = iterator.next();
            if (!isObject(iterationResult))
                throw new TypeError("Iterator result " + iterationResult + " is not an object");
            if (iterationResult.done)
                break;
            callback.call(thisArg, iterationResult.value);
        }
    };

    // Provides simple inheritance functionality
    var simpleInheritance = function (child, parent) {
        if (typeof child !== "function" || typeof parent !== "function")
            throw new TypeError("Child and Parent must be function type");

        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
    };

    // Behaves as Symbol function in ES6, take description and returns an unique object,
    // but in ES6 this function returns 'symbol' primitive typed value.
    // Its type is 'object' not 'symbol'.
    // There is no wrapping in this case i.e. Object(sym) = sym.
    var Symbol = function Symbol(desc) {
        desc = typeof desc === "undefined" ? "" : String(desc);

        if(this instanceof Symbol)
            throw new TypeError("Symbol is not a constructor");

        return setupSymbolInternals(Object.create(Symbol.prototype), desc);
    };

    defineProperties(Symbol, {

        "for": {
            value: symbolFor,
            writable: true,
            configurable: true
        },

        "keyFor": {
            value: symbolKeyFor,
            writable: true,
            configurable: true
        },

        "hasInstance": {
            value: Symbol("Symbol.hasInstance")
        },

        "isConcatSpreadable": {
            value: Symbol("Symbol.isConcatSpreadable")
        },

        "iterator": {
            value: Symbol("Symbol.iterator")
        },

        "toStringTag": {
            value: Symbol("Symbol.toStringTag")
        }
    });

    // In ES6, this function returns like 'Symbol(<desc>)', but in this case
    // this function returns the symbol's internal name to work properly.
    Symbol.prototype.toString = function () {
        return generateSymbolName(this._id);
    };

    // Returns itself but in ES6 It returns 'symbol' typed value.
    Symbol.prototype.valueOf = function () {
        return this;
    };

    // Make Iterator like iterable
    defineProperty(Iterator.prototype, Symbol.iterator.toString(), {
        value: function () {return this;},
        writable: true,
        configurable: true
    });

    simpleInheritance(ArrayIterator, Iterator);

    simpleInheritance(StringIterator, Iterator);

    simpleInheritance(MapIterator, Iterator);

    simpleInheritance(SetIterator, Iterator);

    defineProperty(ArrayIterator.prototype, Symbol.toStringTag.toString(), {
        value: "Array Iterator",
        configurable: true
    });

    defineProperty(StringIterator.prototype, Symbol.toStringTag.toString(), {
        value: "String Iterator",
        configurable: true
    });

    defineProperty(MapIterator.prototype, Symbol.toStringTag.toString(), {
        value: "Map Iterator",
        configurable: true
    });

    defineProperty(SetIterator.prototype, Symbol.toStringTag.toString(), {
        value: "Set Iterator",
        configurable: true
    });

    // This iterator works on any Array or TypedArray or array-like objects
    ArrayIterator.prototype.next = function next() {
        if (!(this instanceof ArrayIterator))
            throw new TypeError("Method Array Iterator.prototype.next called on incompatible receiver " + String(this));

        var self = this,
            nextValue;

        if (self._nextIndex === -1) {
            return {
                done: true,
                value: undefined
            };
        }

        if (!(typeof self._array.length === "number" && self._array.length >= 0)) {
            self._nextIndex = -1;
            return {
                done: true,
                value: undefined
            };
        }

        // _flag = 1 for [index, value]
        // _flag = 2 for [value]
        // _flag = 3 for [index]
        if (self._nextIndex < Math.floor(self._array.length)) {
            if (self._flag === 1)
                nextValue = [self._nextIndex, self._array[self._nextIndex]];
            else if (self._flag === 2)
                nextValue = self._array[self._nextIndex];
            else if (self._flag === 3)
                nextValue = self._nextIndex;
            self._nextIndex++;
            return {
                done: false,
                value: nextValue
            };
        } else {
            self._nextIndex = -1;
            return {
                done: true,
                value: undefined
            };
        }
    };

    StringIterator.prototype.next = function next() {
        if (!(this instanceof StringIterator))
            throw new TypeError("Method String Iterator.prototype.next called on incompatible receiver " + String(this));

        var self = this,
            stringObject = new String(this._string),
            nextValue;

        if (self._nextIndex === -1) {
            return {
                done: true,
                value: undefined
            };
        }

        if (self._nextIndex < stringObject.length) {
            nextValue = stringObject[self._nextIndex];
            self._nextIndex++;
            return {
                done: false,
                value: nextValue
            };
        } else {
            self._nextIndex = -1;
            return {
                done: true,
                value: undefined
            };
        }
    };

    var es6ArrayPrototypeIteratorSymbol = function values() {
        if (this === undefined || this === null)
            throw new TypeError("Cannot convert undefined or null to object");

        var self = Object(this);
        return new ArrayIterator(self, 2);
    };

    var es6StringPrototypeIteratorSymbol = function values() {
        if (this === undefined || this === null)
            throw new TypeError("String.prototype[Symbol.iterator] called on null or undefined");
        return new StringIterator(String(this), 0);
    };

    var es6ArrayPrototypeEntries = function entries() {
        if (this === undefined || this === null)
            throw new TypeError("Cannot convert undefined or null to object");

        var self = Object(this);
        return new ArrayIterator(self, 1);
    };

    var es6ArrayPrototypeKeys = function keys() {
        if (this === undefined || this === null)
            throw new TypeError("Cannot convert undefined or null to object");
        var self = Object(this);
        return new ArrayIterator(self, 3);
    };

    var SpreadOperatorImpl = function (target, thisArg) {
        this._target = target;
        this._values = [];
        this._thisArg = thisArg;
    };

    // All the arguments must be iterable
    SpreadOperatorImpl.prototype.spread = function () {
        var self = this;
        slice.call(arguments).forEach(function (iterable) {
            ES6.forOf(iterable, function (value) {
                self._values.push(value);
            });
        });
        return self;
    };

    SpreadOperatorImpl.prototype.add = function () {
        var self = this;
        slice.call(arguments).forEach(function (value) {
            self._values.push(value);
        });
        return self;
    };

    SpreadOperatorImpl.prototype.call = function (thisArg) {
        if (typeof this._target !== "function")
            throw new TypeError("Target is not a function");
        thisArg = arguments.length <= 0 ? this._thisArg : thisArg;
        return this._target.apply(thisArg, this._values);
    };

    SpreadOperatorImpl.prototype.new = function () {
        if (typeof this._target !== "function")
            throw new TypeError("Target is not a constructor");

        var temp,
            returnValue;
        temp = Object.create(this._target.prototype);
        returnValue = this._target.apply(temp, this._values);
        return isObject(returnValue) ? returnValue : temp;
    };

    // Affects the target array
    SpreadOperatorImpl.prototype.array = function () {
        if (!isArray(this._target))
            throw new TypeError("Target is not a array");
        push.apply(this._target, this._values);
        return this._target;
    };

    // Target must be Array or function
    var es6SpreadOperator = function spreadOperator(target, thisArg) {
        if (!(typeof target === "function" || isArray(target)))
            throw new TypeError("Spread operator only supports on array and function objects at this moment");
        return new SpreadOperatorImpl(target, thisArg);
    };

    /*
    var es6Match = function (regexp) {
        if (this === undefined || this === null)
            throw new TypeError("String.prototype.match called on null or undefined");
        if (regexp === undefined || regexp === null)
            return match.call(this, new RegExp(regexp));
        regexp = Object(regexp);
        var matchSymbol = regexp[Symbol.match];
        if (typeof matchSymbol !== "undefined") {
            if (typeof matchSymbol !== "function")
                throw new TypeError(typeof matchSymbol + " is not a function");
            else {
                return matchSymbol.call(regexp, this);
            }
        } else {
            return match.call(this, new RegExp(String(regexp)));
        }
    };
    */

    var es6ArrayFrom = function from(arrayLike, mapFn, thisArg) {
        var constructor,
            i = 0,
            length,
            outputs;
        // Use the generic constructor
        constructor = !isConstructor(this) ? Array : this;
        if (arrayLike === undefined || arrayLike === null)
            throw new TypeError("Cannot convert undefined or null to object");

        arrayLike = Object(arrayLike);
        if (mapFn === undefined)
            mapFn = simpleFunction;
        else if (!isCallable(mapFn))
            throw new TypeError(mapFn + " is not a function");

        if (typeof arrayLike[Symbol.iterator] === "undefined") {
            if (!(typeof arrayLike.length === "number" && arrayLike.length >= 0)) {
                outputs = new constructor(0);
                outputs.length = 0;
                return outputs;
            }
            length = Math.floor(arrayLike.length);
            outputs = new constructor(length);
            outputs.length = length;
            for(; i < length; ++i)
                outputs[i] = mapFn.call(thisArg, arrayLike[i]);
        } else {
            outputs = new constructor();
            outputs.length = 0;
            ES6.forOf(arrayLike, function (value) {
                outputs.length++;
                outputs[outputs.length - 1] = mapFn.call(thisArg, value);
            });
        }
        return outputs;
    };

    var es6ArrayOf = function of() {
        var constructor,
            outputs,
            length,
            i = 0;
        // Use the generic constructor
        constructor = !isConstructor(this) ? Array : this;
        length = arguments.length;
        outputs = new constructor(length);
        outputs.length = length;
        for(; i < length; ++i) {
            outputs[i] = arguments[i];
        }
        return outputs;
    };

    var es6ArrayPrototypeFill = function fill(value, start, end) {
        if (this === undefined || this === null)
            throw new TypeError("Array.prototype.fill called on null or undefined");

        var self = Object(this),
            i = 0,
            length;
        if (typeof self.length === "number" && self.length >= 0) {
            length = Math.floor(self.length);
            start = start === undefined ? 0 : Math.floor(Number(start));
            end = end === undefined ? length : Math.floor(Number(end));
            start = start < 0 ? start + length : start;
            end = end < 0 ? end + length : end;
            start = start < 0 ? 0 : start;
            end = end > length ? length : end;

            for(i = start; i < end; ++i)
                self[i] = value;
        }
        return self;
    };

    var es6ArrayPrototypeFind = function find(callback, thisArg) {
        if (this === undefined || this === null)
            throw new TypeError("Array.prototype.find called on null or undefined");
        if (!isCallable(callback))
            throw new TypeError(callback + " is not a function");
        var self = Object(this),
            i = 0,
            length;
        if (typeof self.length === "number" && self.length >= 0) {
            length = Math.floor(self.length);
            for (; i < length; ++i) {
                if (callback.call(thisArg, self[i], i, self))
                    return self[i];
            }
        }
    };

    var es6ArrayPrototypeFindIndex = function findIndex(callback, thisArg) {
        if (this === undefined || this === null)
            throw new TypeError("Array.prototype.findIndex called on null or undefined");
        if (!isCallable(callback))
            throw new TypeError(callback + " is not a function");
        var self = Object(this),
            i = 0,
            length;
        if (typeof self.length === "number" && self.length >= 0) {
            length = Math.floor(self.length);
            for (; i < length; ++i) {
                if (callback.call(thisArg, self[i], i, self))
                    return i;
            }
        }
        return -1;
    };

    var es6ArrayPrototypeCopyWithin = function copyWithin(target, start) {
        if (this == undefined || this === null) {
            throw new TypeError("Array.prototype.copyWithin called on null or undefined");
        }

        var self = Object(this),
            length = self.length >>> 0,
            relativeTarget = target >> 0,
            to = relativeTarget < 0 ? max(length + relativeTarget, 0) : min(relativeTarget, length),
            relativeStart = start >> 0,
            from = relativeStart < 0 ? max(length + relativeStart, 0) : min(relativeStart, length),
            end = arguments[2],
            relativeEnd = end === undefined ? length : end >> 0,
            final = relativeEnd < 0 ? max(length + relativeEnd, 0) : min(relativeEnd, length),
            count = min(final - from, length - to),
            direction = 1;

        if (from < to && to < (from + count)) {
            direction = -1;
            from += count - 1;
            to += count - 1;
        }

        while (count > 0) {
            if (from in self) {
                self[to] = self[from];
            } else {
                delete self[to];
            }

            from += direction;
            to += direction;
            count--;
        }

        return self;
    };

    // Returns hash for primitive typed key like this:
    // undefined or null => I___toString(key)
    // number => N___toString(key)
    // string => S___toString(key)
    // boolean => B___toString(key)
    //
    // But returns null for object typed key.
    var hash = function (key) {
        // String(0) === String(-0)
        // String(NaN) === String(NaN)
        var strKey = String(key);
        if (key === undefined || key === null)
            return "I___" + strKey;
        else if (typeof key === "number")
            return "N___" + strKey;
        else if (typeof key === "string")
            return "S___" + strKey;
        else if (typeof key === "boolean")
            return "B___" + strKey;
        else
            return null; /* For object key */
    };

    var Map = function Map(iterable) {
        if (!(this instanceof Map) || isMap(this))
            throw new TypeError("Constructor Map requires 'new'");
        setupMapInternals(this);
    };

    Map.prototype.set = function (key, value) {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.set called on incompatible receiver " + this);
        var keyHash = hash(key),
            hashForObject = getHiddenHashForObject("map"),
            entry;
        if (keyHash === null) {
            if (typeof key[hashForObject] === "number" && this._data.objects[key[hashForObject]] instanceof MapEntry) {
                entry = this._data.objects[key[hashForObject]];
                entry._value = value;
                return this;
            }
            entry = new MapEntry(key, value);
            this._data.objects.push(entry);
            defineProperty(key, hashForObject, {
                value: this._data.objects.length - 1,
                configurable: true
            });
        } else {
            if (typeof this._data.primitives[keyHash] instanceof MapEntry) {
                entry = this._data.primitives[keyHash];
                entry.value = value;
                return this;
            }
            entry = new MapEntry(key, value);
            this._data.primitives[keyHash] = entry;
        }

        if (this._head === null) {
            this._head = entry;
            entry.next = null;
            entry.prev = null;
        }
        if (this._tail === null)
            this._tail = this._head;
        else {
            this._tail.next = entry;
            entry.prev = this._tail;
            entry.next = null;
            this._tail = entry;
        }
        return this;
    };


    var setupMapInternals = function (map) {
        defineProperties(map, {
            _isMap: {
                value: true
            },
            _head: {
                value: null,
                writable: true
            },
            _tail: {
                value: null,
                writable: true
            },
            _objectHash: {
                value: Symbol("Hash(map)")
            },
            _data: {
                value: create(null, {
                    primitives: {
                        value: create(null) /* [[Prototype]] must be null */
                    },
                    objects: {
                        value: []
                    }
                })
            }
        });
    };

    var checkMapInternals = function (map) {
        return map._isMap === true
            && (map._head === null || map._head instanceof MapEntry)
            && (map._tail === null || map._tail instanceof MapEntry)
            && ES6.isSymbol(map._objectHash)
            && isObject(map._data)
            && isObject(map._data.primitives)
            && isArray(map._data.objects);
    };

    var isMap = function (map) {
        return map instanceof Map && checkMapInternals(map);
    };

    var MapEntry = function MapEntry(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    };



    // Some ES6 API can't be implemented in pure ES5, so this 'ES6' object provides
    // some equivalent functionality of these features.
    var ES6 = {

        // Checks if a JS value is a symbol
        // It can be used as equivalent api in ES6: typeof symbol === 'symbol'
        isSymbol: isSymbol,

        // Native ES5 'instanceof' operator does not support @@hasInstance symbol,
        // this method provides same functionality of ES6 'instanceof' operator.
        instanceOf: es6InstanceOfOperator,

        // This method behaves exactly same as ES6 for...of loop.
        forOf: es6ForOfLoop,

        isMap: isMap,

        // This method gives same functionality of the spread operator of ES6
        // It works on only functions and arrays.
        // Limitation: You can't create array like this [...iterable, , , , 33] by this method,
        // to achieve this you have to do like this [...iterable, undefined, undefined, undefined, 33]
        spreadOperator: es6SpreadOperator
    };

    // Addition of all the patches to support ES6 in ES5
    // If the running environment already supports ES6 then no patches will be applied,
    // just an empty object will be exported as 'ES6'.
    if (isES6Running())
        return {};
    else {
        defineProperty(global, "Symbol", {
            value: Symbol,
            writable: true,
            configurable: true
        });

        defineProperty(global, "Map", {
            value: Map,
            writable: true,
            configurable: true
        });

        defineProperty(Function.prototype, Symbol.hasInstance.toString(), {
            value: es6FunctionPrototypeHasInstanceSymbol
        });

        defineProperty(Array.prototype, "concat", {
            value: es6ArrayPrototypeConcat,
            writable: true,
            configurable: true
        });

        defineProperty(Object.prototype, "toString", {
            value: es6ObjectPrototypeToString,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, Symbol.iterator.toString(), {
            value: es6ArrayPrototypeIteratorSymbol,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, "entries", {
            value: es6ArrayPrototypeEntries,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, "keys", {
            value: es6ArrayPrototypeKeys,
            writable: true,
            configurable: true
        });

        defineProperty(String.prototype, Symbol.iterator.toString(), {
            value: es6StringPrototypeIteratorSymbol,
            writable: true,
            configurable: true
        });

        defineProperty(Array, "from", {
            value: es6ArrayFrom,
            writable: true,
            configurable: true
        });

        defineProperty(Array, "of", {
            value: es6ArrayOf,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, "fill", {
            value: es6ArrayPrototypeFill,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, "find", {
            value: es6ArrayPrototypeFind,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, "findIndex", {
            value: es6ArrayPrototypeFindIndex,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, "copyWithin", {
            value: es6ArrayPrototypeCopyWithin,
            writable: true,
            configurable: true
        });
    }

    return ES6;
});















