# Not Yet Implemented

The following features are not yet implemented, but can be implemented safely:

 * `get Array[@@species]`
 * `get Map[@@species]`
 
 * `get Set[@@species]`
 
 * `Math.imul()`, `Math.clz32()`, `Math.fround()`, `Math.log10()`, `Math.log2()`,
   `Math.log1p()`, `Math.expm1()`, `Math.cosh()`, `Math.sinh()`, `Math.tanh()`,
   `Math.acosh()`, `Math.asinh()`, `Math.atanh()`, `Math.hypot()`, `Math.trunc()`,
   `Math.sign()`, `Math.cbrt()`
   
 * generic `Date.prototype.toString()`, `Date.prototype[@@toPrimitive]`
 
 * `Proxy`
 
 * `Reflect`
 
 * generic `RegExp.prototype.toString()`, 
   `RegExp.prototype[@@match]()`,
   `RegExp.prototype[@@replace]()`,
   `RegExp.prototype[@@search]()`,
   `RegExp.prototype[@@split]()`,
   `get RegExp[@@species]`
   
 * `String.prototype.normalize()`,
   `String.raw()`
   
 * `Symbol.match`,
   `Symbol.species`,
   `Symbol.toPrimitive`,
   `Symbol.prototype[@@toPrimitive]`,
   `Symbol.replace`,
   `Symbol.search`,
   `Symbol.split`,
   `Symbol.unscopables`
   
 * `Typed Arrays` (Can't be implemented efficiently due to `ArrayBuffer`)    

 * `arguments[@@iterator]`(By manually calling an `ES6` utility method in `function` body)
 
 * `Template strings` 
 
 * `class` (Manual class inheritance methods)
 
 * `@@StringTag` can be added to Classes
 
 * `@@StringTag` can be added to TypedArray