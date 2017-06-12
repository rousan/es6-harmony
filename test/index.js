
"use strict";


var ws = new WeakSet();
ws.add(Object);
ws.add(Math);

console.log(ws.has(Function));