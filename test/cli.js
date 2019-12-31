var assert = require('assert');
var path = require('path');
var exec = require('child_process').execFile;
var cmd = path.join(__dirname, "..", "live-server.js");
var opts = {
	timeout: 2000,
	maxBuffer: 1024
};
function exec_test(args, callback) {
	if (process.platform === 'win32')
		exec(process.execPath, [ cmd ].concat(args), opts, callback);
	else
		exec(cmd, args, opts, callback);
}

describe('command line usage', function() {
	it('--version', function(done) {
		exec_test([ "--version" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.includes("live-server"), "version not found");
			done();
		});
	});
	it('--help', function(done) {
		exec_test([ "--help" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.includes("Usage: live-server"), "usage not found");
			done();
		});
	});
	it('--quiet', function(done) {
		exec_test([ "--quiet", "--no-browser", "--test" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout === "", "stdout not empty");
			done();
		});
	});
	it('--port', function(done) {
		exec_test([ "--port=16123", "--no-browser", "--test" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.includes("Serving"), "serving string not found");
			assert(stdout.includes("at http://127.0.0.1:16123"), "port string not found");
			done();
		});
	});
	it('--host', function(done) {
		exec_test([ "--host=localhost", "--no-browser", "--test" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.includes("Serving"), "serving string not found");
			assert(stdout.includes("at http://localhost:"), "host string not found");
			done();
		});
	});
	it('--htpasswd', function(done) {
		exec_test(
			[ "--htpasswd=" + path.join(__dirname, "data/htpasswd-test"),
				"--no-browser",
				"--test"
			], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.includes("Serving"), "serving string not found");
			done();
		});
	});
});
