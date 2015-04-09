define(function (require) {
  var BVG = require('../bvg');

  var bvg = BVG.create('#universe', 800);

  bvg.arc(400, 400, 100, 100, Math.PI, Math.PI * 1.5);

});