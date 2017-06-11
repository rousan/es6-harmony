# ES6 Harmony

Provides an equivalent implementation of ES6(Harmony)
in pure ES5 code and creates a ES6 environment for backward browsers or
JavaScript engines that natively does not support ES6.(At least ES5 is required).
This Library is standalone, it has no dependency.

## Installation

If you want to use this module then,
* In browser context, just include this script before all other scripts
* In NodeJS or CommonJS environment, install it via npm and import it

     `npm install es6-harmony`
     
## Implementations

* `Array`
    * `Array.from()`
    * `Array.of()`
    * `get Array[@@species]`
    * `Array.prototype.fill()`
    * `Array.prototype.find()`
    * `Array.prototype.findIndex()`
    * `Array.prototype.entries()`
    * `Array.prototype.keys()`
    * `Array.prototype.copyWithin()`
    * `Array.prototype[@@iterator]`
* `Map`
    * `get Map[@@species]`
    * `Map.prototype.size`
    * `Map.prototype.set()`
    * `Map.prototype.get()`
    * `Map.prototype.has()`
    * `Map.prototype.clear()`
    * `Map.prototype.delete()`
    * `Map.prototype.entries()`
    * `Map.prototype.forEach()`
    * `Map.prototype.keys()`
    * `Map.prototype.values()`
    * `Map.prototype[@@iterator]()`
    * `Map.prototype[@@toStringTag]()`
* `Set`
    * `get Set[@@species]`
    * `Set.prototype.size`
    * `Set.prototype.add()`
    * `Set.prototype.clear()`
    * `Set.prototype.delete()`
    * `Set.prototype.entries()`
    * `Set.prototype.forEach()`
    * `Set.prototype.has()`
    * `Set.prototype.keys()`
    * `Set.prototype.values()`
    * `Set.prototype[@@iterator]()`
    * `Set.prototype[@@toStringTag]()`
* `WeakMap`
    * `WeakMap.prototype.delete()`
    * `WeakMap.prototype.get()`
    * `WeakMap.prototype.has()`
    * `WeakMap.prototype.set()`
    * `WeakMap.prototype[@@toStringTag]()`
* `WeakSet`
    * `WeakSet.prototype.add()`
    * `WeakSet.prototype.delete()`
    * `WeakSet.prototype.has()`
    * `WeakSet.prototype[@@toStringTag]()`
* `Symbol`
    * `Symbol.iterator`
    * `Symbol.hasInstance`
    * `Symbol.isConcatSpreadable`
    * `Symbol.species`
    * `Symbol.toStringTag`
    * `Symbol.for()`
    * `Symbol.keyFor()`
    * `Symbol.prototype.toString()`
    * `Symbol.prototype.valueOf()`
    
    
    
    
## Contributors
   * [Ariyan Khan](https://github.com/ariyankhan)
   
   Contributions are welcome
   
## License
Copyright (c) 2017 Ariyan Khan, MIT License
    
    