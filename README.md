# BVG - Bindable Vector Graphics
**Real-time data-driven visualisation for the web.**

Examples to come.

*Bindable Vector Graphics* was born out of frustration for lack of a
middle level SVG library. [D3.js](http://d3js.org/) abstracts too much
logic, and [SVG.js](http://svgjs.com/) provides only low-level SVG drawing.
Bindable Vector Graphics offers SVG elements that change as the data change,
and gives you all the tools to control their look.
  

## API Documentation 

### `BVG(svg, data, bind)`
Create a Bindable Vector Graphic with `svg` element. This BVG depends on
`data` for its attributes and the callback function `bind` on how those
attributes are presented.

 - `svg`   : Either a `String` for the SVG `tagName` or [`DOM SVGElement`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element)
 - `data`  : Object with arbitrary data to your desire
 - `bind`  : Callback function to handle when `data` is updated. The
             function has signature `bind(bvg, change)`, where `bvg` is
             the BVG object reference, and `change` tells what is changed.
             For more information, see [`Object.observe()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe#Parameters).
    

### `BVG.create(htmlElement)`

    

