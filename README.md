# BVG - Bindable Vector Graphics
**Real-time data-driven visualisation for the web.**

![Example](https://raw.githubusercontent.com/Spaxe/BVG.js/master/example.gif)

Live example: http://spaxe.github.io/BVG.js/

*Bindable Vector Graphics* was born out of frustration for lack of a
middle level SVG library. [D3.js](http://d3js.org/) abstracts too much
logic, and [SVG.js](http://svgjs.com/) provides only low-level SVG drawing.
Bindable Vector Graphics offers SVG elements that change as the data change,
and gives you tools to control their look.
  

The heart of this library is a trinity:*SVG + Data + Binding**. This
connects your data to the SVG element through the binding function, which
creates a living connection that can react to change. BVG uses
[`Object.observe()`](http://caniuse.com/#feat=object-observe) which is
available on Chrome 36+, Opera 27+ and Android Browser 37+.

If you wish to use this for older browsers, you can polyfill with
[`observe-shim`](https://github.com/KapIT/observe-shim).

## Example

    

### `BVG.create(htmlElement)`
Create a BVG container inside `htmlElement`.

Return the BVG container object.

 - `htmlElement`  : Either a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
                    or any [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).
    

## Drawing BVGs
BVG supports many popular SVG objects out of the box. If you don't see
them here, you can use `BVG()` to make your own.

### `BVG.rect(x, y, width, height)`

Return a rectangle at position `(x, y)` at `width` x `height` in size.

### `BVG.ellipse(cx, cy, rx, ry)`

Return a ellipse centred on `(cx, cy)` with radii `rx` and `ry`.
    

## The BVG Object
BVGs are SVGs with extra superpowers. In addition to all the [SVG methods](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model#SVG_interfaces),
BVG has the following:
    

### `bvg.data()`
Get/set the `data` object in a BVG. There are four ways to use this
function.

 - **`bvg.data()`**: Return `data` bound to the BVG.

 - **`bvg.data(property)`**: Return `data[property]` from the BVG.

 - **`bvg.data(objectToUpdate)`**: Update `data` with `objectToUpdate`,
adding and replacing any properties. Return `bvg` object reference.

 - **`bvg.data(property, newValue)`**: Update `property` with `newValue`.
Return `bvg` object reference.
      

### `bvg.stroke()`
Get/set the outline colour. There are 4 ways to use this function.

 - **`bvg.stroke()`**: Return `stroke` colour as [r, g, b, a].

 - **`bvg.stroke(hex)`**: Set `stroke` colour with a CSS hex string.

 - **`bvg.stroke(rgb)`**: Set `stroke` with a greyscale colour with equal
values `(rgb, rgb, rgb)`.

 - **`bvg.stroke(r, g, b, [a])`**: Set `stroke` with `(r, g, b, a)`. If `a`
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

 - **`bvg.fill()`**: Return `fill` colour as [r, g, b, a].

 - **`bvg.fill(hex)`**: Set `fill` colour with a CSS hex string.

 - **`bvg.fill(rgb)`**: Set `fill` with a greyscale colour with equal
values `(rgb, rgb, rgb)`.

 - **`bvg.fill(r, g, b, [a])`**: Set `fill` with `(r, g, b, a)`. If `a`
is omitted, it defaults to `1`.

`r`, `g`, `b` should be in the range of 0-255 inclusive.
      

## Utility Methods 

### `BVG.rgba()`
 Converts a hex string or colour value to rgba(r, g, b, a).

 Returns `[r, g, b, a]`.

 Possible ways to use this function are:

 **`BVG.rgba(hex, [css])`**

 **`BVG.rgba(rgb, [css])`**

 **`BVG.rgba(r, g, b, [css])`**

 **`BVG.rgba(r, g, b, a, [css])`**

 `hex` is a CSS colour string between `#000000` and `#FFFFFF`.

 `r`, `g`, `b` are in the range of 0-255 inclusive. `a` is the opacity and
 is in the range of 0.0-1.0. If not specified, `a` will be `1`.

 if `css` is `true`, it returns a string `'rgba(r, g, b, a)'` instead.
   

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
  

