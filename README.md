[![view on npm](http://img.shields.io/npm/v/live-server.svg)](https://www.npmjs.org/package/live-server)
[![npm module downloads per month](http://img.shields.io/npm/dm/live-server.svg)](https://www.npmjs.org/package/live-server)

Live Server
===========

This is a little development server with live reload capability. Use it for hacking your HTML/JavaScript/CSS files, but not for deploying the final site.

There are two reasons for using this:

1. AJAX requests don't work with the `file://` protocol due to security restrictions, i.e. you need a server if your site fetches content through JavaScript.
2. Having the page reload automatically after changes to files can accelerate development.

If you don't want/need the live reload, you should probably use something simpler, like the following Python-based one-liner:

	python -m SimpleHTTPServer


Installation
------------

You need node.js and npm. You should probably install this globally.

**Npm way**

	npm install -g live-server

**Manual way**

	git clone https://github.com/tapio/live-server
	cd live-server
	npm install # Local dependencies if you want to hack
	npm install -g # Install globally


Usage from command line
-----------------------

Issue the command `live-server` in your project's directory. Alternatively you can add the path to serve as a command line parameter.

This will automatically launch the default browser (you should have `index.html` present). When you make a change to any file, the browser will reload the page - unless it was a CSS file in which case the changes are applied without a reload.

You can configure the port to be used by the server by adding the `--port=<number>` runtime option when invoking live-server, or by setting the `PORT` environment variable prior to running live-server.

Use parameter `--no-browser` to suppress automatic web browser launching.

If you are developing a single-page application that uses HTML5's history API, you might enable the `--entry-point=<entry file>` option that basically redirects every not found request to this file.


Usage from node
---------------

```javascript
var liveServer = require("live-server");

var params = {
	port: 8181, // Set the server port. Defaults to 8080.
	host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0.
	root: "/public", // Set root directory that's being server. Defaults to cwd.
	noBrowser: true, // When true, it won't load your browser by default.
	file: "index.html" // When set, redirect every 404 to this file (useful for single-page applications)
};
liveServer.start(params);
```


Troubleshooting
---------------

Open your browser's console: there should be a message at the top stating that live reload is enabled. If there are errors, deal with them. You will need a browser that supports WebSockets.


How it works
------------

The server is a simple node app that serves the working directory and its subdirectories. It also watches the files for changes and when that happens, it sends a message through a web socket connection to the browser instructing it to reload. In order for the client side to support this, the server injects a small piece of JavaScript code to each requested html file. This script establishes the web socket connection and listens to the reload requests.


Version history
---------------

* master (unreleased)
	- `logLevel` parameter in library to control amount of console spam
	- `--quiet` cli option to suppress console spam
* v0.7.0
	- API BREAKAGE: LiveServer library now takes parameters in an object
	- Added possibility to specify host to the lib
	- Only inject to host page when working with web components (e.g. Polymer) (@davej)
	- Open browser to 127.0.0.1, as 0.0.0.0 has issues
	- `--no-browser` command line flag to suppress browser launch
	- `--help` command line flag to display usage
* v0.6.4
	- Allow specifying port from the command line: `live-server --port=3000` (@Pomax)
	- Don't inject script as the first thing so that DOCTYPE remains valid (@wmira)
	- Be more explicit with listening to all interfaces (@inadarei)
* v0.6.3
	- Fix multiple _cacheOverride parameters polluting css requests
	- Don't create global variables in the injected script
* v0.6.2
	- Fix a deprecation warning from `send`
* v0.6.1
	- Republish to fix npm troubles
* v0.6.0
	- Support for using as node library (@dpgraham)
* v0.5.0
	- Watching was broken with new versions of `watchr` > 2.3.3
	- Added some logging to console
* v0.4.0
	- Allow specifying directory to serve from command line
* v0.3.0
	- Directory listings
* v0.2.0
	- On-the-fly CSS refresh (no page reload)
	- Refactoring
* v0.1.1
	- Documentation and meta tweaks
* v0.1.0
	- Initial release


License
-------

Uses MIT licensed code from [Connect](https://github.com/senchalabs/connect/) and  [Roots](https://github.com/jenius/roots).

(MIT License)

Copyright (c) 2012 Tapio Vierros

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
