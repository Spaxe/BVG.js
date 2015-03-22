# BVG - Bindable Vector Graphics
**Real-time data-driven visualisation for the web.**

Examples to come.

*Bindable Vector Graphics* was born out of frustration for lack of a
middle level SVG library. [D3.js](http://d3js.org/) abstracts too much
logic, and [SVG.js](http://svgjs.com/) provides only low-level SVG drawing.
Bindable Vector Graphics offers SVG elements that change as the data change,
and gives you all the tools to control their look.


### BVG.factory(svg, attrs)

Populate the library with functions to create a BVG.

This allows name checking for functions since calling an undefined
function would fail.


