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
 * Start a live server at the given port and directory
 * @param port {number} Port number (default 8080)
 * @param directory {string} Path to root directory (default to cwd)
 * @param suppressBrowserLaunch
 */
LiveServer.start = function(port, directory, suppressBrowserLaunch) {
	port = port || 8080;
	directory = directory || process.cwd();

	// Setup a web server
	var app = connect()
		.use(staticServer(directory)) // Custom static server
		.use(connect.directory(directory, { icons: true }))
		.use(connect.logger('dev'));
	var server = http.createServer(app).listen(port);
	// WebSocket
	server.addListener('upgrade', function(request, socket, head) {
		ws = new WebSocket(request, socket, head);
		ws.onopen = function() { ws.send('connected'); };
	});
	// Setup file watcher
	watchr.watch({
		path: directory,
		ignoreCommonPatterns: true,
		ignoreHiddenFiles: true,
		preferredMethods: [ 'watchFile', 'watch' ],
		interval: 1407,
		listeners: {
			error: function(err) {
				console.log("ERROR:".red , err)
			},
			change: function(eventName, filePath, fileCurrentStat, filePreviousStat) {
				if (!ws) return;
				if (path.extname(filePath) == ".css") {
					ws.send('refreshcss');
					console.log("CSS change detected".magenta);
				} else {
					ws.send('reload');
					console.log("File change detected".cyan);
				}
			}
		}
	});
	// Output
	var browserURL = "http://127.0.0.1:" + port;
	console.log(('Serving "' + directory + '" at ' + browserURL).green);

	// Launch browser
	if(!suppressBrowserLaunch)
		open(browserURL);
}

module.exports = LiveServer;
