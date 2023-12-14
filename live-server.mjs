import assign from "object-assign";
import path from "path";
import liveServer from "./index.js";

const opts = {
  host: process.env.IP,
  port: process.env.PORT,
  open: true,
  mount: [],
  proxy: [],
  middleware: [],
  logLevel: 2,
};

const homeDir =
  process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];
const configPath = path.join(homeDir, ".live-server.json");

if (fs.existsSync(configPath)) {
  const userConfig = fs.readFileSync(configPath, "utf8");
  assign(opts, JSON.parse(userConfig));
  if (opts.ignorePattern) opts.ignorePattern = new RegExp(opts.ignorePattern);
}

for (let i = process.argv.length - 1; i >= 2; --i) {
  const arg = process.argv[i];
  if (arg.startsWith("--port=")) {
    const portString = arg.slice(7);
    const portNumber = parseInt(portString, 10);
    if (portNumber === +portString) {
      opts.port = portNumber;
      process.argv.splice(i, 1);
    }
  }
  // ... (Other arguments processed similarly)
  else if (arg === "--test") {
    // Hidden param for tests to exit automatically
    setTimeout(liveServer.shutdown, 500);
    process.argv.splice(i, 1);
  } // ... (Continuing from the previous code)
  else if (arg.startsWith("--host=")) {
    opts.host = arg.slice(7);
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--open=")) {
    let open = arg.slice(7);
    if (!open.startsWith("/")) {
      open = "/" + open;
    }
    if (typeof opts.open === "boolean" || typeof opts.open === "string") {
      opts.open = [opts.open, open];
    } else if (Array.isArray(opts.open)) {
      opts.open.push(open);
    }
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--watch=")) {
    opts.watch = arg.slice(8).split(",");
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--ignore=")) {
    opts.ignore = arg.slice(9).split(",");
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--ignorePattern=")) {
    opts.ignorePattern = new RegExp(arg.slice(16));
    process.argv.splice(i, 1);
  } else if (arg === "--no-css-inject") {
    opts.noCssInject = true;
    process.argv.splice(i, 1);
  } else if (arg === "--no-browser") {
    opts.open = false;
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--browser=")) {
    opts.browser = arg.slice(10).split(",");
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--entry-file=")) {
    const file = arg.slice(13);
    if (file) {
      opts.file = file;
      process.argv.splice(i, 1);
    }
  } else if (arg === "--spa") {
    opts.middleware.push("spa");
    process.argv.splice(i, 1);
  } else if (arg === "--quiet" || arg === "-q") {
    opts.logLevel = 0;
    process.argv.splice(i, 1);
  } else if (arg === "--verbose" || arg === "-V") {
    opts.logLevel = 3;
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--mount=")) {
    const match = arg.slice(8).match(/([^:]+):(.+)$/);
    if (match) {
      match[2] = path.resolve(process.cwd(), match[2]);
      opts.mount.push([match[1], match[2]]);
    }
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--wait=")) {
    const waitString = arg.slice(7);
    const waitNumber = parseInt(waitString, 10);
    if (waitNumber === +waitString) {
      opts.wait = waitNumber;
      process.argv.splice(i, 1);
    }
  } else if (arg === "--version" || arg === "-v") {
    import("./package.json").then((packageJson) => {
      console.log(packageJson.name, packageJson.version);
    });
    process.exit();
  } else if (arg.startsWith("--htpasswd=")) {
    opts.htpasswd = arg.slice(11);
    process.argv.splice(i, 1);
  } else if (arg === "--cors") {
    opts.cors = true;
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--https=")) {
    opts.https = arg.slice(8);
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--https-module=")) {
    opts.httpsModule = arg.slice(15);
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--proxy=")) {
    const match = arg.slice(8).match(/([^:]+):(.+)$/);
    if (match) {
      opts.proxy.push([match[1], match[2]]);
    }
    process.argv.splice(i, 1);
  } else if (arg.startsWith("--middleware=")) {
    opts.middleware.push(arg.slice(13));
    process.argv.splice(i, 1);
  } else if (arg === "--help" || arg === "-h") {
    console.log(
      "Usage: live-server [-v|--version] [-h|--help] [-q|--quiet] [--port=PORT] [--host=HOST] [--open=PATH] [--no-browser] [--browser=BROWSER] [--ignore=PATH] [--ignorePattern=RGXP] [--no-css-inject] [--entry-file=PATH] [--spa] [--mount=ROUTE:PATH] [--wait=MILLISECONDS] [--htpasswd=PATH] [--cors] [--https=PATH] [--https-module=MODULE_NAME] [--proxy=PATH] [PATH]",
    );
    process.exit();
  }

  // ... (The rest of the code)
}

// Patch paths
const dir = (opts.root = process.argv[2] || "");

if (opts.watch) {
  opts.watch = opts.watch.map((relativePath) => path.join(dir, relativePath));
}
if (opts.ignore) {
  opts.ignore = opts.ignore.map((relativePath) => path.join(dir, relativePath));
}

liveServer.start(opts);
