var request = require('supertest');
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, 'data'),
	port: 0,
	open: false,
	middleware: [
		function setStatus(req, res, next) {
			res.statusCode = 201;
			next();
		}
	]
});

describe('middleware tests', function() {
	it("should respond with middleware's status code", function(done) {
		request(liveServer)
			.get('/')
			.expect(201, done);
	});
});
