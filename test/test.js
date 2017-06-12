

"use strict";

const mod = require("../es6-harmony");
let ES6 = mod.ES6;
let Symbol = mod.Symbol;
let Map = mod.Map;
let Set = mod.Set;
let WeakMap = mod.WeakMap;
let WeakSet = mod.WeakSet;
let g = global;

var t = {};

var m = new Map();
m.set(t, 12);

var m1 = new Map();

m1.set(t, 111); // legacy


console.log(m.get(t), m1.get(t));

console.log(Object.getOwnPropertyNames(t));
