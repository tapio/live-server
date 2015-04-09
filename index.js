#!/usr/bin/env node
var fs = require('fs'),
  connect = require('connect'),
  colors = require('colors'),
  WebSocket = require('faye-websocket'),
  path = require('path'),
  url = require('url'),
  http = require('http'),
  send = require('send'),
  open = require('open'),
  es = require("event-stream"),
  watchr = require('watchr'),
  chokidar = require('chokidar'),
  ws;

var INJECTED_CODE = "<script>" + fs.readFileSync(__dirname + "/injected.js", "utf8") + "</script>";

var LiveServer = {};

function escape(html) {
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Based on connect.static(), but streamlined and with added code injecter
function staticServer(root) {
  return function (req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var reqpath = url.parse(req.url).pathname;
    var hasNoOrigin = !req.headers.origin;
    var doInject = false;

    function directory() {
      var pathname = url.parse(req.originalUrl).pathname;
      res.statusCode = 301;
      res.setHeader('Location', pathname + '/');
      res.end('Redirecting to ' + escape(pathname) + '/');
    }

    function file(filepath, stat) {
      var x = path.extname(filepath);
      if (hasNoOrigin && (x === "" || x == ".html" || x == ".htm" || x == ".xhtml" || x == ".php")) {
        // TODO: Sync file read here is not nice, but we need to determine if the html should be injected or not
        var contents = fs.readFileSync(filepath, "utf8");
        doInject = contents.indexOf("</body>") > -1;
      }
    }

    function error(err) {
      if (404 == err.status) return next();
      next(err);
    }

    function inject(stream) {
      if (doInject) {
        // We need to modify the length given to browser
        var len = INJECTED_CODE.length + res.getHeader('Content-Length');
        res.setHeader('Content-Length', len);
        var originalPipe = stream.pipe;
        stream.pipe = function (res) {
          originalPipe.call(stream, es.replace(new RegExp("</body>", "i"), INJECTED_CODE + "</body>")).pipe(res);
        };
      }
    }

    send(req, reqpath, {root: root})
      .on('error', error)
      .on('directory', directory)
      .on('file', file)
      .on('stream', inject)
      .pipe(res);
  };
}

/**
 * Start a live server with parameters given as an object
 * @param host {string} Address to bind to (default: 0.0.0.0)
 * @param port {number} Port number (default: 8080)
 * @param root {string} Path to root directory (default: cwd)
 * @param open {string} Subpath to open in browser, use false to suppress launch (default: server root)
 * @param logLevel {number} 0 = errors only, 1 = some, 2 = lots
 */
LiveServer.start = function (options) {
  options = options || {};
  var host = options.host || '0.0.0.0';
  var port = options.port || 8080;
  var root = options.root || process.cwd();
  var logLevel = options.logLevel === undefined ? 2 : options.logLevel;
  var openPath = (options.open === undefined || options.open === true) ?
    "" : ((options.open === null || options.open === false) ? null : options.open);
  if (options.noBrowser) openPath = null; // Backwards compatibility with 0.7.0

  // Setup a web server
  var app = connect()
    .use(staticServer(root)) // Custom static server
    .use(connect.directory(root, {icons: true}));
  if (logLevel >= 2)
    app.use(connect.logger('dev'));
  var server = http.createServer(app).listen(port, host);
  // WebSocket
  server.addListener('upgrade', function (request, socket, head) {
    ws = new WebSocket(request, socket, head);
    ws.onopen = function () {
      ws.send(JSON.stringify({type: 'connected'}));
    };
  });
  // Setup file watcher
  chokidar.watch(root, {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    ignorePermissionErrors: true
  }).on('all', function (event, filePathOrErr) {
    if (event == 'error') {
      console.log("ERROR:".red, filePathOrErr);
    } else {
      if (!ws) return;
      var relativePath = path.relative(root, filePathOrErr);
      ws.send(JSON.stringify({type: 'change', path: relativePath}))
      if (logLevel >= 1) console.log(("Change detected: " + relativePath).cyan);
    }
  });
  // Output
  var serveURL = "http://127.0.0.1:" + port;
  if (logLevel >= 1)
    console.log(('Serving "' + root + '" at ' + serveURL).green);

  // Launch browser
  if (openPath !== null)
    open(serveURL + openPath);
};

module.exports = LiveServer;
