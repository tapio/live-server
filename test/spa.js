var request = require('supertest');
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	spa: true
});

describe('spa tests', function() {
	describe('when the URL has a file ext', function() {
		it('does not mutate the request', function(done) {
			request(liveServer)
				.get('/style.css')
				.expect(/color: red/i)
				.expect(200, done);
		});
	});

	describe('when the URL does not have a file ext', function() {
		it('does mutate the request', function(done) {
			request(liveServer)
				.get('/123')
				.expect('Location', '/#/123')
				.expect(302, done);
		});
	});
});


