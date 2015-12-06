var assert = require('assert');
var path = require('path');
var exec = require('child_process').execFile;
var cmd = path.join(__dirname, "..", "live-server.js");
var opts = {
	timeout: 1000,
	maxBuffer: 1024
};

describe('command line usage', function() {
	it('--version', function(done) {
		exec(cmd, [ "--version" ], opts, function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("live-server") == 0);
			done();
		});
	});
	it('--help', function(done) {
		exec(cmd, [ "--help" ], opts, function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("Usage: live-server") == 0);
			done();
		});
	});
});
