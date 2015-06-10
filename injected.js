(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Code injected by jspm-server
'use strict';

require('./lib');

},{"./lib":3}],2:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _F = require('fkit');

var _F2 = _interopRequireWildcard(_F);

var notChecked = function notChecked(pair) {
  return !(pair[0] == 'default' || /^__/.exec(pair[0]));
},
    pairsEqual = function pairsEqual(pairs) {
  var _pairs = _slicedToArray(pairs, 2);

  var pairA = _pairs[0];
  var pairB = _pairs[1];

  return pairA[0] === pairB[0] && pairA[1] === pairB[1];
},
    compareModules = function compareModules(moduleA, moduleB) {
  var a = _F2['default'].filter(notChecked, _F2['default'].pairs(moduleA)).concat(_F2['default'].pairs(moduleA['default'] || {})),
      b = _F2['default'].filter(notChecked, _F2['default'].pairs(moduleB)).concat(_F2['default'].pairs(moduleB['default'] || {}));
  return a.length == b.length && _F2['default'].all(pairsEqual, _F2['default'].zip(a, b));
};

var ChangeHandler = (function () {
  function ChangeHandler(System) {
    _classCallCheck(this, ChangeHandler);

    this.System = System;
    this.moduleMap = new Map();
    this.depMap = new Map();
    this.updateModuleMap();
    this.updateDepMap();
  }

  _createClass(ChangeHandler, [{
    key: 'updateModuleMap',
    value: function updateModuleMap() {
      var _this = this;

      var modules = Object.keys(this.System.loads || {});
      if (modules.length != this.moduleMap.size) {
        this.moduleMap.clear();
        modules.forEach(function (moduleName) {
          var meta = _this.System.loads[moduleName].metadata,
              path = meta.pluginArgument || meta.loaderArgument || moduleName;
          _this.moduleMap.set(path, { moduleName: moduleName, loader: meta.plugin || meta.loaderModule });
        });
      }
    }
  }, {
    key: 'updateDepMap',
    value: function updateDepMap() {
      var _this2 = this;

      var modules = Object.keys(this.System.loads || {});
      if (modules.length != this.depMap.size) {
        this.depMap.clear();
        modules.forEach(function (m) {
          var meta = _this2.System.loads[m].metadata,
              path = meta.pluginArgument || meta.loaderArgument || m;
          _this2.depMap.set(path, []);
        });
        modules.forEach(function (m) {
          var deps = _this2.System.loads[m].depMap;
          Object.keys(deps).forEach(function (dep) {
            var _deps$dep$split = deps[dep].split('!');

            var _deps$dep$split2 = _slicedToArray(_deps$dep$split, 2);

            var path = _deps$dep$split2[0];
            var loader = _deps$dep$split2[1];

            _this2.depMap.get(path).push(m.split('!')[0]);
          });
        });
      }
    }
  }, {
    key: 'fileChanged',
    value: function fileChanged(_path) {
      var _this3 = this;

      var reloadPageIfNeeded = arguments[1] === undefined ? true : arguments[1];

      this.updateModuleMap();
      this.updateDepMap();
      var path = _path.replace(/\.js$/, '');

      if (!this.moduleMap.has(path)) {
        if (reloadPageIfNeeded) this.reload(path, 'Change occurred to a file outside SystemJS loading');
        return;
      }

      var moduleInfo = this.moduleMap.get(path);

      this.System['import'](moduleInfo.moduleName).then(function (oldModule) {
        if (!oldModule.__hotReload) {
          return Promise.reject('' + path + ' is not hot reloadable!');
        }
        //if (!moduleInfo.loader) {
        //  return Promise.reject("Default loader cannot hot-swap")
        //}
        //
        var loader = moduleInfo.loader && (moduleInfo.loader['default'] || moduleInfo.loader);
        //if (!loader.hotReload) {
        //  return Promise.reject(`Loader '${loader}' does not define a reload handler`)
        //}

        _this3.System['delete'](moduleInfo.moduleName);
        _this3.System['import'](moduleInfo.moduleName).then(function (newModule) {
          var propagate = undefined;
          if (oldModule.__hotReload === true) {
            propagate = true;
          } else if (typeof oldModule.__hotReload === 'function') {
            propagate = oldModule.__hotReload.call(oldModule, loader, newModule);
          }
          console.log('Reloaded ' + path);

          console.log(oldModule['default'] || oldModule);
          console.log(newModule['default'] || newModule);
          console.log(compareModules(oldModule, newModule));
          if (propagate && !compareModules(oldModule, newModule)) {
            var deps = _this3.depMap.get(path);
            if (deps) deps.forEach(function (dep) {
              return _this3.fileChanged(dep);
            });
          } else {
            console.log('No need to propagate');
          }
        });
      })['catch'](function (reason) {
        if (reloadPageIfNeeded) _this3.reload(path, reason);
      });
    }
  }, {
    key: 'reload',
    value: function reload(path, reason) {
      console.info('Change detected in ' + path + ' that cannot be handled gracefully: ' + reason);
    }
  }]);

  return ChangeHandler;
})();

exports['default'] = ChangeHandler;
module.exports = exports['default'];
//window.location.reload()

},{"fkit":5}],3:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _messageHandler = require('./message-handler');

var _messageHandler2 = _interopRequireWildcard(_messageHandler);

var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var address = protocol + window.location.host + window.location.pathname + '/ws';
var socket = new WebSocket(address);
socket.onmessage = function (msg) {
  var data = undefined;
  try {
    data = JSON.parse(msg.data);
  } catch (e) {
    console.error('Non-JSON response received: ' + JSON.stringify(msg));
    throw e;
  }
  _messageHandler2['default'](data);
};

},{"./message-handler":4}],4:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ChangeHandler = require('./change-handler');

var _ChangeHandler2 = _interopRequireWildcard(_ChangeHandler);

var changeHandler = undefined;

exports['default'] = function (message) {
  if (message.type == 'connected') {
    console.log('JSPM watching enabled!');
  } else if (message.type == 'change') {
    console.log('WHAHAHAH');
    // Make sure SystemJS is fully loaded
    if (!changeHandler && window.System && window.System._loader && window.System._loader.modules) {
      changeHandler = new _ChangeHandler2['default'](window.System);
    }
    if (changeHandler) changeHandler.fileChanged(message.path);
  } else {
    console.error('Unknown message type! ' + JSON.stringify(message));
  }
};

