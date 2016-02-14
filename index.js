#!/usr/bin/env node
var fs = require('fs'),
	connect = require('connect'),
	serveIndex = require('serve-index'),
	logger = require('morgan'),
	WebSocket = require('faye-websocket'),
	path = require('path'),
	url = require('url'),
	http = require('http'),
	send = require('send'),
	open = require('opn'),
	es = require("event-stream"),
	watchr = require('watchr');
require('colors');

var INJECTED_CODE = fs.readFileSync(path.join(__dirname, "injected.html"), "utf8");

var LiveServer = {
	server: null,
	watchers: []
};

var logLevel;

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
		if (req.method !== "GET" && req.method !== "HEAD") return next();
		var reqpath = url.parse(req.url).pathname;
		var hasNoOrigin = !req.headers.origin;
		var injectCandidates = [ "</body>", "</svg>" ];
		var injectTag = null;

		function directory() {
			var pathname = url.parse(req.originalUrl).pathname;
			res.statusCode = 301;
			res.setHeader('Location', pathname + '/');
			res.end('Redirecting to ' + escape(pathname) + '/');
		}

		function file(filepath, stat) {
			var x = path.extname(filepath).toLocaleLowerCase(),
					possibleExtensions = [ "", ".html", ".htm", ".xhtml", ".php", ".svg" ];
			if (hasNoOrigin && (possibleExtensions.indexOf(x) > -1)) {
				// TODO: Sync file read here is not nice, but we need to determine if the html should be injected or not
				var contents = fs.readFileSync(filepath, "utf8");
				for (var i = 0; i < injectCandidates.length; ++i) {
					if (contents.indexOf(injectCandidates[i]) > -1) {
						injectTag = injectCandidates[i];
						break;
					}
				}
				if (injectTag === null) {
					if (logLevel >= 1)
						console.warn("Failed to inject refresh script!".yellow,
							"Couldn't find any of the tags ", injectCandidates, "from", filepath);
				}
			}
		}

		function error(err) {
			if (err.status === 404) return next();
			next(err);
		}

		function inject(stream) {
			if (injectTag) {
				// We need to modify the length given to browser
				var len = INJECTED_CODE.length + res.getHeader('Content-Length');
				res.setHeader('Content-Length', len);
				var originalPipe = stream.pipe;
				stream.pipe = function(res) {
					originalPipe.call(stream, es.replace(new RegExp(injectTag, "i"), INJECTED_CODE + injectTag)).pipe(res);
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
 * @param watch {array} Paths to exclusively watch for changes
 * @param ignore {array} Paths to ignore when watching files for changes
 * @param ignorePattern {regexp} Ignore files by RegExp
 * @param open {string} Subpath to open in browser, use false to suppress launch (default: server root)
 * @param mount {array} Mount directories onto a route, e.g. [['/components', './node_modules']].
 * @param logLevel {number} 0 = errors only, 1 = some, 2 = lots
 * @param quiet {string} Sets the loglevel to 0
 * @param file {string} Path to the entry point file
 * @param wait {number} Server will wait for all changes, before reloading
 */
LiveServer.start = function(options) {
	options = options || {};
	var host = options.host || '0.0.0.0';
	var port = options.port !== undefined ? options.port : 8080; // 0 means random
	var root = options.root || process.cwd();
	var mount = options.mount || [];
	var watchPaths = options.watch || [root];
	var openPath = (options.open === undefined || options.open === true) ?
		"" : ((options.open === null || options.open === false) ? null : options.open);
	if (options.noBrowser) openPath = null; // Backwards compatibility with 0.7.0
	var file = options.file;
	var staticServerHandler = staticServer(root);
	var wait = options.wait || 0;
	var browser = options.browser || null;

	logLevel = options.logLevel === undefined ? 2 : options.logLevel;
	if(options.quiet)
		logLevel = 0;

	// Setup a web server
	var app = connect();
	mount.forEach(function(mountRule) {
		var mountPath = path.resolve(process.cwd(), mountRule[1]);
		watchPaths.push(mountPath);
		app.use(mountRule[0], staticServer(mountPath));
		if (logLevel >= 1)
			console.log('Mapping %s to "%s"', mountRule[0], mountPath);
	});
	app.use(staticServerHandler) // Custom static server
		.use(entryPoint(staticServerHandler, file))
		.use(serveIndex(root, { icons: true }));
	if (logLevel >= 2)
		app.use(logger('dev'));
	var server = http.createServer(app);

	// Handle server startup errors
	server.addListener('error', function(e) {
		if (e.code === 'EADDRINUSE') {
			var serveURL = 'http://' + host + ':' + port;
			console.log('%s is already in use. Trying another port.'.yellow, serveURL);
			setTimeout(function() {
				server.listen(0, host);
			}, 1000);
		} else {
			console.error(e.toString().red);
			LiveServer.shutdown();
		}
	});

	// Handle successful server
	server.addListener('listening', function(e) {
		LiveServer.server = server;

		var address = server.address();
		var serveHost = address.address === "0.0.0.0" ? "127.0.0.1" : address.address;
		var openHost = host === "0.0.0.0" ? "127.0.0.1" : host;

		var serveURL = 'http://' + serveHost + ':' + address.port;
		var openURL = 'http://' + openHost + ':' + address.port;

		// Output
		if (logLevel >= 1) {
			if (serveURL === openURL)
				console.log(("Serving \"%s\" at %s").green, root, serveURL);
			else
				console.log(("Serving \"%s\" at %s (%s)").green, root, openURL, serveURL);
		}

		// Launch browser
		if (openPath !== null)
			open(openURL + openPath, {app: browser});
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
		paths: watchPaths,
		ignorePaths: options.ignore || false,
		ignoreCommonPatterns: true,
		ignoreHiddenFiles: true,
		ignoreCustomPatterns: options.ignorePattern || null,
		preferredMethods: [ 'watchFile', 'watch' ],
		interval: 1407,
		listeners: {
			error: function(err) {
				console.log("ERROR:".red, err);
			},
			change: function(eventName, filePath, fileCurrentStat, filePreviousStat) {
				clients.forEach(function(ws) {
					if (!ws) return;
					if (path.extname(filePath) === ".css") {
						ws.send('refreshcss');
						if (logLevel >= 1)
							console.log("CSS change detected".magenta, filePath);
					} else {
						ws.send('reload');
						if (logLevel >= 1)
							console.log("File change detected".cyan, filePath);
					}
				});
			}
		},
		next: function(err, watchers) {
			if (err)
				console.error("Error watching files:".red, err);
			LiveServer.watchers = watchers;
		}
	});

	return server;
};

LiveServer.shutdown = function() {
	var watchers = LiveServer.watchers;
	if (watchers) {
		for (var i = 0; i < watchers.length; ++i)
			watchers[i].close();
	}
	var server = LiveServer.server;
	if (server)
		server.close();
};

module.exports = LiveServer;
