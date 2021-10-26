var request = require('supertest');
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	isolated: true
});

describe('isolated tests', function() {
	it('should respond with header `Cross-Origin-Opener-Policy` valued `same-origin`', function(done) {
		request(liveServer)
            .get('/')
			.expect('Cross-Origin-Opener-Policy', 'same-origin')
			.expect(/Hello world/i)
			.expect(200, done);
	});
	it('should respond with header `Cross-Origin-Embedder-Policy` valued `require-corp`', function(done) {
		request(liveServer)
            .get('/')
            .expect('Cross-Origin-Embedder-Policy', 'require-corp')
			.expect(/Hello world/i)
			.expect(200, done);
	});
});
