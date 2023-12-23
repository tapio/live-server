var request = require("supertest");
var path = require("path");
var MeldServer1 = require("..").start({
  root: path.join(__dirname, "data"),
  port: 0,
  open: false,
  middleware: [
    function setStatus(req, res, next) {
      res.statusCode = 201;
      next();
    },
  ],
});
var MeldServer2 = require("..").start({
  root: path.join(__dirname, "data"),
  port: 0,
  open: false,
  middleware: ["example"],
});
var MeldServer3 = require("..").start({
  root: path.join(__dirname, "data"),
  port: 0,
  open: false,
  middleware: [path.join(__dirname, "data", "middleware.js")],
});

describe("middleware tests", function () {
  it("should respond with middleware function's status code", function (done) {
    request(MeldServer1).get("/").expect(201, done);
  });
  it("should respond with built-in middleware's status code", function (done) {
    request(MeldServer2).get("/").expect(202, done);
  });
  it("should respond with external middleware's status code", function (done) {
    request(MeldServer3).get("/").expect(203, done);
  });
});
