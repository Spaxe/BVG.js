require.config({
  paths: {
    'bvg': '../bvg'
  }
});

require(['bvg'], function(BVG) {
  var bvg = BVG.create('#bvg-container');

  var data = [];
  var polyline = bvg.polyline(data);
  // Change its size based on mouse movement
  bvg.addEventListener('mousemove', function (event) {
    if (event.buttons & 0x01) {
      data.push([event.clientX, event.clientY]);
      polyline.vertices(data);
    } else if (event.buttons & 0x10) {
      polyline.vertices([]);
    } else {
      data = [];
      polyline = bvg.polyline(data);
    }
  });
});