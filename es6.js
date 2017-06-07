/**
 *
 * This module provides an approximate equivalent implementation of ES6(Harmony)'s
 * new features in pure ES5 for backward compatibility. This API has no dependencies.
 *
 * Warning: This implementation is tested only on firefox browser.
 *
 * Codebase: https://github.com/ariyankhan/es6
 *
 */


(function (global, factory) {

    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {
        /*
         * For the environment like NodeJS, CommonJS etc where module or
         * module.exports objects are available to export ES6 object.
         */
        module.exports = factory(global);
    } else {
        /*
         * For browser environment, where global refers to the window
         * object and the ES6 API is exported as 'ES6' property in window object.
         */
        global["ES6"] = factory(global);
    }

    //window is for browser context and global is for NodeJS context
})(typeof window !== "undefined" ? window : global, function (global) {

    "use strict";

    var ES6 = {};


    function generateSymbolName(desc) {
        desc = validateSymbolDesc(desc);

    }
    function validateSymbolDesc(desc) {
        return typeof desc === "undefined" ? "" : String(desc);
    }

    return ES6;
});















