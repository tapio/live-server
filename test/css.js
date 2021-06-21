var assert = require('assert');
var fs = require('fs');
var jsdom = require('jsdom');
var path = require('path');
var request = require('supertest');
var liveServerRoot = path.join(__dirname, 'data');
var liveServer = require('..').start({
	root: liveServerRoot,
	port: 0,
	open: false
});
var JSDOM = jsdom.JSDOM;
var readFile = fs.readFileSync;
var updateFile = fs.writeFileSync;
var loadDOM = function(res){
	return new JSDOM(res, {
		// Enable subresource (<link>, <iframe>, ...) loading.
		resources: 'usable',
		// Allow executing the injected script.
		runScripts: 'dangerously'
	});;
};

describe('css refreshing', function(){
	var cssFilepath = path.join(liveServerRoot, 'style.css');
	var originalStyles = readFile(cssFilepath);

	afterEach(function(){
		updateFile(cssFilepath, originalStyles);
	});

	it('should refresh css contained within the <body> element', function(done){
		request(liveServer)
			.get('/css-refreshing-body.html')
			.expect(200)
			.then(function(res) {
				/**
				 * For some reason, the following won't work:
				 *
				 * var dom = loadDOM(res.text);
				 * var querySelectorStyles = function(dom, selector){
				 *     var window = dom.window;
				 *     var document = window.document;
				 *     var element = document.querySelector(selector);
				 *     var styles = window.getComputedStyle(element);
				 *
				 *     return styles;
				 * };
				 *
				 * updateFile(cssFilepath, 'h1 { color: blue; }');
				 * assert(querySelectorStyles(dom, 'h1').color, 'blue');
				 *
				 * Not even using a timeout of 5s before the assertion
				 * (after updating this.timeout(10e3), of course).
				 *
				 * It seems that the WebSocket's event is emitted once this
				 * test finishes because the "CSS change detected" message
				 * is logged afterwards.
				 *
				 * Anyway... the following hack makes the WebSocket's
				 * "onmessage" listener available on NodeJS to emulate
				 * the event emitted by LiveServer,
				 * and creates a property on the updated <link> element
				 * to detect that the injected script was called on that element.
				 *
				 * @TODO Test properly.
				 */
				var domString = res.text
					.replace(/(socket\.onmessage)/, 'window.sendWebSocketMessage = $1')
					.replace(/(\.appendChild\(elem\);)/, '$1 elem.refreshed = true;');
				var dom = loadDOM(domString);
				var window = dom.window;
				var document = window.document;

				updateFile(cssFilepath, 'h1 { color: blue; }');
				window.sendWebSocketMessage({
					data: 'refreshcss'
				});

				assert(document.querySelector('link').refreshed, true);
			})
			.then(done)
			.catch(done);
	});
});
