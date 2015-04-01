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
      bvg.should.be.instanceof(BVG);
      bvg.tag.parentNode.should.equal(container);
      bvg.tag.should.be.instanceof(SVGElement);
      BVG.create.bind(BVG, '#not-container').should.Throw(TypeError);
    });

    it('should be able to be removed', function () {
      dummy = BVG.create(container);
      var parent = dummy.tag.parentNode;
      parent.should.equal(container);
      dummy.remove();
      container.should.not.equal(dummy.tag.parentNode);
    });

    it('should provide basic shape functions', function () {
      ['rect', 'ellipse', 'line'].forEach(function (f) {
        BVG[f].should.be.a('function');
        var shape = BVG[f](10, 20, 30, 40);
        shape.tag.should.be.instanceof(SVGElement);
      });
      var polyline = BVG.polyline([
        [10, 20], [30, 40]
      ]);
      polyline.tag.should.be.instanceof(SVGElement);
      polyline.data('points').should.eql([[10, 20], [30, 40]]);
      var polygon = BVG.polygon([
        [100, 20], [20, 70], [50, 60]
      ]);
      polygon.tag.should.be.instanceof(SVGElement);
      polygon.data('points').should.eql([[100, 20], [20, 70], [50, 60]]);
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

      var c = [255, 30, 50, 1];
      shape.stroke(c);
      shape.stroke().should.eql(c);
      shape.stroke(255, 20, 50);
      shape.stroke().should.not.eql(c);
      shape.stroke(255, 30, 50, 1);
      shape.stroke().should.eql(c);
      shape.stroke(255);
      shape.stroke().should.eql([255, 255, 255, 1]);
      shape.noStroke();
      shape.stroke().should.eql([0, 0, 0, 0]);

      shape.fill(c);
      shape.fill().should.eql(c);
      shape.fill(255, 20, 50);
      shape.fill().should.not.eql(c);
      shape.fill(255, 30, 50, 1);
      shape.fill().should.eql(c);
      shape.fill(255);
      shape.fill().should.eql([255, 255, 255, 1]);
      shape.noFill();
      shape.fill().should.eql([0, 0, 0, 0]);
    });

    it('should draw geometry', function () {
      var triangle = BVG.triangle(50, 50, 60);
      triangle.tag.should.be.instanceof(SVGElement);
      var arc = BVG.arc(250, 250, 100, 200, 0, Math.PI/3);
      arc.tag.should.be.instanceof(SVGElement);
      arc = BVG.arc(600, 350, 200, 200, Math.PI, Math.PI*2-0.1);
      arc.tag.should.be.instanceof(SVGElement);
      arc = BVG.arc(624, 375, 200, 200, Math.PI, Math.PI/2);
      arc.tag.should.be.instanceof(SVGElement);
    });

    it('should render text', function () {
      var text = bvg.text('Mrraa!', 30, 40).fill(0);
      text.tag.should.be.instanceof(SVGElement);
      text.tag.tagName.should.eql('text');
      text.tag.parentNode.should.equal(bvg.tag);
      bvg.tag.removeChild(text.tag);
    });
  });

});
