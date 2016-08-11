var response = 'middleware added';
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, 'data'),
	port: 0,
	open: false,
	middleware: [
		function middleware() {
			return response;
		}
	]
});

describe('middleware tests', function() {
	it('should add middleware to stack', function(done) {
		var middlewareStack = liveServer._events.request.stack;
		var middlewareResponse = middlewareStack[middlewareStack.length - 1].handle();

		if (middlewareResponse === response) {
			done();
		} else {
			throw new Error('middleware missing');
		}

	});
});
