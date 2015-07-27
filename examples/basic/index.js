#!/usr/bin/env node
var LiveServer = require('../../lib');

var server = LiveServer.start({
	root: __dirname,
	open: !module.parent
});

module.exports = server;
