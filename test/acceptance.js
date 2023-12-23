var request = require("supertest");
var path = require("path");
var MeldServer = require("..").start({
  root: path.join(__dirname, "data"),
  port: 0,
  open: false,
});

describe("basic functional tests", function () {
  it("should respond with index.html", function (done) {
    request(MeldServer)
      .get("/")
      .expect("Content-Type", "text/html; charset=UTF-8")
      .expect(/hello world/i)
      .expect(200, done);
  });
  it("should have injected script", function (done) {
    request(MeldServer)
      .get("/")
      .expect("Content-Type", "text/html; charset=UTF-8")
      .expect(/<script [^]+?live reload enabled[^]+?<\/script>/i)
      .expect(200, done);
  });
  it("should inject script when tags are in CAPS", function (done) {
    request(MeldServer)
      .get("/index-caps.htm")
      .expect("Content-Type", "text/html; charset=UTF-8")
      .expect(/<script [^]+?live reload enabled[^]+?<\/script>/i)
      .expect(200, done);
  });
  it("should inject to <head> when no <body>", function (done) {
    request(MeldServer)
      .get("/index-head.html")
      .expect("Content-Type", "text/html; charset=UTF-8")
      .expect(/<script [^]+?live reload enabled[^]+?<\/script>/i)
      .expect(200, done);
  });
  it("should inject also svg files", function (done) {
    request(MeldServer)
      .get("/test.svg")
      .expect("Content-Type", "image/svg+xml")
      .expect(function (res) {
        if (res.body.toString().indexOf("Live reload enabled") == -1)
          throw new Error("injected code not found");
      })
      .expect(200, done);
  });
  it("should not inject html fragments", function (done) {
    request(MeldServer)
      .get("/fragment.html")
      .expect("Content-Type", "text/html; charset=UTF-8")
      .expect(function (res) {
        if (res.text.toString().indexOf("Live reload enabled") > -1)
          throw new Error("injected code should not be found");
      })
      .expect(200, done);
  });
  xit("should have WebSocket connection", function (done) {
    done(); // todo
  });
  xit("should reload on page change", function (done) {
    done(); // todo
  });
  xit("should reload (without refreshing) on css change", function (done) {
    done(); // todo
  });
});
