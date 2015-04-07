# BVG - Bindable Vector Graphics
**Real-time data-driven visualisation for the web.**

![Example](https://raw.githubusercontent.com/Spaxe/BVG.js/master/demo/index.gif)

Live example: http://spaxe.github.io/BVG.js/

*Bindable Vector Graphics* was born out of frustration for lack of a
middle level SVG library. [D3.js](http://d3js.org/) abstracts too much
logic, and [SVG.js](http://svgjs.com/) provides only low-level SVG drawing.
Bindable Vector Graphics offers SVG elements that change as the data change,
and gives you tools to control their look.
  

The heart of this library is a trinity: **SVG + Data + Binding**. This
connects your data to the SVG element through the binding function, which
creates a living connection that can react to change. BVG uses
[`Object.observe()`](http://caniuse.com/#feat=object-observe) which is
available on Chrome 36+, Opera 27+ and Android Browser 37+.

If you wish to use this for older browsers, you can polyfill with
[`MaxArt2501/Object.observe`](https://github.com/MaxArt2501/object-observe).

## Quickstart

![Quickstart Example](https://raw.githubusercontent.com/Spaxe/BVG.js/master/demo/001-hello.gif)

HTML:

```HTML
<div id="bvg-container"></div>
```

CSS (Make the container large enough):

```CSS
html, body, #bvg-container {
  height: 100%;
  margin: 0;
}
```

Javascript:

```Javascript
// Create a BVG container based on selected HTML element
var bvg = BVG.create('#bvg-container');
// Create a Bindable circle, colour it orange
var circle = bvg.ellipse(0, 0, 150, 150)
                .fill(220, 64, 12);
// Change its size based on mouse movement
bvg.tag.addEventListener('mousemove', function (event) {
  circle.data({
    rx: event.clientX,
    ry: event.clientY
  });
});
```
    

## The BVG Container
The rest of the documentation will assume `bvg` as our BVG container
created by the example below.
    

### `BVG.create(htmlElement)`
Create a BVG container inside `htmlElement`.

Return the BVG container object.

 - `htmlElement`  : Either a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
                    or any [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).

```Javascript
// Create a new BVG container and append it to an existing HTML element.
var bvg = BVG.create('#bvg-container');
```
    

## BVG Elements
All BVG objects, including the container, have access to drawing functions
and return reference to the new shape, which is also a BVG.

```Javascript
// Create a rectangle at (0, 0) with dimensions 100x100 px and add it to bvg
var rect = bvg.rect(0, 0, 100, 100);
```

The BVG module also has drawing functions, which return the BVG object:

```Javascript
// Create a rectangle at (0, 0) with dimensions 100x100 px
// Note it uses the BVG module directly to create the rectangle.
var rect = BVG.rect(0, 0, 100, 100);
// Add the rectangle to an existing BVG container
bvg.append(rect);
```

Drawing functions can be called in a number of ways. Take `bvg.rect(x, y, width, height)`
as an example below. Sometimes it is easier to use one over another style.

```Javascript
bvg.rect(0, 10, 30, 70);      // Arguments style
bvg.rect({                    // Object style
  x: 0,
  y: 10,                      // Name of the object properties must match
  width: 30,                  // names of the arguments in the functions,
  height: 70                  // but the order can be any.
});
```
    

### `bvg.rect(x, y, width, height)`
Create a rectangle at position `(x, y)` at `width` x `height` in size.

```Javascript
var rect = bvg.rect(100, 100, 300, 150);
```
      

### `bvg.circle(cx, cy, r)`
Create a circle centred on `(cx, cy)` with radius `r`.

```Javascript
var circle = bvg.ellipse(100, 100, 50);
```
      

### `bvg.ellipse(cx, cy, rx, ry)`
Create a ellipse centred on `(cx, cy)` with radii `rx` and `ry`.

```Javascript
var ellipse = bvg.ellipse(100, 100, 200, 180);
```
      

### `bvg.line(x1, y1, x2, y2)`
Create a line from `(x1, y1)` to `(x2, y2)`.

```Javascript
var line = bvg.line(100, 100, 200, 300);
```
      

### `bvg.polyline([[x1, y1], [x2, y2], ...])`
Create a series of lines from point to point.

```Javascript
var polyline = bvg.polyline([[100, 200], [200, 300], [400, 800]]);
```
      

### `bvg.polygon([[x1, y1], [x2, y2], ...])`
Create a closed polygon from point to point. The last point will be
connected back to the first point.

```Javascript
var polygon = bvg.polygon([[100, 200], [200, 300], [400, 800]]);
```
      

## Grouping Elements
### `bvg.group([transform])`

Create a group to contain BVG objects. It acts like a BVG container with
an optional `transform` attribute.

```Javascript
// Create a new group and fill it with dashes.
var dashes = bvg.group();
for (int i = 0; i < 5; i++) {
  dahses.rect(10, 10 + i * 30, 50, 20);
}
```
      

## Hyperlinks
### `bvg.hyperlink(url)`

Create a hyperlink BVG to target URL `url`. It does not have any display
elements. Make sure to append elements to it.

```Javascript
// Clicking on this element will bring them to the Github page
var githubLink = bvg.hyperlink('https://github.com/spaxe/BVG.js');
// Make a button and attack it to the link
githubLink.ellipse(200, 200, 50, 50);
```
      

## Other Geometry
### `bvg.triangle(cx, cy, r)`
Create a regular triangle centred on `(cx, cy)` with vertices `r` distance
away.

```Javascript
var triangle = bvg.triangle(50, 50, 10);
```
      

### `bvg.arc(cx, cy, rx, ry, startAngle, endAngle)`
Create an arc centred on `(cx, cy)` with radius `rx` and `ry`, starting
from `startAngle` anti-clockwise to `endAngle`, where 0 is the positive
x-axis.

```Javascript
var arc = bvg.arc(50, 50, 50, 100, 0, Math.PI);
```
      

### `bvg.text(text, x, y)`
Create a string of `text` text at location `(x, y)`.

```Javascript
var text = bvg.text('Mrraa!', 20, 10);
```
      

## The BVG Object
BVGs are SVGs with extra superpowers.
    

### `bvg.append(bvg)`
Insert `child_bvg` inside `bvg`. This is useful to add elements inside a
`BVG.group()`.
    

### `bvg.parent()`
Return the parent BVG. If there is no parent (such is the case for the BVG
container itself), return null.
    

### `bvg.children()`
Return a list of BVG elements inside `bvg`.
    

### `bvg.data()`
Get/set the `data` object in a BVG. There are four ways to use this
function.

 - `bvg.data()`: Return `data` bound to the BVG.
 - `bvg.data(newData)`: Update `data` with `newData` object.
 - `bvg.data(property)`: Return `data[property]` from the BVG.
 - `bvg.data(property, newValue)`: Update `property` with `newValue`.

Return `bvg` object reference.
    

### `bvg.fill()`
Get/set the filling colour. There are four ways to use this function.

 - `bvg.fill()`: Return `fill` colour as [r, g, b, a].
 - `bvg.fill(hex)`: Set `fill` colour with a CSS hex string.
 - `bvg.fill(rgb)`: Set `fill` with a greyscale colour with equal
   values `(rgb, rgb, rgb)`.
 - `bvg.fill(r, g, b, [a])`: Set `fill` with `(r, g, b, a)`. If `a`
   is omitted, it defaults to `1`.

`r`, `g`, `b` should be in the range of 0-255 inclusive.
    

### `bvg.noFill()`
Remove BVG object's colour filling completely.
    

### `bvg.stroke()`
Get/set the outline colour. There are four ways to use this function.

 - `bvg.stroke()`: Return `stroke` colour as [r, g, b, a].
 - `bvg.stroke(hex)`: Set `stroke` colour with a CSS hex string.
 - `bvg.stroke(rgb)`: Set `stroke` with a greyscale colour with equal
   values `(rgb, rgb, rgb)`.
 - `bvg.stroke(r, g, b, [a])`: Set `stroke` with `(r, g, b, a)`. If `a`
   is omitted, it defaults to `1`.

`r`, `g`, `b` should be in the range of 0-255 inclusive.
    

### `bvg.strokeWidth([width])`
Get/set the outline thickness.

Returns the current outline thickness if `width` is omitted. Otherise,
it assigns the outline thickness with a new value, and returns the `bvg`
object reference.

 - `width`  : Outline thickness in pixels.
    

### `bvg.noStroke()`
Remove BVG object's outline completely.
    

### `bvg.addClass(c)`
Add a class name to the element.
  

### `bvg.removeClass(c)`
Remove a class name to the element.
    

### `bvg.hasClass(c)`
Return true if the element has class `c`.
    

### `bvg.removeClass(c)`
Add or remove the class `c` to the element.
    

## Utility Methods 

### `BVG.rgba()`
Converts a hex string or colour value to rgba(r, g, b, a).

Returns `[r, g, b, a]`.

Possible ways to use this function are:

 - `BVG.rgba(hex, [css])`
 - `BVG.rgba(rgb, [css])`
 - `BVG.rgba(r, g, b, [css])`
 - `BVG.rgba(r, g, b, a, [css])`

`hex` is a CSS colour string between `#000000` and `#FFFFFF`.

`r`, `g`, `b` are in the range of 0-255 inclusive. `a` is the opacity and
is in the range of 0.0-1.0. If not specified, `a` will be `1`.

if `css` is `true`, it returns a string `'rgba(r, g, b, a)'` instead.
    

## Contribute to this library
[Make a pull request](https://github.com/Spaxe/BVG.js/pulls) or
[post an issue](https://github.com/Spaxe/BVG.js/issues). Say hello to
contact@xaiverho.com.
  

