#!/usr/bin/env node
var liveServer = require("./index");

var port = process.env.PORT;

process.argv.forEach(function(v,idx) {
	if (v.indexOf("--port=") >- 1) {
		var portString = v.substring(7); 
        var portNumber = parseInt(portString, 10);
		if (portNumber == portString) {
			port = portNumber;
    		process.argv.splice(idx,1);
    	}
	}
});

if (process.argv[2])
	process.chdir(process.argv[2]);

liveServer.start(port);
