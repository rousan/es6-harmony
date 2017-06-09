/*!
 * ES6 v1.0.0
 * This module provides an approximate equivalent implementation of ES6(Harmony)'s
 * new features in pure ES5 for backward compatibility. This API has no dependencies.
 *
 * WARNING: This implementation is tested only on firefox browser.
 *
 * @license Copyright (c) 2017 Ariyan Khan, MIT License
 *
 * Codebase: https://github.com/ariyankhan/es6
 * Date: Jun 8, 2017
 */


var testing = true;
var _global = testing ? exports : global;


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
        if (typeof global["ES6"] !== "object")
            global["ES6"] = factory(global);
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

    var emptyFunction = function () {};

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

    var functionHasInstanceSymbol = function (instance) {
        if (typeof this !== "function")
            return false;
        return instance instanceof this;
    };

    var instanceOf = function (object, constructor) {
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

    var es6ToString = function toString() {
        if (this === undefined || this === null)
            return objectToString.call(this);
        // Add support for @@toStringTag symbol
        if (typeof this[Symbol.toStringTag] === "string")
            return "[object " + this[Symbol.toStringTag] + "]";
        else
            return objectToString.call(this);
    };

    var es6ArrayConcat = function concat() {
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

    var forOfLoop = function (iterable, callback, thisArg) {
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
        },

        "match": {
            value: Symbol("Symbol.match")
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

        if (self._nextIndex < Math.floor(self._array.length)) {
            if (self._flag)
                nextValue = [self._nextIndex, self._array[self._nextIndex]];
            else
                nextValue = self._array[self._nextIndex];
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

    var arrayIteratorSymbol = function values() {
        if (this === undefined || this === null)
            throw new TypeError("Cannot convert undefined or null to object");

        var self = Object(this);
        return new ArrayIterator(self, 0);
    };

    var stringIteratorSymbol = function values() {
        if (this === undefined || this === null)
            throw new TypeError("String.prototype[Symbol.iterator] called on null or undefined");
        return new StringIterator(String(this), 0);
    };

    var arrayEntries = function entries() {
        if (this === undefined || this === null)
            throw new TypeError("Cannot convert undefined or null to object");

        var self = Object(this);
        return new ArrayIterator(self, 1);
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

    // Some ES6 API can't be implemented in pure ES5, so this 'ES6' object provides
    // some equivalent functionality of these features.
    var ES6 = {

        // Checks if a JS value is a symbol
        // It can be used as equivalent api in ES6: typeof symbol === 'symbol'
        isSymbol: isSymbol,

        // Native ES5 'instanceof' operator does not support @@hasInstance symbol,
        // this method provides same functionality of ES6 'instanceof' operator.
        instanceOf: instanceOf,

        // This method behaves exactly same as ES6 for...of loop.
        forOf: forOfLoop,

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

        defineProperty(Function.prototype, Symbol.hasInstance.toString(), {
            value: functionHasInstanceSymbol
        });

        defineProperty(Array.prototype, "concat", {
            value: es6ArrayConcat,
            writable: true,
            configurable: true
        });

        defineProperty(Object.prototype, "toString", {
            value: es6ToString,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, Symbol.iterator.toString(), {
            value: arrayIteratorSymbol,
            writable: true,
            configurable: true
        });

        defineProperty(Array.prototype, "entries", {
            value: arrayEntries,
            writable: true,
            configurable: true
        });

        defineProperty(String.prototype, Symbol.iterator.toString(), {
            value: stringIteratorSymbol,
            writable: true,
            configurable: true
        });
    }


    return ES6;
});















