var request = require('supertest');
var path = require('path');
var port = 40200;
var via = 'test server';
var server1 = require('..').start({
	root: path.join(__dirname, "data"),
	port: port,
	open: false,
	middleware: [ path.join(__dirname, 'data', 'middleware-header.js') ]
});
var server2 = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	proxy: [
		["/server1", "http://localhost:" + port]
	]
});
var server3 = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	proxy: [
		["/server1", "http://localhost:" + port]
	],
	proxyOpts: {
		preserveHost: false,
		via: via
	}
});

describe('proxy tests', function() {
	it('should respond with proxied content', function(done) {
		request(server2)
			.get('/server1/index.html')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(/Hello world/i)
			.expect(200, done);
	});
	it('should change proxy options', function(done) {
		request(server3)
			.get('/server1/index.html')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect('x-host-received', "localhost:" + port)
			.expect('x-via-received', '1.1 ' + via)
			.expect(/Hello world/i)
			.expect(200, done);
	});
});


