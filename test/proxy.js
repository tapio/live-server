var request = require("supertest");
var path = require("path");
var port = 9000;

describe("proxy tests", function () {
	it("should respond with proxied content", function (done) {
		require("..").start({
			root: path.join(__dirname, "data"),
			port: port,
			open: false,
			callback: function () {
				var server2 = require("..").start({
					root: path.join(__dirname, "data"),
					port: 0,
					open: false,
					proxy: [["/server1", "http://127.0.0.1:" + port]],
					callback: function () {
						request(server2)
							.get("/server1/index.html")
							.expect(/Hello world/i)
							.expect(200, done);
					},
				});
			},
		});
	});
});
