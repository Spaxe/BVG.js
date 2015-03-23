require(['bvg'], function(BVG) {

  var bvg = BVG.create('#universe');

  var px = [];
  var size = 16;
  for (var x = 0; x < 1200; x += size*2) {
    for (var y = 0; y < 800; y += size*2) {
      px.push({
        cx: x,
        cy: y,
        rx: size,
        ry: size,
        fill: 255
      });
    }
  }
  var pixels = bvg.ellipseArray(px);

  document.addEventListener('mouseover', function (event) {
    pixels.forEach(function (pixel) {
      var d = Math.sqrt(Math.pow(event.clientX - pixel.data('cx'), 2) +
                        Math.pow(event.clientY - pixel.data('cy'), 2));
      pixel.data('fill', Math.min(d, 255));
    });
  });

  // Remove loading placeholder
  document.getElementById('loading').remove();

});