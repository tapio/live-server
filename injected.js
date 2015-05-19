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

      var modules = Object.keys(this.System._loader.modules);
      if (modules.length != this.moduleMap.size) {
        this.moduleMap.clear();
        modules.forEach(function (m) {
          var _m$split = m.split('!');

          var _m$split2 = _slicedToArray(_m$split, 2);

          var path = _m$split2[0];
          var plugin = _m$split2[1];

          _this.moduleMap.set(path, plugin);
        });
      }
    }
  }, {
    key: 'updateDepMap',
    value: function updateDepMap() {
      var _this2 = this;

      var modules = Object.keys(this.System.loads);
      if (modules.length != this.depMap.size) {
        this.depMap.clear();
        modules.forEach(function (m) {
          var deps = _this2.System.loads[m].depMap;
          Object.keys(deps).forEach(function (dep) {
            var _deps$dep$split = deps[dep].split('!');

            var _deps$dep$split2 = _slicedToArray(_deps$dep$split, 2);

            var path = _deps$dep$split2[0];
            var plugin = _deps$dep$split2[1];

            if (!_this2.depMap.get(path)) _this2.depMap.set(path, []);
            _this2.depMap.get(path).push(m.split('!')[0]);
          });
        });
        console.log(this.depMap);
      }
    }
  }, {
    key: 'fileChanged',
    value: function fileChanged(path) {
      var _this3 = this;

      var reloadPageIfNeeded = arguments[1] === undefined ? true : arguments[1];

      console.log('PATH CHANGED ' + path);
      this.updateModuleMap();
      this.updateDepMap();

      if (!this.moduleMap.has(path)) {
        if (reloadPageIfNeeded) this.reload(path, 'Change occurred to a file outside SystemJS loading');
        return;
      }

      var pluginName = this.moduleMap.get(path);
      if (!pluginName) {
        if (reloadPageIfNeeded) this.reload(path, 'Default plugin cannot hot-swap');
        return;
      }

      this.System.load(pluginName).then(function (plugin) {
        if (!plugin.hotReload) {
          if (reloadPageIfNeeded) _this3.reload(path, 'Plugin \'' + pluginName + '\' does not define a reload handler');
          return;
        }

        var systemPath = '' + path + '!' + pluginName;
        _this3.System['delete'](systemPath);
        _this3.System['import'](systemPath).then(function (module) {
          plugin.hotReload(module);
          console.log('Reloaded ' + path);
          var deps = _this3.depMap.get(path);
          if (deps) deps.forEach(function (dep) {
            return _this3.fileChanged(dep, false);
          });
        });
      });
    }
  }, {
    key: 'reload',
    value: function reload(path, reason) {
      //window.location.reload()
      console.info('Change detected in ' + path + ' that cannot be handled gracefully: ' + reason);
      console.log('Reloading in 2 seconds...');
      setTimeout(function () {
        return console.log('1...');
      }, 1000);
      setTimeout(function () {
        return window.location.reload();
      }, 1000);
    }
  }]);

  return ChangeHandler;
})();

exports['default'] = ChangeHandler;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _messageHandler = require('./message-handler');

var _messageHandler2 = _interopRequireWildcard(_messageHandler);

var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var address = protocol + window.location.host + window.location.pathname + '/ws';
var socket = new WebSocket(address);
socket.onmessage = function (msg) {
  try {
    _messageHandler2['default'](JSON.parse(msg.data));
  } catch (e) {
    console.error('Non-JSON response received: ' + JSON.stringify(msg));
    throw e;
  }
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
