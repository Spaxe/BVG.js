import BVG from './bvg';

var bvg = BVG.create('#universe');

var size = 128;
var pos = 400;

var albedo = bvg.ellipse(pos, pos, size, size)
                 .fill(64);

var diffuse = bvg.ellipse(pos, pos, size, size)
                 .fill(255, 255, 255, 0.4)
                 .noStroke();

var specular = bvg.ellipse(pos, pos, size/8, size/8)
                  .fill(255, 255, 255, 0.5)
                  .noStroke();

var outline = bvg.ellipse(pos, pos, size, size)
                 .fill(0, 0, 0, 0)
                 .stroke(32)
                 .strokeWidth(8);

bvg.tag().addEventListener('mousemove', function (event) {
  var mx = event.clientX;
  var my = event.clientY;
  var angle = Math.atan2(my-pos, mx-pos);
  var distance = Math.sqrt(Math.pow(mx - pos, 2) + Math.pow(my - pos, 2));
  distance = Math.min(distance, size/2);
  if (!isNaN(angle)) {
    diffuse.data({
      x: Math.cos(angle) * distance + pos,
      y: Math.sin(angle) * distance + pos,
      rx: Math.max(distance, size),
      ry: Math.max(distance, size)
    });
    var cx = Math.cos(angle) * Math.min(Math.pow(distance, 1.1), size/3*2) + pos;
    var cy = Math.sin(angle) * Math.min(Math.pow(distance, 1.1), size/3*2) + pos;
    specular.data({
      x: cx,
      y: cy,
      rx: size/8 * (size-distance)/size
    }).transform('rotate(' + [angle / Math.PI * 180, cx, cy].join() + ')');
  }
});

// Remove loading placeholder
document.getElementById('loading').remove();