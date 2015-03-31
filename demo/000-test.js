require.config({
  paths: {
    'bvg': '../bvg'
  }
});

require(['bvg'], function(BVG) {
  var bvg = BVG.create('#bvg-container');
  var text = bvg.text('🐱 meow 🐱', 50, 50)
                .addClass('label');
  bvg.arc(250, 250, 100, 200, 0, Math.PI/3);
  bvg.arc(275, 275, 100, 300, 0, Math.PI/2);
  bvg.arc(300, 300, 100, 150, 0, Math.PI/2*3);
  bvg.arc(325, 325, 200, 150, 0, Math.PI/3*5);
  bvg.arc(350, 350, 200, 200, 0, Math.PI*2-0.1);

  bvg.arc(600, 350, 200, 200, Math.PI, Math.PI*2-0.1);
  bvg.arc(624, 375, 200, 200, Math.PI, Math.PI/2);
});