var liveServer = require('../../examples/basic');
var request = require('supertest');

describe('basic usage example', function(){
	describe('[GET /]', function(){
		it('should respond with index.html', function(done){
			request(liveServer)
				.get('/')
				.expect('Content-Type', 'text/html; charset=UTF-8')
				.expect(/hello world/i)
				.expect(200, done);
		});
		it('should have injected script', function(done){
			request(liveServer)
				.get('/')
				.expect('Content-Type', 'text/html; charset=UTF-8')
				.expect(/<script>[^]+?live reload enabled[^]+?<\/script>/i)
				.expect(200, done);
		});
		xit('should have WebSocket connection', function(done){
			done(); // todo
		});
		xit('should reload on page change', function(done){
			done(); // todo
		});
	});
});
