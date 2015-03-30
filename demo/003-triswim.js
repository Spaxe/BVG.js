require.config({
  paths: {
    'bvg': '../bvg'
  }
});

require(['bvg'], function(BVG) {
  var bvg = BVG.create('#bvg-container');

  function draw () {
    while (bvg.firstChild)
      bvg.removeChild(bvg.firstChild);

    var r = 32;
    var inc = r*Math.sqrt(3);
    var w = document.body.scrollWidth+r;
    var h = document.body.scrollHeight+inc;
    for (var x = -r; x < w; x += 3*r) {
      for (var y = -inc/2; y < h; y += inc) {
        var t = bvg.triangle(x, y, r).xform('rotate(90 ' + x + ' ' + y + ')');
      }
    }
    for (var x = -r/2; x < w; x += 3*r) {
      for (var y = 0; y < h; y += inc) {
        var t = bvg.triangle(x, y, r).xform('rotate(-90 ' + x + ' ' + y + ')');
      }
    }
    for (var x = r; x < w; x += 3*r) {
      for (var y = -inc/2; y < h; y += inc) {
        var t = bvg.triangle(x, y, r).xform('rotate(-90 ' + x + ' ' + y + ')');
      }
    }
    for (var x = r/2; x < w; x += 3*r) {
      for (var y = 0; y < h; y += inc) {
        var t = bvg.triangle(x, y, r).xform('rotate(90 ' + x + ' ' + y + ')');
      }
    }
  }
  draw();
  window.addEventListener('resize', draw);

  bvg.addEventListener('mouseout', function (event) {
    if (event.target.tagName === 'polygon')
      event.target.fill(0);
  });
});