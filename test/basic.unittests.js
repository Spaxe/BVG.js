
/* global describe before it */
var assert = require('better-assert');
var jsdom = require('mocha-jsdom');
var BVG = require('../bvg.js');

describe('BVG.js', function () {
  jsdom();
  var bvg;
  var container;

  before(function () {
    container = document.createElement('div');
    container.id = 'container';
  });

  it('should be able to create a container', function () {
    assert(typeof BVG === 'function');
    bvg = BVG('#container');
    // assert(bvg.isBVG === true);
  });

  it('should provide basic shape functions', function () {
    ['rect', 'ellipse', 'line'].forEach(function (f) {
      assert(typeof BVG[f] === 'function');
    });
  });
});