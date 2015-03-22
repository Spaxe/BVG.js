# BVG - Bindable Vector Graphics
**Real-time data-driven visualisation for the web.**

Examples to come.

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
    

## The BVG Object
BVGs are SVGs with extra superpowers. In addition to all the [SVG methods](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model#SVG_interfaces),
BVG has the following:
    

### `bvg.data()`
### `bvg.data(property)`
### `bvg.data(objectToUpdate)`
### `bvg.data(property, newValue)`
Get/set the `data` object in a BVG. There are four ways to use this
function.

Return `bvg` object reference itself.

If no arguments are supplied, it returns `data`.

If a string of a property is given, it returns `data[property]`.

If an object is given, it will merge `data` with `objectToUpdate`,
adding and replacing any properties provided.

If two arguments are given, the first should be the `property` to be
updated, and the second should be the `newValue`.
      

