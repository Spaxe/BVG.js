require.config({
  paths: {
    'bvg': '../bvg'
  }
});

require(['bvg'], function(BVG) {
  // Create a BVG container based on selected HTML element
  var bvg = BVG.create('#bvg-container');
  // Create a Bindable circle, colour it orange.
  var circle = bvg.ellipse(0, 0, 150, 150)
                  .fill(220, 64, 12);
  // Change its size based on mouse movement
  bvg.addEventListener('mousemove', function (event) {
    circle.data({
      rx: event.clientX,
      ry: event.clientY
    });
  });
});