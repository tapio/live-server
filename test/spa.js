var request = require('supertest');
var path = require('path');
var LiveServer = require('..');

var liveServer;

describe('spa tests', function() {
	afterEach(function() {
		LiveServer.shutdown();
	});

	describe('spaIgnoreAssets', function() {
		describe('when spaIgnoreAssets is set to true', function() {
			beforeEach(function() {
				liveServer = LiveServer.start({
					root: path.join(__dirname, "data"),
					port: 0,
					open: false,
					spa: true,
					spaIgnoreAssets: true
				});
			});

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

		describe('when spaIgnoreAssets is a function', function() {
			beforeEach(function() {
				liveServer = LiveServer.start({
					root: path.join(__dirname, "data"),
					port: 0,
					open: false,
					spa: true,
					spaIgnoreAssets: function(req) {
						return req.url.indexOf('style.css') > -1;
					}
				});
			});

			it('does not mutate the request when the fn returns true', function(done) {
				request(liveServer)
					.get('/style.css')
					.expect(/color: red/i)
					.expect(200, done);
			});

			it('does mutate when the request returns false', function(done) {
				request(liveServer)
					.get('/123')
					.expect('Location', '/#/123')
					.expect(302, done);
			});
		});
	});
});


