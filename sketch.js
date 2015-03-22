require(['BVG'], function(BVG) {

  var bvg = BVG.create('#universe');
  var rects = bvg.rectArray([
    [50, 50, 100, 100],
    [50, 160, 100, 100],
    [160, 50, 100, 100],
    [160, 160, 100, 100],
    [50, 270, 210, 300]
  ]);

  rects[0].data('x', 300);

  // Remove loading placeholder
  document.getElementById('loading').remove();

});