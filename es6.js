/*!
 * This module provides an approximate equivalent implementation of ES6(Harmony)'s
 * new features in pure ES5 for backward compatibility. This API has no dependencies.
 *
 * WARNING: This implementation is tested only on firefox browser.
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

    var symbolHiddenCounter = 0;

    // Generates name for a symbol instance and this name will be used as
    // property key for property symbols internally.
    var generateSymbolName = function (id) {
        return "@@_____" + id + "_____";
    };

    // Generates id for next Symbol instance
    var getNextSymbolId = function () {
        return symbolHiddenCounter++;
    };

    // Behaves as Symbol function in ES6, take description and returns an unique object,
    // but in ES6 this function returns Symbol typed primitive value.
    // Its type is 'object' not 'symbol'.
    // There is no wrapping in this case i.e. Object(sym) = sym.
    var Symbol = function Symbol(desc) {
        desc = typeof desc === "undefined" ? "" : String(desc);

        if(this instanceof Symbol)
            throw new TypeError("Symbol is not a constructor");

        var hiddenSymbol = Object.create(Symbol.prototype);
        hiddenSymbol._description = desc;
        hiddenSymbol._isSymbol = true;
        hiddenSymbol._id = getNextSymbolId();
        return hiddenSymbol;
    };

    // In ES6, this function returns like 'Symbol(<desc>)', but in this case
    // this function returns the symbol's internal name to work properly.
    Symbol.prototype.toString = function () {
        return generateSymbolName(this._id);
    };

    // Returns itself but in ES6 It returns 'symbol' typed value.
    Symbol.prototype.valueOf = function () {
        return this;
    };

    var isSymbol = function (symbol) {
        return typeof symbol === "object" && symbol._isSymbol === true;
    };

    Symbol.iterator = Symbol("Symbol.iterator");

    Symbol.isConcatSpreadable = Symbol("Symbol.isConcatSpreadable");

    Symbol.hasInstance = Symbol("Symbol.hasInstance");

    Symbol.match = Symbol("Symbol.match");

    Symbol.replace = Symbol("Symbol.replace");

    Symbol.search = Symbol("Symbol.search");

    Symbol.species = Symbol("Symbol.species");

    Symbol.split = Symbol("Symbol.split");

    Symbol.toPrimitive = Symbol("Symbol.toPrimitive");

    Symbol.toStringTag = Symbol("Symbol.toStringTag");

    Symbol.unscopables = Symbol("Symbol.unscopables");

    ES6.isSymbol = isSymbol;

    if (typeof global.Symbol !== "function") {
        global.Symbol = Symbol;
    }



    return ES6;
});















