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
	watchr = require('watchr');

var INJECTED_CODE = fs.readFileSync(__dirname + "/injected.html", "utf8");

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
				stream.pipe = function(res) {
					originalPipe.call(stream, es.replace(new RegExp("</body>","i"), INJECTED_CODE + "</body>")).pipe(res);
				};
			}
		}

		send(req, reqpath, { root: root })
			.on('error', error)
			.on('directory', directory)
			.on('file', file)
			.on('stream', inject)
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
	};
}

/**
 * Start a live server with parameters given as an object
 * @param host {string} Address to bind to (default: 0.0.0.0)
 * @param port {number} Port number (default: 8080)
 * @param root {string} Path to root directory (default: cwd)
 * @param open {string} Subpath to open in browser, use false to suppress launch (default: server root)
 * @param logLevel {number} 0 = errors only, 1 = some, 2 = lots
 * @param file {string} Path to the entry point file
 * @param wait {number} Server will wait for all changes, before reloading
 */
LiveServer.start = function(options) {
	options = options || {};
	var host = options.host || '0.0.0.0';
	var port = options.port || 8080;
	var root = options.root || process.cwd();
	var logLevel = options.logLevel === undefined ? 2 : options.logLevel;
	var openPath = (options.open === undefined || options.open === true) ?
		"" : ((options.open === null || options.open === false) ? null : options.open);
	if (options.noBrowser) openPath = null; // Backwards compatibility with 0.7.0
	var file = options.file;
	var staticServerHandler = staticServer(root);
	var wait = options.wait || 0;

	// Setup a web server
	var app = connect()
		.use(staticServerHandler) // Custom static server
		.use(entryPoint(staticServerHandler, file))
		.use(connect.directory(root, { icons: true }));
	if (logLevel >= 2)
		app.use(connect.logger('dev'));
	var server = http.createServer(app);

	// Handle server startup errors
	server.addListener('error', function(e) {
		if (e.code == 'EADDRINUSE') {
			var serveURL = 'http://' + host + ':' +  port;
			console.log('%s is already in use. Trying another port.'.red, serveURL);
			setTimeout(function() {
				server.listen(0, host);
			}, 1000);
		}
	});

	// Handle successful server
	server.addListener('listening', function(e) {
		var address = server.address();
		var serveHost = address.address == "0.0.0.0" ? "127.0.0.1" : address.address;
		var serveURL = 'http://' + serveHost + ':' +  address.port;

		// Output
		if (logLevel >= 1) {
			console.log(("Serving \"%s\" at %s").green, root, serveURL);
		}

		// Launch browser
		if (openPath !== null)
			open(serveURL + openPath);
	});

	// Setup server to listen at port
	server.listen(port, host);

	// WebSocket
	var clients = [];
	server.addListener('upgrade', function(request, socket, head) {
		var ws = new WebSocket(request, socket, head);
		ws.onopen = function() { ws.send('connected'); };

		if (wait > 0) {
			(function(ws) {
				var wssend = ws.send;
				var waitTimeout;

				ws.send = function() {
					var args = arguments;
					if (waitTimeout) clearTimeout(waitTimeout);
					waitTimeout = setTimeout(function(){
						wssend.apply(ws, args);
					}, wait);
				};
			})(ws);
		}

		ws.onclose = function() {
			clients = clients.filter(function (x) {
				return x !== ws;
			});
		};

		clients.push(ws);
	});

	// Setup file watcher
	watchr.watch({
		path: root,
		ignorePaths: options.ignore || false,
		ignoreCommonPatterns: true,
		ignoreHiddenFiles: true,
		preferredMethods: [ 'watchFile', 'watch' ],
		interval: 1407,
		listeners: {
			error: function(err) {
				console.log("ERROR:".red , err);
			},
			change: function(eventName, filePath, fileCurrentStat, filePreviousStat) {
				clients.forEach(function(ws) {
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
				});
			}
		}
	});
};

module.exports = LiveServer;
