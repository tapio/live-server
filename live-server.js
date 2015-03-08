#!/usr/bin/env node
var liveServer = require("./index");

var opts = {
	port: process.env.PORT,
	noBrowser: false,
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
	} else if (arg == "--no-browser") {
		opts.noBrowser = true;
		process.argv.splice(i, 1);
	} else if (arg == "--quiet" || arg == "-q") {
		opts.logLevel = 0;
		process.argv.splice(i, 1);
	} else if (arg == "--help" || arg == "-h") {
		console.log('Usage: live-server [-h|--help] [--port=PORT] [--no-browser] [PATH]');
		process.exit();
	}
}

if (process.argv[2])
	process.chdir(process.argv[2]);

liveServer.start(opts);
