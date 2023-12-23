var request = require("supertest");
var path = require("path");
var MeldServer = require("..").start({
  root: path.join(__dirname, "data"),
  port: 0,
  open: false,
  htpasswd: path.join(__dirname, "data", "htpasswd-test"),
});

describe("htpasswd tests", function () {
  it("should respond with 401 since no password is given", function (done) {
    request(MeldServer).get("/").expect(401, done);
  });
  it("should respond with 401 since wrong password is given", function (done) {
    request(MeldServer)
      .get("/")
      .auth("test", "not-real-password")
      .expect(401, done);
  });
  it("should respond with 200 since correct password is given", function (done) {
    request(MeldServer).get("/").auth("test", "test").expect(200, done);
  });
});
