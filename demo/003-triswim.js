require.config({
  paths: {
    'bvg': '../bvg'
  }
});

require(['bvg'], function(BVG) {
  var bvg = BVG.create('#bvg-container');

  function draw () {
    var r = 32;
    var inc_x = 3*r;
    var inc_y = r*Math.sqrt(3);
    var w = document.body.scrollWidth+r;
    var h = document.body.scrollHeight+inc_y;
    var triangleClass = 'triangle';
    var x; var y; var t;
    for (x = -r; x < w; x += inc_x) {
      for (y = -inc_y/2; y < h; y += inc_y) {
        t = bvg.triangle(x, y, r)
               .xform('rotate(90 ' + x + ' ' + y + ')')
               .addClass(triangleClass);
      }
    }
    for (x = -r/2; x < w; x += inc_x) {
      for (y = 0; y < h; y += inc_y) {
        t = bvg.triangle(x, y, r)
               .xform('rotate(-90 ' + x + ' ' + y + ')')
               .addClass(triangleClass);
      }
    }
    for (x = r; x < w; x += inc_x) {
      for (y = -inc_y/2; y < h; y += inc_y) {
        t = bvg.triangle(x, y, r)
               .xform('rotate(-90 ' + x + ' ' + y + ')')
               .addClass(triangleClass);
      }
    }
    for (x = r/2; x < w; x += inc_x) {
      for (y = 0; y < h; y += inc_y) {
        t = bvg.triangle(x, y, r)
               .xform('rotate(90 ' + x + ' ' + y + ')')
               .addClass(triangleClass);
      }
    }
  }
  draw();
  window.addEventListener('resize', draw);

  bvg.addEventListener('mouseover', function (event) {
    if (event.buttons & 0x01 && event.target.hasClass('triangle'))
      event.target.addClass('painted');
  });
});