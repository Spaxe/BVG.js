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
  bvg.tag.addEventListener('mousemove', function (event) {
    if (event.buttons & 0x01) {
      var xy = [event.clientX, event.clientY];
      data.push(xy);
      polyline.data('points', data);
      bvg.polygon([[xy[0] - 25, xy[1] + 25], [xy[0] + 25, xy[1] + 25], [xy[0], xy[1] - 17]])
    } else if (event.buttons & 0x10) {
      polyline.data('points', []);
    } else {
      data = [];
      polyline = bvg.polyline(data);
    }
  });
});