//
/** # BVG - Bindable Vector Graphics
  * **Real-time data-driven visualisation for the web.**
  *
  * ![Example](https://raw.githubusercontent.com/Spaxe/BVG.js/master/demo/index.gif)
  *
  * Live example: http://spaxe.github.io/BVG.js/
  *
  * *Bindable Vector Graphics* was born out of frustration for lack of a
  * middle level SVG library. [D3.js](http://d3js.org/) abstracts too much
  * logic, and [SVG.js](http://svgjs.com/) provides only low-level SVG drawing.
  * Bindable Vector Graphics offers SVG elements that change as the data change,
  * and gives you tools to control their look.
  */
'use strict';

// NodeJS amdefine patch
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([], function () {
  /** The heart of this library is a trinity: **SVG + Data + Binding**. This
    * connects your data to the SVG element through the binding function, which
    * creates a living connection that can react to change. BVG uses
    * [`Object.observe()`](http://caniuse.com/#feat=object-observe) which is
    * available on Chrome 36+, Opera 27+ and Android Browser 37+.
    *
    * If you wish to use this for older browsers, you can polyfill with
    * [`MaxArt2501/Object.observe`](https://github.com/MaxArt2501/object-observe).
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

  // Inject default SVG styles at top of page
  // if (document.head) {
  //   var defaultStyle = document.createElement('style');
  //   defaultStyle.innerHTML = 'svg * { fill: none; stroke: rgb(175, 175, 175); stroke-width: 1 }';
  //   document.head.insertBefore(defaultStyle, document.head.firstChild);
  // }

  /*- `BVG(svg, data)`
    * Create a Bindable Vector Graphic with `svg` element. This BVG depends on
    * `data` for its attributes.
    *
    * Returns the BVG object created.
    *
    *  - `svg`   : Either a `String` for the SVG `tagName` or any DOM [`SVGElement`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element)
    *  - `data`  : Object with arbitrary data to your desire.
    */
  var BVGIDCounter = 0;
  var BVG = function (svg, data) {
    if (typeof svg === 'string') {
      try {
        svg = document.createElementNS('http://www.w3.org/2000/svg', svg);
      } catch (e) {
        throw new TypeError(svg + ' is not a valid SVG tagName.');
      }
    }
    if (!(svg instanceof SVGElement))
      throw new TypeError('svg (' + svg + ') must be SVG tag name or element.');

    var bvg = svg;
    bvg.isBVG = true;
    addCreationMethods(bvg);
    addUtilityMethods(bvg, data);

    var bind = function (bvg, change) {
      if (change.type === 'update' || change.type === 'add') {
        if (typeof bvg[change.name] === 'function') {
          bvg[change.name](change.object[change.name]);
        } else {
          bvg.setAttribute(change.name, change.object[change.name]);
        }
      } else if (change.type === 'remove' && bvg.hasAttribute(change.name)) {
        bvg.removeAttribute(change.name);
      }
    };

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

    if (['svg', 'g', 'a'].indexOf(bvg.tagName) < 0) {
      if (!data.stroke)
        bvg.stroke(175);

      if (!data.strokeWidth)
        bvg.strokeWidth(0.5);

      if (!data.fill)
        bvg.noFill();
    }

    return bvg;
  };

  /** ## The BVG Container
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

  /** ## BVG Elements
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
    * bvg.rect({                    // Object style
    *   x: 0,
    *   y: 10,                      // Name of the object properties must match
    *   width: 30,                  // names of the arguments in the functions,
    *   height: 70                  // but the order can be any.
    * });
    * ```
    *
    * ### `bvg.rect(x, y, width, height)`
    * Create a rectangle at position `(x, y)` at `width` x `height` in size.
    *
    * ```Javascript
    * var rect = bvg.rect(100, 100, 300, 150);
    * ```
    *
    * ### `bvg.circle(cx, cy, r)`
    * Create a circle centred on `(cx, cy)` with radius `r`.
    *
    * ```Javascript
    * var circle = bvg.ellipse(100, 100, 50);
    * ```
    *
    * ### `bvg.ellipse(cx, cy, rx, ry)`
    * Create a ellipse centred on `(cx, cy)` with radii `rx` and `ry`.
    *
    * ```Javascript
    * var ellipse = bvg.ellipse(100, 100, 200, 180);
    * ```
    *
    * ### `bvg.line(x1, y1, x2, y2)`
    * Create a line from `(x1, y1)` to `(x2, y2)`.
    *
    * ```Javascript
    * var line = bvg.line(100, 100, 200, 300);
    * ```
    * ### `bvg.polyline([[x1, y1], [x2, y2], ...])`
    * Create a series of lines from point to point.
    *
    * ```Javascript
    * var polyline = bvg.polyline([[100, 200], [200, 300], [400, 800]]);
    * ```
    *
    * ### `bvg.polygon([[x1, y1], [x2, y2], ...])`
    * Create a closed polygon from point to point.
    *
    * ```Javascript
    * var polygon = bvg.polygon([[100, 200], [200, 300], [400, 800]]);
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
  var creationFunctions = {
    svg: ['xmlns:xlink', 'version', 'width', 'height'],
    rect: ['x', 'y', 'width', 'height'],
    circle: ['cx', 'cy', 'r'],
    ellipse: ['cx', 'cy', 'rx', 'ry'],
    line: ['x1', 'y1', 'x2', 'y2'],
    polyline: ['vertices'],
    polygon: ['vertices'],
    g: ['transform'],
    a: ['xlink:href']
  };

  /*- ### `objectifyArguments(paranmeters, args)`
    * Return an object with {paranmeters: args} pair.
    */
  function objectifyArguments (paranmeters, args) {
    var obj = {};
    var data = [].slice.call(args);
    data.forEach(function (d, i) {
      obj[paranmeters[i]] = d;
    });
    return obj;
  }

  /*- ### `creationMethods(svg, paranmeters)`
    * Populate the library with functions to create a BVG.
    */
  function creationMethods (bvg, svg, paranmeters) {
    bvg[svg] = function () {
      var newBVG;
      var obj = arguments[0].constructor.name === 'Object' ? arguments[0] :
                objectifyArguments(paranmeters, arguments);
      newBVG = BVG(svg, obj);
      if (bvg.isBVG)
        bvg.appendChild(newBVG);
      return newBVG;
    };
  }

  function addCreationMethods (bvg) {
    for (var f in creationFunctions) {
      creationMethods(bvg, f, creationFunctions[f]);
    }

    /** ## Other Geometry
      * ### `bvg.triangle(cx, cy, r)`
      * Create a regular triangle centred on `(cx, cy)` with vertices `r` distance
      * away.
      *
      * ```Javascript
      * var triangle = bvg.triangle(50, 50, 10);
      * ```
      */
    bvg.triangle = function () {
      var obj = objectifyArguments(['cx', 'cy', 'r'], arguments);
      var vertices = [
        [obj.cx, obj.cy-obj.r],
        [obj.cx-obj.r/2*Math.sqrt(3), obj.cy+obj.r/2],
        [obj.cx+obj.r/2*Math.sqrt(3), obj.cy+obj.r/2]
      ];
      return bvg.polygon(vertices);
    }

    /** ### `bvg.text(title, x, y)`
      * Create a string of `title` text at location `(x, y)`.
      *
      * ```Javascript
      * var text = bvg.text('Mrraa!', 20, 10);
      * ```
      */
    bvg.text = function () {
      var obj = objectifyArguments(['content', 'x', 'y'], arguments);
      var element = BVG('text', obj).noStroke()
                                    .fill(175);
      if (bvg.isBVG)
        bvg.appendChild(element);
      return element;
    };
  }
  addCreationMethods(BVG);

  /** ## The BVG Object
    * BVGs are SVGs with extra superpowers.
    */
  function addUtilityMethods (bvg, data) {

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

    bvg.content = function() {
      if (arguments.length === 0) {
        return bvg.innerHTML;
      }
      else if (arguments.length === 1) {
        bvg.innerHTML = arguments[0];
        return bvg;
      }
    };

    /** ### `bvg.addClass(c)`
      * Add a class name to the element.
      */
    bvg.addClass = function (c) {
      bvg.classList.add(c);
      return bvg;
    };

    /** ### `bvg.removeClass(c)`
      * Remove a class name to the element.
      */
    bvg.removeClass = function (c) {
      bvg.classList.remove(c);
      return bvg;
    };

    /** ### `bvg.hasClass(c)`
      * Return true if the element has class `c`.
      */
    bvg.hasClass = function (c) {
      return bvg.classList.contains(c);
    };

    /** ### `bvg.removeClass(c)`
      * Add or remove the class `c` to the element.
      */
    bvg.toggleClass = function (c) {
      bvg.classList.toggle(c);
      return bvg;
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
        var s = bvg.getAttribute('stroke');
        if (s && s !== 'none')
          return BVG.rgba(s);
        return null;
      }
      else if (arguments.length === 1) {
        if (arguments[0] === 'none') {
          bvg.noStroke();
        } else {
          bvg.setAttribute('stroke', BVG.rgba(arguments[0], true));
        }
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
      else if (arguments.length === 1) {
        bvg.setAttribute('stroke-width', arguments[0]);
      }
      return bvg;
    };

    /** ### `bvg.noStroke()`
      * Remove BVG object's outline completely.
      */
    bvg.noStroke = function () {
      bvg.setAttribute('stroke', 'rgba(0, 0, 0, 0)');
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
        var f = bvg.getAttribute('fill');
        if (f && f !== 'none')
          return BVG.rgba(f);
        return null;
      }
      else if (arguments.length === 1) {
        if (arguments[0] === 'none') {
          bvg.noFill();
        } else {
          bvg.setAttribute('fill', BVG.rgba(arguments[0], true));
        }
      } else {
        bvg.setAttribute('fill', BVG.rgba([].slice.call(arguments), true));
      }
      return bvg;
    };

    /** ### `bvg.noFill()`
      * Remove BVG object's colour filling completely.
      */
    bvg.noFill = function () {
      bvg.setAttribute('fill', 'rgba(0, 0, 0, 0)');
      return bvg;
    };

    // TODO: DOCUMENTATION
    bvg.xform = function () {
      if (arguments.length === 0) {
        return bvg.getAttribute('transform');
      }
      if (arguments.length === 1) {
        bvg.setAttribute('transform', arguments[0]);
      }
      return bvg;
    };

    if (bvg.tagName === 'polygon' || bvg.tagName === 'polyline') {
      bvg.vertices = function () {
        if (arguments.length === 0) {
          var points = [];
          bvg.getAttribute('points').split(' ').forEach(function (pair) {
            points.push(pair.split(',').map(Number));
          });
          return points;
        }
        if (arguments.length === 1) {
          bvg.setAttribute('points', arguments[0].join(' '));
        }
        return bvg;
      };
    }

    /** ### `bvg.remove()`
      * Remove the BVG object from its parent and return itself.
      */
    bvg.remove = function () {
      bvg.parentNode.removeChild(bvg);
      return bvg;
    };
  }

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
      throw new TypeError('BVG.rgba() can\'t work with ' + [].slice.call(arguments));
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