#!/usr/bin/env node
var LiveServer = require('../../..');

var server = LiveServer.start({
	root: __dirname,
	open: !module.parent
});

module.exports = server;
