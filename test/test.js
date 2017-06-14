

"use strict";

//var es6 = require("../es6-harmony");







var t = {};

t[Symbol.hasInstance] = 9;

console.log(Object.getOwnPropertySymbols(t)[0] === Symbol.hasInstance);