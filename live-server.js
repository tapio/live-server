#!/usr/bin/env node
var liveServer = require("./index");
var path = require('path');

var opts = {
	port: process.env.PORT,
	open: true,
	logLevel: 2
};

for (var i = process.argv.length-1; i >= 2; --i) {
	var arg = process.argv[i];
	if (arg.indexOf("--port=") > -1) {
		var portString = arg.substring(7);
		var portNumber = parseInt(portString, 10);
		if (portNumber == portString) {
			opts.port = portNumber;
			process.argv.splice(i, 1);
		}
	}
	else if (arg.indexOf("--open=") > -1) {
		var open = arg.substring(7);
		if (open.indexOf('/') != 0) {
			open = '/' + open;
		}
		opts.open = open;
		process.argv.splice(i, 1);
	}
	else if (arg.indexOf("--ignore=") > -1) {
		var cwd = process.cwd();
		opts.ignore =
			arg.substring(9).
				split(",").
				map(function (relativePath) {
					return path.join(cwd, relativePath);
				});
		process.argv.splice(i, 1);
	}
	else if (arg == "--no-browser") {
		opts.open = false;
		process.argv.splice(i, 1);
	}
	else if (arg.indexOf("--entry-file=") > -1) {
		var file = arg.substring(13);
		if (file.length) {
			opts.file = file;
			process.argv.splice(i, 1);
		}
	}
	else if (arg == "--quiet" || arg == "-q") {
		opts.logLevel = 0;
		process.argv.splice(i, 1);
	}
	else if (arg.indexOf("--wait=") > -1) {
		var waitString = arg.substring(7);
		var waitNumber = parseInt(waitString, 10);
		if (waitNumber == waitString) {
			opts.wait = waitNumber;
			process.argv.splice(i, 1);
		}
	} else if ( arg.indexOf("--proxyPath=") > -1 ) {
		var proxyPath =  arg.substring(12);
		opts.proxyPath = proxyPath;
		process.argv.splice(i, 1);
	}
	else if (arg == "--help" || arg == "-h") {
		console.log('Usage: live-server [-h|--help] [-q|--quiet] [--port=PORT] [--open=PATH] [--no-browser] [--ignore=PATH] [--entry-file=PATH] [--wait=MILLISECONDS] [PATH]');
		process.exit();
	}
}

if (process.argv[2]) {
	process.chdir(process.argv[2]);
}

liveServer.start(opts);
