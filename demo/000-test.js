require.config({
  paths: {
    'bvg': '../bvg'
  }
});

require(['bvg'], function(BVG) {
  var bvg = BVG.create('#bvg-container');
  var x = [
    [10, 10], [20, 30], [50, 80], [130, 210]
  ];
  var p = bvg.polyline(x).strokeWidth(5);
  console.log(p.tagName);
});