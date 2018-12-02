var request = require('supertest');
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	base: "alias"
});

describe('base tests', function() {
	it('should respond with sub.html', function(done) {
		request(liveServer)
			.get('/alias/sub/sub.html')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(/Subdirectory/i)
			.expect(200, done);
	});
	it('should respond with style.css', function(done) {
		request(liveServer)
			.get('/alias/style.css')
			.expect('Content-Type', 'text/css; charset=UTF-8')
			.expect(/color/i)
			.expect(200, done);
	});
	it('should respond with 404 since we must use base', function(done) {
		request(liveServer)
			.get('/')
			.expect(404, done);
	});
});
