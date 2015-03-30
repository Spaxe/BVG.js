require.config({
  paths: {
    'bvg': '../bvg'
  }
});

require(['bvg'], function(BVG) {
  var bvg = BVG.create('#bvg-container');

  var data = {vertices: []};
  var polyline = bvg.polyline(data);
  // Change its size based on mouse movement
  bvg.node.addEventListener('click', function (event) {
    data.vertices.push([event.clientX, event.clientY]);
    data.b = event.clientX;
  });
});