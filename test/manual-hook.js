var request = require('supertest');
var path = require('path');
var liveServer1 = require('..').start({
	root: path.join(__dirname, 'data'),
	port: 0,
	open: false,
	manualHook: '/manual-reload'
});

describe('manual-hook tests', function() {
	it("should respond with static server status code", function(done) {
		request(liveServer1)
			.get('/')
			.expect(200, done);
	});
	it("should respond with middleware function's status code", function(done) {
		request(liveServer1)
			.get('/manual-reload')
			.expect(201, done);
	});
});
