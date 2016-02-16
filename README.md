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

This will automatically launch the default browser. When you make a change to any file, the browser will reload the page - unless it was a CSS file in which case the changes are applied without a reload.

Command line parameters:

* `--port=NUMBER` - select port to use (can also be done with PORT environment variable)
* `--host=ADDRESS` - select host address to bind to, default: 0.0.0.0 ("any address")
* `--no-browser` - suppress automatic web browser launching
* `--browser=BROWSER` - specify browser to use instead of system default
* `--quiet` - suppress logging
* `--open=PATH` - launch browser to PATH instead of server root
* `--watch=PATH` - comma-separated string of paths to exclusively watch for changes (default: watch everything)
* `--ignore=PATH` - comma-separated string of paths to ignore
* `--ignorePattern=RGXP` - Regular expression of files to ignore (ie `.*\.jade`)
* `--entry-file=PATH` - serve this file in place of missing files (useful for single page apps)
* `--mount=ROUTE:PATH` - serve the paths contents under the defined route (multiple definitions possible)
* `--wait=MILLISECONDS` - wait for all changes, before reloading
* `--help | -h` - display terse usage hint and exit
* `--version | -v` - display version and exit

Default options:

If a file `~/.live-server.json` exists it will be loaded and used as default options for live-server on the command line. See "Usage from node" for option names.


Usage from node
---------------

```javascript
var liveServer = require("live-server");

var params = {
	port: 8181, // Set the server port. Defaults to 8080.
	host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0.
	root: "/public", // Set root directory that's being server. Defaults to cwd.
	open: false, // When false, it won't load your browser by default.
	ignore: 'scss,my/templates', // comma-separated string for paths to ignore
	file: "index.html", // When set, serve this file for every 404 (useful for single-page applications)
	wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
	mount: [['/components', './node_modules']] // Mount a directory to a route.
};
liveServer.start(params);
```


Troubleshooting
---------------

Open your browser's console: there should be a message at the top stating that live reload is enabled. Note that you will need a browser that supports WebSockets. If there are errors, deal with them. If it's still not working, [file an issue](https://github.com/tapio/live-server/issues).


How it works
------------

The server is a simple node app that serves the working directory and its subdirectories. It also watches the files for changes and when that happens, it sends a message through a web socket connection to the browser instructing it to reload. In order for the client side to support this, the server injects a small piece of JavaScript code to each requested html file. This script establishes the web socket connection and listens to the reload requests. CSS files can be refreshed without a full page reload by finding the referenced stylesheets from the DOM and tricking the browser to fetch and parse them again.


Contributing
------------

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.


Version history
---------------

* v0.9.2
	- Updated most dependencies to latest versions
	- `--quiet` now silences warning about injection failure
	- Giving explicit `--watch` paths now disables adding mounted paths to watching
* v0.9.1
	- `--ignorePattern=RGXP` exclude files from watching by regexp (@psi-4ward)
	- `--watch=PATH` cli option to only watch given paths
* v0.9.0
	- `--mount=ROUTE:PATH` cli option to specify alternative routes to paths (@pmentz)
	- `--browser=BROWSER` cli option to specify browser to use (@sakiv)
	- Improved error reporting
	- Basic support for injecting the reload code to SVG files (@dotnetCarpenter, @tapio)
	- LiveServer.shutdown() function to close down the server and file watchers
	- If host parameter is given, use it for browser URL instead of resolved IP
	- Initial testing framework (@harrytruong, @evanplaice, @tapio)
* v0.8.2
	- Load initial settings from `~/.live-server.json` if exists (@mikker)
	- Allow `--port=0` to select random port (@viqueen)
	- Fix injecting when file extension is not lower case (@gusgard)
	- Fail gracefully if browser does not support WebSockets (@mattymaloney)
	- Switched to a more maintained browser opening library
* v0.8.1
	- Add `--version / -v` command line flags to display version
	- Add `--host` cli option to mirror the API parameter
	- Once again use 127.0.0.1 instead of 0.0.0.0 as the browser URL
* v0.8.0
	- Support multiple clients simultaneously (@dvv)
	- Pick a random available port if the default is in use (@oliverzy, @harrytruong)
	- Fix Chrome sometimes not applying CSS changes (@harrytruong)
	- `--ignore=PATH` cli option to not watch given server root relative paths (@richardgoater)
	- `--entry-file=PATH` cli option to specify file to use when request is not found (@izeau)
	- `--wait=MSECS` cli option to wait specified time before reloading (@leolower, @harrytruong)
* v0.7.1
	- Fix hang caused by trying to inject into fragment html files without `</body>`
	- `logLevel` parameter in library to control amount of console spam
	- `--quiet` cli option to suppress console spam
	- `--open=PATH` cli option to launch browser in specified path instead of root (@richardgoater)
	- Library's `noBrowser: true` option is deprecated in favor of `open: false`
* v0.7.0
	- API BREAKAGE: LiveServer library now takes parameters in an object
	- Add possibility to specify host to the lib
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
