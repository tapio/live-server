var request = require('supertest');
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	mount: [[ "/mounted", path.join(__dirname, "data", "sub") ]],
	htpasswd: path.join(__dirname, "data", "htpasswd-test")
});

describe('htpasswd tets', function() {
	it('should respond with 401 since to password is set', function(done) {
		request(liveServer)
			.get('/')
			.expect(401, done);
	});

	it('should respond with 200 since correct password is set', function(done) {
		request(liveServer)
			.get('/')
			.auth("test", "test")
			.expect(200, done);
	});

});
