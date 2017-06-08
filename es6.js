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

    var ES6 = {};

    var defineProperty = Object.defineProperty;

    var defineProperties = Object.defineProperties;

    var symbolHiddenCounter = 0;

    var globalSymbolRegistry = [];

    var isObject = function (value) {
        return value !== null
    };

    var instanceOfOperator = function (object, constructor) {

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

    // Checks if a JS value is a symbol
    // It can be used as equivalent api in ES6: typeof symbol === 'symbol'
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

    ES6.isSymbol = isSymbol;

    if (typeof global.Symbol !== "function") {
        global.Symbol = Symbol;
    }



    return ES6;
});















