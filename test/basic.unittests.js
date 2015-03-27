var requirejs = require('requirejs');
var assert = require('better-assert');
var bvg = require('../bvg.js')

describe('BVG', function () {
  it('should be there', function () {
    assert(typeof bvg === 'function');
  });
  it('should offer create()', function () {
    assert(typeof bvg.create === 'function');
  });
  it('should provide basic shape functions', function () {
    ['rect', 'ellipse', 'line'].forEach(function (f) {
      assert(typeof bvg[f] === 'function');
    });
  });
});