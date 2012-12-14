#!/usr/bin/env node
var connect = require('connect'),
	colors = require('colors'),
	WebSocket = require('faye-websocket'),
	path = require('path'),
	url = require('url'),
	http = require('http'),
	send = require('send'),
	open = require('open'),
	watchr = require('watchr'),
	ws;

function escape(html){
	return String(html)
		.replace(/&(?!\w+;)/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
};

// Based on connect.static(), but streamlined and with added code injecter
function static(root) {
	return function static(req, res, next) {
		if ('GET' != req.method && 'HEAD' != req.method) return next();
		var reqpath = url.parse(req.url).pathname;

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
			if (x == "" || x == ".html" || x == ".htm" || x == ".xhtml" || x == ".php") {
				var code = "<script>\n(function() {\n" +
					"protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';\n" +
					"address = protocol + window.location.host + window.location.pathname + '/ws';\n" +
					"socket = new WebSocket(address);\n" +
					"socket.onmessage = function(msg) { msg.data == 'reload' && window.location.reload() };\n" +
					"console.log('Live reload enabled.');\n" +
				"})();\n</script>";
				// We need to modify the length given to browser
				var len = code.length + res.getHeader('Content-Length');
				res.setHeader('Content-Length', len);
				// Write the injected code
				res.write(code);
			}
		}

		send(req, reqpath)
			.root(root)
			.on('error', error)
			.on('stream', inject)
			.on('directory', directory)
			.pipe(res);
	};
};

function start(port, directory) {
	port = port || 8080;
	directory = directory || process.cwd();
	// Setup a web server
	var app = connect()
		.use(static(directory)) // Custom static server
		.use(connect.logger('dev'));
	var server = http.createServer(app).listen(port);
	// WebSocket
	server.addListener('upgrade', function(request, socket, head) {
		ws = new WebSocket(request, socket, head);
		ws.onopen = function() { ws.send('connected'); }
	});
	// Setup file watcher
	watchr.watch({
		path: directory,
		ignorePatterns: true,
		listener: function(eventName, filePath, fileCurrentStat, filePreviousStat){
			ws && ws.send('reload');
		}
	});
	// Output
	console.log(('Serving "' + directory + '" at http://localhost:' + port).green);
	// Launch browser
	open('http://localhost:' + port);
}

start(process.env.PORT);
