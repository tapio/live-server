#!/usr/bin/env node
var liveServer = require("./index");

if (process.argv[2])
	process.chdir(process.argv[2]);

liveServer.start(process.env.PORT);
