[![view on npm](http://img.shields.io/npm/v/jspm-server.svg)](https://www.npmjs.org/package/jspm-server)
[![npm module downloads per month](http://img.shields.io/npm/dm/jspm-server.svg)](https://www.npmjs.org/package/jspm-server)

To dev on this:
```
watchify injected.src.js -t babelify --outfile injected.js
```

JSPM Server
===========

This is a little development server for devving on JSPM sites. It's based on (and owes 99% of its smarts) to @tapio's excellent [live-server](https://github.com/tapio/live-server).

If you don't need JSPM stuff, use live-server, and if you don't need live-reloading at all, use [http-server](https://www.npmjs.com/package/http-server) or `python -m SimpleHTTPServer` 


Installation
------------

You need node.js and npm. You should probably install this globally.

**Npm way**

	npm install -g jspm-server

Usage from command line
-----------------------

Issue the command `jspm-server` in your project's directory. Alternatively you can add the path to serve as a command line parameter.

You can configure the port to be used by the server by adding the `--port=<number>` runtime option when invoking jspm-server, or by setting the `PORT` environment variable prior to running jspm-server.

Additional parameters:

* `--no-browser` - suppress automatic web browser launching
* `--quiet` - suppress logging
* `--open=PATH` - launch browser to PATH instead of server root

How it works
------------

This is a variant of `live-server` that uses a payload of [SystemJS](https://github.com/systemjs/systemjs)-aware hooks, and looks for plugins that export a `hotReload` function. It then cache-busts the resource and `System.import`s it. The logic all lives in [ChangeHandler](https://github.com/geelen/jspm-server/blob/master/lib/change-handler.js). At the moment, there are two plugins that support live-reloading, and they're mega hacks (both of them reload as a side-effect, and aren't properly wired into the SystemJS loader). They are:

- [postcss](https://github.com/geelen/plugin-postcss)
- [jsx](https://github.com/geelen/typeslab/blob/master/src/jsx.js)


Version history
---------------

* v0.0.1
	- Forked from v0.7.1 of [live-server](https://github.com/tapio/live-server)


License
-------

Uses MIT licensed code from [live-server](https://github.com/tapio/live-server), [Connect](https://github.com/senchalabs/connect/) and  [Roots](https://github.com/jenius/roots).

(MIT License)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
