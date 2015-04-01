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
    * bvg.tag.addEventListener('mousemove', function (event) {
    *   circle.data({
    *     rx: event.clientX,
    *     ry: event.clientY
    *   });
    * });
    * ```
    */

  /*- Property-wise Object.observe()
    * Similar to Object.observe(), except two things:
    *  - Nested objects are observed
    *  - All change events report the top-level property as a whole
    */
  function observe (obj, callback, _original, _property) {
    Object.observe(obj, function (changes) {
      changes.forEach(function (change) {
        if (obj[change.name] instanceof Object && obj[change.name] !== _original) {
          observe(obj[change.name], notifyOriginal, _original || obj, _property || change.name);
        }

        function notifyOriginal () {
          Object.getNotifier(_original || obj).notify({
            type: 'update',
            name: _property || change.name,
            oldValue: change.oldValue,
            object: _original || obj
          });
        }
      });

      callback.call(this, changes);
    });
  }

  /*- `BVG(tag, data, binding)`
    * The trinity of this library: SVG + Data + Binding Function.
    *
    * Return the BVG object created.
    *
    *  - `tag`    : Either a `String` for the SVG `tagName` or any [`SVGElement`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element)
    *  - `data`   : Object with arbitrary data to your desire
    *  - `binding`: (optional) Object with properties that specify the binding.
    */
  var BVG = function (tag, data, binding) {
    tag = tag instanceof SVGElement ? tag : document.createElementNS('http://www.w3.org/2000/svg', tag);
    data = data || {};
    binding = binding || {};

    observe(data, function (changes) {
      changes.forEach(function (change) {
        if (typeof binding[change.name] === 'function') {
          binding[change.name](tag, data);
        } else {
          tag.setAttribute(change.name, data[change.name]);
        }
      });
    });

    Object.keys(data).forEach(function (key) {
      Object.getNotifier(data).notify({
        type: 'add',
        name: key,
        object: data
      });
    });

    // ID function from https://gist.github.com/gordonbrander/2230317
    data.id = data.id || 'BVG_' + tag.tagName + '_' + Math.random().toString(36).substr(2, 7);

    this.tag = tag;
    this._data = data;
    this._binding = binding;

    if (['svg', 'g', 'a'].indexOf(tag.tagName) < 0) {
      if (!data.stroke) this.stroke(175);
      if (!data.strokeWidth) this.strokeWidth(0.5);
      if (!data.fill) this.noFill();
    }

    return this;
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

    var bvg = new BVG('svg', {
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      version: 1.1,
      width: '100%',
      height: '100%'
    });
    htmlElement.appendChild(bvg.tag);
    return bvg;
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
    * bvg.append(rect);
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
    */
  var creationFunctions = {
    svg: function (xlink, version, width, height) {
      return new BVG('svg', xlink.constructor.name === 'Object' ? xlink : {
        'xmlns:xlink': xlink,
        version: version,
        width: width,
        height: height
      });
    },

    /** ### `bvg.rect(x, y, width, height)`
      * Create a rectangle at position `(x, y)` at `width` x `height` in size.
      *
      * ```Javascript
      * var rect = bvg.rect(100, 100, 300, 150);
      * ```
      */
    rect: function (x, y, width, height) {
      return new BVG('rect', x.constructor.name === 'Object' ? x : {
        x: x,
        y: y,
        width: width,
        height: height
      });
    },

    /** ### `bvg.circle(cx, cy, r)`
      * Create a circle centred on `(cx, cy)` with radius `r`.
      *
      * ```Javascript
      * var circle = bvg.ellipse(100, 100, 50);
      * ```
      */
    circle: function (x, y, r) {
      return new BVG('circle', x.constructor.name === 'Object' ? x : {
        x: x,
        y: y,
        r: r
      }, {
        x: function (tag, data) { tag.setAttribute('cx', data.x); },
        y: function (tag, data) { tag.setAttribute('cy', data.y); }
      });
    },

    /** ### `bvg.ellipse(cx, cy, rx, ry)`
      * Create a ellipse centred on `(cx, cy)` with radii `rx` and `ry`.
      *
      * ```Javascript
      * var ellipse = bvg.ellipse(100, 100, 200, 180);
      * ```
      */
    ellipse: function (x, y, rx, ry) {
      return new BVG('ellipse', x.constructor.name === 'Object' ? x : {
        x: x,
        y: y,
        rx: rx,
        ry: ry
      }, {
        x: function (tag, data) { tag.setAttribute('cx', data.x); },
        y: function (tag, data) { tag.setAttribute('cy', data.y); }
      });
    },

    /** ### `bvg.line(x1, y1, x2, y2)`
      * Create a line from `(x1, y1)` to `(x2, y2)`.
      *
      * ```Javascript
      * var line = bvg.line(100, 100, 200, 300);
      * ```
      */
    line: function (x1, y1, x2, y2) {
      return new BVG('line', x1.constructor.name === 'Object' ? x1 : {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
      });
    },
    /** ### `bvg.polyline([[x1, y1], [x2, y2], ...])`
      * Create a series of lines from point to point.
      *
      * ```Javascript
      * var polyline = bvg.polyline([[100, 200], [200, 300], [400, 800]]);
      * ```
      */
    polyline: function (points) {
      return new BVG('polyline', points.constructor.name === 'Object' ? points : {
        points: points
      }, {
        points: function (tag, data) { tag.setAttribute('points', data.points.join(' ')); }
      });
    },
    /** ### `bvg.polygon([[x1, y1], [x2, y2], ...])`
      * Create a closed polygon from point to point. The last point will be
      * connected back to the first point.
      *
      * ```Javascript
      * var polygon = bvg.polygon([[100, 200], [200, 300], [400, 800]]);
      * ```
      */
    polygon: function (points) {
      return new BVG('polygon', points.constructor.name === 'Object' ? points : {
        points: points
      }, {
        points: function (tag, data) { tag.setAttribute('points', data.points.join(' ')); }
      });
    },

    /** ## Grouping Elements
      * ### `bvg.group([transform])`
      *
      * Create a group to contain BVG objects. It acts like a BVG container with
      * an optional `transform` attribute.
      *
      * ```Javascript
      * // Create a new group and fill it with dashes.
      * var dashes = bvg.group();
      * for (int i = 0; i < 5; i++) {
      *   dahses.rect(10, 10 + i * 30, 50, 20);
      * }
      * ```
      */
    group: function (transform) {
      return new BVG('g', transform.constructor.name === 'Object' ? transform : {
        transform: transform
      });
    },

    /** ## Hyperlinks
      * ### `bvg.hyperlink(url)`
      *
      * Create a hyperlink BVG to target URL `url`. It does not have any display
      * elements. Make sure to append elements to it.
      *
      * ```Javascript
      * // Clicking on this element will bring them to the Github page
      * var githubLink = bvg.hyperlink('https://github.com/spaxe/BVG.js');
      * // Make a button and attack it to the link
      * githubLink.ellipse(200, 200, 50, 50);
      * ```
      */
    hyperlink: function (url) {
      return new BVG('a', url.constructor.name === 'Object' ? url : {
        'xmlns:href': url
      });
    },

    /** ## Other Geometry
      * ### `bvg.triangle(cx, cy, r)`
      * Create a regular triangle centred on `(cx, cy)` with vertices `r` distance
      * away.
      *
      * ```Javascript
      * var triangle = bvg.triangle(50, 50, 10);
      * ```
      */
    triangle: function (x, y, r) {
      return new BVG('polygon', x.constructor.name === 'Object' ? x : {
        x: x,
        y: y,
        r: r
      }, {
        x: _triangle,
        y: _triangle,
        r: _triangle
      });

      function _triangle(tag, data) {
        var points = [
          [data.x, data.y-data.r],
          [data.x-data.r/2*Math.sqrt(3), data.y+data.r/2],
          [data.x+data.r/2*Math.sqrt(3), data.y+data.r/2]
        ];
        tag.setAttribute('points', points.join(' '));
      }
    },

    /** ### `bvg.arc(cx, cy, rx, ry, startAngle, endAngle)`
      * Create an arc centred on `(cx, cy)` with radius `rx` and `ry`, starting
      * from `startAngle` anti-clockwise to `endAngle`, where 0 is the positive
      * x-axis.
      *
      * ```Javascript
      * var arc = bvg.arc(50, 50, 50, 100, 0, Math.PI);
      * ```
      */
    arc: function (x, y, rx, ry, startAngle, endAngle) {
      return new BVG('path', x.constructor.name === 'Object' ? x : {
        x: x,
        y: y,
        rx: rx,
        ry: ry,
        startAngle: startAngle,
        endAngle: endAngle
      }, {
        x: _arc,
        y: _arc,
        rx: _arc,
        ry: _arc,
        startAngle: _arc,
        endAngle: _arc
      });

      function _arc(tag, data) {
        var p1 = getPointOnEllipse(data.x, data.y, data.rx, data.ry, data.startAngle);
        var p2 = getPointOnEllipse(data.x, data.y, data.rx, data.ry, data.endAngle);
        var largeArc = (data.endAngle - data.startAngle) > Math.PI ? 1 : 0;
        var sweepArc = data.endAngle > data.startAngle ? 1 : 0;
        var d = [
          ['M', p1.x, p1.y],
          ['A', data.rx, data.ry, 0, largeArc, sweepArc, p2.x, p2.y]
        ];
        tag.setAttribute('d', d.map(function (x) {
          return x.join(' ');
        })).join(' ');
      }

      function getPointOnEllipse(x, y, rx, ry, angle) {
        return {
          x: rx * Math.cos(angle) + x,
          y: ry * Math.sin(angle) + y
        };
      }
    },

    /** ### `bvg.text(text, x, y)`
      * Create a string of `text` text at location `(x, y)`.
      *
      * ```Javascript
      * var text = bvg.text('Mrraa!', 20, 10);
      * ```
      */
    text: function (text, x, y) {
      return new BVG('text', text.constructor.name === 'Object' ? text : {
        text: text,
        x: x,
        y: y,
        fill: 'rgba(175, 175, 175, 1)',
        stroke: 'rgba(0, 0, 0, 0)'
      }, {
        text: function (tag, data) { tag.innerHTML = data.text; }
      });
    }
  };

  Object.keys(creationFunctions).forEach(function (f) {
    BVG[f] = function () {
      return creationFunctions[f].apply(BVG, arguments);
    };
    BVG.prototype[f] = function () {
      var bvg = creationFunctions[f].apply(this, arguments);
      this.append(bvg);
      return bvg;
    };
  });

  /** ## The BVG Object
    * BVGs are SVGs with extra superpowers.
    */

  // TODO: Documentation
  BVG.prototype.append = function (bvg) {
    this.tag.appendChild(bvg.tag);
    return this;
  };

   /** ### `bvg.data()`
    * Get/set the `data` object in a BVG. There are four ways to use this
    * function.
    *
    *  - `bvg.data()`: Return `data` bound to the BVG.
    *  - `bvg.data(newData)`: Update `data` with `newData` object.
    *  - `bvg.data(property)`: Return `data[property]` from the BVG.
    *  - `bvg.data(property, newValue)`: Update `property` with `newValue`.
    *
    * Return `bvg` object reference.
    */
  BVG.prototype.data = function () {
    if (arguments.length === 0) {
      return this._data;
    } else if (arguments.length === 1) {
      if (arguments[0].constructor.name === 'Object') {
        for (var k in arguments[0]) {
          if (arguments[0].hasOwnProperty(k)) {
            this.data(k, arguments[0][k]);
          }
        }
        return this;
      } else {
        return this._data[arguments[0]];
      }
    } else if (arguments.length === 2) {
      this._data[arguments[0]] = arguments[1];
      return this;
    } else {
      throw new RangeError(this, 'data() received more than 2 arguments.');
    }
  };

  /** ### `bvg.fill()`
    * Get/set the filling colour. There are four ways to use this function.
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
  BVG.prototype.fill = function () {
    if (arguments.length === 0) {
      return BVG.rgba(this.data('fill'));
    } else if (arguments.length === 1) {
      return this.data('fill', BVG.rgba(arguments[0], true));
    } else if (arguments.length === 3 || arguments.length === 4) {
      return this.data('fill', BVG.rgba([].slice.call(arguments), true));
    } else {
      throw new RangeError(this, 'fill() received more than 1 argument.');
    }
  };

  /** ### `bvg.noFill()`
    * Remove BVG object's colour filling completely.
    */
  BVG.prototype.noFill = function () { return this.fill('rgba(0, 0, 0, 0)'); };

  /** ### `bvg.stroke()`
    * Get/set the outline colour. There are four ways to use this function.
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
  BVG.prototype.stroke = function () {
    if (arguments.length === 0) {
      return BVG.rgba(this.data('stroke'));
    } else if (arguments.length === 1) {
      return this.data('stroke', BVG.rgba(arguments[0], true));
    } else if (arguments.length === 3 || arguments.length === 4) {
      return this.data('stroke', BVG.rgba([].slice.call(arguments), true));
    } else {
      throw new RangeError(this, 'stroke() received more than 1 argument.');
    }
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
  BVG.prototype.strokeWidth = function () {
    if (arguments.length === 0) {
      return this.data('stroke-width');
    } else if (arguments.length === 1) {
      this.data('stroke-width', arguments[0]);
      return this;
    } else {
      throw new RangeError(this, 'strokeWidth() received more than 1 argument.');
    }
  };

  /** ### `bvg.noStroke()`
    * Remove BVG object's outline completely.
    */
  BVG.prototype.noStroke = function () { return this.stroke('rgba(0, 0, 0, 0)'); };

  BVG.prototype.content = function () {
    if (arguments.length === 0) {
      return this.tag.innerHTML;
    } else if (arguments.length === 1) {
      this.tag.innerHTML = arguments[0];
      return this;
    } else {
      throw new RangeError(this, 'content() received more than 1 argument.');
    }
  };

  /** ### `bvg.addClass(c)`
  * Add a class name to the element.
  */
  BVG.prototype.addClass = function (c) {
    this.tag.classList.add(c);
    return this;
  };

  /** ### `bvg.removeClass(c)`
    * Remove a class name to the element.
    */
  BVG.prototype.removeClass = function (c) {
    this.tag.classList.remove(c);
    return this;
  };

  /** ### `bvg.hasClass(c)`
    * Return true if the element has class `c`.
    */
  BVG.prototype.hasClass = function (c) {
    return this.tag.classList.contains(c);
  };

  /** ### `bvg.removeClass(c)`
    * Add or remove the class `c` to the element.
    */
  BVG.prototype.toggleClass = function (c) {
    this.tag.classList.toggle(c);
    return this;
  };

  // TODO: temporary
  BVG.prototype.transform = function () {
    if (arguments.length === 0) {
      return this.data('transform');
    } else if (arguments.length === 1) {
      this.data('transform', arguments[0]);
      return this;
    } else {
      throw new RangeError(this, 'transform() received more than 1 argument.');
    }
  };

  BVG.prototype.remove = function () {
    this.tag.parentNode.removeChild(this.tag);
    return this;
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