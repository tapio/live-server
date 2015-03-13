#!/usr/bin/env node
var connect = require('connect'),
	colors = require('colors'),
	WebSocket = require('faye-websocket'),
	path = require('path'),
	url = require('url'),
	http = require('http'),
	send = require('send'),
	open = require('open'),
	es = require("event-stream"),
	watchr = require('watchr'),
	ws;

var INJECTED_CODE = require('fs').readFileSync(__dirname + "/injected.html", "utf8");

var LiveServer = {};

function escape(html){
	return String(html)
		.replace(/&(?!\w+;)/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// Based on connect.static(), but streamlined and with added code injecter
function staticServer(root) {
	return function(req, res, next) {
		if ('GET' != req.method && 'HEAD' != req.method) return next();
		var reqpath = url.parse(req.url).pathname;
		var hasNoOrigin = !req.headers.origin;

		function directory() {
			var pathname = url.parse(req.originalUrl).pathname;
			res.statusCode = 301;
			res.setHeader('Location', pathname + '/');
			res.end('Redirecting to ' + escape(pathname) + '/');
		}

		function error(err) {
			if (404 == err.status) return next();
			next(err);
		}

		function inject(stream) {
			var x = path.extname(reqpath);
			if (hasNoOrigin && (x === "" || x == ".html" || x == ".htm" || x == ".xhtml" || x == ".php")) {
				// We need to modify the length given to browser
				var len = INJECTED_CODE.length + res.getHeader('Content-Length');
				res.setHeader('Content-Length', len);

				var originalPipe = stream.pipe;
				stream.pipe = function(res) {
					originalPipe.call(stream, es.replace(new RegExp("</body>","i"), INJECTED_CODE + "</body>")).pipe(res);
				};
			}
		}

		send(req, reqpath, { root: root })
			.on('error', error)
			.on('stream', inject)
			.on('directory', directory)
			.pipe(res);
	};
}

/**
 * Rewrite request URL and pass it back to the static handler.
 * @param staticHandler {function} Next handler
 * @param file {string} Path to the entry point file
 */
function entryPoint(staticHandler, file) {
	if (!file) return function(req, res, next) { next(); };

	return function(req, res, next) {
		req.url = "/" + file;
		staticHandler(req, res, next);
	}
}

/**
 * Start a live server with parameters given as an object
 * @param host {string} Address to bind to (default: 0.0.0.0)
 * @param port {number} Port number (default: 8080)
 * @param root {string} Path to root directory (default: cwd)
 * @param noBrowser
 * @param logLevel {number} 0 = errors only, 1 = some, 2 = lots
 * @param file {string} Path to the entry point file
 */
LiveServer.start = function(options) {
	options = options || {};
	var host = options.host || '0.0.0.0';
	var port = options.port || 8080;
	var root = options.root || process.cwd();
	var logLevel = options.logLevel === undefined ? 2 : options.logLevel;
	var noBrowser = options.noBrowser || false;
	var file = options.file;
	var staticHandler = staticServer(root);

	// Setup a web server
	var app = connect()
		.use(staticHandler) // Custom static server
		.use(entryPoint(staticHandler, file))
		.use(connect.directory(root, { icons: true }));
	if (logLevel >= 2)
		app.use(connect.logger('dev'));
	var server = http.createServer(app).listen(port, host);
	// WebSocket
	server.addListener('upgrade', function(request, socket, head) {
		ws = new WebSocket(request, socket, head);
		ws.onopen = function() { ws.send('connected'); };
	});
	// Setup file watcher
	watchr.watch({
		path: root,
		ignoreCommonPatterns: true,
		ignoreHiddenFiles: true,
		preferredMethods: [ 'watchFile', 'watch' ],
		interval: 1407,
		listeners: {
			error: function(err) {
				console.log("ERROR:".red , err);
			},
			change: function(eventName, filePath, fileCurrentStat, filePreviousStat) {
				if (!ws) return;
				if (path.extname(filePath) == ".css") {
					ws.send('refreshcss');
					if (logLevel >= 1)
						console.log("CSS change detected".magenta);
				} else {
					ws.send('reload');
					if (logLevel >= 1)
						console.log("File change detected".cyan);
				}
			}
		}
	});
	// Output
	var browserURL = "http://127.0.0.1:" + port;
	if (logLevel >= 1)
		console.log(('Serving "' + root + '" at ' + browserURL).green);

	// Launch browser
	if(!noBrowser)
		open(browserURL);
};

module.exports = LiveServer;
