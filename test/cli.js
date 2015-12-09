var assert = require('assert');
var path = require('path');
var exec = require('child_process').execFile;
var cmd = path.join(__dirname, "..", "live-server.js");
var opts = {
	timeout: 2000,
	maxBuffer: 1024
};

describe('command line usage', function() {
	it('--version', function(done) {
		exec(cmd, [ "--version" ], opts, function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("live-server") == 0, "version not found");
			done();
		});
	});
	it('--help', function(done) {
		exec(cmd, [ "--help" ], opts, function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("Usage: live-server") == 0, "usage not found");
			done();
		});
	});
	it('--quiet', function(done) {
		exec(cmd, [ "--quiet", "--no-browser", "--test" ], opts, function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout === "", "stdout not empty");
			done();
		});
	});
	it('--port', function(done) {
		exec(cmd, [ "--port=16123", "--no-browser", "--test" ], opts, function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("Serving") == 0, "serving string not found");
			assert(stdout.indexOf("at http://127.0.0.1:16123") != -1, "port string not found");
			done();
		});
	});
	it('--host', function(done) {
		exec(cmd, [ "--host=localhost", "--no-browser", "--test" ], opts, function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("Serving") == 0, "serving string not found");
			assert(stdout.indexOf("at http://localhost:") != -1, "host string not found");
			done();
		});
	});
});