module.exports = exports['default'];

},{"./change-handler":2}],5:[function(require,module,exports){
'use strict';

var util = require('./util');

/**
 * This module mixes in the functions and classes from all the other FKit
 * modules. It's available as a convenience, however if you don't need all of
 * FKit then you can require just the module that you need.
 *
 * @module fkit
 * @summary ALL THE THINGS!
 * @author Josh Bassett
 */
module.exports = util.extend({}, [
  require('./fn'),
  require('./list'),
  require('./logic'),
  require('./math'),
  require('./obj'),
  require('./string'),
]);

},{"./fn":6,"./list":7,"./logic":17,"./math":18,"./obj":19,"./string":20,"./util":21}],6:[function(require,module,exports){
'use strict';

var util = require('./util');

function flatten(as) {
  return as.reduce(function(a, b) { return a.concat(b); }, []);
}

function curry(f) {
  var arity = f.length;

  return (arity <= 1) ? f : given([], 0);

  function given(args, applications) {
    return function() {
      var newArgs = args.concat(
        (arguments.length > 0) ? util.slice.call(arguments, 0) : undefined
      );

      return (newArgs.length >= arity) ?
        f.apply(this, newArgs) :
        given(newArgs, applications + 1);
    };
  }
}

function variadic(f) {
  var arity = f.length;

  if (arity < 1) {
    return f;
  } else if (arity === 1)  {
    return function() {
      var args    = util.slice.call(arguments, 0),
          newArgs = (arguments.length === 1) ? flatten(args) : args;

      return f.call(this, newArgs);
    };
  } else {
    return function() {
      var numMissingArgs = Math.max(arity - arguments.length - 1, 0),
          missingArgs    = new Array(numMissingArgs),
          namedArgs      = util.slice.call(arguments, 0, arity - 1),
          variadicArgs   = util.slice.call(arguments, f.length - 1);

      return f.apply(this, namedArgs.concat(missingArgs).concat([variadicArgs]));
    };
  }
}

var self;

/**
 * This module defines basic operations on functions.
 *
 * @module fkit/fn
 * @summary Core Functions
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Flattens the list of `as`.
   *
   * @private
   */
  flatten: flatten,

  /**
   * Returns the result of the function `f` applied to the value `a`.
   *
   * @summary Applies a function to a value.
   *
   * @example
   *   function sayHi(a) { return ['Hi', a, '!'].join(' '); }
   *   F.apply(sayHi, 'Jane'); // Hi Jane!
   *
   * @curried
   * @function
   * @param f A function.
   * @param a A value.
   * @returns The result of `f(a)`.
   */
  apply: curry(function(f, a) { return f(a); }),

  /**
   * Returns the result of the function `f` applied to the values `a` and `b`.
   *
   * @summary Applies a function to two values.
   *
   * @example
   *   function sayHi(a, b) { return ['Hi', a, b, '!'].join(' '); }
   *   F.apply2(sayHi, 'Jane', 'Appleseed'); // Hi Jane Appleseed!
   *
   * @curried
   * @function
   * @param f A function.
   * @param a A value.
   * @param b A value.
   * @returns The result of `f(a, b)`.
   */
  apply2: curry(function(f, a, b) { return f(a, b); }),

  /**
   * Returns the result of the function `f` applied to the values `a`, `b`, and
   * `c`.
   *
   * @summary Applies a function to three values.
   *
   * @example
   *   function sayHi(a, b, c) { return ['Hi', a, b, c, '!'].join(' '); }
   *   F.apply3(sayHi, 'Ms', 'Jane', 'Appleseed'); // Hi Ms Jane Appleseed!
   *
   * @curried
   * @function
   * @param f A function.
   * @param a A value.
   * @param b A value.
   * @param c A value.
   * @returns The result of `f(a, b, c)`.
   */
  apply3: curry(function(f, a, b, c) { return f(a, b, c); }),

  /**
   * Returns the result of the function `f` applied to the value `a`.
   *
   * This is similar to `apply`, however the order of the arguments is flipped.
   *
   * @summary Applies a function to a value.
   *
   * @example
   *   function sayHi(a) { return ['Hi', a, '!'].join(' '); }
   *   F.applyRight('Jane', sayHi); // Hi Jane!
   *
   * @curried
   * @function
   * @param a A value.
   * @param f A function.
   * @returns The result of `f(a)`.
   */
  applyRight: curry(function(a, f) { return f(a); }),

  /**
   * Returns a function that is the composition of the list of functions `fs`.
   *
   * @summary Composes a list of functions.
   *
   * @example
   *   F.compose(f, g, h)(a); // f(g(h(a)))
   *
   * @function
   * @param fs A list of functions.
   * @returns A new function.
   */
  compose: variadic(function(fs) {
    return function(a) {
      return fs.reduceRight(function(a, f) {
        return f(a);
      }, a);
    };
  }),

  /**
   * Returns the result of applying the function `f` to the values `b` and `a`.
   *
   * @summary Flips the order of the arguments to a function.
   *
   * @example
   *   function f(a, b) { ... }
   *   var g = F.flip(f);
   *   g(1, 2); // f(2, 1)
   *
   * @function
   * @param f A function.
   * @param a A value.
   * @param b A value.
   * @returns A new function.
   */
  flip: curry(function(f, a, b) { return f(b, a); }),

  /**
   * Returns the value `a` unchanged.
   *
   * @summary The identity function.
   *
   * @example
   *   F.id(1); // 1
   *
   * @param a A value.
   * @returns The value `a`.
   */
  id: function(a) { return a; },

  /**
   * Returns a function that always returns the value `c`, regardless of the
   * arguments.
   *
   * @summary The constant function.
   *
   * @example
   *   F.const(1)(2, 3); // 1
   *
   * @param c A value.
   * @returns A new function.
   */
  const: function(c) { return function() { return c; }; },

  /**
   * Returns a function that allows partial application of the arguments to the
   * function `f`.
   *
   * @summary Converts a function to a curried function.
   *
   * @example
   *   var add = F.curry(function(a, b) { return a + b; });
   *   add(1)(2); // 3
   *
   * @function
   * @param f A function.
   * @returns A new function.
   */
  curry: curry,

  /**
   * Returns a function that wraps the binary function `f` to accept a pair.
   *
   * @summary Converts a binary function to a function on pairs.
   *
   * @example
   *   var add = F.uncurry(function(a, b) { return a + b; });
   *   add([1, 2]); // 3
   *
   * @function
   * @param f A function.
   * @returns A new function.
   */
  uncurry: curry(function(f, p) { return f(p[0], p[1]); }),

  /**
   * Returns a function that wraps the function `f` to accept only one argument.
   *
   * @summary Converts a function to a unary function.
   *
   * @param f A function.
   * @returns A new function.
   */
  unary: function(f) { return (f.length === 1) ? f : self.apply(f); },

  /**
   * Returns a function that wraps the function `f` to accept only two arguments.
   *
   * @summary Converts a function to a binary function.
   *
   * @param f A function.
   * @returns A new function.
   */
  binary: function(f) { return (f.length === 2) ? f : self.apply2(f); },

  /**
   * Returns a function that wraps the function `f` to accept any number of
   * arguments.
   *
   * The last named parameter will be given an array of arguments.
   *
   * @summary Converts a function to a variadic function.
   *
   * @example
   *   function f(head, tail) { ... }
   *   F.variadic(f)(1, 2, 3); // f(1, [2, 3])
   *
   * @function
   * @param f A function.
   * @returns A new function.
   */
  variadic: variadic,

  /**
   * Applies the function `f` to the value `a` and returns the value `a`
   * unchanged.
   *
   * @summary Applies a side-effecting function to a value.
   *
   * @example
   *   function f(a) { console.log(a); }
   *   F.tap(f)(1); // 1
   *
   * @curried
   * @function
   * @param f A function.
   * @param a A value.
   * @returns The value `a`.
   */
  tap: curry(function(f, a) { f(a); return a; }),

  /**
   * Returns `true` if the value `a` is strictly equal (`===`) to the value
   * `b`, false otherwise.
   *
   * @summary The strict equality operator.
   *
   * @curried
   * @function
   * @param a A value.
   * @param b A value.
   * @returns A boolean value.
   */
  equal: curry(function(a, b) { return b === a; }),

  /**
   * Returns `true` if the value `a` is strictly not equal (`!==`) to the value
   * `b`, false otherwise.
   *
   * @summary The strict inequality operator.
   *
   * @curried
   * @function
   * @param a A value.
   * @param b A value.
   * @returns A boolean value.
   */
  notEqual: curry(function(a, b) { return b !== a; }),

  /**
   * Returns the ordering of the two values `a` and `b`.
   *
   * @summary Compares two values using natural ordering.
   *
   * @example
   *   F.compare(1, 2); // -1
   *   F.compare(2, 1); // 1
   *   F.compare(2, 2); // 0
   *
   * @curried
   * @function
   * @param a A value.
   * @param b A value.
   * @returns A number.
   */
  compare: curry(function(a, b) {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  }),
};

},{"./util":21}],7:[function(require,module,exports){
'use strict';

var util = require('./util');

/**
 * FKit treats both arrays and strings as *lists*: an array is a list of
 * elements, and a string is a list of characters.
 *
 * Representing strings as lists may be a novel concept for some JavaScript
 * users, but it is quite common in other languages. This seemingly simple
 * abstractions yields a great deal of power: it allows you to apply the same
 * list combinators to both arrays and strings.
 *
 * @summary Working with Lists
 *
 * @module fkit/list
 * @mixes module:fkit/list/base
 * @mixes module:fkit/list/build
 * @mixes module:fkit/list/fold
 * @mixes module:fkit/list/map
 * @mixes module:fkit/list/search
 * @mixes module:fkit/list/set
 * @mixes module:fkit/list/sort
 * @mixes module:fkit/list/sublist
 * @mixes module:fkit/list/zip
 * @author Josh Bassett
 */
module.exports = util.extend({}, [
  require('./list/base'),
  require('./list/build'),
  require('./list/fold'),
  require('./list/map'),
  require('./list/search'),
  require('./list/set'),
  require('./list/sort'),
  require('./list/sublist'),
  require('./list/zip'),
]);

},{"./list/base":8,"./list/build":9,"./list/fold":10,"./list/map":11,"./list/search":12,"./list/set":13,"./list/sort":14,"./list/sublist":15,"./list/zip":16,"./util":21}],8:[function(require,module,exports){
'use strict';

var fn = require('../fn');

var self;

/**
 * This module defines basic operations on lists.
 *
 * @private
 * @module fkit/list/base
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns true if `as` is a string or an array of strings.
   *
   * @private
   */
  isString: function(as) {
    return (typeof as === 'string');
  },

  /**
   * Returns true if the list of `as` is an array of strings, false otherwise.
   *
   * @private
   */
  isArrayOfStrings: function(as) {
    return Array.isArray(as) &&
      as.length > 0 &&
      as.reduce(function(a, b) { return a && self.isString(b); }, true);
  },

  /**
   * Returns an empty monoid of `as`.
   *
   * @private
   */
  mempty: function(as) {
    return self.isString(as) || self.isArrayOfStrings(as) ? '' : [];
  },

  /**
   * Returns `a` in a pure context.
   *
   * @private
   */
  pure: function(a) {
    return self.isString(a) || self.isArrayOfStrings(a) ? a : [a];
  },

  /**
   * Converts the list of `as` to an array.
   *
   * @private
   */
  toArray: function(as) {
    return self.isString(as) ? as.split('') : as;
  },

  /**
   * Converts the list of `as` to a list of type `t`.
   *
   * @private
   */
  toList: function(as, t) {
    return t === 'string' ? as.join('') : as;
  },

  /**
   * Returns the number of elements in the list of `as`.
   *
   * @summary Gets the length of a list.
   *
   * @example
   *   F.length([1, 2, 3]); // 3
   *   F.length('foo'); // 3
   *
   * @param as A list.
   * @returns A number.
   */
  length: function(as) { return as.length; },

  /**
   * Returns `true` if the list of `as` is empty, `false` otherwise.
   *
   * @summary Determines if a list is empty.
   *
   * @example
   *   F.empty([]); // true
   *   F.empty([1, 2, 3]); // false
   *
   *   F.empty(''); // true
   *   F.empty('foo'); // false
   *
   * @param as A list.
   * @returns A boolean value.
   */
  empty: function(as) { return as.length === 0; },

  /**
   * Returns a list that contains the value `a` appended to the list of `bs`.
   *
   * @summary Appends a value to a list.
   *
   * @example
   *   F.append(3, [1, 2]); // [1, 2, 3]
   *   F.append('o', 'fo'); // 'foo'
   *
   * @curried
   * @function
   * @param a A value.
   * @param bs A list.
   * @returns A new list.
   */
  append: fn.curry(function(a, bs) {
    return self.isString(bs) ? (bs + a) : bs.concat([a]);
  }),

  /**
   * Returns a list that contains the value `a` prepended to the list of `bs`.
   *
   * @summary Prepends a value to a list.
   *
   * @example
   *   F.prepend(1, [2, 3]); // [1, 2, 3]
   *   F.prepend('f', 'oo'); // 'foo'
   *
   * @curried
   * @function
   * @param a A value.
   * @param bs A list.
   * @returns A new list.
   */
  prepend: fn.curry(function(a, bs) {
    return self.isString(bs) ? (a + bs) : [a].concat(bs);
  }),

  /**
   * Surrounds the list of `cs` with the values `a` and `b`.
   *
   * @example
   *   F.surround(0, 4, [1, 2, 3]); // [0, 1, 2, 3, 4]
   *   F.surround('(', ')', 'foo'); // '(foo)'
   *
   * @curried
   * @function
   * @param a A value.
   * @param b A value.
   * @param cs A list.
   * @returns A new list.
   */
  surround: fn.curry(function(a, b, cs) {
    return self.append(b, self.prepend(a, cs));
  }),

  /**
   * Returns the first element in the list of `as`.
   *
   * @summary Gets the first element in a list.
   *
   * @example
   *   F.head([1, 2, 3]); // 1
   *   F.head('foo'); // 'f'
   *
   * @param as A list.
   * @returns A value or `undefined` if the list is empty.
   */
  head: function(as) { return as[0]; },

  /**
   * Returns the last element in the list of `as`.
   *
   * @summary Gets the last element in a list.
   *
   * @example
   *   F.last([1, 2, 3]); // 3
   *   F.last('foo'); // 'o'
   *
   * @param as A list.
   * @returns A value or `undefined` if the list is empty.
   */
  last: function(as) { return as[as.length - 1]; },

  /**
   * Returns a list that contains the elements before the last element in the
   * list of `as`.
   *
   * @summary Gets the elements before the last element in a list.
   *
   * @example
   *   F.init([1, 2, 3]); // [1, 2]
   *   F.init('foo'); // 'fo'
   *
   * @param as A list.
   * @returns A new list.
   */
  init: function(as) { return as.slice(0, as.length - 1); },

  /**
   * Returns a list that contains the elements after the first element in the
   * list of `as`.
   *
   * @summary Get the elements after the first element in a list.
   *
   * @example
   *   F.tail([1, 2, 3]); // [2, 3]
   *   F.tail('foo'); // 'oo'
   *
   * @param as A list.
   * @returns A new list.
   */
  tail: function(as) { return as.slice(1); },

  /**
   * Returns a list that contains all initial segments of the list of `as`.
   *
   * @summary Gets all initial segments of a list.
   *
   * @example
   *   F.inits([1, 2, 3]); // [[], [1], [1, 2], [1, 2, 3]]
   *   F.inits('foo'); // ['', 'f', 'fo', 'foo']
   *
   * @param as A list.
   * @returns A new list.
   */
  inits: function inits(as) {
    return self.prepend(
      self.mempty(as),
      self.empty(as) ? [] : inits(self.tail(as)).map(self.prepend(self.head(as)))
    );
  },

  /**
   * Returns a list that contains all final segments of the list of `as`.
   *
   * @summary Gets all final segments of a list.
   *
   * @example
   *   F.tails([1, 2, 3]); // [[1, 2, 3], [2, 3], [3], []]
   *   F.tails('foo'); // ['foo', 'oo', 'o', '']
   *
   * @param as A list.
   * @returns A new list.
   */
  tails: function tails(as) {
    return self.prepend(
      as,
      self.empty(as) ? [] : tails(self.tail(as))
    );
  },
};

},{"../fn":6}],9:[function(require,module,exports){
'use strict';

var base    = require('./base'),
    fn      = require('../fn'),
    fold    = require('./fold'),
    math    = require('../math'),
    sublist = require('./sublist');

var self;

/**
 * This module defines operations for building lists.
 *
 * @private
 * @module fkit/list/build
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns an array of length `n`.
   *
   * @summary Creates a new array.
   *
   * @example
   *   F.array(3); // [undefined, undefined, undefined]
   *
   * @param n A number.
   * @returns A new array.
   */
  array: function(n) { return Array.apply(null, Array(n)); },

  /**
   * Returns an string of length `n`.
   *
   * @summary Creates a new string.
   *
   * @example
   *   F.string(3); // '   '
   *
   * @param n A number.
   * @returns A new string.
   */
  string: function(n) { return self.array(n + 1).join(' '); },

  /**
   * Returns an ordered pair with the values `a` and `b`.
   *
   * @summary Creates a new ordered pair.
   *
   * @example
   *   F.pair(1, 2); // [1, 2]
   *   F.pair('a', 'b'); // ['a', 'b']
   *
   * @curried
   * @function
   * @param a A value.
   * @param b A value.
   * @returns A new pair.
   */
  pair: fn.curry(function(a, b) { return [a, b]; }),

  /**
   * Returns an array of numbers of length `n` starting from `a`.
   *
   * @summary Creates a new array of numbers.
   *
   * @example
   *   F.range(1, 3); // [1, 2, 3]
   *
   * @curried
   * @function
   * @param a A number.
   * @param n A number.
   * @returns A new array.
   */
  range: fn.curry(function(a, n) {
    return self.array(n).map(function(_, i) { return a + i; });
  }),

  /**
   * Returns a list of length `n` with `a` the value of every element.
   *
   * @summary Replicates a value.
   *
   * @example
   *   F.replicate(3, 1); // [1, 1, 1]
   *   F.replicate(3, 'a'); // 'aaa'
   *
   * @curried
   * @function
   * @param n A number.
   * @param a A value.
   * @returns A new list.
   */
  replicate: fn.curry(function(n, a) {
    var as = base.isString(a) ? self.string(n) : self.array(n);
    return fold.concatMap(function() { return [a]; }, as);
  }),

  /**
   * Returns a list of `n` elements randomly sampled from the list of `as`.
   *
   * @summary Samples random elements from a list.
   *
   * @example
   *   F.sample(2, [1, 2, 3]); // [3, 1]
   *   F.sample(2, 'abc'); // 'ca'
   *
   * @curried
   * @function
   * @param n A number.
   * @param as A list.
   * @returns A new list.
   */
  sample: fn.curry(function(n, as) {
    return sublist.take(n, self.shuffle(as));
  }),

  /**
   * Returns a list that contains the elements in the list of `as` randomly
   * shuffled using the [Fisher-Yates
   * algorithm](http://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
   *
   * @summary Shuffles a list.
   *
   * @example
   *   F.shuffle([1, 2, 3]); // [2, 3, 1]
   *   F.shuffle('abc'); // 'bca'
   *
   * @curried
   * @function
   * @param as A list.
   * @returns A new list.
   */
  shuffle: function(as) {
    var i  = -1,
        r  = self.array(as.length),
        bs = fold.fold(f, r, as),
        s  = base.isString(as) ? '' : [];

    return fold.concatWith(s, bs);

    function f(b, a) {
      var j = math.randomInt(0, ++i);

      b[i] = b[j];
      b[j] = a;

      return b;
    }
  },
};

},{"../fn":6,"../math":18,"./base":8,"./fold":10,"./sublist":15}],10:[function(require,module,exports){
'use strict';

var base = require('./base'),
    fn   = require('../fn'),
    math = require('../math');

var self;

/**
 * This module defines fold operations on lists.
 *
 * @private
 * @module fkit/list/fold
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Flattens any strings in the list of `as`.
   *
   * @private
   */
  flattenStrings: function flattenStrings(as) {
    if (base.isArrayOfStrings(as)) {
      return self.concat(as);
    } else {
      if (Array.isArray(as)) {
        return as.map(flattenStrings);
      } else {
        return as;
      }
    }
  },

  /**
   * Returns a list that contains the elements in the list of `as` concatenated
   * with the starting value `s`.
   *
   * @private
   */
  concatWith: fn.curry(function(s, as) {
    return base
      .toArray(fn.flatten(as))
      .reduce(fn.flip(base.append), s);
  }),

  /**
   * Returns a list that contains the concatenated elements in the list of
   * `as`.
   *
   * @summary Concatenates lists.
   *
   * @example
   *   F.concat([1], [2, 3], [4, 5, 6]); // [1, 2, 3, 4, 5, 6]
   *   F.concat('f', 'oo', 'bar'); // 'foobar'
   *
   * @function
   * @param as A list.
   * @returns A new list.
   */
  concat: fn.variadic(function(as) {
    return self.concatWith(base.mempty(as), as);
  }),

  /**
   * Returns a list that contains the elements in the list of `as` mapped with
   * the function `f` concatenated together.
   *
   * @summary Maps a function over a list and concatenates the results.
   *
   * @example
   *   F.concatMap(function(a) {
   *     return [a, 0];
   *   }, [1, 2, 3]); // [1, 0, 2, 0, 3, 0]
   *
   *   F.concatMap(function(a) {
   *     return [a, '-'];
   *   }, 'foo'); // 'f-o-o-'
   *
   * @curried
   * @function
   * @param f A function.
   * @param as A list.
   * @returns A new list.
   */
  concatMap: fn.curry(function(f, as) {
    var bs = base.toArray(as).map(fn.compose(self.flattenStrings, f)),
        cs = bs.length > 0 ? bs : as;

    return self.concatWith(base.mempty(cs), bs);
  }),

  /**
   * Returns a list that contains the elements in the list of `as` folded
   * left-to-right with the binary function `f` and starting value `s`.
   *
   * @summary Folds a list from left to right with a function.
   *
   * @example
   *   F.fold(F.flip(F.prepend), [], [1, 2, 3]); // [3, 2, 1]
   *   F.fold(F.flip(F.prepend), '', 'foo'); // 'oof'
   *
   * @curried
   * @function
   * @param f A binary function.
   * @param s A starting value.
   * @param as A list.
   * @returns A value.
   */
  fold: fn.curry(function(f, s, as) {
    return base
      .toArray(as)
      .reduce(f, s);
  }),

  /**
   * Returns a list that contains the elements in the list of `as` folded
   * right-to-left with the binary function `f` and starting value `s`.
   *
   * @summary Folds a list from right to left with a function.
   *
   * @example
   *   F.foldRight(F.append, [], [1, 2, 3]); // [3, 2, 1]
   *   F.foldRight(F.append, '', 'foo'); // 'oof'
   *
   * @curried
   * @function
   * @param f A binary function.
   * @param s A starting value.
   * @param as A list.
   * @returns A value.
   */
  foldRight: fn.curry(function(f, s, as) {
    return base
      .toArray(as)
      .reduceRight(fn.flip(f), s);
  }),

  /**
   * Returns a list that contains the elements in the list of `as` scanned
   * left-to-right with the binary function `f` and starting value `s`.
   *
   * @summary Scans a list from left to right with a function.
   *
   * @example
   *   F.fold(F.flip(F.prepend), [],  [1, 2, 3]); // [[], [1], [2, 1], [3, 2, 1]]
   *   F.fold(F.flip(F.prepend), '',  'foo'); // ['', 'f', 'of', 'oof']
   *
   * @curried
   * @function
   * @param f A binary function.
   * @param s A starting value.
   * @param as A list.
   * @returns A new list.
   */
  scan: fn.curry(function(f, s, as) {
    var r = [s];

    self.fold(function(b, a) {
      return fn.tap(r.push.bind(r), f(b, a));
    }, s, as);

    return r;
  }),

  /**
   * Returns a list that contains the elements in the list of `as` scanned
   * right-to-left with the binary function `f` and starting value `s`.
   *
   * @summary Scans a list from right to left with a function.
   *
   * @example
   *   F.foldRight(F.append, [],  [1, 2, 3]); // [[3, 2, 1], [3, 2], [3], []]
   *   F.foldRight(F.append, '',  'foo'); // ['oof', 'oo', 'o', '']
   *
   * @curried
   * @function
   * @param f A binary function.
   * @param s A starting value.
   * @param as A list.
   * @returns A new list.
   */
  scanRight: fn.curry(function(f, s, as) {
    var r = [s];

    self.foldRight(function(a, b) {
      return fn.tap(r.unshift.bind(r), f(a, b));
    }, s, as);

    return r;
  }),

  /**
   * Returns the maximum value in the list of `as`.
   *
   * @summary Calculates the maximum value of a list.
   *
   * @example
   *   F.maximum([1, 2, 3]); // 3
   *   F.maximum('abc'); // 'c'
   *
   * @param as A list.
   * @returns A value.
   */
  maximum: function(as) { return self.fold(math.max, as[0], as); },

  /**
   * Returns the minimum value in the list of `as`.
   *
   * @summary Calculates the minimum value of a list.
   *
   * @example
   *   F.minimum([1, 2, 3]); // 1
   *   F.minimum('abc'); // 'a'
   *
   * @param as A list.
   * @returns A value.
   */
  minimum: function(as) { return self.fold(math.min, as[0], as); },

  /**
   * Returns the maximum value in the list of `as` using the comparator
   * function `c`.
   *
   * @summary Calculates the maximum value of a list using a comparator.
   *
   * @curried
   * @function
   * @param c A comparator function.
   * @param as A list.
   * @returns A value.
   */
  maximumBy: fn.curry(function(c, as) {
    return self.fold(function(a, b) {
      return c(a, b) > 0? a : b;
    }, as[0], as);
  }),

  /**
   * Returns the minimum value in the list of `as` using the comparator
   * function `c`.
   *
   * @summary Calculates the minimum value of a list using a comparator
   * function.
   *
   * @curried
   * @function
   * @param c A comparator function.
   * @param as A list.
   * @returns A value.
   */
  minimumBy: fn.curry(function(c, as) {
    return self.fold(function(a, b) {
      return c(a, b) < 0 ? a : b;
    }, as[0], as);
  }),

  /**
   * Returns the sum of the elements in the list of `as`.
   *
   * @summary Calculates the sum of the elements in a list.
   *
   * @example
   *   F.sum([1, 2, 3]); // 6
   *
   * @param as A list.
   * @returns A number.
   */
  sum: function(as) { return self.fold(math.add, 0, as); },

  /**
   * Returns the product of the elements in the list of `as`.
   *
   * @summary Calculates the product of the elements in a list.
   *
   * @example
   *   F.product([1, 2, 3]); // 6
   *
   * @param as A list.
   * @returns A number.
   */
  product: function(as) { return self.fold(math.mul, 1, as); },
};

},{"../fn":6,"../math":18,"./base":8}],11:[function(require,module,exports){
'use strict';

var base = require('./base'),
    fn   = require('../fn'),
    fold = require('./fold');

/**
 * This module defines map operations on lists.
 *
 * @private
 * @module fkit/list/map
 * @author Josh Bassett
 */
module.exports = {
  /**
   * Returns a list that contains the elements in the list of `as` mapped with
   * the function `f`.
   *
   * @summary Maps a function over a list.
   *
   * @example
   *   F.map(F.inc, [1, 2, 3]); // [2, 3, 4]
   *   F.map(F.toUpper, 'foo'); // ['F', 'O', 'O']
   *
   * @curried
   * @function
   * @param f A function.
   * @param as A list.
   * @returns A new list.
   */
  map: fn.curry(function(f, as) {
    return base
      .toArray(as)
      .map(f);
  }),

  /**
   * Returns a list that contains the elements in the list of `as` in reverse
   * order.
   *
   * @summary Reverses the elements in a list.
   *
   * @example
   *   F.reverse([1, 2, 3]); // [3, 2, 1]
   *   F.reverse('foo'); // 'oof'
   *
   * @param as A list.
   * @returns A new list.
   */
  reverse: function(as) {
    return base
      .toArray(as)
      .reduce(fn.flip(base.prepend), base.mempty(as));
  },

  /**
   * Returns a list that contains the elements in the list of `as` interspersed
   * with the separator `s`.
   *
   * @summary Intersperses the elements of a list with separator.
   *
   * @example
   *   F.intersperse(4, [1, 2, 3]); // [1, 4, 2, 4, 3]
   *   F.intersperse('-', 'foo'); // 'f-o-o'
   *
   * @curried
   * @function
   * @param s A separator.
   * @param as A list.
   * @returns A new list.
   */
  intersperse: fn.curry(function(s, as) {
    return base.empty(as) ?
      base.mempty(as) :
      fold.concat(base.head(as), prependToAll(base.tail(as)));

    function prependToAll(bs) {
      return base.empty(bs) ?
        base.mempty(bs) :
        fold.concat(s, base.head(bs), prependToAll(base.tail(bs)));
    }
  }),
};

},{"../fn":6,"./base":8,"./fold":10}],12:[function(require,module,exports){
'use strict';

var base  = require('./base'),
    fn    = require('../fn'),
    fold  = require('./fold'),
    logic = require('../logic'),
    map   = require('./map');

var self;

/**
 * This module defines search operations on lists.
 *
 * @private
 * @module fkit/list/search
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns `true` if the list of `as` contains the element `a`, `false`
   * otherwise.
   *
   * @summary Determines if a value is present in a list.
   *
   * @example
   *   F.elem(0, [1, 2, 3]); // false
   *   F.elem(1, [1, 2, 3]); // true
   *
   *   F.elem('a', 'foo'); // false
   *   F.elem('o', 'foo'); // true
   *
   * @curried
   * @function
   * @param a A value.
   * @param as A list.
   * @returns A boolean value.
   */
  elem: fn.curry(function(a, as) {
    return as.indexOf(a) >= 0;
  }),

  /**
   * Returns the index of the first occurance of the element `a` in the list of
   * `as`.
   *
   * @summary Gets the index of the first occurance of an element in a list.
   *
   * @example
   *   F.elemIndex(0, [1, 2, 3]); // undefined
   *   F.elemIndex(1, [1, 2, 3]); // 0
   *
   *   F.elemIndex('a', 'foo'); // undefined
   *   F.elemIndex('o', 'foo'); // 1
   *
   * @curried
   * @function
   * @param a A value.
   * @param as A list.
   * @returns A number or `undefined` if no value was found.
   */
  elemIndex: fn.curry(function(a, as) {
    var i = as.indexOf(a);
    return (i >= 0) ? i : undefined;
  }),

  /**
   * Returns the indices of all occurances of the element `a` in the list of
   * `as`.
   *
   * @summary Gets the indices of all occurances of an element in a list.
   *
   * @example
   *   F.elemIndices(0, [1, 2, 3]); // []
   *   F.elemIndices(1, [1, 2, 3]); // [0]
   *
   *   F.elemIndices('a', 'foo'); // []
   *   F.elemIndices('o', 'foo'); // [1, 2]
   *
   * @curried
   * @function
   * @param a A value.
   * @param as A list.
   * @returns A number or `undefined` if no value was found.
   */
  elemIndices: fn.curry(function(a, as) {
    return self.findIndices(fn.equal(a), as);
  }),

  /**
   * Returns an element in the list of `as` that satisfies the predicate function
   * `p`.
   *
   * @summary Finds an element in a list that satisfies a predicate function.
   *
   * @example
   *   F.find(F.gt(1), []); // undefined
   *   F.find(F.gt(1), [1, 2, 3]); // 2
   *
   *   F.find(F.eq('o'), ''); // undefined
   *   F.find(F.eq('o'), 'foo'); // 'o'
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A value or `undefined` if no value was found.
   */
  find: fn.curry(function(p, as) {
    return base.head(self.filter(p, as));
  }),

  /**
   * Returns the index of the first occurance of an element in the list of `as`
   * that satisfies the predicate function `p`.
   *
   * @summary Finds the index of the first occurance of an element in a list
   * that satisfies a predicate function.
   *
   * @example
   *   F.findIndex(F.gt(1), []); // undefined
   *   F.findIndex(F.gt(1), [1, 2, 3]); // 1
   *
   *   F.findIndex(F.eq('o'), ''); // undefined
   *   F.findIndex(F.eq('o'), 'foo'); // 1
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A number or `undefined` if no value was found.
   */
  findIndex: fn.curry(function(p, as) {
    var n = as.length;

    for (var i = 0; i < n; i++) {
      if (p(as[i])) { return i; }
    }

    return undefined;
  }),

  /**
   * Returns the indices of the elements in the list of `as` that satisfy the
   * predicate function `p`.
   *
   * @summary Finds the indices of all occurances of the elements in a list
   * that satisfy a predicate function.
   *
   * @example
   *   F.findIndices(F.gt(1), []); // []
   *   F.findIndices(F.gt(1), [1, 2, 3]); // [1, 2]
   *
   *   F.findIndices(F.eq('o'), ''); // []
   *   F.findIndices(F.eq('o'), 'foo'); // [1, 2]
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A number or `undefined` if no value was found.
   */
  findIndices: fn.curry(function(p, as) {
    var s = [],
        n = as.length;

    for (var i = 0; i < n; i++) {
      if (p(as[i])) { s.push(i); }
    }

    return s;
  }),

  /**
   * Returns a list that contains the elements in the list of `as` that satisfy
   * the predicate function `p`.
   *
   * @summary Filters a list using a predicate function.
   *
   * @example
   *   F.filter(F.gt(1), [1, 2, 3]); // [2, 3]
   *   F.filter(F.eq('o'), 'foo'); // 'oo'
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A new list.
   */
  filter: fn.curry(function(p, as) {
    var f = logic.branch(p, fn.id, fn.const(''));
    return base.isString(as) ? fold.concatMap(f, as) : as.filter(p);
  }),

  /**
   * Returns a list that contains the elements in the list of `as` split into a
   * pair of lists: the elements that satisfy the predicate function `p` and
   * the elements that do not satisfy the predicate function `p`.
   *
   * @summary Partitions a list using a predicate function.
   *
   * @example
   *   F.partition(F.gt(1), [1, 2, 3]); // [[2, 3], [1]]
   *   F.partition(F.eq('o'), 'foo'); // ['oo', 'f']
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A pair of lists.
   */
  partition: fn.curry(function(p, as) {
    return [
      self.filter(p, as),
      self.filter(fn.compose(logic.not, p), as)
    ];
  }),

  /**
   * Returns `true` if all elements in the list of `as` satisfy the predicate
   * function `p`, `false` otherwise.
   *
   * @summary Determines if all elements in a list satisfy a predicate
   * function.
   *
   * @example
   *   F.all(F.gt(1), [1, 2, 3]); // false
   *   F.all(F.gt(1), [2, 3]); // true
   *   F.all(F.gt(1), [3]); // true
   *
   *   F.all(F.eq('o'), 'foo'); // false
   *   F.all(F.eq('o'), 'oo'); // true
   *   F.all(F.eq('o'), 'o'); // true
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A boolean value.
   */
  all: fn.curry(function(p, as) {
    return self.filter(p, as).length === as.length;
  }),

  /**
   * Returns `true` if any elements in the list of `as` satisfy the predicate
   * function `p`, `false` otherwise.
   *
   * @summary Determines if any elements in a list satisfy a predicate
   * function.
   *
   * @example
   *   F.any(F.gt(1), [1, 2, 3]); // true
   *   F.any(F.gt(1), [1, 2]); // true
   *   F.any(F.gt(1), [1]); // false
   *
   *   F.any(F.eq('o'), 'foo'); // true
   *   F.any(F.eq('o'), 'fo'); // true
   *   F.any(F.eq('o'), 'f'); // false
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A boolean value.
   */
  any: fn.curry(function(p, as) {
    return self.filter(p, as).length > 0;
  }),

  /**
   * Returns `true` if the list of `as` is a prefix of the list of `bs`,
   * `false` otherwise.
   *
   * @summary Determines if a list is a prefix of another list.
   *
   * @example
   *   F.isPrefixOf([], [1, 2, 3]); // true
   *   F.isPrefixOf([1, 2], [1, 2, 3]); // true
   *   F.isPrefixOf([2, 3], [1, 2, 3]); // false
   *
   *   F.isPrefixOf('', 'foo'); // true
   *   F.isPrefixOf('fo', 'foo'); // true
   *   F.isPrefixOf('oo', 'foo'); // false
   *
   * @curried
   * @function
   * @param as A list.
   * @param bs A list.
   * @returns A boolean value.
   */
  isPrefixOf: fn.curry(function isPrefixOf(as, bs) {
    if (base.empty(as)) {
      return true;
    } else if (base.empty(bs)) {
      return false;
    } else {
      return base.head(as) === base.head(bs) && isPrefixOf(base.tail(as), base.tail(bs));
    }
  }),

  /**
   * Returns `true` if the list of `as` is a suffix of the list of `bs`,
   * `false` otherwise.
   *
   * @summary Determines if a list is a suffix of another list.
   *
   * @example
   *   F.isSuffixOf([], [1, 2, 3]); // true
   *   F.isSuffixOf([1, 2], [1, 2, 3]); // false
   *   F.isSuffixOf([2, 3], [1, 2, 3]); // true
   *
   *   F.isSuffixOf('', 'foo'); // true
   *   F.isSuffixOf('fo', 'foo'); // false
   *   F.isSuffixOf('oo', 'foo'); // true
   *
   * @curried
   * @function
   * @param as A list.
   * @param bs A list.
   * @returns A boolean value.
   */
  isSuffixOf: fn.curry(function(as, bs) {
    return self.isPrefixOf(map.reverse(as), map.reverse(bs));
  }),

  /**
   * Returns `true` if the list of `as` is contained within the list of `bs`,
   * `false` otherwise.
   *
   * @summary Determines if a list is contained within another list.
   *
   * @example
   *   F.isInfixOf([], [1, 2, 3]); // true
   *   F.isInfixOf([2, 3], [1, 2, 3]); // true
   *   F.isInfixOf([3, 2], [1, 2, 3]); // false
   *
   *   F.isInfixOf('', 'foo'); // true
   *   F.isInfixOf('oo', 'foo'); // true
   *   F.isInfixOf('of', 'foo'); // false
   *
   * @curried
   * @function
   * @param as A list.
   * @param bs A list.
   * @returns A boolean value.
   */
  isInfixOf: fn.curry(function(as, bs) {
    return self.any(self.isPrefixOf(as), base.tails(bs));
  }),
};

},{"../fn":6,"../logic":17,"./base":8,"./fold":10,"./map":11}],13:[function(require,module,exports){
'use strict';

var base   = require('./base'),
    build  = require('./build'),
    fn     = require('../fn'),
    fold   = require('./fold'),
    map    = require('./map'),
    search = require('./search');

var self;

/**
 * This module defines set operations on lists.
 *
 * @private
 * @module fkit/list/set
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns a list with all duplicate elements removed from the list of `as`.
   *
   * It is a special case of the `nubBy` function where the elements are
   * compared using the strict equality `===` operator.
   *
   * The resulting list will only contain unique elements.
   *
   * @summary Removes duplicate elements from a list.
   *
   * @example
   *   F.nub([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
   *   F.nub('abbccc'); // 'abc'
   *
   * @param as A list.
   * @returns A new list.
   */
  nub: function(as) {
    return self.nubBy(fn.equal, as);
  },

  /**
   * Returns a list with all duplicate elements that satisfy the comparator
   * function `f` removed from the list of `bs`.
   *
   * @summary Removes duplicate elements from a list using a comparator
   * function.
   *
   * @curried
   * @function
   * @param f A comparator function.
   * @param as A list.
   * @returns A new list.
   */
  nubBy: fn.curry(function nubBy(f, as) {
    var a = base.head(as);

    return base.empty(as) ?
      base.mempty(as) :
      base.prepend(
        a,
        nubBy(f, search.filter(function(b) { return !f(a, b); }, base.tail(as)))
      );
  }),

  /**
   * Returns a list that contains the union of elements in the lists of `as`
   * and `bs`.
   *
   * Duplicates are removed from `bs`, but if `as` contains duplicates then so
   * will the result.
   *
   * @summary Calculates the union of two lists.
   *
   * @example
   *   F.union([1, 2, 3], [2, 3, 4]); // [1, 2, 3, 4]
   *   F.union('hello', 'world'); // 'hellowrd'
   *
   * @curried
   * @function
   * @param as A list.
   * @param bs A list.
   * @returns A new list.
   */
  union: fn.curry(function(as, bs) {
    return fold.fold(function(cs, b) {
      return (search.elem(b, cs)) ? cs : base.append(b, cs);
    }, as, bs);
  }),

  /**
   * Returns a list that contains the intersection of the elments in the lists
   * of `as` and `bs`.
   *
   * Duplicates are removed from `bs`, but if `as` contains duplicates then so
   * will the result.
   *
   * @summary Calculates the intersection of two lists.
   *
   * @example
   *   F.intersect([1, 2, 3], [2, 3, 4]); // [2, 3]
   *   F.intersect('hello', 'world'); // 'ol'
   *
   * @curried
   * @function
   * @param as A list.
   * @param bs A list.
   * @returns A new list.
   */
  intersect: fn.curry(function(as, bs) {
    return fold.fold(function(cs, a) {
      return (search.elem(a, bs)) ? base.append(a, cs) : cs;
    }, base.mempty(as), as);
  }),

  /**
   * Returns a list that contains the difference of the elements in the lists
   * of `as` and `bs`.
   *
   * @summary Calculates the difference of two lists.
   *
   * @example
   *   F.difference([1, 2, 3], [2, 3, 4]); // [1]
   *   F.difference('hello', 'world'); // 'wrd'
   *
   * @curried
   * @function
   * @param as A list.
   * @param bs A list.
   * @returns A new list.
   */
  difference: fn.curry(function(as, bs) {
    return fold.fold(fn.flip(self.remove), as, bs);
  }),

  /**
   * Returns a list with the first occurance of the element `a` removed from
   * the list of `bs`.
   *
   * It is a special case of the `removeBy` function where the elements are
   * compared using the strict equality `===` operator.
   *
   * @summary Removes the first occurance of an element from a list.
   *
   * @example
   *   F.remove(2, [1, 2, 3]); // [1, 3]
   *   F.remove('f', 'foo'); // 'oo'
   *
   * @curried
   * @function
   * @param a A value.
   * @param bs A list.
   * @returns A new list.
   */
  remove: fn.curry(function(a, bs) {
    return self.removeBy(fn.equal, a, bs);
  }),

  /**
   * Returns a list with the first occurance of the element `a` that satisfies
   * the comparator function `f` removed from the list of `bs`.
   *
   * @summary Removes the first occurance of an element from a list using a
   * comparator function.
   *
   * @curried
   * @function
   * @param f A comparator function.
   * @param a A value.
   * @param bs A list.
   * @returns A new list.
   */
  removeBy: fn.curry(function removeBy(f, a, bs_) {
    var b  = base.head(bs_),
        bs = base.tail(bs_);

    return base.empty(bs_) ?
      base.mempty(bs_) :
      f(a, b) ? bs : base.prepend(b, removeBy(f, a, bs));
  }),

  /**
   * Returns a list that contains all the ordered pairs `[a, b]` in the lists
   * of `as` and `bs`.
   *
   * @summary Calculates the cartesian product of two lists.
   *
   * @example
   *   F.cartesian([1, 2], [3, 4]); // [[1, 3], [1, 4], [2, 3], [2, 4]]
   *   F.cartesian('ab', 'cd'); // [['a', 'c'], ['a', 'd'], ['b', 'c'], ['b', 'd']]
   *
   * @curried
   * @function
   * @param as A list.
   * @param bs A list.
   * @returns A new list.
   */
  cartesian: fn.curry(function cartesian(as, bs) {
    return base.empty(as) ?
      [] :
      fold.concat(
        map.map(build.pair(base.head(as)), bs),
        cartesian(base.tail(as), bs)
      );
  }),

  /**
   * Returns a list that contains all the subsequences of the elements in the
   * list of `as`.
   *
   * @summary Calculates the subsequences of a list.
   *
   * @example
   *   F.subsequences([1, 2, 3]); // [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
   *   F.subsequences('abc'); // ['', 'a', 'b', 'ab', 'c', 'ac', 'bc', 'abc']
   *
   * @param as A list.
   * @returns A new list.
   */
  subsequences: function(as) {
    return base.prepend(base.mempty(as), subsequences_(as));

    function subsequences_(bs) {
      var b = base.head(bs);

      if (base.empty(bs)) {
        return [];
      } else {
        return base.prepend(base.pure(b), fold.foldRight(f, [], subsequences_(base.tail(bs))));
      }

      function f(ys, r) {
        return fold.concat(base.pure(ys), base.pure(base.prepend(b, ys)), r);
      }
    }
  },

  /**
   * Returns a list that contains all the permutations of the elements in the
   * list of `as`.
   *
   * @summary Calculates the permutations of a list.
   *
   * @example
   *   F.permutations([1, 2, 3]); // [[1, 2, 3], [2, 1, 3], [3, 2, 1], [2, 3, 1], [3, 1, 2], [1, 3, 2]]
   *   F.permutations('abc'); // ['abc', 'bac', 'cba', 'bca', 'cab', 'acb']
   *
   * @param as A list.
   * @returns A new list.
   */
  permutations: function permutations(as) {
    return base.prepend(as, permutations_(as, []));

    function permutations_(bs_, cs) {
      var b  = base.head(bs_),
          bs = base.tail(bs_);

      return base.empty(bs_) ? [] :
        fold.foldRight(
          interleave,
          permutations_(bs, base.prepend(b, cs)),
          permutations(cs)
        );

      function interleave(ds, r) {
        return interleave_(fn.id, ds)[1];

        function interleave_(f, es_) {
          if (base.empty(es_)) {
            return [bs, r];
          } else {
            var e  = base.head(es_),
                es = base.tail(es_),
                s  = interleave_(fn.compose(f, base.prepend(e)), es);

            return [
              base.prepend(e, s[0]),
              base.prepend(f(fold.concat(b, e, s[0])), s[1])
            ];
          }
        }
      }
    }
  },
};

},{"../fn":6,"./base":8,"./build":9,"./fold":10,"./map":11,"./search":12}],14:[function(require,module,exports){
'use strict';

var base = require('./base'),
    fn   = require('../fn'),
    util = require('../util');

var self;

/**
 * This module defines operations for sorting lists.
 *
 * @private
 * @module fkit/list/sort
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns a list that contains the elements in the list of `as` sorted.
   *
   * @summary Sorts a list using natural ordering.
   *
   * @example
   *   F.sort([2, 3, 1]); // [1, 2, 3]
   *   F.sort('bca'); // 'abc'
   *
   * @curried
   * @function
   * @param a A list.
   * @returns A new list.
   */
  sort: function(as) {
    return self.sortBy(fn.compare, as);
  },

  /**
   * Returns a list that contains the elements in the list of `as` sorted
   * using the comparator function `c`.
   *
   * @summary Sorts a list using a comparator function.
   *
   * @curried
   * @function
   * @param c A comparator function.
   * @param as A list.
   * @returns A new list.
   */
  sortBy: fn.curry(function(c, as) {
    var bs = base.toArray(as.slice(0));
    return base.toList(bs.sort(c), typeof as);
  }),
};

},{"../fn":6,"../util":21,"./base":8}],15:[function(require,module,exports){
'use strict';

var base = require('./base'),
    fn   = require('../fn'),
    fold = require('./fold');

var self;

/**
 * This module defines sublist operations on lists.
 *
 * @private
 * @module fkit/list/sublist
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns the prefix of `n` elements from the list of `as`.
   *
   * @summary Gets the prefix of a list.
   *
   * @example
   *   F.take(2, [1, 2, 3]); // [1, 2]
   *   F.take(2, 'foo'); // 'fo'
   *
   * @curried
   * @function
   * @param n A number.
   * @param as A list.
   * @returns A new list.
   */
  take: fn.curry(function(n, as) {
    var s = base.isString(as) ? '' : [],
        m = as.length;

    for (var i = 0; i < Math.min(m, n); i++) {
      s = s.concat(as[i]);
    }

    return s;
  }),

  /**
   * Returns the suffix after dropping `n` elements from the list of `as`.
   *
   * @summary Gets the suffix of a list.
   *
   * @example
   *   F.drop(2, [1, 2, 3]); // [3]
   *   F.drop(2, 'foo'); // 'o'
   *
   * @curried
   * @function
   * @param n A number.
   * @param as A list.
   * @returns A new list.
   */
  drop: fn.curry(function(n, as) {
    var s = base.isString(as) ? '' : [],
        m = as.length;

    for (var i = n; i < m; i++) {
      s = s.concat(as[i]);
    }

    return s;
  }),

  /**
   * Returns the prefix of elements from the list of `as` while the predicate
   * function `p` is satisfied.
   *
   * @summary Gets the prefix of a list using a predicate function.
   *
   * @example
   *   F.takeWhile(F.lt(3), [1, 2, 3]); // [1, 2]
   *   F.takeWhile(F.neq(o), 'foo'); // 'f'
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A new list.
   */
  takeWhile: fn.curry(function(p, as) {
    var s = base.isString(as) ? '' : [],
        n = as.length;

    for (var i = 0; i < n && p(as[i]); i++) {
      s = s.concat(as[i]);
    }

    return s;
  }),

  /**
   * Returns the suffix after dropping elements from the list of `as` while
   * the predicate function `p` is satisfied.
   *
   * @summary Gets the suffix of a list using a predicate function.
   *
   * @example
   *   F.dropWhile(F.lt(3), [1, 2, 3]); // [3]
   *   F.dropWhile(F.neq(o), 'foo'); // 'oo'
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A new list.
   */
  dropWhile: fn.curry(function(p, as) {
    var s = base.isString(as) ? '' : [],
        m = as.length,
        n = 0;

    while (p(as[n]) && n < as.length) {
      n++;
    }

    for (var i = n; i < m; i++) {
      s = s.concat(as[i]);
    }

    return s;
  }),

  /**
   * Returns a list that contains the elements in the list of `as` split into a
   * pair of lists: a prefix of length `n` and the remainder of the list.
   *
   * @summary Splits a list.
   *
   * @example
   *   F.splitAt(1, [1, 2, 3]); // [[1], [2, 3]]
   *   F.splitAt(1, 'foo'); // ['f', 'oo']
   *
   * @curried
   * @function
   * @param n A number.
   * @param as A list.
   * @returns A pair of lists.
   */
  splitAt: fn.curry(function(n, as) {
    return [self.take(n, as), self.drop(n, as)];
  }),

  /**
   * Returns a list that contains the elements in the list of `as` split into a
   * pair of lists: a prefix of elements that satisfy the predicate function
   * `p` and the remainder of the list.
   *
   * @summary Splits a list using a predicate function.
   *
   * @example
   *   F.span(F.lt(3), [1, 2, 3]); // [[1, 2], [3]]
   *   F.span(F.neq(o), 'foo'); // ['f', 'oo']
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param as A list.
   * @returns A pair of lists.
   */
  span: fn.curry(function(p, as) {
    return [self.takeWhile(p, as), self.dropWhile(p, as)];
  }),

  /**
   * Returns a list that contains the elements in the list of `as` grouped into
   * sublists of equal elements.
   *
   * It is a special case of the `groupBy` function where the elements are
   * compared using the strict equality `===` operator.
   *
   * @summary Groups the elements in a list.
   *
   * @example
   *   F.group([1, 2, 2, 3, 3, 3]); // [[1], [2, 2], [3, 3, 3]]
   *   F.group('Mississippi'); // ['M', 'i', 'ss', 'i', 'ss', 'i', 'pp', 'i']
   *
   * @param as A list.
   * @returns A new list.
   */
  group: function(as) { return self.groupBy(fn.equal, as); },

  /**
   * Returns a list that contains the elements in the list of `as` grouped into
   * sublists that satisfy the comparator function `f`.
   *
   * @summary Groups the elements in a list using a comparator function.
   *
   * @curried
   * @function
   * @param f A comparator function.
   * @param as A list.
   * @returns A new list.
   */
  groupBy: fn.curry(function groupBy(f, as) {
    var b  = base.head(as),
        bs = self.span(f(b), base.tail(as));

    return base.empty(as) ?
      [] :
      base.prepend(
        base.prepend(b, base.head(bs)),
        groupBy(f, base.last(bs))
      );
  }),
};

},{"../fn":6,"./base":8,"./fold":10}],16:[function(require,module,exports){
'use strict';

var base  = require('./base'),
    build = require('./build'),
    fn    = require('../fn');

var self;

/**
 * This module defines zip operations on lists.
 *
 * @private
 * @module fkit/list/zip
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns the lists of `as` and `bs` zipped with the binary function `f`.
   *
   * @summary Zips two lists with a function.
   *
   * @curried
   * @function
   * @param f A binary function.
   * @param as A list.
   * @param bs A list.
   * @returns A new list.
   */
  zipWith: fn.curry(function(f, as, bs) {
    var n = Math.min(as.length, bs.length);

    return base
      .toArray(as.slice(0, n))
      .map(function(a, i) { return f(a, bs[i]); });
  }),

  /**
   * Returns the lists of `as` and `bs` zipped into a list of pairs.
   *
   * It is a special case of the `zipWith` function where the elements are combined
   * using the `F.pair` function.
   *
   * @summary Zips two lists into list of pairs.
   *
   * @example
   *   F.zip([1, 2, 3], [4, 5, 6]); // [[1, 4], [2, 5], [3, 6]]
   *   F.zip('foo', 'bar'); // [['f', 'b'], ['o', 'a'], ['o', 'r']]
   *
   * @curried
   * @function
   * @param as A list.
   * @param bs A list.
   * @returns A new list.
   */
  zip: fn.curry(function(as, bs) {
    return self.zipWith(build.pair, as, bs);
  }),

  /**
   * Returns the list of pairs `as` unzipped into a pair of lists.
   *
   * @summary Unzips a list of pairs into a pair of lists.
   *
   * @example
   *   F.unzip([[1, 4], [2, 5], [3, 6]]); // [[1, 2, 3], [4, 5, 6]]
   *   F.unzip([['f', 'b'], ['o', 'a'], ['o', 'r']]); // ['foo', 'bar']
   *
   * @param as A list.
   * @returns A new list.
   */
  unzip: function(as) {
    var s = base.mempty(as[0]);

    return as.reduceRight(function(p, ps) {
      var a = ps[0], b = ps[1], as = p[0], bs = p[1];
      return [base.prepend(a, as), base.prepend(b, bs)];
    }, [s, s]);
  },
};

},{"../fn":6,"./base":8,"./build":9}],17:[function(require,module,exports){
'use strict';

var fn  = require('./fn'),
    map = require('./list/map');

var self;

/**
 * This module defines logic functions.
 *
 * @module fkit/logic
 * @summary Logical Functions and Combinators
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns the result of `b && a`.
   *
   * @summary The logical AND operator.
   *
   * @curried
   * @function
   * @param a A boolean value.
   * @param b A boolean value.
   * @returns A boolean value.
   */
  and: fn.curry(function(a, b) { return b && a; }),

  /**
   * Returns the result of `b || a`.
   *
   * @summary The logical OR operator.
   *
   * @curried
   * @function
   * @param a A boolean value.
   * @param b A boolean value.
   * @returns A boolean value.
   */
  or: fn.curry(function(a, b) { return b || a; }),

  /**
   * Returns the result of `!a`.
   *
   * @summary The logical NOT operator.
   *
   * @param a A boolean.
   * @returns A boolean value.
   */
  not: function(a) { return !a; },

  /**
   * If `p(a)` is true then `f` is applied to `a`, otherwise `g` is applied to
   * `a`.
   *
   * @summary Branches execution based on a predicate function.
   *
   * @example
   *   function big(a) { return a + ' is a big number'; }
   *   function small(a) { return a + ' is a small number'; }
   *   var f = F.branch(F.gt(10), big, small);
   *   f(10); // small number
   *   f(11); // big number
   *
   * @curried
   * @function
   * @param p A predicate function.
   * @param f A function.
   * @param g A function.
   * @param a A value.
   * @returns A value.
   */
  branch: fn.curry(function(p, f, g, a) {
    return p(a) ? f(a) : g(a);
  }),

  /**
   * Applies the list of predicate functions `ps` to the value `a` and returns
   * their conjunction.
   *
   * @example
   *   var ps = [F.gt(1), F.gt(2)];
   *   F.whereAll(ps, 1); // false
   *   F.whereAll(ps, 2); // false
   *   F.whereAll(ps, 3); // true
   *
   * @curried
   * @function
   * @param ps A list of predicate functions.
   * @param a A value.
   * @returns A boolean value.
   */
  whereAll: fn.curry(function(ps, a) {
    return ps.map(fn.applyRight(a)).reduce(self.and, true);
  }),

  /**
   * Applies the list of predicate functions `ps` to the value `a` and returns
   * their disjunction.
   *
   * @example
   *   var ps = [F.gt(1), F.gt(2)];
   *   F.whereAny(ps, 1); // false
   *   F.whereAny(ps, 2); // true
   *   F.whereAny(ps, 3); // true
   *
   * @curried
   * @function
   * @param ps A list of predicate functions.
   * @param a A value.
   * @returns A boolean value.
   */
  whereAny: fn.curry(function(ps, a) {
    return ps.map(fn.applyRight(a)).reduce(self.or, false);
  }),
};

},{"./fn":6,"./list/map":11}],18:[function(require,module,exports){
'use strict';

var fn = require('./fn');

/**
 * This module defines math functions.
 *
 * @module fkit/math
 * @summary Yay, Numbers!
 * @author Josh Bassett
 */
module.exports = {
  /**
   * Returns the result of `b + a`.
   *
   * @summary The addition operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  add: fn.curry(function(a, b) { return b + a; }),

  /**
   * Returns the result of `b - a`.
   *
   * @summary The subtraction operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  sub: fn.curry(function(a, b) { return b - a; }),

  /**
   * Returns the result of `b * a`.
   *
   * @summary The multiplication operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  mul: fn.curry(function(a, b) { return b * a; }),

  /**
   * Returns the result of `b / a`.
   *
   * @summary The division operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  div: fn.curry(function(a, b) { return b / a; }),

  /**
   * Returns the result of `b % a`.
   *
   * @summary The modulo operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  mod: fn.curry(function(a, b) { return b % a; }),

  /**
   * Returns the largest of the numbers `a` and `b`.
   *
   * @summary Determines the largest of two numbers.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  max: fn.curry(function(a, b) { return b > a ? b : a; }),

  /**
   * Returns the smallest of the numbers `a` and `b`.
   *
   * @summary Determines the smallest of two numbers.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  min: fn.curry(function(a, b) { return a > b ? b : a; }),

  /**
   * Returns the negation of the number `a`.
   *
   * @summary The negation operator.
   *
   * @param a A number.
   * @returns A number.
   */
  negate: function(a) { return -a; },

  /**
   * Returns `true` if the value `a` is equal (`==`) to the value `b`, false
   * otherwise.
   *
   * @summary The non-strict equality operator.
   *
   * @curried
   * @function
   * @param a A value.
   * @param b A value.
   * @returns A boolean value.
   */
  eq: fn.curry(function(a, b) { return b == a; }),

  /**
   * Returns `true` if the value `a` is not equal (`!=`) to the value `b`,
   * false otherwise.
   *
   * @summary The non-strict inequality operator.
   *
   * @curried
   * @function
   * @param a A value.
   * @param b A value.
   * @returns A boolean value.
   */
  neq: fn.curry(function(a, b) { return b != a; }),

  /**
   * Returns `true` if the value `a` is greater than the value `b`, false
   * otherwise.
   *
   * @summary The greater than operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A boolean value.
   */
  gt: fn.curry(function(a, b) { return b > a; }),

  /**
   * Returns `true` if the value `a` is greater than or equal to the value `b`,
   * false otherwise.
   *
   * @summary The greater than or equal operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A boolean value.
   */
  gte: fn.curry(function(a, b) { return b >= a; }),

  /**
   * Returns `true` if the value `a` is less than the value `b`, false
   * otherwise.
   *
   * @summary The less than operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A boolean value.
   */
  lt: fn.curry(function(a, b) { return b < a; }),

  /**
   * Returns `true` if the value `a` is less than or equal to the value `b`,
   * false otherwise.
   *
   * @summary The less than or equal operator.
   *
   * @curried
   * @function
   * @param a A number.
   * @param b A number.
   * @returns A boolean value.
   */
  lte: fn.curry(function(a, b) { return b <= a; }),

  /**
   * Returns the result of `a + 1`.
   *
   * @summary Increments a number.
   *
   * @param a A number.
   * @returns A number.
   */
  inc: function(a) { return a + 1; },

  /**
   * Returns the result of `a - 1`.
   *
   * @summary Decrements a number.
   *
   * @param a A number.
   * @returns A number.
   */
  dec: function(a) { return a - 1; },

  /**
   * Returns a random integer between `a` and `b`.
   *
   * @summary Generates a random integer.
   *
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  randomInt: fn.curry(function(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }),

  /**
   * Returns a random float between `a` and `b`.
   *
   * @summary Generates a random float.
   *
   * @param a A number.
   * @param b A number.
   * @returns A number.
   */
  randomFloat: fn.curry(function(a, b) {
    return (Math.random() * (b - a)) + a;
  }),
};

},{"./fn":6}],19:[function(require,module,exports){
'use strict';

var fn   = require('./fn'),
    set  = require('./list/set'),
    util = require('./util');

var self;

/**
 * This module defines operations on objects.
 *
 * @module fkit/obj
 * @summary Objects
 * @author Josh Bassett
 */
self = module.exports = {
  /**
   * Returns the result of the method `k` of object `o` applied to the value
   * `a`.
   *
   * @summary Applies a method to a method.
   *
   * @example
   *   var person = {sayHi: function(a) { return ['Hi', a, '!'].join(' '); }};
   *   F.applyMethod(sayHi, 'Jane', person); // Hi Jane!
   *
   * @curried
   * @function
   * @param k A string.
   * @param a A value.
   * @param o An object.
   * @returns A value.
   */
  applyMethod: fn.curry(function(k, a, o) {
    return o[k](a);
  }),

  /**
   * Returns the result of the method `k` of object `o` applied to the values
   * `a` and `b`.
   *
   * @summary Applies a method to two values.
   *
   * @example
   *   var person = {sayHi: function(a, b) { return ['Hi', a, b, '!'].join(' '); }};
   *   F.applyMethod2(sayHi, 'Jane', 'Appleseed', person); // Hi Jane Appleseed!
   *
   * @curried
   * @function
   * @param k A string.
   * @param a A value.
   * @param b A value.
   * @param o An object.
   * @returns A value.
   */
  applyMethod2: fn.curry(function(k, a, b, o) {
    return o[k](a, b);
  }),

  /**
   * Returns the result of the method `k` of object `o` applied to the values
   * `a`, `b`, and `c`.
   *
   * @summary Applies a method to three values.
   *
   * @example
   *   var person = {sayHi: function(a, b, c) { return ['Hi', a, b, c, '!'].join(' '); }};
   *   F.applyMethod3(sayHi, 'Ms', 'Jane', 'Appleseed', person); // Hi Ms Jane Appleseed!
   *
   * @curried
   * @function
   * @param k A string.
   * @param a A value.
   * @param b A value.
   * @param c A value.
   * @param o An object.
   * @returns A value.
   */
  applyMethod3: fn.curry(function(k, a, b, c, o) {
    return o[k](a, b, c);
  }),

  /**
   * Returns a copy of the objects in the list of `os`.
   *
   * Properties with the same key will take precedence from right to left.
   *
   * The copy will have the *same* prototype as the *first* object in the list.
   *
   * @summary Creates a copy of an object.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.copy(person, {name: 'Steve'}); // {name: 'Steve', age: 20, city: 'Melbourne'}
   *
   * @function
   * @param os A list.
   * @returns A new object.
   */
  copy: fn.variadic(function(o, ps) {
    return util.extend(new o.constructor(), [o].concat(ps));
  }),

  /**
   * Returns the property at the key `k` in the object `o`.
   *
   * @summary Gets a property of an object.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.get('name', person); // 'Jane'
   *
   * @curried
   * @function
   * @param k A string.
   * @param o An object.
   * @returns A value.
   */
  get: fn.curry(function(k, o) { return o[k]; }),

  /**
   * Returns the property at the key path `ks` in the object `o`.
   *
   * @summary Gets a property of an object using a key path.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, address: {city: 'Melbourne', country: 'Australia'}};
   *   F.getIn(['address', 'city'], person); // 'Melbourne'
   *
   * @curried
   * @function
   * @param ks A list.
   * @param o An object.
   * @returns A value.
   */
  getIn: fn.curry(function(ks, o) {
    return ks.reduce(function(a, b) {
      return (a !== undefined) ? a[b] : undefined;
    }, o);
  }),

  /**
   * Returns a copy of the object `o` with the property `k` set to the value
   * `v`.
   *
   * @summary Sets a property of an object.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.set('name', 'Steve', person); // {name: 'Steve', age: 20, city: 'Melbourne'}
   *
   * @curried
   * @function
   * @param k A string.
   * @param v A value.
   * @param o An object.
   * @returns A new object.
   */
  set: fn.curry(function(k, v, o) {
    var p = {};
    p[k] = v;
    return self.copy(o, p);
  }),

  /**
   * Returns a copy of the object `o` with the property `k` updated with the
   * function `f`.
   *
   * @summary Updates a property of an object with a function.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.update('age', F.inc, person); // {name: 'Jane', age: 21, city: 'Melbourne'}
   *
   * @curried
   * @function
   * @param k A string.
   * @param f A function.
   * @param o An object.
   * @returns A new object.
   */
  update: fn.curry(function(k, f, o) {
    return self.set(k, f(self.get(k, o)), o);
  }),

  /**
   * Returns a copy of the object `o` *with* the properties in the list of
   * `ks`.
   *
   * @summary Picks properties of an object.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.pick(['name', 'age'], person); // {name: 'Jane', age: 20}
   *
   * @curried
   * @function
   * @param ks A list.
   * @param o An object.
   * @returns A new object.
   */
  pick: fn.curry(function(ks, o) {
    return ks.reduce(function(p, k) {
      return self.set(k, self.get(k, o), p);
    }, {});
  }),

  /**
   * Returns a copy of the object `o` *without* the properties in the list of
   * `ks`.
   *
   * @summary Omits properties of an object.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.omit(['name', 'age'], person); // {city: 'Melbourne'}
   *
   * @curried
   * @function
   * @param ks A list.
   * @param o An object.
   * @returns A new object.
   */
  omit: fn.curry(function(ks, o) {
    return set
      .difference(self.keys(o), ks)
      .reduce(function(p, k) {
        return self.set(k, self.get(k, o), p);
      }, {});
  }),

  /**
   * Returns a list of key-value pairs for the properties of the object `o`.
   *
   * @summary Gets the key-value pairs of an object.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.pairs(person); // [['name', 'Jane'], ['age', 20], ['city', 'Melbourne']]
   *
   * @param o An object.
   * @returns A new list.
   */
  pairs: function(o) {
    return Object.keys(o).map(function(k) {
      return [k, self.get(k, o)];
    });
  },

  /**
   * Returns a list of keys for the properties of the object `o`.
   *
   * @summary Gets the keys of an object.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.keys(person); // ['name', 'age', 'city']
   *
   * @param o An object.
   * @returns A new list.
   */
  keys: function(o) {
    return Object.keys(o);
  },

  /**
   * Returns a list of values for the properties of the object `o`.
   *
   * @summary Gets the values of an object.
   *
   * @example
   *   var person = {name: 'Jane', age: 20, city: 'Melbourne'};
   *   F.values(person); // ['Jane', 20, 'Melbourne']
   *
   * @param o An object.
   * @returns A new list.
   */
  values: function(o) {
    return Object
      .keys(o)
      .map(fn.flip(self.get)(o));
  },
};

},{"./fn":6,"./list/set":13,"./util":21}],20:[function(require,module,exports){
'use strict';

var fn = require('./fn');

/**
 * This module defines string functions.
 *
 * @module fkit/string
 * @summary Strings
 * @author Josh Bassett
 */
module.exports = {
  /**
   * @summary Converts a string to uppercase.
   *
   * @param s A string.
   * @returns A new string.
   */
  toUpper: function(s) { return s.toUpperCase(); },

  /**
   * @summary Converts a string to lowercase.
   *
   * @param s A string.
   * @returns A new string.
   */
  toLower: function(s) { return s.toLowerCase(); },

  /**
   * Returns the result of replacing term `a` with the string `b` in the string
   * `s`.
   *
   * @summary Replaces a term in a string.
   *
   * @example
   *   F.replace('r', 'z', 'bar'); // baz
   *   F.replace(/$hello/, 'goodbye', 'hello world!'); // goodbye world!
   *
   * @curried
   * @function
   * @param a A string or a regexp.
   * @param b A string.
   * @param s A string.
   * @returns A new string.
   */
  replace: fn.curry(function(a, b, s) {
    return s.replace(a, b);
  }),
};

},{"./fn":6}],21:[function(require,module,exports){
'use strict';

module.exports = {
  extend: function(target, objects) {
    objects.forEach(function(object) {
      Object.getOwnPropertyNames(object).forEach(function(property) {
        target[property] = object[property];
      });
    });
    return target;
  },

  slice: Array.prototype.slice
};

},{}]},{},[1]);
