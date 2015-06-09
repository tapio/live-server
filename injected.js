(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Code injected by jspm-server
'use strict';

require('./lib');

},{"./lib":3}],2:[function(require,module,exports){
'use strict';

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

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
              path = meta.pluginArgument || meta.loaderArgument || moduleName + '.js';
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
          var deps = _this2.System.loads[m].depMap;
          Object.keys(deps).forEach(function (dep) {
            var _deps$dep$split = deps[dep].split('!');

            var _deps$dep$split2 = _slicedToArray(_deps$dep$split, 2);

            var path = _deps$dep$split2[0];
            var loader = _deps$dep$split2[1];

            if (!_this2.depMap.get(path)) _this2.depMap.set(path, []);
            _this2.depMap.get(path).push(m.split('!')[0]);
          });
        });
      }
    }
  }, {
    key: 'fileChanged',
    value: function fileChanged(path) {
      var _this3 = this;

      var reloadPageIfNeeded = arguments[1] === undefined ? true : arguments[1];

      this.updateModuleMap();
      this.updateDepMap();
      console.log(path);
      console.log(this.moduleMap);
      console.log(this.depMap);

      if (!this.moduleMap.has(path)) {
        if (reloadPageIfNeeded) this.reload(path, 'Change occurred to a file outside SystemJS loading');
        return;
      }

      var moduleInfo = this.moduleMap.get(path);

      this.System['import'](moduleInfo.moduleName).then(function (oldModule) {
        console.log(oldModule);
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
            console.log('DEFAULT RELOAD STRATEGY');
            propagate = true;
          } else if (typeof oldModule.__hotReload === 'function') {
            propagate = oldModule.__hotReload.call(oldModule, loader, newModule);
          }
          //loader.hotReload(module)
          console.log('Reloaded ' + path);

          if (propagate) {
            var deps = _this3.depMap.get(path.replace(/\.js$/, ''));
            console.log(deps);
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

},{}],3:[function(require,module,exports){
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

exports['default'] = function (message) {
  var changeHandler = undefined;
  if (message.type == 'connected') {
    console.log('JSPM watching enabled!');
  } else if (message.type == 'change') {
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

},{"./change-handler":2}]},{},[1]);
