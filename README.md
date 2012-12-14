Live Server
===========

This is a little development server with live reload capability. Use it for hacking your HTML/JavaScript/CSS files, but not for deploying the final site.

There are two reasons for using this:

1. AJAX requests don't work with the `file://` protocol due to security restrictions, i.e. you need a server if your site fetches content through JavaScript.
2. Having the page reload automatically after changes to files can accelerate development.

If you don't want/need the live reload, you should probably use something simpler, like the following Python-based one-liner:

	python -m SimpleHTTPServer


Preparations
------------

You need node.js and npm. You should probably install this globally.


Usage
-----

Issue the command `live-server.js` in your project's directory.

This will automatically launch the default browser (you should have `index.html` present). When you make a change to any file, the browser will reload the page.

You can configure the port to be used by setting `PORT` environment variable prior to launching the server.


Troubleshooting
---------------

Open your browser's console: there should be a message at the top stating that live reload is enabled. If there are errors, deal with them. You will need a browser that supports WebSockets.


How it works
------------

The server is a simple node app that serves the working directory and its subdirectories. It also watches the files for changes and when that happens, it sends a message through a web socket connection to the browser instructing it to reload. In order for the client side to support this, the server injects a small piece of JavaScript code to each requested html and php files. This script establishes the web socket connection and listens to the reload requests.

