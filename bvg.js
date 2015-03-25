/* globals define */
/** # BVG - Bindable Vector Graphics
  * **Real-time data-driven visualisation for the web.**
  *
  * ![Example](https://raw.githubusercontent.com/Spaxe/BVG.js/master/example.gif)
  *
  * Live example: http://spaxe.github.io/BVG.js/
  *
  * *Bindable Vector Graphics* was born out of frustration for lack of a
  * middle level SVG library. [D3.js](http://d3js.org/) abstracts too much
  * logic, and [SVG.js](http://svgjs.com/) provides only low-level SVG drawing.
  * Bindable Vector Graphics offers SVG elements that change as the data change,
  * and gives you tools to control their look.
  */
define([], function () {
  var BVGIDCounter = 0;

  /** The heart of this library is a trinity: **SVG + Data + Binding**. This
    * connects your data to the SVG element through the binding function, which
    * creates a living connection that can react to change. BVG uses
    * [`Object.observe()`](http://caniuse.com/#feat=object-observe) which is
    * available on Chrome 36+, Opera 27+ and Android Browser 37+.
    *
    * If you wish to use this for older browsers, you can polyfill with
    * [`MaxArt2501/observe.observe`](https://github.com/MaxArt2501/object-observe).
    *
    * ## Quickstart
    *
    * ![Quickstart Example](https://raw.githubusercontent.com/Spaxe/BVG.js/master/demo/001-hello.gif)
    *
    * HTML:
    *
    * ```HTML
    * <div id="bvg-container"></div>
    * ```
    *
    * CSS (Make the container large enough):
    *
    * ```CSS
    * html, body, #bvg-container {
    *   height: 100%;
    *   margin: 0;
    * }
    * ```
    *
    * Javascript:
    *
    * ```Javascript
    * // Create a BVG container based on selected HTML element
    * var bvg = BVG.create('#bvg-container');
    * // Create a Bindable circle, colour it orange
    * var circle = bvg.ellipse(0, 0, 150, 150)
    *                 .fill(220, 64, 12);
    * // Change its size based on mouse movement
    * bvg.addEventListener('mousemove', function (event) {
    *   circle.data({
    *     rx: event.clientX,
    *     ry: event.clientY
    *   });
    * });
    * ```
    */

  /*- `BVG(svg, data, bind)`
    * Create a Bindable Vector Graphic with `svg` element. This BVG depends on
    * `data` for its attributes and the callback function `bind` on how those
    * attributes are presented.
    *
    * Returns the BVG object created.
    *
    *  - `svg`   : Either a `String` for the SVG `tagName` or any DOM [`SVGElement`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element)
    *  - `data`  : Object with arbitrary data to your desire
    *  - `bind`  : Callback function to handle when `data` is updated. The
    *              function has signature `bind(bvg, change)`, where `bvg` is
    *              the BVG object reference, and `change` tells what is changed.
    *              For more information, see [`Object.observe()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe#Parameters).
    */
  var BVG = function (svg, data, bind) {
    if (typeof svg === 'string')
      svg = document.createElementNS('http://www.w3.org/2000/svg', svg);
    if (!(svg instanceof SVGElement))
      throw new TypeError('svg (' + svg + ') must be SVG tag name or element.');

    var bvg = svg;
    bvg.isBVG = true;
    bvg.bind = bind;
    BVG.addFactoryMethods(bvg);
    BVG.addUtilityMethods(bvg, data, bind);

    Object.observe(data, function(changes) {
      changes.forEach(function (change) {
        bind(bvg, change);
      });
    });

    if (!data.id)
      data.id = 'BVG_' + bvg.tagName + '_' + BVGIDCounter++;

    for (var name in data) {
      if (data.hasOwnProperty(name)) {
        bind(bvg, {
          type: 'add',
          object: data,
          name: name
        });
      }
    }

    return bvg;
  };

  /** ## Creating BVG Container
    * The rest of the documentation will assume `bvg` as our BVG container
    * created by the example below.
    */

  /** ### `BVG.create(htmlElement)`
    * Create a BVG container inside `htmlElement`.
    *
    * Return the BVG container object.
    *
    *  - `htmlElement`  : Either a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
    *                     or any [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).
    *
    * ```Javascript
    * // Create a new BVG container and append it to an existing HTML element.
    * var bvg = BVG.create('#bvg-container');
    * ```
    */
  BVG.create = function (htmlElement) {
    if (typeof htmlElement === 'string')
      htmlElement = document.querySelector(htmlElement);
    if (!(htmlElement instanceof HTMLElement))
      throw new TypeError('htmlElement (' + htmlElement + ') was not found.');

    var svg = BVG.svg('http://www.w3.org/1999/xlink', 1.1, '100%', '100%');
    htmlElement.appendChild(svg);
    return svg;
  };

  /** ## Creating Basic Shapes
    *
    * All BVG objects, including the container, have access to drawing functions
    * and return reference to the new shape, which is also a BVG.
    *
    * ```Javascript
    * // Create a rectangle at (0, 0) with dimensions 100x100 px and add it to bvg
    * var rect = bvg.rect(0, 0, 100, 100);
    * ```
    *
    * The BVG module also has drawing functions, which return the BVG object:
    *
    * ```Javascript
    * // Create a rectangle at (0, 0) with dimensions 100x100 px
    * // Note it uses the BVG module directly to create the rectangle.
    * var rect = BVG.rect(0, 0, 100, 100);
    * // Add the rectangle to an existing BVG container
    * bvg.appendChild(rect);
    * ```
    *
    * Drawing functions can be called in a number of ways. Take `bvg.rect(x, y, width, height)`
    * as an example below. Sometimes it is easier to use one over another style.
    *
    * ```Javascript
    * bvg.rect(0, 10, 30, 70);      // Arguments style
    * bvg.rect([0, 10, 30, 70]);    // Array style
    * bvg.rect({                    // Object style
    *   x: 0,
    *   y: 10,                      // Name of the object properties must match
    *   width: 30,                  // names of the arguments in the functions,
    *   height: 70                  // but the order can be any.
    * });
    * ```
    *
    * ## Basic Shape Functions
    *
    * ### `bvg.rect(x, y, width, height)`
    *
    * Create a rectangle at position `(x, y)` at `width` x `height` in size.
    *
    * ```Javascript
    * var rect = bvg.rect(100, 100, 300, 150);
    * ```
    *
    * ### `bvg.circle(cx, cy, r)`
    *
    * Create a circle centred on `(cx, cy)` with radius `r`.
    *
    * ```Javascript
    * var circle = bvg.ellipse(100, 100, 50);
    * ```
    *
    * ### `bvg.ellipse(cx, cy, rx, ry)`
    *
    * Create a ellipse centred on `(cx, cy)` with radii `rx` and `ry`.
    *
    * ```Javascript
    * var ellipse = bvg.ellipse(100, 100, 200, 180);
    * ```
    *
    * ### `bvg.line(x1, y1, x2, y2)`
    *
    * Create a line from `(x1, y1)` to `(x2, y2)`.
    *
    * ```Javascript
    * var line = bvg.line(100, 100, 200, 300);
    * ```
    *
    * ## Grouping Elements
    * ### `bvg.g([transform])`
    *
    * Create a group to contain BVG objects. It acts like a BVG container with
    * an optional `transform` attribute.
    *
    * ```Javascript
    * // Create a new group and fill it with dashes.
    * var dashes = bvg.g();
    * for (int i = 0; i < 5; i++) {
    *   dahses.rect(10, 10 + i * 30, 50, 20);
    * }
    * ```
    *
    * ## Hyperlinks
    * ### `bvg.a(href)`
    *
    * Create a hyperlink BVG to target URL `href`. It does not have any display
    * elements. Make sure to append elements to it.
    *
    * ```Javascript
    * // Clicking on this element will bring them to the Github page
    * var githubLink = bvg.a('https://github.com/spaxe/BVG.js');
    * // Make a button and attack it to the link
    * githubLink.ellipse(200, 200, 50, 50);
    * ```
    */
  var svgElements = {
    svg: ['xmlns:xlink', 'version', 'width', 'height'],
    rect: ['x', 'y', 'width', 'height'],
    circle: ['cx', 'cy', r],
    ellipse: ['cx', 'cy', 'rx', 'ry'],
    line: ['x1', 'y1', 'x2', 'y2'],
    g: ['transform'],
    a: ['xlink:href'],
  };

  /** ## The BVG Object
    * BVGs are SVGs with extra superpowers.
    */
  BVG.addUtilityMethods = function (bvg, data, bind) {

    /** ### `bvg.data()`
      * Get/set the `data` object in a BVG. There are four ways to use this
      * function.
      *
      *  - `bvg.data()`: Return `data` bound to the BVG.
      *  - `bvg.data(property)`: Return `data[property]` from the BVG.
      *  - `bvg.data(objectToUpdate)`: Update `data` with `objectToUpdate`,
      *     adding and replacing any properties. Return `bvg` object reference.
      *  - `bvg.data(property, newValue)`: Update `property` with `newValue`.
      *
      * Return `bvg` object reference.
      */
    bvg.data = function () {
      if (arguments.length === 0) {
        return data;
      } else if (arguments.length === 1) {
        if (typeof arguments[0] === 'string') {
          return data[arguments[0]];
        } else {
          for (var name in arguments[0]) {
            if (arguments[0].hasOwnProperty(name)) {
              data[name] = arguments[0][name];
            }
          }
          return bvg;
        }
      } else {
        data[arguments[0]] = arguments[1];
        return bvg;
      }
    };

    /** ### `bvg.stroke()`
      * Get/set the outline colour. There are 4 ways to use this function.
      *
      *  - `bvg.stroke()`: Return `stroke` colour as [r, g, b, a].
      *  - `bvg.stroke(hex)`: Set `stroke` colour with a CSS hex string.
      *  - `bvg.stroke(rgb)`: Set `stroke` with a greyscale colour with equal
      *    values `(rgb, rgb, rgb)`.
      *  - `bvg.stroke(r, g, b, [a])`: Set `stroke` with `(r, g, b, a)`. If `a`
      *    is omitted, it defaults to `1`.
      *
      * `r`, `g`, `b` should be in the range of 0-255 inclusive.
      */
    bvg.stroke = function () {
      if (arguments.length === 0) {
        return BVG.rgba(bvg.getAttribute('stroke'));
      }
      if (arguments.length === 1) {
        bvg.setAttribute('stroke', BVG.rgba(arguments[0], true));
      } else {
        bvg.setAttribute('stroke', BVG.rgba([].slice.call(arguments), true));
      }
      return bvg;
    };

    /** ### `bvg.strokeWidth([width])`
      * Get/set the outline thickness.
      *
      * Returns the current outline thickness if `width` is omitted. Otherise,
      * it assigns the outline thickness with a new value, and returns the `bvg`
      * object reference.
      *
      *  - `width`  : Outline thickness in pixels.
      */
    bvg.strokeWidth = function () {
      if (arguments.length === 0) {
        return BVG.rgba(bvg.getAttribute('stroke-width'));
      }
      if (arguments.length === 1) {
        bvg.setAttribute('stroke-width', arguments[0]);
      }
      return bvg;
    };

    /** ### `bvg.fill()`
      * Get/set the filling colour. There are 4 ways to use this function.
      *
      *  - `bvg.fill()`: Return `fill` colour as [r, g, b, a].
      *  - `bvg.fill(hex)`: Set `fill` colour with a CSS hex string.
      *  - `bvg.fill(rgb)`: Set `fill` with a greyscale colour with equal
      *    values `(rgb, rgb, rgb)`.
      *  - `bvg.fill(r, g, b, [a])`: Set `fill` with `(r, g, b, a)`. If `a`
      *    is omitted, it defaults to `1`.
      *
      * `r`, `g`, `b` should be in the range of 0-255 inclusive.
      */
    bvg.fill = function () {
      if (arguments.length === 0) {
        return BVG.rgba(bvg.getAttribute('fill'));
      }
      if (arguments.length === 1) {
        bvg.setAttribute('fill', BVG.rgba(arguments[0], true));
      } else {
        bvg.setAttribute('fill', BVG.rgba([].slice.call(arguments), true));
      }
      return bvg;
    };
  };

  /*- Internal methods */

  /*- ### `BVG.factory(svg, attrs)`
    * Populate the library with functions to create a BVG.
    */
  BVG.factory = function (bvg, svg, attrs) {
    bvg[svg] = function () {
      var newBVG;
      if (arguments.length <= 2 &&
          arguments[0].constructor.name === 'Object') {
        var bind = typeof arguments[1] === 'function' ?
                      arguments[1] : BVG.defaultBind;
        newBVG = BVG(svg, arguments[0], bind);
      } else {
        var data = {};
        var paranmeters = [];
        for (var i = 0; i < arguments.length; i++) {
          paranmeters.push(arguments[i]);
        }
        attrs.forEach(function (arg) {
          data[arg] = paranmeters.shift();
        });
        newBVG = BVG(svg, data, BVG.defaultBind);
      }
      if (bvg.isBVG)
        bvg.appendChild(newBVG);
      return newBVG;
    };
  };

  BVG.addFactoryMethods = function (bvg) {
    for (var tagName in svgElements) {
      BVG.factory(bvg, tagName, svgElements[tagName]);
    }
  };
  BVG.addFactoryMethods(BVG);

  /*- ### `BVG.defaultBind(svg, change)`
   *  Default callback function that assigns each data property to BVG data.
   */
  BVG.defaultBind = function (svg, change) {
    if (change.type === 'add' || change.type === 'update') {
      if (svg.hasOwnProperty(change.name) && typeof svg[change.name] === 'function') {
        svg[change.name](change.object[change.name]);
      } else {
        svg.setAttribute(change.name, change.object[change.name]);
      }
    } else if (change.type === 'remove') {
      svg.removeAttribute(change.name);
    }
  };

  /** ## Utility Methods */

  /** ### `BVG.rgba()`
    * Converts a hex string or colour value to rgba(r, g, b, a).
    *
    * Returns `[r, g, b, a]`.
    *
    * Possible ways to use this function are:
    *
    *  - `BVG.rgba(hex, [css])`
    *  - `BVG.rgba(rgb, [css])`
    *  - `BVG.rgba(r, g, b, [css])`
    *  - `BVG.rgba(r, g, b, a, [css])`
    *
    * `hex` is a CSS colour string between `#000000` and `#FFFFFF`.
    *
    * `r`, `g`, `b` are in the range of 0-255 inclusive. `a` is the opacity and
    * is in the range of 0.0-1.0. If not specified, `a` will be `1`.
    *
    * if `css` is `true`, it returns a string `'rgba(r, g, b, a)'` instead.
    */
  BVG.rgba = function () {
    var h = '';
    var colour = [];
    var css = false;
    if (arguments.length === 1 || arguments.length === 2) {
      var c = arguments[0];
      if (typeof c === 'string') {
        var rgba = c.match(/rgba?\((.*)\)/);
        if (rgba) {
          colour = rgba[1].split(',').map(Number);
        } else {
          c = c.replace('#', '');
          var i;
          if (c.length === 3) {
            for (i = 0; i < c.length; i++) {
              h += c[i] + c[i];
            }
          } else {
            h = c;
          }
          for (i = 0; i < h.length; i+=2) {
            var hex = h.substring(i, i+2);
            if (hex.length !== 2)
              break;
            colour.push(parseInt(hex, 16));
          }
        }
      } else if (typeof c === 'number') {
        c = c;
        colour = [c, c, c];
      } else if (c instanceof Array && (c.length === 3 || c.length === 4)) {
        colour = c.map(Number);
      }
      if (arguments[1])
        css = true;
    } else if (arguments.length === 3) {
      colour = [].slice.call(arguments);
    } else if (arguments.length === 4) {
      if (typeof arguments[3] === 'number') {
        colour = [].slice.call(arguments);
      } else {
        colour = [].slice.call(arguments).slice(0, 3);
        if (arguments[3])
          css = true;
      }
    } else if (arguments.length === 5) {
      colour = [].slice.call(arguments).slice(0, 4);
      if (arguments[4])
        css = true;
    }

    if (colour.length !== 3 && colour.length !== 4) {
      throw new TypeError('BVG.rgba() can\'t work with ' + arguments);
    }

    if (colour.length === 3) {
      colour.push(1);
    }
    if (css)
      return 'rgba(' + colour.join() + ')';
    return colour;
  };

  return BVG;
});

/** ## Contribute to this library
  * [Make a pull request](https://github.com/Spaxe/BVG.js/pulls) or
  * [post an issue](https://github.com/Spaxe/BVG.js/issues). Say hello to
  * contact@xaiverho.com.
  */

/**
  * ### The MIT License (MIT)
  * Copyright © 2015 Xavier Ho
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in all
  * copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  * SOFTWARE.
  */