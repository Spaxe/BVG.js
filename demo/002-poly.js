require.config({
  paths: {
    'bvg': '../bvg'
  }
});

require(['bvg'], function(BVG) {
  var bvg = BVG.create('#bvg-container');

  var data = {points: []};
  var polyline = bvg.polyline(data);
  // Change its size based on mouse movement
  bvg.tag().addEventListener('mousemove', function (event) {
    var xy = [event.clientX, event.clientY];
    data.points.push(xy);
  });
  bvg.tag().addEventListener('click', function (event) {
    data.points = [];
  });
});