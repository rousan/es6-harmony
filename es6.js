/*!
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
        global["ES6"] = factory(global);
    }

    /* window is for browser environment and global is for NodeJS environment */
})(typeof window !== "undefined" ? window : _global, function (global) {

    "use strict";

    var defineProperty = Object.defineProperty;

    var defineProperties = Object.defineProperties;

    var symbolHiddenCounter = 0;

    var globalSymbolRegistry = [];

    var isES6Running = function() {
        return false; /* For testing purpose */
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

    // Behaves as Symbol function in ES6, take description and returns an unique object,
    // but in ES6 this function returns Symbol typed primitive value.
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

    // Some ES6 API can't be implemented in pure ES5, so this ES6 object provides
    // some equivalent functionality of these features.
    var ES6 = {

        // Checks if a JS value is a symbol
        // It can be used as equivalent api in ES6: typeof symbol === 'symbol'
        isSymbol: isSymbol,

        // Native ES5 'instanceof' operator does not support @@hasInstance symbol,
        // this method provides same functionality of ES6 'instanceof' operator with
        // @@hasInstance symbol
        instanceOf: instanceOf
    };

    // Addition of all patches to support ES6 new APIs in ES5
    // If the running environment already supports ES6 then no patches will applied,
    // and exported ES6 object has no APIs, just a empty object
    if (isES6Running())
        return {};
    else {
        if (typeof global.Symbol !== "function") {
            defineProperty(global, "Symbol", {
                value: Symbol,
                writable: true,
                configurable: true
            });
        }

        if (typeof Function.prototype[Symbol.hasInstance] !== "function") {
            defineProperty(Function.prototype, Symbol.hasInstance.toString(), {
                value: functionHasInstanceSymbol
            });
        }
    }

    return ES6;
});















