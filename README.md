# BVG - Bindable Vector Graphics
**Real-time data-driven visualisation for the web.**

![Example](https://raw.githubusercontent.com/Spaxe/BVG.js/master/example.gif)

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
[`MaxArt2501/observe.observe`](https://github.com/MaxArt2501/object-observe).

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
bvg.addEventListener('mousemove', function (event) {
  circle.data({
    rx: event.clientX,
    ry: event.clientY
  });
});
```
    

## Creating BVG Container
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
    

## Creating Basic Shapes

All BVG objects, including the container, have access drawing functions in
this section. They also return the shapes created. For example:

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
bvg.appendChild(rect);
```

Drawing functions can be called in a number of ways. Take `bvg.rect(x, y, width, height)`
for example, all following function calls are functionally equivalent.
These variants exist because sometimes it is easier to use one over
another.

```Javascript
bvg.rect(0, 10, 30, 70);      // Arguments style
bvg.rect([0, 10, 30, 70]);    // Array style
bvg.rect({                    // Object style
  x: 0,
  y: 10,
  width: 30,
  height:70
});
```

### `bvg.rect(x, y, width, height)`

Create a rectangle at position `(x, y)` at `width` x `height` in size.

```Javascript
// Basic usage with 4 paranmeters
var wide_rect = bvg.rect(100, 100, 300, 150);
// You can also use an array
var tall_rect = bvg.rect([300, 300, 150, 300]);
```

### `bvg.ellipse(cx, cy, rx, ry)`

Create a ellipse centred on `(cx, cy)` with radii `rx` and `ry`.

```Javascript
// Basic usage with 4 paranmeters
var big_ellipse = bvg.ellipse(100, 100, 200, 180);
// You can also use an array
var small_ellipse = bvg.ellipse([300, 300, 20, 40]);
```

## Grouping Elements
### `bvg.g([transform])`

Create a group to contain BVG objects. It acts like a BVG container with
an optional `transform` attribute.

```Javascript
// Create a new group and fill it with dashes using Array.prototype.map()
var dashes = bvg.g();
var data = [];
for (int i = 0; i < 5; i++)
  data.push([10, 10 + i * 30, 50, 20]);
data.map(dashes.rect);
```

## Hyperlinks
### `bvg.a(href)`

Create a hyperlink BVG to target URL `href`. It does not have any display
elements. Make sure to append elements to it.

```Javascript
// Clicking on this element will bring them to the Github page
var githubLink = bvg.a('https://github.com/spaxe/BVG.js');
// Make a button and attack it to the link
githubLink.ellipse(200, 200, 50, 50);
```
    

## The BVG Object
BVGs are SVGs with extra superpowers.
    

### `bvg.data()`
Get/set the `data` object in a BVG. There are four ways to use this
function.

 - `bvg.data()`: Return `data` bound to the BVG.
 - `bvg.data(property)`: Return `data[property]` from the BVG.
 - `bvg.data(objectToUpdate)`: Update `data` with `objectToUpdate`,
    adding and replacing any properties. Return `bvg` object reference.
 - `bvg.data(property, newValue)`: Update `property` with `newValue`.

Return `bvg` object reference.
      

### `bvg.stroke()`
Get/set the outline colour. There are 4 ways to use this function.

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
      

### `bvg.fill()`
Get/set the filling colour. There are 4 ways to use this function.

 - `bvg.fill()`: Return `fill` colour as [r, g, b, a].
 - `bvg.fill(hex)`: Set `fill` colour with a CSS hex string.
 - `bvg.fill(rgb)`: Set `fill` with a greyscale colour with equal
   values `(rgb, rgb, rgb)`.
 - `bvg.fill(r, g, b, [a])`: Set `fill` with `(r, g, b, a)`. If `a`
   is omitted, it defaults to `1`.

`r`, `g`, `b` should be in the range of 0-255 inclusive.
      

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
  

### The MIT License (MIT)
Copyright © 2015 Xavier Ho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
  

