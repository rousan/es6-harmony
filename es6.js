/**
 *
 * This module provides an approximate equivalent implementation of ES6(Harmony)'s
 * new features in pure ES5 for backward compatibility. This API has no dependencies.
 *
 * Warning: This implementation is basically on firefox browser.
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
        module.exports = factory();
    } else {
        /*
         * For browser environment, where global refers to the window
         * object and the ES6 API is exported as 'ES6' property in window object.
         */
        global["ES6"] = factory();
    }

})(this, function () {

    "use strict";

    var ES6 = {};



    return ES6;
});















