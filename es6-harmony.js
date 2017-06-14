/*!
 * ES6 Harmony v0.2.0
 * This module provides an equivalent implementation of ES6(Harmony)
 * in pure ES5 code and creates an ES6 environment for old browsers or
 * JavaScript engines that natively does not support ES6.(At least ES5 is required).
 * This Library is standalone, it has no dependency.
 *
 * @license Copyright (c) 2017 Ariyan Khan, MIT License
 *
 * Codebase: https://github.com/ariyankhan/es6-harmony
 * Date: Jun 14, 2017
 */

(function (global, factory) {

    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {

        // For the environment like NodeJS, CommonJS etc where module or
        // module.exports objects are available to export ES6 APIs.
        module.exports = factory(global);
    } else {

        // For browser context, where global object is window
        // and the ES6 APIs is exported as 'ES6' property of window object
        global.ES6 = factory(global);
    }

    /* window is for browser environment and global is for NodeJS environment */
})(typeof window !== "undefined" ? window : global, function (global) {

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

    var globalIsFinite = isFinite;

    var floor = Math.floor;

    var max = Math.max;

    var min = Math.min;

    var create = Object.create;

    var symbolBucket = create(null);

    var symbolNamePattern = /^@@_____(\d+)_____$/;

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
        this._currentEntry = null;
        this._done = false;
    };

    var SetIterator = function SetIterator(set, flag) {
        this._set = set;
        this._flag = flag;
        this._currentEntry = null;
        this._done = false;
    };

    var isES6Running = function() {
        return false; /* Now 'false' for testing purpose */
    };

    var isObject = function (value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };

    var addToMessageQueue = function (fn, thisArg) {
        if (!isCallable(fn))
            throw new TypeError(fn + " is not a function");
        var args = slice.call(arguments, 2);
        setTimeout(function () {
            fn.apply(thisArg, args);
        });
    };

    var es6FunctionPrototypeHasInstanceSymbol = function (instance) {
        if (typeof this !== "function")
            return false;
        return instance instanceof this;
    };

    var es6InstanceOfOperator = function instanceOf(object, constructor) {
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

    var es6ForOfLoop = function forOf(iterable, callback, thisArg) {
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

        var newInstance = setupSymbolInternals(Object.create(Symbol.prototype), desc);
        symbolBucket[newInstance._id] = newInstance;
        return newInstance;
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

    MapIterator.prototype.next = function next() {
        if (!(this instanceof MapIterator))
            throw new TypeError("Method Map Iterator.prototype.next called on incompatible receiver " + String(this));
        var self = this,
            nextValue;
        if (self._done) {
            return {
                done: true,
                value: undefined
            };
        }
        if (self._currentEntry === null)
            self._currentEntry = self._map._head;
        else
            self._currentEntry = self._currentEntry.next;

        if (self._currentEntry === null) {
            self._done = true;
            return {
                done: true,
                value: undefined
            };
        }
        // _flag = 1 for [key, value]
        // _flag = 2 for [value]
        // _flag = 3 for [key]
        if (self._flag === 1)
            nextValue = [self._currentEntry.key, self._currentEntry.value];
        else if (self._flag === 2)
            nextValue = self._currentEntry.value;
        else if (self._flag === 3)
            nextValue = self._currentEntry.key;
        return {
            done: false,
            value: nextValue
        };
    };

    SetIterator.prototype.next = function next() {
        if (!(this instanceof SetIterator))
            throw new TypeError("Method Set Iterator.prototype.next called on incompatible receiver " + String(this));
        var self = this,
            nextValue;
        if (self._done) {
            return {
                done: true,
                value: undefined
            };
        }
        if (self._currentEntry === null)
            self._currentEntry = self._set._head;
        else
            self._currentEntry = self._currentEntry.next;

        if (self._currentEntry === null) {
            self._done = true;
            return {
                done: true,
                value: undefined
            };
        }
        // _flag = 1 for [value, value]
        // _flag = 2 for [value]
        if (self._flag === 1)
            nextValue = [self._currentEntry.value, self._currentEntry.value];
        else if (self._flag === 2)
            nextValue = self._currentEntry.value;
        return {
            done: false,
            value: nextValue
        };
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

        if (iterable !== null && iterable !== undefined) {
            ES6.forOf(iterable, function (entry) {
                if (!isObject(entry))
                    throw new TypeError("Iterator value " + entry + " is not an entry object");
                this.set(entry[0], entry[1]);
            }, this);
        }
    };

    // WARNING: This method puts a link in the key object to reduce time complexity to O(1).
    // So, after map.set(key, value) call, if the linker property of the key object is deleted
    // then map.has(key) will returns false.
    // Time complexity: O(1) for all cases(there is no worst case, same for both primitive and object key).
    // Space complexity is O(n) for all cases.
    Map.prototype.set = function set(key, value) {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.set called on incompatible receiver " + this);
        var keyHash = hash(key),
            objectHash = this._objectHash,
            entry;
        if (keyHash === null) {
            if (typeof key[objectHash] === "number" && this._data.objects[key[objectHash]] instanceof MapEntry) {
                entry = this._data.objects[key[objectHash]];
                entry.value = value;
                return this;
            }
            entry = new MapEntry(key, value);
            this._data.objects.push(entry);
            defineProperty(key, objectHash.toString(), {
                value: this._data.objects.length - 1,
                configurable: true
            });
            this._size++;
        } else {
            if (this._data.primitives[keyHash] instanceof MapEntry) {
                entry = this._data.primitives[keyHash];
                entry.value = value;
                return this;
            }
            entry = new MapEntry(key, value);
            this._data.primitives[keyHash] = entry;
            this._size++;
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

    // Time complexity: O(1) for all cases(there is no worst case, same for both primitive and object key).
    // Space complexity is O(1)
    Map.prototype.has = function has(key) {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.has called on incompatible receiver " + this);
        var keyHash = hash(key),
            objectHash = this._objectHash;

        if (keyHash === null)
            return typeof key[objectHash] === "number" && this._data.objects[key[objectHash]] instanceof MapEntry;
        else
            return this._data.primitives[keyHash] instanceof MapEntry;
    };

    // Time complexity: O(1) for all cases(there is no worst case, same for both primitive and object key).
    // Space complexity is O(1)
    Map.prototype.get = function get(key) {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.get called on incompatible receiver " + this);
        var keyHash = hash(key),
            objectHash = this._objectHash;
        if (keyHash === null) {
            if (typeof key[objectHash] === "number" && this._data.objects[key[objectHash]] instanceof MapEntry)
                return this._data.objects[key[objectHash]].value;
        } else {
            if (this._data.primitives[keyHash] instanceof MapEntry)
                return this._data.primitives[keyHash].value;
        }
    };

    // Time complexity: O(n)
    // Space complexity is O(1)
    Map.prototype.clear = function clear() {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.clear called on incompatible receiver " + this);
        var entry;
        // Clear all primitive keys
        Object.getOwnPropertyNames(this._data.primitives).forEach(function (prop) {
            if (this._data.primitives[prop] instanceof MapEntry) {
                entry = this._data.primitives[prop];
                delete this._data.primitives[prop];
                entry.next = null;
                entry.prev = null;
            }
        }, this);

        // Clear all object keys
        Object.getOwnPropertyNames(this._data.objects).forEach(function (prop) {
            if (this._data.objects[prop] instanceof MapEntry) {
                entry = this._data.objects[prop];
                delete this._data.objects[prop];
                delete entry.key[this._objectHash];
                entry.next = null;
                entry.prev = null;
            }
        }, this);
        this._data.objects.length = 0;

        // Free head and tail MapEntry
        this._head = null;
        this._tail = null;
        this._size = 0;
    };

    // Time complexity: O(1) for all cases(there is no worst case, same for both primitive and object key).
    // Space complexity is O(1)
    Map.prototype.delete = function (key) {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.delete called on incompatible receiver " + this);
        var keyHash = hash(key),
            objectHash = this._objectHash,
            entry;
        if (keyHash === null) {
            if (typeof key[objectHash] === "number" && this._data.objects[key[objectHash]] instanceof MapEntry) {
                entry = this._data.objects[key[objectHash]];
                delete this._data.objects[key[objectHash]];
                delete entry.key[objectHash];
            } else
                return false;
        } else {
            if (this._data.primitives[keyHash] instanceof MapEntry) {
                entry = this._data.primitives[keyHash];
                delete this._data.primitives[keyHash];
            } else {
                return false;
            }
        }

        if (entry.prev !== null && entry.next !== null) {
            entry.prev.next = entry.next;
            entry.next.prev = entry.prev;
            entry.next = null;
            entry.prev = null;
        } else if(entry.prev === null && entry.next !== null) {
            this._head = entry.next;
            entry.next.prev = null;
            entry.next = null;
        } if (entry.prev !== null && entry.next === null) {
            this._tail = entry.prev;
            entry.prev.next = null;
            entry.prev = null;
        } else {
            this._head = null;
            this._tail = null;
        }
        this._size--;
        return true;
    };

    defineProperty(Map.prototype, "size", {
        get: function size() {
            if (!isMap(this))
                throw new TypeError("Method Map.prototype.size called on incompatible receiver " + this);
            return this._size;
        },
        configurable: true
    });

    Map.prototype.entries = function entries() {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.entries called on incompatible receiver " + this);
        return new MapIterator(this, 1);
    };

    Map.prototype.values = function values() {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.values called on incompatible receiver " + this);
        return new MapIterator(this, 2);
    };

    Map.prototype.keys = function keys() {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.keys called on incompatible receiver " + this);
        return new MapIterator(this, 3);
    };

    Map.prototype.forEach = function forEach(callback, thisArg) {
        if (!isMap(this))
            throw new TypeError("Method Map.prototype.forEach called on incompatible receiver " + this);
        if (!isCallable(callback))
            throw new TypeError(callback + " is not a function");
        var currentEntry = this._head;
        while(currentEntry !== null) {
            callback.call(thisArg, currentEntry.value, currentEntry.key, this);
            currentEntry = currentEntry.next;
        }
    };

    Map.prototype[Symbol.iterator] = Map.prototype.entries;

    defineProperty(Map.prototype, Symbol.toStringTag.toString(), {
        value: "Map",
        configurable: true
    });

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
            _size: {
                value: 0,
                writable: true
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
            && typeof map._size === "number"
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

    var Set = function Set(iterable) {
        if (!(this instanceof Set) || isSet(this))
            throw new TypeError("Constructor Set requires 'new'");
        setupSetInternals(this);

        if (iterable !== null && iterable !== undefined) {
            ES6.forOf(iterable, function (entry) {
                this.add(entry);
            }, this);
        }
    };

    // WARNING: This method puts a link in the value object to reduce time complexity to O(1).
    // So, after set.add(value) call, if the linker property of the value object is deleted
    // then set.has(value) will returns false.
    // Time complexity: O(1) for all cases(there is no worst case, same for both primitive and object value).
    // Space complexity is O(n) for all cases.
    Set.prototype.add = function add(value) {
        if (!isSet(this))
            throw new TypeError("Method Set.prototype.add called on incompatible receiver " + this);
        var valueHash = hash(value),
            objectHash = this._objectHash,
            entry;
        if (valueHash === null) {
            if (typeof value[objectHash] === "number" && this._data.objects[value[objectHash]] instanceof SetEntry) {
                // If the value is already present then just return 'this'
                return this;
            }
            entry = new SetEntry(value);
            this._data.objects.push(entry);
            defineProperty(value, objectHash.toString(), {
                value: this._data.objects.length - 1,
                configurable: true
            });
            this._size++;
        } else {
            if (this._data.primitives[valueHash] instanceof SetEntry) {
                // If the value is already present then just return 'this'
                return this;
            }
            entry = new SetEntry(value);
            this._data.primitives[valueHash] = entry;
            this._size++;
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

    // Time complexity: O(1) for all cases(there is no worst case, same for both primitive and object value).
    // Space complexity is O(1)
    Set.prototype.has = function has(value) {
        if (!isSet(this))
            throw new TypeError("Method Set.prototype.has called on incompatible receiver " + this);
        var valueHash = hash(value),
            objectHash = this._objectHash;

        if (valueHash === null)
            return typeof value[objectHash] === "number" && this._data.objects[value[objectHash]] instanceof SetEntry;
        else
            return this._data.primitives[valueHash] instanceof SetEntry;
    };

    // Time complexity: O(n)
    // Space complexity is O(1)
    Set.prototype.clear = function clear() {
        if (!isSet(this))
            throw new TypeError("Method Set.prototype.clear called on incompatible receiver " + this);
        var entry;
        // Clear all primitive values
        Object.getOwnPropertyNames(this._data.primitives).forEach(function (prop) {
            if (this._data.primitives[prop] instanceof SetEntry) {
                entry = this._data.primitives[prop];
                delete this._data.primitives[prop];
                entry.next = null;
                entry.prev = null;
            }
        }, this);

        // Clear all object values
        Object.getOwnPropertyNames(this._data.objects).forEach(function (prop) {
            if (this._data.objects[prop] instanceof SetEntry) {
                entry = this._data.objects[prop];
                delete this._data.objects[prop];
                delete entry.value[this._objectHash];
                entry.next = null;
                entry.prev = null;
            }
        }, this);
        this._data.objects.length = 0;

        // Free head and tail MapEntry
        this._head = null;
        this._tail = null;
        this._size = 0;
    };

    // Time complexity: O(1) for all cases(there is no worst case, same for both primitive and object value).
    // Space complexity is O(1)
    Set.prototype.delete = function (value) {
        if (!isSet(this))
            throw new TypeError("Method Set.prototype.delete called on incompatible receiver " + this);
        var valueHash = hash(value),
            objectHash = this._objectHash,
            entry;
        if (valueHash === null) {
            if (typeof value[objectHash] === "number" && this._data.objects[value[objectHash]] instanceof SetEntry) {
                entry = this._data.objects[value[objectHash]];
                delete this._data.objects[value[objectHash]];
                delete entry.value[objectHash];
            } else
                return false;
        } else {
            if (this._data.primitives[valueHash] instanceof SetEntry) {
                entry = this._data.primitives[valueHash];
                delete this._data.primitives[valueHash];
            } else {
                return false;
            }
        }

        if (entry.prev !== null && entry.next !== null) {
            entry.prev.next = entry.next;
            entry.next.prev = entry.prev;
            entry.next = null;
            entry.prev = null;
        } else if(entry.prev === null && entry.next !== null) {
            this._head = entry.next;
            entry.next.prev = null;
            entry.next = null;
        } if (entry.prev !== null && entry.next === null) {
            this._tail = entry.prev;
            entry.prev.next = null;
            entry.prev = null;
        } else {
            this._head = null;
            this._tail = null;
        }
        this._size--;
        return true;
    };

    Set.prototype.entries = function entries() {
        if (!isSet(this))
            throw new TypeError("Method Set.prototype.entries called on incompatible receiver " + this);
        return new SetIterator(this, 1);
    };

    Set.prototype.values = function values() {
        if (!isSet(this))
            throw new TypeError("Method Set.prototype.values called on incompatible receiver " + this);
        return new SetIterator(this, 2);
    };

    Set.prototype.keys = Set.prototype.values;

    Set.prototype[Symbol.iterator] = Set.prototype.values;

    defineProperty(Set.prototype, "size", {
        get: function size() {
            if (!isSet(this))
                throw new TypeError("Method Set.prototype.size called on incompatible receiver " + this);
            return this._size;
        },
        configurable: true
    });

    Set.prototype.forEach = function forEach(callback, thisArg) {
        if (!isSet(this))
            throw new TypeError("Method Set.prototype.forEach called on incompatible receiver " + this);
        if (!isCallable(callback))
            throw new TypeError(callback + " is not a function");
        var currentEntry = this._head;
        while(currentEntry !== null) {
            callback.call(thisArg, currentEntry.value, currentEntry.value, this);
            currentEntry = currentEntry.next;
        }
    };

    defineProperty(Set.prototype, Symbol.toStringTag.toString(), {
        value: "Set",
        configurable: true
    });

    var setupSetInternals = function (set) {
        defineProperties(set, {
            _isSet: {
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
                value: Symbol("Hash(set)")
            },
            _size: {
                value: 0,
                writable: true
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

    var checkSetInternals = function (set) {
        return set._isSet === true
            && (set._head === null || set._head instanceof SetEntry)
            && (set._tail === null || set._tail instanceof SetEntry)
            && ES6.isSymbol(set._objectHash)
            && typeof set._size === "number"
            && isObject(set._data)
            && isObject(set._data.primitives)
            && isArray(set._data.objects);
    };

    var SetEntry = function SetEntry(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    };

    var isSet = function (set) {
        return set instanceof Set && checkSetInternals(set);
    };

    var WeakMap = function WeakMap(iterable) {
        if (!(this instanceof WeakMap) || isWeakMap(this))
            throw new TypeError("Constructor WeakMap requires 'new'");
        setupWeakMapInternals(this);

        if (iterable !== null && iterable !== undefined) {
            ES6.forOf(iterable, function (entry) {
                if (!isObject(entry))
                    throw new TypeError("Iterator value " + entry + " is not an entry object");
                this.set(entry[0], entry[1]);
            }, this);
        }
    };

    var setupWeakMapInternals = function (weakMap) {
        defineProperties(weakMap, {
            _isWeakMap: {
                value: true
            },
            _objectHash: {
                value: Symbol("Hash(weakmap)")
            },
            _values: {
                value: []
            }
        });
    };

    defineProperty(WeakMap.prototype, Symbol.toStringTag.toString(), {
        value: "WeakMap",
        configurable: true
    });

    var checkWeakMapInternals = function (weakMap) {
        return weakMap._isWeakMap === true
            && ES6.isSymbol(weakMap._objectHash)
            && isArray(weakMap._values);
    };

    var isWeakMap = function (weakMap) {
        return weakMap instanceof WeakMap && checkWeakMapInternals(weakMap);
    };

    // WARNING: This method puts a link in the key object to reduce time complexity to O(1).
    // So, after weakMap.set(key, value) call, if the linker property of the key object is deleted
    // then weakMap.has(key) will return false.
    // Time complexity: O(1) for all cases(there is no worst case)
    // Space complexity is O(n) for all cases.
    WeakMap.prototype.set = function set(key, value) {
        if (!isWeakMap(this))
            throw new TypeError("Method WeakMap.prototype.set called on incompatible receiver " + this);
        // No symbol is allowed in WeakMap as key
        if (!isObject(key) || ES6.isSymbol(key))
            throw new TypeError("Invalid value used as weak map key");
        var objectHash = this._objectHash;
        if (typeof key[objectHash] === "number" && this._values.hasOwnProperty(key[objectHash])) {
            this._values[key[objectHash]] = value;
        } else {
            this._values.push(value);
            defineProperty(key, objectHash.toString(), {
                value: this._values.length - 1,
                configurable: true
            });
        }
        return this;
    };


    // Time complexity: O(1) for all cases(there is no worst case)
    // Space complexity is O(1)
    WeakMap.prototype.get = function get(key) {
        if (!isWeakMap(this))
            throw new TypeError("Method WeakMap.prototype.get called on incompatible receiver " + this);
        if (!isObject(key) || ES6.isSymbol(key))
            return;
        var objectHash = this._objectHash;
        if (typeof key[objectHash] === "number" && this._values.hasOwnProperty(key[objectHash]))
            return this._values[key[objectHash]];
    };

    // Time complexity: O(1) for all cases(there is no worst case)
    // Space complexity is O(1)
    WeakMap.prototype.has = function has(key) {
        if (!isWeakMap(this))
            throw new TypeError("Method WeakMap.prototype.has called on incompatible receiver " + this);
        if (!isObject(key) || ES6.isSymbol(key))
            return false;
        var objectHash = this._objectHash;
        return typeof key[objectHash] === "number" && this._values.hasOwnProperty(key[objectHash]);
    };

    // Time complexity: O(1) for all cases(there is no worst case)
    // Space complexity is O(1)
    WeakMap.prototype.delete = function (key) {
        if (!isWeakMap(this))
            throw new TypeError("Method WeakMap.prototype.delete called on incompatible receiver " + this);
        if (!isObject(key) || ES6.isSymbol(key))
            return false;
        var objectHash = this._objectHash;
        if (typeof key[objectHash] === "number" && this._values.hasOwnProperty(key[objectHash])) {
            delete this._values[key[objectHash]];
            delete key[objectHash];
            return true;
        } else
            return false;
    };

    var WeakSet = function WeakSet(iterable) {
        if (!(this instanceof WeakSet) || isWeakSet(this))
            throw new TypeError("Constructor WeakSet requires 'new'");
        setupWeakSetInternals(this);

        if (iterable !== null && iterable !== undefined) {
            ES6.forOf(iterable, function (entry) {
                this.add(entry);
            }, this);
        }
    };

    var setupWeakSetInternals = function (weakSet) {
        defineProperties(weakSet, {
            _isWeakSet: {
                value: true
            },
            _objectHash: {
                value: Symbol("Hash(weakset)")
            }
        });
    };

    var checkWeakSetInternals = function (weakSet) {
        return weakSet._isWeakSet === true
            && ES6.isSymbol(weakSet._objectHash);
    };

    var isWeakSet = function (weakSet) {
        return weakSet instanceof WeakSet && checkWeakSetInternals(weakSet);
    };

    // WARNING: This method puts a link in the value object to reduce time complexity to O(1).
    // So, after weakSet.add(value) call, if the linker property of the value object is deleted
    // then weakSet.has(value) will return false.
    // Time complexity: O(1) for all cases(there is no worst case)
    // Space complexity is O(n) for all cases.
    WeakSet.prototype.add = function add(value) {
        if (!isWeakSet(this))
            throw new TypeError("Method WeakSet.prototype.add called on incompatible receiver " + this);
        // No symbol is allowed in WeakSet as value
        if (!isObject(value) || ES6.isSymbol(value))
            throw new TypeError("Invalid value used in weak set");
        var objectHash = this._objectHash;
        if (value[objectHash] === objectHash.toString()) {
            // Just ignore if the value already exists
        } else {
            defineProperty(value, objectHash.toString(), {
                value: objectHash.toString(),
                configurable: true
            });
        }
        return this;
    };

    // Time complexity: O(1) for all cases(there is no worst case)
    // Space complexity is O(1) for all cases.
    WeakSet.prototype.has = function has(value) {
        if (!isWeakSet(this))
            throw new TypeError("Method WeakSet.prototype.has called on incompatible receiver " + this);
        if (!isObject(value) || ES6.isSymbol(value))
            return false;
        var objectHash = this._objectHash;
        return value[objectHash] === objectHash.toString();
    };

    // Time complexity: O(1) for all cases(there is no worst case)
    // Space complexity is O(1) for all cases.
    WeakSet.prototype.delete = function (value) {
        if (!isWeakSet(this))
            throw new TypeError("Method WeakSet.prototype.delete called on incompatible receiver " + this);
        if (!isObject(value) || ES6.isSymbol(value))
            return false;
        var objectHash = this._objectHash;
        if (value[objectHash] === objectHash.toString()) {
            delete value[objectHash];
            return true;
        } else
            return false;
    };

    defineProperty(WeakSet.prototype, Symbol.toStringTag.toString(), {
        value: "WeakSet",
        configurable: true
    });

    var Promise = function Promise(executor) {
        if (!(this instanceof Promise) || isPromise(this))
            throw new TypeError(String(this) + " is not a promise");
        if (!isCallable(executor))
            throw new TypeError("Promise resolver " + String(executor) + " is not a function");
        setupPromiseInternals(this);
        try {
            executor((function (value) {
                this._resolve(value);
            }).bind(this), (function (reason) {
                this._reject(reason);
            }).bind(this));
        } catch (e) {
            this._reject(e);
        }
    };

    Promise.resolve = function resolve(value) {
        if (isPromise(value))
            return value;
        return new Promise(function (resolve, reject) {
            if (isThenable(value)) {
                addToMessageQueue(function () {
                    try {
                        value.then(resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            }
            else
                resolve(value);
        });
    };

    Promise.reject = function reject(reason) {
        return new Promise(function (resoolve, reject) {
            reject(reason);
        });
    };

    Promise.race = function race(iterable) {
        var isSettled = false;
        return new Promise(function (resolve, reject) {
            ES6.forOf(iterable, function (promise) {
                var temp1,
                    temp2;
                if (isPromise(promise)) {
                    if (isFulfilledPromise(promise)) {
                        if (!isSettled) {
                            isSettled = true;
                            addToMessageQueue(function () {
                                resolve(promise._value);
                            });
                        }
                    }
                    else if (isRejectedPromise(promise)) {
                        if (!isSettled) {
                            isSettled = true;
                            addToMessageQueue(function () {
                                reject(promise._reason);
                            });
                        }
                    } else if (isPendingPromise(promise)) {
                        temp1 = promise._resolve;
                        temp2 = promise._reject;
                        defineProperties(promise, {
                            _resolve: {
                                value: (function (value) {
                                    temp1(value);
                                    if (!isSettled) {
                                        isSettled = true;
                                        resolve(value);
                                    }
                                }).bind(promise)
                            },
                            _reject: {
                                value: (function (reason) {
                                    temp2(reason);
                                    if (!isSettled) {
                                        isSettled = true;
                                        reject(reason);
                                    }
                                }).bind(promise)
                            }
                        });
                    }
                } else if (isThenable(promise)) {
                    addToMessageQueue(function () {
                        try {
                            promise.then(function (value) {
                                if (!isSettled) {
                                    isSettled = true;
                                    resolve(value);
                                }
                            }, function (reason) {
                                if (!isSettled) {
                                    isSettled = true;
                                    reject(reason);
                                }
                            });
                        } catch (e) {
                            reject(e);
                        }
                    });
                } else {
                    if (!isSettled) {
                        isSettled = true;
                        addToMessageQueue(function () {
                            resolve(promise);
                        });
                    }
                }
            })
        });
    };

    Promise.all = function all(iterable) {
        var promises = ES6.spreadOperator([]).spread(iterable).array(),
            counter = 0,
            length = promises.length,
            values = new Array(length);

        return new Promise(function (resolve, reject) {
            if (length === 0)
                resolve(values);
            else {
                promises.forEach(function (promise, index) {
                    var temp1,
                        temp2;
                    if (isPromise(promise)) {
                        if (isFulfilledPromise(promise)) {
                            values[index] = promise._value;
                            counter++;
                            if (counter === length) {
                                addToMessageQueue(function () {
                                    resolve(values);
                                });
                            }
                        } else if(isRejectedPromise(promise)) {
                            addToMessageQueue(function () {
                                reject(promise._reason);
                            });
                        } else if(isPendingPromise(promise)) {
                            temp1 = promise._resolve;
                            temp2 = promise._reject;
                            defineProperties(promise, {
                                _resolve: {
                                    value: (function (value) {
                                        temp1(value);
                                        values[index] = value;
                                        counter++;
                                        if (counter === length) {
                                            resolve(values);
                                        }
                                    }).bind(promise)
                                },
                                _reject: {
                                    value: (function (reason) {
                                        temp2(reason);
                                        reject(reason);
                                    }).bind(promise)
                                }
                            });
                        }
                    } else if (isThenable(promise)) {
                        addToMessageQueue(function () {
                            try {
                                promise.then(function (value) {
                                    values[index] = value;
                                    counter++;
                                    if (counter === length) {
                                        resolve(values);
                                    }
                                }, function (reason) {
                                    // If the returned promise is already rejected, then it does nothing
                                    reject(reason);
                                });
                            } catch (e) {
                                reject(e);
                            }
                        });
                    } else {
                        values[index] = promise;
                        counter++;
                        if (counter === length) {
                            addToMessageQueue(function () {
                                resolve(values);
                            });
                        }
                    }
                });
            }
        });
    };

    Promise.prototype.then = function then(onFulfilled, onRejected) {
        if (!isPromise(this))
            throw new TypeError(this + " is not a promise");
        onFulfilled = !isCallable(onFulfilled) ? defaultPromiseOnFulfilled : onFulfilled;
        onRejected = !isCallable(onRejected) ? defaultPromiseOnRejected : onRejected;

        var chainedPromise = new Promise(function (resolve, reject) {}),
            nextOnFulfilled,
            nextOnRejected;

        nextOnFulfilled = function (value) {
            var result;
            try {
                result = onFulfilled(value);
                processPromiseResult(result, chainedPromise);
            } catch (e) {
                chainedPromise._reject(e);
            }
        };

        nextOnRejected = function (reason) {
            var result;
            try {
                result = onRejected(reason);
                processPromiseResult(result, chainedPromise);
            } catch (e) {
                chainedPromise._reject(e);
            }
        };

        if (isPendingPromise(this)) {
            this._onFulfilled.push(nextOnFulfilled);
            this._onRejected.push(nextOnRejected);
        } else if (isFulfilledPromise(this)) {
            addToMessageQueue(nextOnFulfilled, undefined, this._value);
        } else if (isRejectedPromise(this))
            addToMessageQueue(nextOnRejected, undefined, this._reason);
        return chainedPromise;
    };

    var processPromiseResult = function (result, chainedPromise) {
        var temp1,
            temp2;
        if (isPromise(result)) {
            if (isFulfilledPromise(result))
                chainedPromise._resolve(result._value);
            else if (isRejectedPromise(result))
                chainedPromise._reject(result._reason);
            else if (isPendingPromise(result)) {
                temp1 = result._resolve;
                temp2 = result._reject;
                defineProperties(result, {
                    _resolve: {
                        value: (function (value) {
                            temp1(value);
                            chainedPromise._resolve(value);
                        }).bind(result)
                    },
                    _reject: {
                        value: (function (reason) {
                            temp2(reason);
                            chainedPromise._reject(reason);
                        }).bind(result)
                    }
                });
            }
        } else if (isThenable(result)) {
            addToMessageQueue(function () {
                try {
                    result.then((function (value) {
                        this._resolve(value);
                    }).bind(chainedPromise), (function (reason) {
                        this._reject(reason);
                    }).bind(chainedPromise));
                } catch (e) {
                    chainedPromise._reject(e);
                }
            });
        } else
            chainedPromise._resolve(result);
    };

    Promise.prototype.catch = function (onRejected) {
        if (!isCallable(this["then"]))
            throw new TypeError("(var).then is not a function");
        return this["then"](undefined, onRejected);
    };

    defineProperty(Promise.prototype, Symbol.toStringTag.toString(), {
        value: "Promise",
        configurable: true
    });

    // Although this method is not standard i.e. is not a part of ES6,
    // but it is given for testing purpose
    Promise.prototype.toString = function () {
        if (!isPromise(this))
            throw new TypeError(this + " is not a promise");
        switch (this._state) {
            case "pending":
                return "Promise { <pending> }";
            case "fulfilled":
                return "Promise { " + this._value + " }";
            case "rejected":
                return "Promise { <rejected> " + this._reason + " }";
        }
    };

    var isThenable = function (value) {
        return isObject(value) && isCallable(value.then);
    };

    var defaultPromiseOnFulfilled = function (value) {
        return Promise.resolve(value);
    };

    var defaultPromiseOnRejected = function (reason) {
        return Promise.reject(reason);
    };

    var promiseResolve = function (value) {
        // Just return if the promise is settled already
        if (isSettledPromise(this))
            return;
        defineProperties(this, {
            _state: {
                value: "fulfilled"
            },
            _value: {
                value: value
            }
        });
        if (this._onFulfilled.length > 0) {
            addToMessageQueue(function (value) {
                this._onFulfilled.forEach(function (callback) {
                    callback(value);
                });
                // Free the references of the callbacks, because
                // these are not needed anymore after calling first time _resolve() method
                this._onFulfilled.length = 0;
                this._onRejected.length = 0;
            }, this, value);
        }
    };

    var promiseReject = function (reason) {
        // Just return if the promise is settled already
        if (isSettledPromise(this))
            return;
        defineProperties(this, {
            _state: {
                value: "rejected"
            },
            _reason: {
                value: reason
            }
        });
        if (this._onRejected.length > 0) {
            addToMessageQueue(function (reason) {
                this._onRejected.forEach(function (callback) {
                    callback(reason);
                });
                // Free the references of the callbacks, because
                // these are not needed anymore after calling first time _reject() method
                this._onFulfilled.length = 0;
                this._onRejected.length = 0;
            }, this, reason);
        }
    };

    var setupPromiseInternals = function (promise) {
        defineProperties(promise, {
            _isPromise: {
                value: true
            },
            _onFulfilled: {
                value: []
            },
            _onRejected: {
                value: []
            },
            _resolve: {
                value: promiseResolve.bind(promise),
                configurable: true
            },
            _reject: {
                value: promiseReject.bind(promise),
                configurable: true
            },
            _state: {
                value: "pending",
                configurable: true
            },
            _value: {
                value: undefined,
                configurable: true
            },
            _reason: {
                value: undefined,
                configurable: true
            }
        });
    };

    var isPendingPromise = function (promise) {
        return promise._state === "pending";
    };

    var isFulfilledPromise = function (promise) {
        return promise._state === "fulfilled";
    };

    var isRejectedPromise = function (promise) {
        return promise._state === "rejected";
    };

    var isSettledPromise = function (promise) {
        return promise._state === "fulfilled" || promise._state === "rejected";
    };

    var isValidPromiseState = function (state) {
        return ["pending", "fulfilled", "rejected"].indexOf(String(state)) !== -1;
    };

    var checkPromiseInternals = function (promise) {
        return promise._isPromise === true
            && isArray(promise._onFulfilled)
            && isArray(promise._onRejected)
            && isCallable(promise._resolve)
            && isCallable(promise._reject)
            && isValidPromiseState(promise._state)
            && promise.hasOwnProperty("_value")
            && promise.hasOwnProperty("_reason")
    };

    var isPromise = function (promise) {
        return promise instanceof Promise && checkPromiseInternals(promise);
    };

    var es6NumberIsNaN = function isNaN(value) {
        return typeof value === "number" && value !== value;
    };

    var es6NumberIsFinite = function isFinite(value) {
        return typeof value === "number" && globalIsFinite(value);
    };

    var es6NumberIsInteger = function isInteger(value) {
        return es6NumberIsFinite(value) && floor(value) === value;
    };

    var es6NumberIsSafeInteger = function isSafeInteger(value) {
        return es6NumberIsInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
    };

    var es6ObjectIs = function is(value1, value2) {
        if (typeof value1 === "number" && typeof value2 === "number") {
            if (value1 === 0 && value2 === 0)
                return 1 / value1 === 1 / value2;
            else if (es6NumberIsNaN(value1) && es6NumberIsNaN(value2))
                return true;
            else
                return value1 === value2;
        } else
            return value1 === value2;
    };


    var es6ObjectSetPrototypeOf = function setPrototypeOf(obj, prototype) {
        if (obj === undefined || obj === null)
            throw new TypeError("Object.setPrototypeOf called on null or undefined");
        if ( !(prototype === null || isObject(prototype)) )
            throw new TypeError("Object prototype may only be an Object or null: " + String(prototype));

        var protoDesc = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__");
        // If Object.prototype.__proto__ does not exist or it is
        // not an accessor property then just throw errors
        if (protoDesc === undefined || !isCallable(protoDesc.set))
            throw new TypeError("Object.prototype.__proto__ accessor property does not exist");

        protoDesc.set.call(obj, prototype);
        return obj;
    };

    var es6ObjectAssign = function assign(target) {
        if (target === null || target === undefined)
            throw new TypeError("Cannot convert undefined or null to object");
        target = Object(target);
        var i,
            j,
            keys,
            nextSource;

        for(i = 1; i < arguments.length; ++i) {
            nextSource = arguments[i];
            if (nextSource === undefined || nextSource === null)
                continue;
            nextSource = Object(nextSource);
            keys = Object.keys(nextSource);
            for (j = 0; j < keys.length; ++j) {
                target[keys[j]] = nextSource[keys[j]];
            }
        }
        return target;
    };

    var es6ObjectGetOwnPropertySymbols = function getOwnPropertySymbols(obj) {
        if (obj === null || obj === undefined)
            throw new TypeError("Cannot convert undefined or null to object");
        obj = Object(obj);
        var ownProps = Object.getOwnPropertyNames(obj),
            matched,
            sId,
            foundSymbols = [];
        ownProps.forEach(function (prop) {
            matched = prop.match(symbolNamePattern);
            if (matched === null)
                return;
            sId = matched[1];
            if (isSymbol(symbolBucket[sId]))
                foundSymbols.push(symbolBucket[sId]);
        });
        return foundSymbols;
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

        // This method gives same functionality of the spread operator of ES6
        // It works on only functions and arrays.
        // Limitation: You can't create array like this [...iterable, , , , 33] by this method,
        // to achieve this you have to do like this [...iterable, undefined, undefined, undefined, 33]
        spreadOperator: es6SpreadOperator,

        isMap: isMap,

        isSet: isSet,

        isWeakMap: isWeakMap,

        isWeakSet: isWeakSet
    };
    
    // Apply all the patches to support ES6 in ES5.
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

        defineProperty(global, "Set", {
            value: Set,
            writable: true,
            configurable: true
        });

        defineProperty(global, "WeakMap", {
            value: WeakMap,
            writable: true,
            configurable: true
        });

        defineProperty(global, "WeakSet", {
            value: WeakSet,
            writable: true,
            configurable: true
        });

        defineProperty(global, "Promise", {
            value: Promise,
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

        defineProperty(Object, "is", {
            value: es6ObjectIs,
            writable: true,
            configurable: true
        });

        defineProperty(Object, "setPrototypeOf", {
            value: es6ObjectSetPrototypeOf,
            writable: true,
            configurable: true
        });

        defineProperty(Object, "assign", {
            value: es6ObjectAssign,
            writable: true,
            configurable: true
        });

        defineProperty(Object, "getOwnPropertySymbols", {
            value: es6ObjectGetOwnPropertySymbols,
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

        defineProperty(Number, "isNaN", {
            value: es6NumberIsNaN,
            writable: true,
            configurable: true
        });

        defineProperty(Number, "isFinite", {
            value: es6NumberIsFinite,
            writable: true,
            configurable: true
        });

        defineProperty(Number, "isInteger", {
            value: es6NumberIsInteger,
            writable: true,
            configurable: true
        });

        defineProperty(Number, "parseInt", {
            value: parseInt,
            writable: true,
            configurable: true
        });

        defineProperty(Number, "parseFloat", {
            value: parseFloat,
            writable: true,
            configurable: true
        });

        defineProperty(Number, "isSafeInteger", {
            value: es6NumberIsSafeInteger,
            writable: true,
            configurable: true
        });

        if (typeof Number.EPSILON !== "number") {
            defineProperty(Number, "EPSILON", {
                value: 2.220446049250313e-16
            });
        }

        if (typeof Number.MAX_SAFE_INTEGER !== "number") {
            defineProperty(Number, "MAX_SAFE_INTEGER", {
                value: Math.pow(2, 53) - 1
            });
        }

        if (typeof Number.MIN_SAFE_INTEGER !== "number") {
            defineProperty(Number, "MIN_SAFE_INTEGER", {
                value: -(Math.pow(2, 53) - 1)
            });
        }



    }

    return ES6;
});















