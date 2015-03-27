/* global mocha: true, define: true, describe: true, it: true, before: true, after: true */
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['../bvg'], function (BVG) {

  describe('BVG.js', function () {
    var bvg;
    var dummy;
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
      bvg.parentNode.should.equal(container);
      bvg.should.be.instanceof(SVGElement);
      dummy = BVG.create(container);
      dummy.isBVG.should.equal(true);
      dummy.parentNode.should.equal(container);
      BVG.create.bind(BVG, '#not-container').should.Throw(TypeError);
    });

    it('should be able to be removed', function () {
      var parent = dummy.parentNode;
      parent.should.equal(container);
      dummy.remove();
      container.should.not.equal(dummy.parentNode);
    });

    it('should provide basic shape functions', function () {
      ['rect', 'ellipse', 'line'].forEach(function (f) {
        BVG[f].should.be.a('function');
        var shape = BVG[f](10, 20, 30, 40);
        shape.should.be.instanceof(SVGElement);
      });
      BVG.polyline([
        [10, 20], [30, 40]
      ]).should.be.instanceof(SVGElement);
    });

    it('should provide access to data, strokes and fills', function () {
      var data = {
        x: 10,
        y: 20,
        width: 30,
        height: 40
      };
      var shape = BVG.rect(data);
      shape.data('x').should.equal(10);
      shape.data().should.equal(data);
      shape.data('y', 50);
      shape.data('y').should.equal(50);

      var c = [255, 30, 50, 1]
      shape.stroke(c);
      shape.stroke().should.eql(c);
      shape.stroke(255, 20, 50);
      shape.stroke().should.not.eql(c);
      shape.stroke(255, 30, 50, 1);
      shape.stroke().should.eql(c);
      shape.stroke(255);
      shape.stroke().should.eql([255, 255, 255, 1]);
      shape.noStroke();
      should.not.exist(shape.stroke());

      shape.fill(c);
      shape.fill().should.eql(c);
      shape.fill(255, 20, 50);
      shape.fill().should.not.eql(c);
      shape.fill(255, 30, 50, 1);
      shape.fill().should.eql(c);
      shape.fill(255);
      shape.fill().should.eql([255, 255, 255, 1]);
      shape.noFill();
      should.not.exist(shape.fill());
    });
  });

});
