require(['BVG'], function(BVG) {

  var bvg = BVG.create('#universe');

  var rects = [];
  for (var x = 0; x < 800; x += 16) {
    for (var y = 0; y < 800; y += 16) {
      rects.push({
        x: x,
        y: y,
        width: 16,
        height: 16,
        fill: [12, 120 + x*y % 49, 240 - x*y % 49, 1]
      });
    }
  }
  bvg.rectArray(rects);
  // console.log(rects[0].stroke());

  // Remove loading placeholder
  document.getElementById('loading').remove();

});