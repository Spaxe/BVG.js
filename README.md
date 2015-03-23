# BVG - Bindable Vector Graphics
**Real-time data-driven visualisation for the web.**

Examples to come.

Live testing page: http://spaxe.github.io/BVG.js/

*Bindable Vector Graphics* was born out of frustration for lack of a
middle level SVG library. [D3.js](http://d3js.org/) abstracts too much
logic, and [SVG.js](http://svgjs.com/) provides only low-level SVG drawing.
Bindable Vector Graphics offers SVG elements that change as the data change,
and gives you all the tools to control their look.
  

## Module Functions 

### `BVG(svg, data, bind)`
Create a Bindable Vector Graphic with `svg` element. This BVG depends on
`data` for its attributes and the callback function `bind` on how those
attributes are presented.

Returns the BVG object created.

 - `svg`   : Either a `String` for the SVG `tagName` or any DOM [`SVGElement`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element)
 - `data`  : Object with arbitrary data to your desire
 - `bind`  : Callback function to handle when `data` is updated. The
             function has signature `bind(bvg, change)`, where `bvg` is
             the BVG object reference, and `change` tells what is changed.
             For more information, see [`Object.observe()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe#Parameters).
    

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
   

