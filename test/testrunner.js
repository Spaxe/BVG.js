/* global mocha: true, mochaPhantomJS: true */
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([], function () {
  require([
    'basic.unittests.js'
  ],
  function(require) {
    if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
    else { mocha.run(); }
  });
});