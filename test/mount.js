var request = require('supertest');
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	mount: [[ "/mounted", path.join(__dirname, "data", "sub") ]]
});

describe('mount tests', function() {
	it('should respond with sub.html', function(done) {
		request(liveServer)
			.get('/mounted/sub.html')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(/Subdirectory/i)
			.expect(200, done);
	});
});


