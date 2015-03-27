/* global mocha: true, define: true, describe: true, it: true, before: true, after: true */
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['../bvg'], function (BVG) {

  describe('BVG.js', function () {
    var bvg;
    var container;

    before(function () {
      container = document.createElement('div');
      container.id = 'container';
      document.body.appendChild(container);
    });

    it('should be able to create a container', function () {
      BVG.should.be.a('function');
      BVG.create.should.be.a('function');
      bvg = BVG.create('#container');
      bvg.isBVG.should.equal(true);
      var dummy = BVG.create(container);
      dummy.isBVG.should.equal(true);
      container.removeChild(dummy);
    });

    it('should provide basic shape functions', function () {
      ['rect', 'ellipse', 'line'].forEach(function (f) {
        BVG[f].should.be.a('function');
      });
    });
  });

});
