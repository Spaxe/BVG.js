require(['BVG'], function(BVG) {

  var bvg = BVG.create('#universe');

  var rects = [];
  for (var x = 0; x < 1200; x += 16) {
    for (var y = 0; y < 800; y += 16) {
      rects.push({
        x: x,
        y: y,
        width: 16,
        height: 16,
        fill: 255
      });
    }
  }
  var pixels = bvg.rectArray(rects);

  document.addEventListener('mouseover', function (event) {
    pixels.forEach(function (pixel) {
      var d = Math.sqrt(Math.pow(event.clientX - pixel.data('x'), 2) +
                        Math.pow(event.clientY - pixel.data('y'), 2));
      pixel.data('fill', Math.min(d, 255));
    });
  });

  // Remove loading placeholder
  document.getElementById('loading').remove();

});