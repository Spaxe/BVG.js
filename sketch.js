require(['BVG'], function(BVG) {

  var bvg = BVG.create('#universe');
  var rects = bvg.rectArray([
    [50, 50, 100, 100],
    [50, 160, 100, 100],
    [160, 50, 100, 100],
    [160, 160, 100, 100],
    [50, 270, 210, 300]
  ]);

  rects[0].stroke('#009AFE');
  console.log(rects[0]);

  // Remove loading placeholder
  document.getElementById('loading').remove();

});