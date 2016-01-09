(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

/** The heart of this library is a trinity: **SVG + Data + Binding**. This
  * connects your data to the SVG element through the binding function, which
  * creates a living connection that can react to change. BVG uses
  * [`Object.observe()`](http://caniuse.com/#feat=object-observe) which is
  * available on Chrome 36+, Opera 27+ and Android Browser 37+.
  *
  * If you wish to use this for older browsers, you can polyfill with
  * [`MaxArt2501/Object.observe`](https://github.com/MaxArt2501/object-observe).
  *
  * ## Installation
  *
  * **Install using `npm`**:
  *
  *  1. Install Node.js: https://docs.npmjs.com/getting-started/installing-node
  *  2. In your working directory:
  *
  *     ```
  *     npm install bvg
  *     ```
  *
  * **Install via GitHub**:
  *
  *  1. Clone this repo:
  *
  *     ```
  *     git clone https://github.com/Spaxe/BVG.js.git
  *     ```
  *
  *  2. Copy `require.js` and `bvg.js` into your working directory.
  *
  * **To include `BVG.js` in your webpage**:
  *
  *  1. In your HTML `<head>`, include this script using `require.js`:
  *
  *     ```HTML
  *     <script src="path/to/require.js" data-main="your-script.js"></script>
  *     ```
  *
  *  2. In `your-script.js`, define your own code with
  *
  *     ```Javascript
  *     require(['path/to/bvg.js'], function (BVG) {
  *       // your code goes here ...
  *     });
  *     ```
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
  * bvg.tag().addEventListener('mousemove', function (event) {
  *   circle.data({
  *     rx: event.clientX,
  *     ry: event.clientY
  *   });
  * });
  * ```
  */

/*- Deep Object.observe() */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = BVG;
function observe(obj, callback) {

  // Include https://github.com/MaxArt2501/object-observe if you wish to work
  // with polyfill on browsers that don't support Object.observe()
  Object.observe(obj, function (changes) {
    changes.forEach(function (change) {

      // Bind child property if it is an object for deep observing
      if (obj[change.name] instanceof Object) {
        observe(obj[change.name], callback);
      }
    });

    // Trigger user callback
    callback.call(this, changes);
  });

  // Immediately fire observe to initiate deep observing
  Object.keys(obj).forEach(function (key) {
    if (obj[key] instanceof Object) {
      observe(obj[key], callback);
    }
  });
}

/*- `BVG(tag, data, binding)`
  * The trinity of this library: SVG + Data + Binding Function.
  *
  * Return the BVG object created.
  *
  *  - `tag`    : Either a `String` for the SVG `tagName` or any [`SVGElement`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element)
  *  - `data`   : Object with arbitrary data to your desire
  *  - `binding`: (optional) Binding function that sets the tag attributes
  */
function BVG(tag, data, binding) {
  var bvg = this;
  tag = tag instanceof SVGElement ? tag : document.createElementNS('http://www.w3.org/2000/svg', tag);
  data = data || {};
  binding = binding || function (tag, data) {
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        tag.setAttribute(prop, data[prop]);
      }
    }
  };

  // Observe data object and apply binding right away
  observe(data, function (changes) {
    binding(tag, data);
  });
  binding(tag, data);

  // ID function from https://gist.github.com/gordonbrander/2230317
  tag.setAttribute('id', 'BVG_' + tag.tagName + '_' + Math.random().toString(36).substr(2, 7));
  this._tag = tag;
  this._data = data;
  this._binding = binding;

  // Functional circular reference
  this._tag._getBVG = function () {
    return bvg;
  };

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
BVG.create = function (htmlElement, xDimension, yDimension) {
  if (typeof htmlElement === 'string') htmlElement = document.querySelector(htmlElement);
  if (!(htmlElement instanceof HTMLElement)) throw new TypeError('htmlElement (' + htmlElement + ') was not found.');

  var data = {
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    version: 1.1,
    width: '100%',
    height: '100%'
  };
  yDimension = yDimension || xDimension;
  if (xDimension) {
    data.viewBox = [0, 0, xDimension, yDimension].join(' ');
  }

  var bvg = new BVG('svg', data);
  htmlElement.appendChild(bvg.tag());
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
  svg: function svg(xlink, version, width, height) {
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
  rect: function rect(x, y, width, height) {
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
  circle: function circle(x, y, r) {
    return new BVG('circle', x.constructor.name === 'Object' ? x : {
      x: x,
      y: y,
      r: r
    }, function (tag, data) {
      tag.setAttribute('cx', data.x);
      tag.setAttribute('cy', data.y);
      tag.setAttribute('r', data.r);
    });
  },

  /** ### `bvg.ellipse(cx, cy, rx, ry)`
    * Create a ellipse centred on `(cx, cy)` with radii `rx` and `ry`.
    *
    * ```Javascript
    * var ellipse = bvg.ellipse(100, 100, 200, 180);
    * ```
    */
  ellipse: function ellipse(x, y, rx, ry) {
    return new BVG('ellipse', x.constructor.name === 'Object' ? x : {
      x: x,
      y: y,
      rx: rx,
      ry: ry
    }, function (tag, data) {
      tag.setAttribute('cx', data.x);
      tag.setAttribute('cy', data.y);
      tag.setAttribute('rx', data.rx);
      tag.setAttribute('ry', data.ry);
    });
  },

  /** ### `bvg.line(x1, y1, x2, y2)`
    * Create a line from `(x1, y1)` to `(x2, y2)`.
    *
    * ```Javascript
    * var line = bvg.line(100, 100, 200, 300);
    * ```
    */
  line: function line(x1, y1, x2, y2) {
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
  polyline: function polyline(points) {
    return new BVG('polyline', points.constructor.name === 'Object' ? points : {
      points: points
    }, function (tag, data) {
      tag.setAttribute('points', data.points.join(' '));
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
  polygon: function polygon(points) {
    return new BVG('polygon', points.constructor.name === 'Object' ? points : {
      points: points
    }, function (tag, data) {
      tag.setAttribute('points', data.points.join(' '));
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
  group: function group(transform) {
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
  hyperlink: function hyperlink(url) {
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
  triangle: function triangle(x, y, r) {
    return new BVG('polygon', x.constructor.name === 'Object' ? x : {
      x: x,
      y: y,
      r: r
    }, function (tag, data) {
      var points = [[data.x, data.y - data.r], [data.x - data.r / 2 * Math.sqrt(3), data.y + data.r / 2], [data.x + data.r / 2 * Math.sqrt(3), data.y + data.r / 2]];
      tag.setAttribute('points', points.join(' '));
    });
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
  arc: function arc(x, y, rx, ry, startAngle, endAngle) {
    return new BVG('path', x.constructor.name === 'Object' ? x : {
      x: x,
      y: y,
      rx: rx,
      ry: ry,
      startAngle: startAngle,
      endAngle: endAngle
    }, function (tag, data) {
      var p1 = getPointOnEllipse(data.x, data.y, data.rx, data.ry, data.startAngle);
      var p2 = getPointOnEllipse(data.x, data.y, data.rx, data.ry, data.endAngle);
      var largeArc = data.endAngle - data.startAngle > Math.PI ? 1 : 0;
      var sweepArc = data.endAngle > data.startAngle ? 1 : 0;
      var d = [['M', p1.x, p1.y], ['A', data.rx, data.ry, 0, largeArc, sweepArc, p2.x, p2.y]];
      tag.setAttribute('d', d.map(function (x) {
        return x.join(' ');
      }).join(' '));

      function getPointOnEllipse(x, y, rx, ry, angle) {
        return {
          x: rx * Math.cos(angle) + x,
          y: ry * Math.sin(angle) + y
        };
      }
    });
  },

  /** ### `bvg.text(text, x, y)`
    * Create a string of `text` text at location `(x, y)`.
    *
    * ```Javascript
    * var text = bvg.text('Mrraa!', 20, 10);
    * ```
    */
  text: function text(_text, x, y) {
    return new BVG('text', _text.constructor.name === 'Object' ? _text : {
      text: _text,
      x: x,
      y: y
    }, function (tag, data) {
      tag.innerHTML = data.text;
      tag.setAttribute('x', data.x);
      tag.setAttribute('y', data.y);
    }).fill('rgba(175, 175, 175, 1)').stroke('rgba(0, 0, 0, 0)');
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

/** ### `bvg.find(selector)`
  * Return an array of BVGs matching `selector` inside BVG. `selector` is
  * defined as [CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Selectors).
  */
BVG.prototype.find = function (selector) {
  var result = this._tag.querySelectorAll(selector);
  if (result) {
    var bvgs = [];
    [].slice.call(result).forEach(function (r) {
      bvgs.push(r._getBVG());
    });
    return bvgs;
  }
  return [];
};

/** ### `bvg.append(bvg)`
  * Insert `child_bvg` inside `bvg`. This is useful to add elements inside a
  * `BVG.group()`.
  */
BVG.prototype.append = function (child_bvg) {
  this._tag.appendChild(child_bvg._tag);
  return this;
};

/** ### `bvg.remove()`
  * Remove itself from its parent. Return self reference.
  */
BVG.prototype.remove = function () {
  var parent = this.parent();
  if (parent) {
    parent._tag.removeChild(this._tag);
  }
  return this;
};

/** ### `bvg.parent()`
  * Return the parent BVG. If there is no parent (such is the case for the BVG
  * container itself), return null.
  */
BVG.prototype.parent = function () {
  if (this._tag.parentNode && typeof this._tag.parentNode._getBVG === 'function') return this._tag.parentNode._getBVG();
  return null;
};

/** ### `bvg.children()`
  * Return a list of BVG elements inside `bvg`.
  */
BVG.prototype.children = function () {
  var output = [];
  for (var i = 0; i < this._tag.childNodes.length; i++) {
    if (typeof this._tag.childNodes[i]._getBVG === 'function') output.push(this._tag.childNodes[i]._getBVG());
  }return output;
};

/** ### `bvg.tag()`
  * Return thw BVG graphical content, a SVG.
  */
BVG.prototype.tag = function () {
  return this._tag;
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

/** ### `bvg.attr()`
  * Get/set attributes on a BVG.
  *
  *  - `bvg.attr(attr)`: Return attribute value.
  *  - `bvg.attr(attr, value)`: Update `attr` with `value`.
  */
BVG.prototype.attr = function (attr, value) {
  if (!attr) throw new Error('attr must be defined');
  if (!value) return this._tag.getAttribute(attr);else this._tag.setAttribute(attr, value);
  return this;
};

/** ### `bvg.fill()`
  * Get/set the filling colour.
  *
  *  - `bvg.fill()`: Return `fill` colour as [r, g, b, a], or `''` (empty
  *                  strig) if fill is not specified on the object.
  *  - `bvg.fill(rgb)`: Set `fill` with a greyscale colour with equal
  *    values `(rgb, rgb, rgb)`.
  *  - `bvg.fill(r, g, b, [a])`: Set `fill` with `(r, g, b, a)`. If `a`
  *    is omitted, it defaults to `1`.
  *
  * `r`, `g`, `b` should be in the range of 0-255 inclusive.
  */
BVG.prototype.fill = function () {
  if (arguments.length === 0) {
    var f = this.attr('fill');
    if (f) return BVG.extractNumberArray(f);
    return '';
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'string') return this.attr('fill', arguments[0]);else return this.attr('fill', BVG.rgba(arguments[0]));
  } else if (arguments.length === 3 || arguments.length === 4) {
    return this.attr('fill', BVG.rgba.apply(BVG, arguments));
  } else {
    throw new RangeError(this, 'fill() received more than 1 argument.');
  }
};

/** ### `bvg.noFill()`
  * Remove BVG object's colour filling completely.
  */
BVG.prototype.noFill = function () {
  return this.fill('rgba(0, 0, 0, 0)');
};

/** ### `bvg.stroke()`
  * Get/set the outline colour.
  *
  *  - `bvg.stroke()`: Return `stroke` colour as [r, g, b, a]. If `stroke` is
  *    not specified, return `''` (empty string).
  *  - `bvg.stroke(rgb)`: Set `stroke` with a greyscale colour with equal
  *    values `(rgb, rgb, rgb)`.
  *  - `bvg.stroke(r, g, b, [a])`: Set `stroke` with `(r, g, b, a)`. If `a`
  *    is omitted, it defaults to `1`.
  *
  * `r`, `g`, `b` should be in the range of 0-255 inclusive.
  */
BVG.prototype.stroke = function () {
  if (arguments.length === 0) {
    var s = this.attr('stroke');
    if (s) return BVG.extractNumberArray(s);
    return '';
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'string') return this.attr('stroke', arguments[0]);else return this.attr('stroke', BVG.rgba(arguments[0]));
  } else if (arguments.length === 3 || arguments.length === 4) {
    return this.attr('stroke', BVG.rgba.apply(BVG, arguments));
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
    return this.attr('stroke-width');
  } else if (arguments.length === 1) {
    this.attr('stroke-width', arguments[0]);
    return this;
  } else {
    throw new RangeError(this, 'strokeWidth() received more than 1 argument.');
  }
};

/** ### `bvg.noStroke()`
  * Remove BVG object's outline completely.
  */
BVG.prototype.noStroke = function () {
  return this.strokeWidth(0).stroke('rgba(0, 0, 0, 0)');
};

BVG.prototype.content = function () {
  if (arguments.length === 0) {
    return this._tag.innerHTML;
  } else if (arguments.length === 1) {
    this._tag.innerHTML = arguments[0];
    return this;
  } else {
    throw new RangeError(this, 'content() received more than 1 argument.');
  }
};

/** ### `bvg.addClass(c)`
* Add a class name to the element.
*/
BVG.prototype.addClass = function (c) {
  this._tag.classList.add(c);
  return this;
};

/** ### `bvg.removeClass(c)`
  * Remove a class name to the element.
  */
BVG.prototype.removeClass = function (c) {
  this._tag.classList.remove(c);
  return this;
};

/** ### `bvg.hasClass(c)`
  * Return true if the element has class `c`.
  */
BVG.prototype.hasClass = function (c) {
  return this._tag.classList.contains(c);
};

/** ### `bvg.removeClass(c)`
  * Add or remove the class `c` to the element.
  */
BVG.prototype.toggleClass = function (c) {
  this._tag.classList.toggle(c);
  return this;
};

/** ## Affine Transformations */
BVG.prototype.transform = function () {
  if (arguments.length === 0) {
    return this._tag.getAttribute('transform') || '';
  } else if (arguments.length === 1) {
    this._tag.setAttribute('transform', arguments[0]);
    return this;
  } else {
    throw new Error('transform() received more than 1 argument');
  }
};

/** ### `BVG.translate(x, [y])`
  * Apply a moving translation by `x` and `y` units. If `y` is not given, it
  * is assumed to be 0.
  */
BVG.prototype.translate = function (x, y) {
  if (typeof x !== 'number' && typeof y !== 'number') throw new Error('translate() only take numbers as arguments');
  y = y || 0;
  var transform = this.transform();
  this._tag.setAttribute('transform', [transform, ' translate(', x, ' ', y, ')'].join('').trim());
  return this;
};

/** ## Utility Methods */

/** ### `BVG.rgba(r, g, b, [a])`
  * Return a string in the form of `rgba(r, g, b, a)`.
  *
  * If only `r` is given, the value is copied to `g` and `b` to produce a
  * greyscale value.
  */
BVG.rgba = function (r, g, b) {
  var a = arguments.length <= 3 || arguments[3] === undefined ? 1.0 : arguments[3];

  if (typeof r !== 'number') throw new TypeError('rgba() must take numerical values as input');
  g = g || r;
  b = b || r;
  return 'rgba(' + [r, g, b, a].join(',') + ')';
};

/** ### `BVG.hsla(hue, saturation, lightness, [alpha])`
  * Return the CSS representation in `hsla()` as a string.
  *
  *  - `hue`: A value between `0` and `360`, where `0` is red, `120` is green,
  *           and `240` is blue.
  *  - `saturation` : A value between `0` and `100`, where `0` is grey and
  *                 `100` is fully saturate.
  *  - `lightness`: A value between `0` and `100`, where `0` is black and
  *                 `100` is full intensity of the colour.
  */
BVG.hsla = function (hue, saturation, lightness, alpha) {
  alpha = alpha || 1.0;
  return 'hsla(' + [hue, saturation + '%', lightness + '%', alpha].join(',') + ')';
};

/** ### `BVG.extractNumberArray(str)`
  * Return an array `[x, y, z, ...]` from a string containing common-separated
  * numbers.
  */
BVG.extractNumberArray = function (str) {
  return str.match(/\d*\.?\d+/g).map(Number);
};

/** ## Contribute to this library
* [Make a pull request](https://github.com/Spaxe/BVG.js/pulls) or
* [post an issue](https://github.com/Spaxe/BVG.js/issues). Say hello to
* contact@xaiverho.com.
*/

},{}],2:[function(require,module,exports){
'use strict';

var _bvg = require('./bvg');

var _bvg2 = _interopRequireDefault(_bvg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bvg = _bvg2.default.create('#universe');

var size = 128;
var pos = 400;

var albedo = bvg.ellipse(pos, pos, size, size).fill(64);

var diffuse = bvg.ellipse(pos, pos, size, size).fill(255, 255, 255, 0.4).noStroke();

var specular = bvg.ellipse(pos, pos, size / 8, size / 8).fill(255, 255, 255, 0.5).noStroke();

var outline = bvg.ellipse(pos, pos, size, size).fill(0, 0, 0, 0).stroke(32).strokeWidth(8);

bvg.tag().addEventListener('mousemove', function (event) {
  var mx = event.clientX;
  var my = event.clientY;
  var angle = Math.atan2(my - pos, mx - pos);
  var distance = Math.sqrt(Math.pow(mx - pos, 2) + Math.pow(my - pos, 2));
  distance = Math.min(distance, size / 2);
  if (!isNaN(angle)) {
    diffuse.data({
      x: Math.cos(angle) * distance + pos,
      y: Math.sin(angle) * distance + pos,
      rx: Math.max(distance, size),
      ry: Math.max(distance, size)
    });
    var cx = Math.cos(angle) * Math.min(Math.pow(distance, 1.1), size / 3 * 2) + pos;
    var cy = Math.sin(angle) * Math.min(Math.pow(distance, 1.1), size / 3 * 2) + pos;
    specular.data({
      x: cx,
      y: cy,
      rx: size / 8 * (size - distance) / size
    }).transform('rotate(' + [angle / Math.PI * 180, cx, cy].join() + ')');
  }
});

// Remove loading placeholder
document.getElementById('loading').remove();

},{"./bvg":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidmcuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0FDY0EsWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQzs7OztrQkF3SFcsR0FBRztBQWxDM0IsU0FBUyxPQUFPLENBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRTs7OztBQUkvQixRQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxVQUFVLE9BQU8sRUFBRTtBQUNyQyxXQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFOzs7QUFHaEMsVUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLE1BQU0sRUFBRTtBQUN0QyxlQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztPQUNyQztLQUNGLENBQUM7OztBQUFDLEFBR0gsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDOUIsQ0FBQzs7O0FBQUMsQUFHSCxRQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUN0QyxRQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxNQUFNLEVBQUU7QUFDOUIsYUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM3QjtHQUNGLENBQUMsQ0FBQztDQUNKOzs7Ozs7Ozs7OztBQUFBLEFBV2MsU0FBUyxHQUFHLENBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDL0MsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2YsS0FBRyxHQUFHLEdBQUcsWUFBWSxVQUFVLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEcsTUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEIsU0FBTyxHQUFHLE9BQU8sSUFBSSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDeEMsU0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDckIsVUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzdCLFdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO09BQ3BDO0tBQ0Y7R0FDRjs7O0FBQUMsQUFHRixTQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsT0FBTyxFQUFFO0FBQy9CLFdBQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDcEIsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7OztBQUFDLEFBR25CLEtBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RixNQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztBQUNoQixNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixNQUFJLENBQUMsUUFBUSxHQUFHLE9BQU87OztBQUFDLEFBR3hCLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVk7QUFDOUIsV0FBTyxHQUFHLENBQUM7R0FDWixDQUFDOztBQUVGLE1BQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzlDLFFBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsUUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QyxRQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDL0I7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQyxBQW9CRixHQUFHLENBQUMsTUFBTSxHQUFHLFVBQVUsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUU7QUFDMUQsTUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLEVBQ2pDLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3BELE1BQUksRUFBRSxXQUFXLFlBQVksV0FBVyxDQUFBLEFBQUMsRUFDdkMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxlQUFlLEdBQUcsV0FBVyxHQUFHLGtCQUFrQixDQUFDLENBQUM7O0FBRTFFLE1BQUksSUFBSSxHQUFHO0FBQ1QsaUJBQWEsRUFBRSw4QkFBOEI7QUFDN0MsV0FBTyxFQUFFLEdBQUc7QUFDWixTQUFLLEVBQUUsTUFBTTtBQUNiLFVBQU0sRUFBRSxNQUFNO0dBQ2YsQ0FBQztBQUNGLFlBQVUsR0FBRyxVQUFVLElBQUksVUFBVSxDQUFDO0FBQ3RDLE1BQUksVUFBVSxFQUFFO0FBQ2QsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUN6RDs7QUFFRCxNQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0IsYUFBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNuQyxTQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUMsQUFrQ0YsSUFBSSxpQkFBaUIsR0FBRztBQUN0QixLQUFHLEVBQUUsYUFBVSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDNUMsV0FBTyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFHLEtBQUssR0FBRztBQUNsRSxtQkFBYSxFQUFFLEtBQUs7QUFDcEIsYUFBTyxFQUFFLE9BQU87QUFDaEIsV0FBSyxFQUFFLEtBQUs7QUFDWixZQUFNLEVBQUUsTUFBTTtLQUNmLENBQUMsQ0FBQztHQUNKOzs7Ozs7Ozs7QUFTRCxNQUFJLEVBQUUsY0FBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDbkMsV0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRztBQUMzRCxPQUFDLEVBQUUsQ0FBQztBQUNKLE9BQUMsRUFBRSxDQUFDO0FBQ0osV0FBSyxFQUFFLEtBQUs7QUFDWixZQUFNLEVBQUUsTUFBTTtLQUNmLENBQUMsQ0FBQztHQUNKOzs7Ozs7Ozs7QUFTRCxRQUFNLEVBQUUsZ0JBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDekIsV0FBTyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRztBQUM3RCxPQUFDLEVBQUUsQ0FBQztBQUNKLE9BQUMsRUFBRSxDQUFDO0FBQ0osT0FBQyxFQUFFLENBQUM7S0FDTCxFQUFFLFVBQVUsR0FBRyxFQUFFLElBQUksRUFBRTtBQUN0QixTQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsU0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFNBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMvQixDQUFDLENBQUM7R0FDSjs7Ozs7Ozs7O0FBU0QsU0FBTyxFQUFFLGlCQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUMvQixXQUFPLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxRQUFRLEdBQUcsQ0FBQyxHQUFHO0FBQzlELE9BQUMsRUFBRSxDQUFDO0FBQ0osT0FBQyxFQUFFLENBQUM7QUFDSixRQUFFLEVBQUUsRUFBRTtBQUNOLFFBQUUsRUFBRSxFQUFFO0tBQ1AsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDdEIsU0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFNBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixTQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsU0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ2pDLENBQUMsQ0FBQztHQUNKOzs7Ozs7Ozs7QUFTRCxNQUFJLEVBQUUsY0FBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDOUIsV0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFHLEVBQUUsR0FBRztBQUM3RCxRQUFFLEVBQUUsRUFBRTtBQUNOLFFBQUUsRUFBRSxFQUFFO0FBQ04sUUFBRSxFQUFFLEVBQUU7QUFDTixRQUFFLEVBQUUsRUFBRTtLQUNQLENBQUMsQ0FBQztHQUNKOzs7Ozs7OztBQVFELFVBQVEsRUFBRSxrQkFBVSxNQUFNLEVBQUU7QUFDMUIsV0FBTyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFHLE1BQU0sR0FBRztBQUN6RSxZQUFNLEVBQUUsTUFBTTtLQUNmLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ3RCLFNBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDbkQsQ0FBQyxDQUFDO0dBQ0o7Ozs7Ozs7OztBQVNELFNBQU8sRUFBRSxpQkFBVSxNQUFNLEVBQUU7QUFDekIsV0FBTyxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFHLE1BQU0sR0FBRztBQUN4RSxZQUFNLEVBQUUsTUFBTTtLQUNmLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ3RCLFNBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDbkQsQ0FBQyxDQUFDO0dBQ0o7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkQsT0FBSyxFQUFFLGVBQVUsU0FBUyxFQUFFO0FBQzFCLFdBQU8sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsR0FBRyxTQUFTLEdBQUc7QUFDeEUsZUFBUyxFQUFFLFNBQVM7S0FDckIsQ0FBQyxDQUFDO0dBQ0o7Ozs7Ozs7Ozs7Ozs7OztBQWVELFdBQVMsRUFBRSxtQkFBVSxHQUFHLEVBQUU7QUFDeEIsV0FBTyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFHLEdBQUcsR0FBRztBQUM1RCxrQkFBWSxFQUFFLEdBQUc7S0FDbEIsQ0FBQyxDQUFDO0dBQ0o7Ozs7Ozs7Ozs7O0FBV0QsVUFBUSxFQUFFLGtCQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzNCLFdBQU8sSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUc7QUFDOUQsT0FBQyxFQUFFLENBQUM7QUFDSixPQUFDLEVBQUUsQ0FBQztBQUNKLE9BQUMsRUFBRSxDQUFDO0tBQ0wsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDdEIsVUFBSSxNQUFNLEdBQUcsQ0FDWCxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ3ZCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFDL0MsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUNoRCxDQUFDO0FBQ0YsU0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzlDLENBQUMsQ0FBQztHQUNKOzs7Ozs7Ozs7OztBQVdELEtBQUcsRUFBRSxhQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO0FBQ2pELFdBQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUc7QUFDM0QsT0FBQyxFQUFFLENBQUM7QUFDSixPQUFDLEVBQUUsQ0FBQztBQUNKLFFBQUUsRUFBRSxFQUFFO0FBQ04sUUFBRSxFQUFFLEVBQUU7QUFDTixnQkFBVSxFQUFFLFVBQVU7QUFDdEIsY0FBUSxFQUFFLFFBQVE7S0FDbkIsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDdEIsVUFBSSxFQUFFLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUUsVUFBSSxFQUFFLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUUsVUFBSSxRQUFRLEdBQUcsQUFBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25FLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksQ0FBQyxHQUFHLENBQ04sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ2pCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDM0QsQ0FBQztBQUNGLFNBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDdkMsZUFBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3BCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFZCxlQUFTLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDOUMsZUFBTztBQUNMLFdBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQzNCLFdBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1NBQzVCLENBQUM7T0FDSDtLQUNGLENBQUMsQ0FBQztHQUNKOzs7Ozs7Ozs7QUFTRCxNQUFJLEVBQUUsY0FBVSxLQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUMxQixXQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxRQUFRLEdBQUcsS0FBSSxHQUFHO0FBQ2pFLFVBQUksRUFBRSxLQUFJO0FBQ1YsT0FBQyxFQUFFLENBQUM7QUFDSixPQUFDLEVBQUUsQ0FBQztLQUNMLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ3RCLFNBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUMxQixTQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsU0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FDOUIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7R0FDL0I7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDbEQsS0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVk7QUFDbkIsV0FBTyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQ25ELENBQUM7QUFDRixLQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVk7QUFDN0IsUUFBSSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUN0RCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFdBQU8sR0FBRyxDQUFDO0dBQ1osQ0FBQztDQUNILENBQUM7Ozs7Ozs7Ozs7QUFBQyxBQVVILEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ3ZDLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEQsTUFBSSxNQUFNLEVBQUU7QUFDVixRQUFJLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZCxNQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDekMsVUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUN4QixDQUFDLENBQUM7QUFDSCxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FBTyxFQUFFLENBQUM7Q0FDWDs7Ozs7O0FBQUMsQUFNRixHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLFNBQVMsRUFBRTtBQUMxQyxNQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7QUFBQyxBQUtGLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVk7QUFDakMsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNCLE1BQUksTUFBTSxFQUFFO0FBQ1YsVUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BDO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7O0FBQUMsQUFNRixHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZO0FBQ2pDLE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUM3RSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZDLFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7O0FBQUMsQUFLRixHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxZQUFZO0FBQ25DLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUNsRCxRQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0dBQUEsQUFDbkQsT0FBTyxNQUFNLENBQUM7Q0FDZjs7Ozs7QUFBQyxBQUtGLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFlBQVk7QUFDOUIsU0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQ2xCOzs7Ozs7Ozs7Ozs7O0FBQUMsQUFhRixHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFZO0FBQy9CLE1BQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUIsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQ25CLE1BQU0sSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNqQyxRQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUM5QyxXQUFLLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUMxQixZQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDbEMsY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDL0I7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2IsTUFBTTtBQUNMLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQztHQUNGLE1BQU0sSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNqQyxRQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxXQUFPLElBQUksQ0FBQztHQUNiLE1BQU07QUFDTCxVQUFNLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO0dBQ3RFO0NBQ0Y7Ozs7Ozs7O0FBQUMsQUFRRixHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxVQUFVLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDMUMsTUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDbkQsTUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6QyxTQUFPLElBQUksQ0FBQztDQUNiOzs7Ozs7Ozs7Ozs7OztBQUFDLEFBY0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBWTtBQUMvQixNQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFCLFFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsUUFBSSxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsV0FBTyxFQUFFLENBQUM7R0FDWCxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakMsUUFBSSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUN4RSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN2RCxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDM0QsV0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztHQUMxRCxNQUFNO0FBQ0wsVUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztHQUNyRTtDQUNGOzs7OztBQUFDLEFBS0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWTtBQUFFLFNBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0NBQUU7Ozs7Ozs7Ozs7Ozs7O0FBQUMsQUFjN0UsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWTtBQUNqQyxNQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFCLFFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsUUFBSSxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsV0FBTyxFQUFFLENBQUM7R0FDWCxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakMsUUFBSSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUMxRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN6RCxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDM0QsV0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztHQUM1RCxNQUFNO0FBQ0wsVUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUseUNBQXlDLENBQUMsQ0FBQztHQUN2RTtDQUNGOzs7Ozs7Ozs7OztBQUFDLEFBV0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBWTtBQUN0QyxNQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFCLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUNsQyxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakMsUUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsV0FBTyxJQUFJLENBQUM7R0FDYixNQUFNO0FBQ0wsVUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsOENBQThDLENBQUMsQ0FBQztHQUM1RTtDQUNGOzs7OztBQUFDLEFBS0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsWUFBWTtBQUNuQyxTQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Q0FDdkQsQ0FBQzs7QUFFRixHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFZO0FBQ2xDLE1BQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUIsV0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztHQUM1QixNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakMsUUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFdBQU8sSUFBSSxDQUFDO0dBQ2IsTUFBTTtBQUNMLFVBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLDBDQUEwQyxDQUFDLENBQUM7R0FDeEU7Q0FDRjs7Ozs7QUFBQyxBQUtGLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQ3BDLE1BQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixTQUFPLElBQUksQ0FBQztDQUNiOzs7OztBQUFDLEFBS0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLEVBQUU7QUFDdkMsTUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7O0FBQUMsQUFLRixHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsRUFBRTtBQUNwQyxTQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN4Qzs7Ozs7QUFBQyxBQUtGLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQ3ZDLE1BQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixTQUFPLElBQUksQ0FBQztDQUNiOzs7QUFBQyxBQUdGLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFlBQVk7QUFDcEMsTUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxQixXQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNsRCxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakMsUUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELFdBQU8sSUFBSSxDQUFDO0dBQ2IsTUFBTTtBQUNMLFVBQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztHQUM5RDtDQUNGOzs7Ozs7QUFBQyxBQU1GLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN4QyxNQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQ2hELE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUNoRSxHQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNYLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqQyxNQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2hHLFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7Ozs7Ozs7QUFBQyxBQVVGLEdBQUcsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBUztNQUFQLENBQUMseURBQUMsR0FBRzs7QUFDakMsTUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBRSw0Q0FBNEMsQ0FBQyxDQUFDO0FBQzlGLEdBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1gsR0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDWCxTQUFPLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDL0M7Ozs7Ozs7Ozs7OztBQUFDLEFBWUYsR0FBRyxDQUFDLElBQUksR0FBRyxVQUFVLEdBQUcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRTtBQUN0RCxPQUFLLEdBQUcsS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUNyQixTQUFPLE9BQU8sR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFVLEdBQUcsR0FBRyxFQUFFLFNBQVMsR0FBRyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUNsRjs7Ozs7O0FBQUMsQUFNRixHQUFHLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDdEMsU0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUM1Qzs7Ozs7OztBQUFDOzs7Ozs7Ozs7O0FDdHhCRixJQUFJLEdBQUcsR0FBRyxjQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFbEMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2YsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDOztBQUVkLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQzVCLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFM0IsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FDN0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUN4QixRQUFRLEVBQUUsQ0FBQzs7QUFFN0IsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksR0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFDLENBQUMsQ0FBQyxDQUNqQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQ3hCLFFBQVEsRUFBRSxDQUFDOztBQUU5QixJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUM3QixJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ2hCLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FDVixXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDdkQsTUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUN2QixNQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsTUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEUsVUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxNQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2pCLFdBQU8sQ0FBQyxJQUFJLENBQUM7QUFDWCxPQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLEdBQUcsR0FBRztBQUNuQyxPQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLEdBQUcsR0FBRztBQUNuQyxRQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDO0FBQzVCLFFBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7S0FDN0IsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzdFLFFBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUM3RSxZQUFRLENBQUMsSUFBSSxDQUFDO0FBQ1osT0FBQyxFQUFFLEVBQUU7QUFDTCxPQUFDLEVBQUUsRUFBRTtBQUNMLFFBQUUsRUFBRSxJQUFJLEdBQUMsQ0FBQyxJQUFJLElBQUksR0FBQyxRQUFRLENBQUEsQUFBQyxHQUFDLElBQUk7S0FDbEMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0dBQ3hFO0NBQ0YsQ0FBQzs7O0FBQUMsQUFHSCxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vXG4vKiogIyBCVkcgLSBCaW5kYWJsZSBWZWN0b3IgR3JhcGhpY3NcbiAgKiAqKlJlYWwtdGltZSBkYXRhLWRyaXZlbiB2aXN1YWxpc2F0aW9uIGZvciB0aGUgd2ViLioqXG4gICpcbiAgKiAhW0V4YW1wbGVdKGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9TcGF4ZS9CVkcuanMvbWFzdGVyL2RlbW8vaW5kZXguZ2lmKVxuICAqXG4gICogTGl2ZSBleGFtcGxlOiBodHRwOi8vc3BheGUuZ2l0aHViLmlvL0JWRy5qcy9cbiAgKlxuICAqICpCaW5kYWJsZSBWZWN0b3IgR3JhcGhpY3MqIHdhcyBib3JuIG91dCBvZiBmcnVzdHJhdGlvbiBmb3IgbGFjayBvZiBhXG4gICogbWlkZGxlIGxldmVsIFNWRyBsaWJyYXJ5LiBbRDMuanNdKGh0dHA6Ly9kM2pzLm9yZy8pIGFic3RyYWN0cyB0b28gbXVjaFxuICAqIGxvZ2ljLCBhbmQgW1NWRy5qc10oaHR0cDovL3N2Z2pzLmNvbS8pIHByb3ZpZGVzIG9ubHkgbG93LWxldmVsIFNWRyBkcmF3aW5nLlxuICAqIEJpbmRhYmxlIFZlY3RvciBHcmFwaGljcyBvZmZlcnMgU1ZHIGVsZW1lbnRzIHRoYXQgY2hhbmdlIGFzIHRoZSBkYXRhIGNoYW5nZSxcbiAgKiBhbmQgZ2l2ZXMgeW91IHRvb2xzIHRvIGNvbnRyb2wgdGhlaXIgbG9vay5cbiAgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqIFRoZSBoZWFydCBvZiB0aGlzIGxpYnJhcnkgaXMgYSB0cmluaXR5OiAqKlNWRyArIERhdGEgKyBCaW5kaW5nKiouIFRoaXNcbiAgKiBjb25uZWN0cyB5b3VyIGRhdGEgdG8gdGhlIFNWRyBlbGVtZW50IHRocm91Z2ggdGhlIGJpbmRpbmcgZnVuY3Rpb24sIHdoaWNoXG4gICogY3JlYXRlcyBhIGxpdmluZyBjb25uZWN0aW9uIHRoYXQgY2FuIHJlYWN0IHRvIGNoYW5nZS4gQlZHIHVzZXNcbiAgKiBbYE9iamVjdC5vYnNlcnZlKClgXShodHRwOi8vY2FuaXVzZS5jb20vI2ZlYXQ9b2JqZWN0LW9ic2VydmUpIHdoaWNoIGlzXG4gICogYXZhaWxhYmxlIG9uIENocm9tZSAzNissIE9wZXJhIDI3KyBhbmQgQW5kcm9pZCBCcm93c2VyIDM3Ky5cbiAgKlxuICAqIElmIHlvdSB3aXNoIHRvIHVzZSB0aGlzIGZvciBvbGRlciBicm93c2VycywgeW91IGNhbiBwb2x5ZmlsbCB3aXRoXG4gICogW2BNYXhBcnQyNTAxL09iamVjdC5vYnNlcnZlYF0oaHR0cHM6Ly9naXRodWIuY29tL01heEFydDI1MDEvb2JqZWN0LW9ic2VydmUpLlxuICAqXG4gICogIyMgSW5zdGFsbGF0aW9uXG4gICpcbiAgKiAqKkluc3RhbGwgdXNpbmcgYG5wbWAqKjpcbiAgKlxuICAqICAxLiBJbnN0YWxsIE5vZGUuanM6IGh0dHBzOi8vZG9jcy5ucG1qcy5jb20vZ2V0dGluZy1zdGFydGVkL2luc3RhbGxpbmctbm9kZVxuICAqICAyLiBJbiB5b3VyIHdvcmtpbmcgZGlyZWN0b3J5OlxuICAqXG4gICogICAgIGBgYFxuICAqICAgICBucG0gaW5zdGFsbCBidmdcbiAgKiAgICAgYGBgXG4gICpcbiAgKiAqKkluc3RhbGwgdmlhIEdpdEh1YioqOlxuICAqXG4gICogIDEuIENsb25lIHRoaXMgcmVwbzpcbiAgKlxuICAqICAgICBgYGBcbiAgKiAgICAgZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9TcGF4ZS9CVkcuanMuZ2l0XG4gICogICAgIGBgYFxuICAqXG4gICogIDIuIENvcHkgYHJlcXVpcmUuanNgIGFuZCBgYnZnLmpzYCBpbnRvIHlvdXIgd29ya2luZyBkaXJlY3RvcnkuXG4gICpcbiAgKiAqKlRvIGluY2x1ZGUgYEJWRy5qc2AgaW4geW91ciB3ZWJwYWdlKio6XG4gICpcbiAgKiAgMS4gSW4geW91ciBIVE1MIGA8aGVhZD5gLCBpbmNsdWRlIHRoaXMgc2NyaXB0IHVzaW5nIGByZXF1aXJlLmpzYDpcbiAgKlxuICAqICAgICBgYGBIVE1MXG4gICogICAgIDxzY3JpcHQgc3JjPVwicGF0aC90by9yZXF1aXJlLmpzXCIgZGF0YS1tYWluPVwieW91ci1zY3JpcHQuanNcIj48L3NjcmlwdD5cbiAgKiAgICAgYGBgXG4gICpcbiAgKiAgMi4gSW4gYHlvdXItc2NyaXB0LmpzYCwgZGVmaW5lIHlvdXIgb3duIGNvZGUgd2l0aFxuICAqXG4gICogICAgIGBgYEphdmFzY3JpcHRcbiAgKiAgICAgcmVxdWlyZShbJ3BhdGgvdG8vYnZnLmpzJ10sIGZ1bmN0aW9uIChCVkcpIHtcbiAgKiAgICAgICAvLyB5b3VyIGNvZGUgZ29lcyBoZXJlIC4uLlxuICAqICAgICB9KTtcbiAgKiAgICAgYGBgXG4gICpcbiAgKiAjIyBRdWlja3N0YXJ0XG4gICpcbiAgKiAhW1F1aWNrc3RhcnQgRXhhbXBsZV0oaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1NwYXhlL0JWRy5qcy9tYXN0ZXIvZGVtby8wMDEtaGVsbG8uZ2lmKVxuICAqXG4gICogSFRNTDpcbiAgKlxuICAqIGBgYEhUTUxcbiAgKiA8ZGl2IGlkPVwiYnZnLWNvbnRhaW5lclwiPjwvZGl2PlxuICAqIGBgYFxuICAqXG4gICogQ1NTIChNYWtlIHRoZSBjb250YWluZXIgbGFyZ2UgZW5vdWdoKTpcbiAgKlxuICAqIGBgYENTU1xuICAqIGh0bWwsIGJvZHksICNidmctY29udGFpbmVyIHtcbiAgKiAgIGhlaWdodDogMTAwJTtcbiAgKiAgIG1hcmdpbjogMDtcbiAgKiB9XG4gICogYGBgXG4gICpcbiAgKiBKYXZhc2NyaXB0OlxuICAqXG4gICogYGBgSmF2YXNjcmlwdFxuICAqIC8vIENyZWF0ZSBhIEJWRyBjb250YWluZXIgYmFzZWQgb24gc2VsZWN0ZWQgSFRNTCBlbGVtZW50XG4gICogdmFyIGJ2ZyA9IEJWRy5jcmVhdGUoJyNidmctY29udGFpbmVyJyk7XG4gICogLy8gQ3JlYXRlIGEgQmluZGFibGUgY2lyY2xlLCBjb2xvdXIgaXQgb3JhbmdlXG4gICogdmFyIGNpcmNsZSA9IGJ2Zy5lbGxpcHNlKDAsIDAsIDE1MCwgMTUwKVxuICAqICAgICAgICAgICAgICAgICAuZmlsbCgyMjAsIDY0LCAxMik7XG4gICogLy8gQ2hhbmdlIGl0cyBzaXplIGJhc2VkIG9uIG1vdXNlIG1vdmVtZW50XG4gICogYnZnLnRhZygpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAqICAgY2lyY2xlLmRhdGEoe1xuICAqICAgICByeDogZXZlbnQuY2xpZW50WCxcbiAgKiAgICAgcnk6IGV2ZW50LmNsaWVudFlcbiAgKiAgIH0pO1xuICAqIH0pO1xuICAqIGBgYFxuICAqL1xuXG4vKi0gRGVlcCBPYmplY3Qub2JzZXJ2ZSgpICovXG5mdW5jdGlvbiBvYnNlcnZlIChvYmosIGNhbGxiYWNrKSB7XG5cbiAgLy8gSW5jbHVkZSBodHRwczovL2dpdGh1Yi5jb20vTWF4QXJ0MjUwMS9vYmplY3Qtb2JzZXJ2ZSBpZiB5b3Ugd2lzaCB0byB3b3JrXG4gIC8vIHdpdGggcG9seWZpbGwgb24gYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IE9iamVjdC5vYnNlcnZlKClcbiAgT2JqZWN0Lm9ic2VydmUob2JqLCBmdW5jdGlvbiAoY2hhbmdlcykge1xuICAgIGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hhbmdlKSB7XG5cbiAgICAgIC8vIEJpbmQgY2hpbGQgcHJvcGVydHkgaWYgaXQgaXMgYW4gb2JqZWN0IGZvciBkZWVwIG9ic2VydmluZ1xuICAgICAgaWYgKG9ialtjaGFuZ2UubmFtZV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgb2JzZXJ2ZShvYmpbY2hhbmdlLm5hbWVdLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUcmlnZ2VyIHVzZXIgY2FsbGJhY2tcbiAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGNoYW5nZXMpO1xuICB9KTtcblxuICAvLyBJbW1lZGlhdGVseSBmaXJlIG9ic2VydmUgdG8gaW5pdGlhdGUgZGVlcCBvYnNlcnZpbmdcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAob2JqW2tleV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgIG9ic2VydmUob2JqW2tleV0sIGNhbGxiYWNrKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKi0gYEJWRyh0YWcsIGRhdGEsIGJpbmRpbmcpYFxuICAqIFRoZSB0cmluaXR5IG9mIHRoaXMgbGlicmFyeTogU1ZHICsgRGF0YSArIEJpbmRpbmcgRnVuY3Rpb24uXG4gICpcbiAgKiBSZXR1cm4gdGhlIEJWRyBvYmplY3QgY3JlYXRlZC5cbiAgKlxuICAqICAtIGB0YWdgICAgIDogRWl0aGVyIGEgYFN0cmluZ2AgZm9yIHRoZSBTVkcgYHRhZ05hbWVgIG9yIGFueSBbYFNWR0VsZW1lbnRgXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9TVkcvRWxlbWVudClcbiAgKiAgLSBgZGF0YWAgICA6IE9iamVjdCB3aXRoIGFyYml0cmFyeSBkYXRhIHRvIHlvdXIgZGVzaXJlXG4gICogIC0gYGJpbmRpbmdgOiAob3B0aW9uYWwpIEJpbmRpbmcgZnVuY3Rpb24gdGhhdCBzZXRzIHRoZSB0YWcgYXR0cmlidXRlc1xuICAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQlZHICh0YWcsIGRhdGEsIGJpbmRpbmcpIHtcbiAgdmFyIGJ2ZyA9IHRoaXM7XG4gIHRhZyA9IHRhZyBpbnN0YW5jZW9mIFNWR0VsZW1lbnQgPyB0YWcgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnKTtcbiAgZGF0YSA9IGRhdGEgfHwge307XG4gIGJpbmRpbmcgPSBiaW5kaW5nIHx8IGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIHRhZy5zZXRBdHRyaWJ1dGUocHJvcCwgZGF0YVtwcm9wXSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIE9ic2VydmUgZGF0YSBvYmplY3QgYW5kIGFwcGx5IGJpbmRpbmcgcmlnaHQgYXdheVxuICBvYnNlcnZlKGRhdGEsIGZ1bmN0aW9uIChjaGFuZ2VzKSB7XG4gICAgYmluZGluZyh0YWcsIGRhdGEpO1xuICB9KTtcbiAgYmluZGluZyh0YWcsIGRhdGEpO1xuXG4gIC8vIElEIGZ1bmN0aW9uIGZyb20gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ29yZG9uYnJhbmRlci8yMjMwMzE3XG4gIHRhZy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ0JWR18nICsgdGFnLnRhZ05hbWUgKyAnXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgNykpO1xuICB0aGlzLl90YWcgPSB0YWc7XG4gIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB0aGlzLl9iaW5kaW5nID0gYmluZGluZztcblxuICAvLyBGdW5jdGlvbmFsIGNpcmN1bGFyIHJlZmVyZW5jZVxuICB0aGlzLl90YWcuX2dldEJWRyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYnZnO1xuICB9O1xuXG4gIGlmIChbJ3N2ZycsICdnJywgJ2EnXS5pbmRleE9mKHRhZy50YWdOYW1lKSA8IDApIHtcbiAgICBpZiAoIWRhdGEuc3Ryb2tlKSB0aGlzLnN0cm9rZSgxNzUpO1xuICAgIGlmICghZGF0YS5zdHJva2VXaWR0aCkgdGhpcy5zdHJva2VXaWR0aCgwLjUpO1xuICAgIGlmICghZGF0YS5maWxsKSB0aGlzLm5vRmlsbCgpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMgVGhlIEJWRyBDb250YWluZXJcbiAgKiBUaGUgcmVzdCBvZiB0aGUgZG9jdW1lbnRhdGlvbiB3aWxsIGFzc3VtZSBgYnZnYCBhcyBvdXIgQlZHIGNvbnRhaW5lclxuICAqIGNyZWF0ZWQgYnkgdGhlIGV4YW1wbGUgYmVsb3cuXG4gICovXG5cbi8qKiAjIyMgYEJWRy5jcmVhdGUoaHRtbEVsZW1lbnQpYFxuICAqIENyZWF0ZSBhIEJWRyBjb250YWluZXIgaW5zaWRlIGBodG1sRWxlbWVudGAuXG4gICpcbiAgKiBSZXR1cm4gdGhlIEJWRyBjb250YWluZXIgb2JqZWN0LlxuICAqXG4gICogIC0gYGh0bWxFbGVtZW50YCAgOiBFaXRoZXIgYSBbQ1NTIFNlbGVjdG9yXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9HdWlkZS9DU1MvR2V0dGluZ19TdGFydGVkL1NlbGVjdG9ycylcbiAgKiAgICAgICAgICAgICAgICAgICAgIG9yIGFueSBbSFRNTEVsZW1lbnRdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IVE1MRWxlbWVudCkuXG4gICpcbiAgKiBgYGBKYXZhc2NyaXB0XG4gICogLy8gQ3JlYXRlIGEgbmV3IEJWRyBjb250YWluZXIgYW5kIGFwcGVuZCBpdCB0byBhbiBleGlzdGluZyBIVE1MIGVsZW1lbnQuXG4gICogdmFyIGJ2ZyA9IEJWRy5jcmVhdGUoJyNidmctY29udGFpbmVyJyk7XG4gICogYGBgXG4gICovXG5CVkcuY3JlYXRlID0gZnVuY3Rpb24gKGh0bWxFbGVtZW50LCB4RGltZW5zaW9uLCB5RGltZW5zaW9uKSB7XG4gIGlmICh0eXBlb2YgaHRtbEVsZW1lbnQgPT09ICdzdHJpbmcnKVxuICAgIGh0bWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihodG1sRWxlbWVudCk7XG4gIGlmICghKGh0bWxFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2h0bWxFbGVtZW50ICgnICsgaHRtbEVsZW1lbnQgKyAnKSB3YXMgbm90IGZvdW5kLicpO1xuXG4gIHZhciBkYXRhID0ge1xuICAgICd4bWxuczp4bGluayc6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICB2ZXJzaW9uOiAxLjEsXG4gICAgd2lkdGg6ICcxMDAlJyxcbiAgICBoZWlnaHQ6ICcxMDAlJ1xuICB9O1xuICB5RGltZW5zaW9uID0geURpbWVuc2lvbiB8fCB4RGltZW5zaW9uO1xuICBpZiAoeERpbWVuc2lvbikge1xuICAgIGRhdGEudmlld0JveCA9IFswLCAwLCB4RGltZW5zaW9uLCB5RGltZW5zaW9uXS5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgYnZnID0gbmV3IEJWRygnc3ZnJywgZGF0YSk7XG4gIGh0bWxFbGVtZW50LmFwcGVuZENoaWxkKGJ2Zy50YWcoKSk7XG4gIHJldHVybiBidmc7XG59O1xuXG4vKiogIyMgQlZHIEVsZW1lbnRzXG4gICogQWxsIEJWRyBvYmplY3RzLCBpbmNsdWRpbmcgdGhlIGNvbnRhaW5lciwgaGF2ZSBhY2Nlc3MgdG8gZHJhd2luZyBmdW5jdGlvbnNcbiAgKiBhbmQgcmV0dXJuIHJlZmVyZW5jZSB0byB0aGUgbmV3IHNoYXBlLCB3aGljaCBpcyBhbHNvIGEgQlZHLlxuICAqXG4gICogYGBgSmF2YXNjcmlwdFxuICAqIC8vIENyZWF0ZSBhIHJlY3RhbmdsZSBhdCAoMCwgMCkgd2l0aCBkaW1lbnNpb25zIDEwMHgxMDAgcHggYW5kIGFkZCBpdCB0byBidmdcbiAgKiB2YXIgcmVjdCA9IGJ2Zy5yZWN0KDAsIDAsIDEwMCwgMTAwKTtcbiAgKiBgYGBcbiAgKlxuICAqIFRoZSBCVkcgbW9kdWxlIGFsc28gaGFzIGRyYXdpbmcgZnVuY3Rpb25zLCB3aGljaCByZXR1cm4gdGhlIEJWRyBvYmplY3Q6XG4gICpcbiAgKiBgYGBKYXZhc2NyaXB0XG4gICogLy8gQ3JlYXRlIGEgcmVjdGFuZ2xlIGF0ICgwLCAwKSB3aXRoIGRpbWVuc2lvbnMgMTAweDEwMCBweFxuICAqIC8vIE5vdGUgaXQgdXNlcyB0aGUgQlZHIG1vZHVsZSBkaXJlY3RseSB0byBjcmVhdGUgdGhlIHJlY3RhbmdsZS5cbiAgKiB2YXIgcmVjdCA9IEJWRy5yZWN0KDAsIDAsIDEwMCwgMTAwKTtcbiAgKiAvLyBBZGQgdGhlIHJlY3RhbmdsZSB0byBhbiBleGlzdGluZyBCVkcgY29udGFpbmVyXG4gICogYnZnLmFwcGVuZChyZWN0KTtcbiAgKiBgYGBcbiAgKlxuICAqIERyYXdpbmcgZnVuY3Rpb25zIGNhbiBiZSBjYWxsZWQgaW4gYSBudW1iZXIgb2Ygd2F5cy4gVGFrZSBgYnZnLnJlY3QoeCwgeSwgd2lkdGgsIGhlaWdodClgXG4gICogYXMgYW4gZXhhbXBsZSBiZWxvdy4gU29tZXRpbWVzIGl0IGlzIGVhc2llciB0byB1c2Ugb25lIG92ZXIgYW5vdGhlciBzdHlsZS5cbiAgKlxuICAqIGBgYEphdmFzY3JpcHRcbiAgKiBidmcucmVjdCgwLCAxMCwgMzAsIDcwKTsgICAgICAvLyBBcmd1bWVudHMgc3R5bGVcbiAgKiBidmcucmVjdCh7ICAgICAgICAgICAgICAgICAgICAvLyBPYmplY3Qgc3R5bGVcbiAgKiAgIHg6IDAsXG4gICogICB5OiAxMCwgICAgICAgICAgICAgICAgICAgICAgLy8gTmFtZSBvZiB0aGUgb2JqZWN0IHByb3BlcnRpZXMgbXVzdCBtYXRjaFxuICAqICAgd2lkdGg6IDMwLCAgICAgICAgICAgICAgICAgIC8vIG5hbWVzIG9mIHRoZSBhcmd1bWVudHMgaW4gdGhlIGZ1bmN0aW9ucyxcbiAgKiAgIGhlaWdodDogNzAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhlIG9yZGVyIGNhbiBiZSBhbnkuXG4gICogfSk7XG4gICogYGBgXG4gICovXG52YXIgY3JlYXRpb25GdW5jdGlvbnMgPSB7XG4gIHN2ZzogZnVuY3Rpb24gKHhsaW5rLCB2ZXJzaW9uLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3N2ZycsIHhsaW5rLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geGxpbmsgOiB7XG4gICAgICAneG1sbnM6eGxpbmsnOiB4bGluayxcbiAgICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyMgYGJ2Zy5yZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpYFxuICAgICogQ3JlYXRlIGEgcmVjdGFuZ2xlIGF0IHBvc2l0aW9uIGAoeCwgeSlgIGF0IGB3aWR0aGAgeCBgaGVpZ2h0YCBpbiBzaXplLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciByZWN0ID0gYnZnLnJlY3QoMTAwLCAxMDAsIDMwMCwgMTUwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIHJlY3Q6IGZ1bmN0aW9uICh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3JlY3QnLCB4LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geCA6IHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMjIGBidmcuY2lyY2xlKGN4LCBjeSwgcilgXG4gICAgKiBDcmVhdGUgYSBjaXJjbGUgY2VudHJlZCBvbiBgKGN4LCBjeSlgIHdpdGggcmFkaXVzIGByYC5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgY2lyY2xlID0gYnZnLmVsbGlwc2UoMTAwLCAxMDAsIDUwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIGNpcmNsZTogZnVuY3Rpb24gKHgsIHksIHIpIHtcbiAgICByZXR1cm4gbmV3IEJWRygnY2lyY2xlJywgeC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHggOiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHI6IHJcbiAgICB9LCBmdW5jdGlvbiAodGFnLCBkYXRhKSB7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdjeCcsIGRhdGEueCk7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdjeScsIGRhdGEueSk7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdyJywgZGF0YS5yKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMjIGBidmcuZWxsaXBzZShjeCwgY3ksIHJ4LCByeSlgXG4gICAgKiBDcmVhdGUgYSBlbGxpcHNlIGNlbnRyZWQgb24gYChjeCwgY3kpYCB3aXRoIHJhZGlpIGByeGAgYW5kIGByeWAuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIGVsbGlwc2UgPSBidmcuZWxsaXBzZSgxMDAsIDEwMCwgMjAwLCAxODApO1xuICAgICogYGBgXG4gICAgKi9cbiAgZWxsaXBzZTogZnVuY3Rpb24gKHgsIHksIHJ4LCByeSkge1xuICAgIHJldHVybiBuZXcgQlZHKCdlbGxpcHNlJywgeC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHggOiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHJ4OiByeCxcbiAgICAgIHJ5OiByeVxuICAgIH0sIGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ2N4JywgZGF0YS54KTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ2N5JywgZGF0YS55KTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3J4JywgZGF0YS5yeCk7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdyeScsIGRhdGEucnkpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyMgYGJ2Zy5saW5lKHgxLCB5MSwgeDIsIHkyKWBcbiAgICAqIENyZWF0ZSBhIGxpbmUgZnJvbSBgKHgxLCB5MSlgIHRvIGAoeDIsIHkyKWAuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIGxpbmUgPSBidmcubGluZSgxMDAsIDEwMCwgMjAwLCAzMDApO1xuICAgICogYGBgXG4gICAgKi9cbiAgbGluZTogZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2xpbmUnLCB4MS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHgxIDoge1xuICAgICAgeDE6IHgxLFxuICAgICAgeTE6IHkxLFxuICAgICAgeDI6IHgyLFxuICAgICAgeTI6IHkyXG4gICAgfSk7XG4gIH0sXG4gIC8qKiAjIyMgYGJ2Zy5wb2x5bGluZShbW3gxLCB5MV0sIFt4MiwgeTJdLCAuLi5dKWBcbiAgICAqIENyZWF0ZSBhIHNlcmllcyBvZiBsaW5lcyBmcm9tIHBvaW50IHRvIHBvaW50LlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciBwb2x5bGluZSA9IGJ2Zy5wb2x5bGluZShbWzEwMCwgMjAwXSwgWzIwMCwgMzAwXSwgWzQwMCwgODAwXV0pO1xuICAgICogYGBgXG4gICAgKi9cbiAgcG9seWxpbmU6IGZ1bmN0aW9uIChwb2ludHMpIHtcbiAgICByZXR1cm4gbmV3IEJWRygncG9seWxpbmUnLCBwb2ludHMuY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyBwb2ludHMgOiB7XG4gICAgICBwb2ludHM6IHBvaW50c1xuICAgIH0sIGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3BvaW50cycsIGRhdGEucG9pbnRzLmpvaW4oJyAnKSk7XG4gICAgfSk7XG4gIH0sXG4gIC8qKiAjIyMgYGJ2Zy5wb2x5Z29uKFtbeDEsIHkxXSwgW3gyLCB5Ml0sIC4uLl0pYFxuICAgICogQ3JlYXRlIGEgY2xvc2VkIHBvbHlnb24gZnJvbSBwb2ludCB0byBwb2ludC4gVGhlIGxhc3QgcG9pbnQgd2lsbCBiZVxuICAgICogY29ubmVjdGVkIGJhY2sgdG8gdGhlIGZpcnN0IHBvaW50LlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciBwb2x5Z29uID0gYnZnLnBvbHlnb24oW1sxMDAsIDIwMF0sIFsyMDAsIDMwMF0sIFs0MDAsIDgwMF1dKTtcbiAgICAqIGBgYFxuICAgICovXG4gIHBvbHlnb246IGZ1bmN0aW9uIChwb2ludHMpIHtcbiAgICByZXR1cm4gbmV3IEJWRygncG9seWdvbicsIHBvaW50cy5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHBvaW50cyA6IHtcbiAgICAgIHBvaW50czogcG9pbnRzXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgZGF0YS5wb2ludHMuam9pbignICcpKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMgR3JvdXBpbmcgRWxlbWVudHNcbiAgICAqICMjIyBgYnZnLmdyb3VwKFt0cmFuc2Zvcm1dKWBcbiAgICAqXG4gICAgKiBDcmVhdGUgYSBncm91cCB0byBjb250YWluIEJWRyBvYmplY3RzLiBJdCBhY3RzIGxpa2UgYSBCVkcgY29udGFpbmVyIHdpdGhcbiAgICAqIGFuIG9wdGlvbmFsIGB0cmFuc2Zvcm1gIGF0dHJpYnV0ZS5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiAvLyBDcmVhdGUgYSBuZXcgZ3JvdXAgYW5kIGZpbGwgaXQgd2l0aCBkYXNoZXMuXG4gICAgKiB2YXIgZGFzaGVzID0gYnZnLmdyb3VwKCk7XG4gICAgKiBmb3IgKGludCBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICogICBkYWhzZXMucmVjdCgxMCwgMTAgKyBpICogMzAsIDUwLCAyMCk7XG4gICAgKiB9XG4gICAgKiBgYGBcbiAgICAqL1xuICBncm91cDogZnVuY3Rpb24gKHRyYW5zZm9ybSkge1xuICAgIHJldHVybiBuZXcgQlZHKCdnJywgdHJhbnNmb3JtLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8gdHJhbnNmb3JtIDoge1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm1cbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMgSHlwZXJsaW5rc1xuICAgICogIyMjIGBidmcuaHlwZXJsaW5rKHVybClgXG4gICAgKlxuICAgICogQ3JlYXRlIGEgaHlwZXJsaW5rIEJWRyB0byB0YXJnZXQgVVJMIGB1cmxgLiBJdCBkb2VzIG5vdCBoYXZlIGFueSBkaXNwbGF5XG4gICAgKiBlbGVtZW50cy4gTWFrZSBzdXJlIHRvIGFwcGVuZCBlbGVtZW50cyB0byBpdC5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiAvLyBDbGlja2luZyBvbiB0aGlzIGVsZW1lbnQgd2lsbCBicmluZyB0aGVtIHRvIHRoZSBHaXRodWIgcGFnZVxuICAgICogdmFyIGdpdGh1YkxpbmsgPSBidmcuaHlwZXJsaW5rKCdodHRwczovL2dpdGh1Yi5jb20vc3BheGUvQlZHLmpzJyk7XG4gICAgKiAvLyBNYWtlIGEgYnV0dG9uIGFuZCBhdHRhY2sgaXQgdG8gdGhlIGxpbmtcbiAgICAqIGdpdGh1YkxpbmsuZWxsaXBzZSgyMDAsIDIwMCwgNTAsIDUwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIGh5cGVybGluazogZnVuY3Rpb24gKHVybCkge1xuICAgIHJldHVybiBuZXcgQlZHKCdhJywgdXJsLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8gdXJsIDoge1xuICAgICAgJ3htbG5zOmhyZWYnOiB1cmxcbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMgT3RoZXIgR2VvbWV0cnlcbiAgICAqICMjIyBgYnZnLnRyaWFuZ2xlKGN4LCBjeSwgcilgXG4gICAgKiBDcmVhdGUgYSByZWd1bGFyIHRyaWFuZ2xlIGNlbnRyZWQgb24gYChjeCwgY3kpYCB3aXRoIHZlcnRpY2VzIGByYCBkaXN0YW5jZVxuICAgICogYXdheS5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgdHJpYW5nbGUgPSBidmcudHJpYW5nbGUoNTAsIDUwLCAxMCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICB0cmlhbmdsZTogZnVuY3Rpb24gKHgsIHksIHIpIHtcbiAgICByZXR1cm4gbmV3IEJWRygncG9seWdvbicsIHguY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4IDoge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICByOiByXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdmFyIHBvaW50cyA9IFtcbiAgICAgICAgW2RhdGEueCwgZGF0YS55LWRhdGEucl0sXG4gICAgICAgIFtkYXRhLngtZGF0YS5yLzIqTWF0aC5zcXJ0KDMpLCBkYXRhLnkrZGF0YS5yLzJdLFxuICAgICAgICBbZGF0YS54K2RhdGEuci8yKk1hdGguc3FydCgzKSwgZGF0YS55K2RhdGEuci8yXVxuICAgICAgXTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3BvaW50cycsIHBvaW50cy5qb2luKCcgJykpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyMgYGJ2Zy5hcmMoY3gsIGN5LCByeCwgcnksIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKWBcbiAgICAqIENyZWF0ZSBhbiBhcmMgY2VudHJlZCBvbiBgKGN4LCBjeSlgIHdpdGggcmFkaXVzIGByeGAgYW5kIGByeWAsIHN0YXJ0aW5nXG4gICAgKiBmcm9tIGBzdGFydEFuZ2xlYCBhbnRpLWNsb2Nrd2lzZSB0byBgZW5kQW5nbGVgLCB3aGVyZSAwIGlzIHRoZSBwb3NpdGl2ZVxuICAgICogeC1heGlzLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciBhcmMgPSBidmcuYXJjKDUwLCA1MCwgNTAsIDEwMCwgMCwgTWF0aC5QSSk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBhcmM6IGZ1bmN0aW9uICh4LCB5LCByeCwgcnksIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3BhdGgnLCB4LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geCA6IHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgcng6IHJ4LFxuICAgICAgcnk6IHJ5LFxuICAgICAgc3RhcnRBbmdsZTogc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlOiBlbmRBbmdsZVxuICAgIH0sIGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICAgIHZhciBwMSA9IGdldFBvaW50T25FbGxpcHNlKGRhdGEueCwgZGF0YS55LCBkYXRhLnJ4LCBkYXRhLnJ5LCBkYXRhLnN0YXJ0QW5nbGUpO1xuICAgICAgdmFyIHAyID0gZ2V0UG9pbnRPbkVsbGlwc2UoZGF0YS54LCBkYXRhLnksIGRhdGEucngsIGRhdGEucnksIGRhdGEuZW5kQW5nbGUpO1xuICAgICAgdmFyIGxhcmdlQXJjID0gKGRhdGEuZW5kQW5nbGUgLSBkYXRhLnN0YXJ0QW5nbGUpID4gTWF0aC5QSSA/IDEgOiAwO1xuICAgICAgdmFyIHN3ZWVwQXJjID0gZGF0YS5lbmRBbmdsZSA+IGRhdGEuc3RhcnRBbmdsZSA/IDEgOiAwO1xuICAgICAgdmFyIGQgPSBbXG4gICAgICAgIFsnTScsIHAxLngsIHAxLnldLFxuICAgICAgICBbJ0EnLCBkYXRhLnJ4LCBkYXRhLnJ5LCAwLCBsYXJnZUFyYywgc3dlZXBBcmMsIHAyLngsIHAyLnldXG4gICAgICBdO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnZCcsIGQubWFwKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiB4LmpvaW4oJyAnKTtcbiAgICAgIH0pLmpvaW4oJyAnKSk7XG5cbiAgICAgIGZ1bmN0aW9uIGdldFBvaW50T25FbGxpcHNlKHgsIHksIHJ4LCByeSwgYW5nbGUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiByeCAqIE1hdGguY29zKGFuZ2xlKSArIHgsXG4gICAgICAgICAgeTogcnkgKiBNYXRoLnNpbihhbmdsZSkgKyB5XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLnRleHQodGV4dCwgeCwgeSlgXG4gICAgKiBDcmVhdGUgYSBzdHJpbmcgb2YgYHRleHRgIHRleHQgYXQgbG9jYXRpb24gYCh4LCB5KWAuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIHRleHQgPSBidmcudGV4dCgnTXJyYWEhJywgMjAsIDEwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIHRleHQ6IGZ1bmN0aW9uICh0ZXh0LCB4LCB5KSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3RleHQnLCB0ZXh0LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8gdGV4dCA6IHtcbiAgICAgIHRleHQ6IHRleHQsXG4gICAgICB4OiB4LFxuICAgICAgeTogeVxuICAgIH0sIGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICAgIHRhZy5pbm5lckhUTUwgPSBkYXRhLnRleHQ7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCd4JywgZGF0YS54KTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3knLCBkYXRhLnkpO1xuICAgIH0pLmZpbGwoJ3JnYmEoMTc1LCAxNzUsIDE3NSwgMSknKVxuICAgICAgLnN0cm9rZSgncmdiYSgwLCAwLCAwLCAwKScpO1xuICB9XG59O1xuXG5PYmplY3Qua2V5cyhjcmVhdGlvbkZ1bmN0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICBCVkdbZl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNyZWF0aW9uRnVuY3Rpb25zW2ZdLmFwcGx5KEJWRywgYXJndW1lbnRzKTtcbiAgfTtcbiAgQlZHLnByb3RvdHlwZVtmXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYnZnID0gY3JlYXRpb25GdW5jdGlvbnNbZl0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmFwcGVuZChidmcpO1xuICAgIHJldHVybiBidmc7XG4gIH07XG59KTtcblxuLyoqICMjIFRoZSBCVkcgT2JqZWN0XG4gICogQlZHcyBhcmUgU1ZHcyB3aXRoIGV4dHJhIHN1cGVycG93ZXJzLlxuICAqL1xuXG4vKiogIyMjIGBidmcuZmluZChzZWxlY3RvcilgXG4gICogUmV0dXJuIGFuIGFycmF5IG9mIEJWR3MgbWF0Y2hpbmcgYHNlbGVjdG9yYCBpbnNpZGUgQlZHLiBgc2VsZWN0b3JgIGlzXG4gICogZGVmaW5lZCBhcyBbQ1NTIFNlbGVjdG9yc10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL0dldHRpbmdfc3RhcnRlZC9TZWxlY3RvcnMpLlxuICAqL1xuQlZHLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciByZXN1bHQgPSB0aGlzLl90YWcucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIGlmIChyZXN1bHQpIHtcbiAgICB2YXIgYnZncyA9IFtdO1xuICAgIFtdLnNsaWNlLmNhbGwocmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7XG4gICAgICBidmdzLnB1c2goci5fZ2V0QlZHKCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBidmdzO1xuICB9XG4gIHJldHVybiBbXTtcbn07XG5cbi8qKiAjIyMgYGJ2Zy5hcHBlbmQoYnZnKWBcbiAgKiBJbnNlcnQgYGNoaWxkX2J2Z2AgaW5zaWRlIGBidmdgLiBUaGlzIGlzIHVzZWZ1bCB0byBhZGQgZWxlbWVudHMgaW5zaWRlIGFcbiAgKiBgQlZHLmdyb3VwKClgLlxuICAqL1xuQlZHLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbiAoY2hpbGRfYnZnKSB7XG4gIHRoaXMuX3RhZy5hcHBlbmRDaGlsZChjaGlsZF9idmcuX3RhZyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIyBgYnZnLnJlbW92ZSgpYFxuICAqIFJlbW92ZSBpdHNlbGYgZnJvbSBpdHMgcGFyZW50LiBSZXR1cm4gc2VsZiByZWZlcmVuY2UuXG4gICovXG5CVkcucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50KCk7XG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQuX3RhZy5yZW1vdmVDaGlsZCh0aGlzLl90YWcpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIyBgYnZnLnBhcmVudCgpYFxuICAqIFJldHVybiB0aGUgcGFyZW50IEJWRy4gSWYgdGhlcmUgaXMgbm8gcGFyZW50IChzdWNoIGlzIHRoZSBjYXNlIGZvciB0aGUgQlZHXG4gICogY29udGFpbmVyIGl0c2VsZiksIHJldHVybiBudWxsLlxuICAqL1xuQlZHLnByb3RvdHlwZS5wYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl90YWcucGFyZW50Tm9kZSAmJiB0eXBlb2YgdGhpcy5fdGFnLnBhcmVudE5vZGUuX2dldEJWRyA9PT0gJ2Z1bmN0aW9uJylcbiAgIHJldHVybiB0aGlzLl90YWcucGFyZW50Tm9kZS5fZ2V0QlZHKCk7XG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqICMjIyBgYnZnLmNoaWxkcmVuKClgXG4gICogUmV0dXJuIGEgbGlzdCBvZiBCVkcgZWxlbWVudHMgaW5zaWRlIGBidmdgLlxuICAqL1xuQlZHLnByb3RvdHlwZS5jaGlsZHJlbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3RhZy5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKVxuICAgIGlmICh0eXBlb2YgdGhpcy5fdGFnLmNoaWxkTm9kZXNbaV0uX2dldEJWRyA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgIG91dHB1dC5wdXNoKHRoaXMuX3RhZy5jaGlsZE5vZGVzW2ldLl9nZXRCVkcoKSk7XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKiogIyMjIGBidmcudGFnKClgXG4gICogUmV0dXJuIHRodyBCVkcgZ3JhcGhpY2FsIGNvbnRlbnQsIGEgU1ZHLlxuICAqL1xuQlZHLnByb3RvdHlwZS50YWcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLl90YWc7XG59O1xuXG4gLyoqICMjIyBgYnZnLmRhdGEoKWBcbiAgKiBHZXQvc2V0IHRoZSBgZGF0YWAgb2JqZWN0IGluIGEgQlZHLiBUaGVyZSBhcmUgZm91ciB3YXlzIHRvIHVzZSB0aGlzXG4gICogZnVuY3Rpb24uXG4gICpcbiAgKiAgLSBgYnZnLmRhdGEoKWA6IFJldHVybiBgZGF0YWAgYm91bmQgdG8gdGhlIEJWRy5cbiAgKiAgLSBgYnZnLmRhdGEobmV3RGF0YSlgOiBVcGRhdGUgYGRhdGFgIHdpdGggYG5ld0RhdGFgIG9iamVjdC5cbiAgKiAgLSBgYnZnLmRhdGEocHJvcGVydHkpYDogUmV0dXJuIGBkYXRhW3Byb3BlcnR5XWAgZnJvbSB0aGUgQlZHLlxuICAqICAtIGBidmcuZGF0YShwcm9wZXJ0eSwgbmV3VmFsdWUpYDogVXBkYXRlIGBwcm9wZXJ0eWAgd2l0aCBgbmV3VmFsdWVgLlxuICAqXG4gICogUmV0dXJuIGBidmdgIG9iamVjdCByZWZlcmVuY2UuXG4gICovXG5CVkcucHJvdG90eXBlLmRhdGEgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGE7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChhcmd1bWVudHNbMF0uY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGsgaW4gYXJndW1lbnRzWzBdKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHNbMF0uaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICB0aGlzLmRhdGEoaywgYXJndW1lbnRzWzBdW2tdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYXRhW2FyZ3VtZW50c1swXV07XG4gICAgfVxuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICB0aGlzLl9kYXRhW2FyZ3VtZW50c1swXV0gPSBhcmd1bWVudHNbMV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IodGhpcywgJ2RhdGEoKSByZWNlaXZlZCBtb3JlIHRoYW4gMiBhcmd1bWVudHMuJyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYGJ2Zy5hdHRyKClgXG4gICogR2V0L3NldCBhdHRyaWJ1dGVzIG9uIGEgQlZHLlxuICAqXG4gICogIC0gYGJ2Zy5hdHRyKGF0dHIpYDogUmV0dXJuIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgKiAgLSBgYnZnLmF0dHIoYXR0ciwgdmFsdWUpYDogVXBkYXRlIGBhdHRyYCB3aXRoIGB2YWx1ZWAuXG4gICovXG5CVkcucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAoYXR0ciwgdmFsdWUpIHtcbiAgaWYgKCFhdHRyKSB0aHJvdyBuZXcgRXJyb3IoJ2F0dHIgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIGlmICghdmFsdWUpIHJldHVybiB0aGlzLl90YWcuZ2V0QXR0cmlidXRlKGF0dHIpO1xuICBlbHNlIHRoaXMuX3RhZy5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsdWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKiAjIyMgYGJ2Zy5maWxsKClgXG4gICogR2V0L3NldCB0aGUgZmlsbGluZyBjb2xvdXIuXG4gICpcbiAgKiAgLSBgYnZnLmZpbGwoKWA6IFJldHVybiBgZmlsbGAgY29sb3VyIGFzIFtyLCBnLCBiLCBhXSwgb3IgYCcnYCAoZW1wdHlcbiAgKiAgICAgICAgICAgICAgICAgIHN0cmlnKSBpZiBmaWxsIGlzIG5vdCBzcGVjaWZpZWQgb24gdGhlIG9iamVjdC5cbiAgKiAgLSBgYnZnLmZpbGwocmdiKWA6IFNldCBgZmlsbGAgd2l0aCBhIGdyZXlzY2FsZSBjb2xvdXIgd2l0aCBlcXVhbFxuICAqICAgIHZhbHVlcyBgKHJnYiwgcmdiLCByZ2IpYC5cbiAgKiAgLSBgYnZnLmZpbGwociwgZywgYiwgW2FdKWA6IFNldCBgZmlsbGAgd2l0aCBgKHIsIGcsIGIsIGEpYC4gSWYgYGFgXG4gICogICAgaXMgb21pdHRlZCwgaXQgZGVmYXVsdHMgdG8gYDFgLlxuICAqXG4gICogYHJgLCBgZ2AsIGBiYCBzaG91bGQgYmUgaW4gdGhlIHJhbmdlIG9mIDAtMjU1IGluY2x1c2l2ZS5cbiAgKi9cbkJWRy5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB2YXIgZiA9IHRoaXMuYXR0cignZmlsbCcpO1xuICAgIGlmIChmKSByZXR1cm4gQlZHLmV4dHJhY3ROdW1iZXJBcnJheShmKTtcbiAgICByZXR1cm4gJyc7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnc3RyaW5nJykgcmV0dXJuIHRoaXMuYXR0cignZmlsbCcsIGFyZ3VtZW50c1swXSk7XG4gICAgZWxzZSByZXR1cm4gdGhpcy5hdHRyKCdmaWxsJywgQlZHLnJnYmEoYXJndW1lbnRzWzBdKSk7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyB8fCBhcmd1bWVudHMubGVuZ3RoID09PSA0KSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cignZmlsbCcsIEJWRy5yZ2JhLmFwcGx5KEJWRywgYXJndW1lbnRzKSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IodGhpcywgJ2ZpbGwoKSByZWNlaXZlZCBtb3JlIHRoYW4gMSBhcmd1bWVudC4nKTtcbiAgfVxufTtcblxuLyoqICMjIyBgYnZnLm5vRmlsbCgpYFxuICAqIFJlbW92ZSBCVkcgb2JqZWN0J3MgY29sb3VyIGZpbGxpbmcgY29tcGxldGVseS5cbiAgKi9cbkJWRy5wcm90b3R5cGUubm9GaWxsID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5maWxsKCdyZ2JhKDAsIDAsIDAsIDApJyk7IH07XG5cbi8qKiAjIyMgYGJ2Zy5zdHJva2UoKWBcbiAgKiBHZXQvc2V0IHRoZSBvdXRsaW5lIGNvbG91ci5cbiAgKlxuICAqICAtIGBidmcuc3Ryb2tlKClgOiBSZXR1cm4gYHN0cm9rZWAgY29sb3VyIGFzIFtyLCBnLCBiLCBhXS4gSWYgYHN0cm9rZWAgaXNcbiAgKiAgICBub3Qgc3BlY2lmaWVkLCByZXR1cm4gYCcnYCAoZW1wdHkgc3RyaW5nKS5cbiAgKiAgLSBgYnZnLnN0cm9rZShyZ2IpYDogU2V0IGBzdHJva2VgIHdpdGggYSBncmV5c2NhbGUgY29sb3VyIHdpdGggZXF1YWxcbiAgKiAgICB2YWx1ZXMgYChyZ2IsIHJnYiwgcmdiKWAuXG4gICogIC0gYGJ2Zy5zdHJva2UociwgZywgYiwgW2FdKWA6IFNldCBgc3Ryb2tlYCB3aXRoIGAociwgZywgYiwgYSlgLiBJZiBgYWBcbiAgKiAgICBpcyBvbWl0dGVkLCBpdCBkZWZhdWx0cyB0byBgMWAuXG4gICpcbiAgKiBgcmAsIGBnYCwgYGJgIHNob3VsZCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMC0yNTUgaW5jbHVzaXZlLlxuICAqL1xuQlZHLnByb3RvdHlwZS5zdHJva2UgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgdmFyIHMgPSB0aGlzLmF0dHIoJ3N0cm9rZScpO1xuICAgIGlmIChzKSByZXR1cm4gQlZHLmV4dHJhY3ROdW1iZXJBcnJheShzKTtcbiAgICByZXR1cm4gJyc7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnc3RyaW5nJykgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlJywgYXJndW1lbnRzWzBdKTtcbiAgICBlbHNlIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZScsIEJWRy5yZ2JhKGFyZ3VtZW50c1swXSkpO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xuICAgIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZScsIEJWRy5yZ2JhLmFwcGx5KEJWRywgYXJndW1lbnRzKSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IodGhpcywgJ3N0cm9rZSgpIHJlY2VpdmVkIG1vcmUgdGhhbiAxIGFyZ3VtZW50LicpO1xuICB9XG59O1xuXG4vKiogIyMjIGBidmcuc3Ryb2tlV2lkdGgoW3dpZHRoXSlgXG4gICogR2V0L3NldCB0aGUgb3V0bGluZSB0aGlja25lc3MuXG4gICpcbiAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IG91dGxpbmUgdGhpY2tuZXNzIGlmIGB3aWR0aGAgaXMgb21pdHRlZC4gT3RoZXJpc2UsXG4gICogaXQgYXNzaWducyB0aGUgb3V0bGluZSB0aGlja25lc3Mgd2l0aCBhIG5ldyB2YWx1ZSwgYW5kIHJldHVybnMgdGhlIGBidmdgXG4gICogb2JqZWN0IHJlZmVyZW5jZS5cbiAgKlxuICAqICAtIGB3aWR0aGAgIDogT3V0bGluZSB0aGlja25lc3MgaW4gcGl4ZWxzLlxuICAqL1xuQlZHLnByb3RvdHlwZS5zdHJva2VXaWR0aCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2Utd2lkdGgnKTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdGhpcy5hdHRyKCdzdHJva2Utd2lkdGgnLCBhcmd1bWVudHNbMF0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKHRoaXMsICdzdHJva2VXaWR0aCgpIHJlY2VpdmVkIG1vcmUgdGhhbiAxIGFyZ3VtZW50LicpO1xuICB9XG59O1xuXG4vKiogIyMjIGBidmcubm9TdHJva2UoKWBcbiAgKiBSZW1vdmUgQlZHIG9iamVjdCdzIG91dGxpbmUgY29tcGxldGVseS5cbiAgKi9cbkJWRy5wcm90b3R5cGUubm9TdHJva2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnN0cm9rZVdpZHRoKDApLnN0cm9rZSgncmdiYSgwLCAwLCAwLCAwKScpO1xufTtcblxuQlZHLnByb3RvdHlwZS5jb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzLl90YWcuaW5uZXJIVE1MO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB0aGlzLl90YWcuaW5uZXJIVE1MID0gYXJndW1lbnRzWzBdO1xuICAgIHJldHVybiB0aGlzO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKHRoaXMsICdjb250ZW50KCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDEgYXJndW1lbnQuJyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYGJ2Zy5hZGRDbGFzcyhjKWBcbiogQWRkIGEgY2xhc3MgbmFtZSB0byB0aGUgZWxlbWVudC5cbiovXG5CVkcucHJvdG90eXBlLmFkZENsYXNzID0gZnVuY3Rpb24gKGMpIHtcbiAgdGhpcy5fdGFnLmNsYXNzTGlzdC5hZGQoYyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIyBgYnZnLnJlbW92ZUNsYXNzKGMpYFxuICAqIFJlbW92ZSBhIGNsYXNzIG5hbWUgdG8gdGhlIGVsZW1lbnQuXG4gICovXG5CVkcucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGMpIHtcbiAgdGhpcy5fdGFnLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIyBgYnZnLmhhc0NsYXNzKGMpYFxuICAqIFJldHVybiB0cnVlIGlmIHRoZSBlbGVtZW50IGhhcyBjbGFzcyBgY2AuXG4gICovXG5CVkcucHJvdG90eXBlLmhhc0NsYXNzID0gZnVuY3Rpb24gKGMpIHtcbiAgcmV0dXJuIHRoaXMuX3RhZy5jbGFzc0xpc3QuY29udGFpbnMoYyk7XG59O1xuXG4vKiogIyMjIGBidmcucmVtb3ZlQ2xhc3MoYylgXG4gICogQWRkIG9yIHJlbW92ZSB0aGUgY2xhc3MgYGNgIHRvIHRoZSBlbGVtZW50LlxuICAqL1xuQlZHLnByb3RvdHlwZS50b2dnbGVDbGFzcyA9IGZ1bmN0aW9uIChjKSB7XG4gIHRoaXMuX3RhZy5jbGFzc0xpc3QudG9nZ2xlKGMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKiAjIyBBZmZpbmUgVHJhbnNmb3JtYXRpb25zICovXG5CVkcucHJvdG90eXBlLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5fdGFnLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJykgfHwgJyc7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHRoaXMuX3RhZy5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsIGFyZ3VtZW50c1swXSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd0cmFuc2Zvcm0oKSByZWNlaXZlZCBtb3JlIHRoYW4gMSBhcmd1bWVudCcpO1xuICB9XG59O1xuXG4vKiogIyMjIGBCVkcudHJhbnNsYXRlKHgsIFt5XSlgXG4gICogQXBwbHkgYSBtb3ZpbmcgdHJhbnNsYXRpb24gYnkgYHhgIGFuZCBgeWAgdW5pdHMuIElmIGB5YCBpcyBub3QgZ2l2ZW4sIGl0XG4gICogaXMgYXNzdW1lZCB0byBiZSAwLlxuICAqL1xuQlZHLnByb3RvdHlwZS50cmFuc2xhdGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICBpZiAodHlwZW9mIHggIT09ICdudW1iZXInICYmIHR5cGVvZiB5ICE9PSAnbnVtYmVyJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RyYW5zbGF0ZSgpIG9ubHkgdGFrZSBudW1iZXJzIGFzIGFyZ3VtZW50cycpO1xuICB5ID0geSB8fCAwO1xuICB2YXIgdHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm0oKTtcbiAgdGhpcy5fdGFnLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgW3RyYW5zZm9ybSwgJyB0cmFuc2xhdGUoJywgeCwgJyAnLCB5LCAnKSddLmpvaW4oJycpLnRyaW0oKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIFV0aWxpdHkgTWV0aG9kcyAqL1xuXG4vKiogIyMjIGBCVkcucmdiYShyLCBnLCBiLCBbYV0pYFxuICAqIFJldHVybiBhIHN0cmluZyBpbiB0aGUgZm9ybSBvZiBgcmdiYShyLCBnLCBiLCBhKWAuXG4gICpcbiAgKiBJZiBvbmx5IGByYCBpcyBnaXZlbiwgdGhlIHZhbHVlIGlzIGNvcGllZCB0byBgZ2AgYW5kIGBiYCB0byBwcm9kdWNlIGFcbiAgKiBncmV5c2NhbGUgdmFsdWUuXG4gICovXG5CVkcucmdiYSA9IGZ1bmN0aW9uIChyLCBnLCBiLCBhPTEuMCkge1xuICBpZiAodHlwZW9mIHIgIT09ICdudW1iZXInKSB0aHJvdyBuZXcgVHlwZUVycm9yICgncmdiYSgpIG11c3QgdGFrZSBudW1lcmljYWwgdmFsdWVzIGFzIGlucHV0Jyk7XG4gIGcgPSBnIHx8IHI7XG4gIGIgPSBiIHx8IHI7XG4gIHJldHVybiAncmdiYSgnICsgW3IsIGcsIGIsIGFdLmpvaW4oJywnKSArICcpJztcbn07XG5cbi8qKiAjIyMgYEJWRy5oc2xhKGh1ZSwgc2F0dXJhdGlvbiwgbGlnaHRuZXNzLCBbYWxwaGFdKWBcbiAgKiBSZXR1cm4gdGhlIENTUyByZXByZXNlbnRhdGlvbiBpbiBgaHNsYSgpYCBhcyBhIHN0cmluZy5cbiAgKlxuICAqICAtIGBodWVgOiBBIHZhbHVlIGJldHdlZW4gYDBgIGFuZCBgMzYwYCwgd2hlcmUgYDBgIGlzIHJlZCwgYDEyMGAgaXMgZ3JlZW4sXG4gICogICAgICAgICAgIGFuZCBgMjQwYCBpcyBibHVlLlxuICAqICAtIGBzYXR1cmF0aW9uYCA6IEEgdmFsdWUgYmV0d2VlbiBgMGAgYW5kIGAxMDBgLCB3aGVyZSBgMGAgaXMgZ3JleSBhbmRcbiAgKiAgICAgICAgICAgICAgICAgYDEwMGAgaXMgZnVsbHkgc2F0dXJhdGUuXG4gICogIC0gYGxpZ2h0bmVzc2A6IEEgdmFsdWUgYmV0d2VlbiBgMGAgYW5kIGAxMDBgLCB3aGVyZSBgMGAgaXMgYmxhY2sgYW5kXG4gICogICAgICAgICAgICAgICAgIGAxMDBgIGlzIGZ1bGwgaW50ZW5zaXR5IG9mIHRoZSBjb2xvdXIuXG4gICovXG5CVkcuaHNsYSA9IGZ1bmN0aW9uIChodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcywgYWxwaGEpIHtcbiAgYWxwaGEgPSBhbHBoYSB8fCAxLjA7XG4gIHJldHVybiAnaHNsYSgnICsgW2h1ZSwgc2F0dXJhdGlvbiArICclJywgbGlnaHRuZXNzICsgJyUnLCBhbHBoYV0uam9pbignLCcpICsgJyknO1xufTtcblxuLyoqICMjIyBgQlZHLmV4dHJhY3ROdW1iZXJBcnJheShzdHIpYFxuICAqIFJldHVybiBhbiBhcnJheSBgW3gsIHksIHosIC4uLl1gIGZyb20gYSBzdHJpbmcgY29udGFpbmluZyBjb21tb24tc2VwYXJhdGVkXG4gICogbnVtYmVycy5cbiAgKi9cbkJWRy5leHRyYWN0TnVtYmVyQXJyYXkgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHJldHVybiBzdHIubWF0Y2goL1xcZCpcXC4/XFxkKy9nKS5tYXAoTnVtYmVyKTtcbn07XG5cblxuLyoqICMjIENvbnRyaWJ1dGUgdG8gdGhpcyBsaWJyYXJ5XG4qIFtNYWtlIGEgcHVsbCByZXF1ZXN0XShodHRwczovL2dpdGh1Yi5jb20vU3BheGUvQlZHLmpzL3B1bGxzKSBvclxuKiBbcG9zdCBhbiBpc3N1ZV0oaHR0cHM6Ly9naXRodWIuY29tL1NwYXhlL0JWRy5qcy9pc3N1ZXMpLiBTYXkgaGVsbG8gdG9cbiogY29udGFjdEB4YWl2ZXJoby5jb20uXG4qLyIsImltcG9ydCBCVkcgZnJvbSAnLi9idmcnO1xuXG52YXIgYnZnID0gQlZHLmNyZWF0ZSgnI3VuaXZlcnNlJyk7XG5cbnZhciBzaXplID0gMTI4O1xudmFyIHBvcyA9IDQwMDtcblxudmFyIGFsYmVkbyA9IGJ2Zy5lbGxpcHNlKHBvcywgcG9zLCBzaXplLCBzaXplKVxuICAgICAgICAgICAgICAgICAuZmlsbCg2NCk7XG5cbnZhciBkaWZmdXNlID0gYnZnLmVsbGlwc2UocG9zLCBwb3MsIHNpemUsIHNpemUpXG4gICAgICAgICAgICAgICAgIC5maWxsKDI1NSwgMjU1LCAyNTUsIDAuNClcbiAgICAgICAgICAgICAgICAgLm5vU3Ryb2tlKCk7XG5cbnZhciBzcGVjdWxhciA9IGJ2Zy5lbGxpcHNlKHBvcywgcG9zLCBzaXplLzgsIHNpemUvOClcbiAgICAgICAgICAgICAgICAgIC5maWxsKDI1NSwgMjU1LCAyNTUsIDAuNSlcbiAgICAgICAgICAgICAgICAgIC5ub1N0cm9rZSgpO1xuXG52YXIgb3V0bGluZSA9IGJ2Zy5lbGxpcHNlKHBvcywgcG9zLCBzaXplLCBzaXplKVxuICAgICAgICAgICAgICAgICAuZmlsbCgwLCAwLCAwLCAwKVxuICAgICAgICAgICAgICAgICAuc3Ryb2tlKDMyKVxuICAgICAgICAgICAgICAgICAuc3Ryb2tlV2lkdGgoOCk7XG5cbmJ2Zy50YWcoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgdmFyIG14ID0gZXZlbnQuY2xpZW50WDtcbiAgdmFyIG15ID0gZXZlbnQuY2xpZW50WTtcbiAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuMihteS1wb3MsIG14LXBvcyk7XG4gIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhteCAtIHBvcywgMikgKyBNYXRoLnBvdyhteSAtIHBvcywgMikpO1xuICBkaXN0YW5jZSA9IE1hdGgubWluKGRpc3RhbmNlLCBzaXplLzIpO1xuICBpZiAoIWlzTmFOKGFuZ2xlKSkge1xuICAgIGRpZmZ1c2UuZGF0YSh7XG4gICAgICB4OiBNYXRoLmNvcyhhbmdsZSkgKiBkaXN0YW5jZSArIHBvcyxcbiAgICAgIHk6IE1hdGguc2luKGFuZ2xlKSAqIGRpc3RhbmNlICsgcG9zLFxuICAgICAgcng6IE1hdGgubWF4KGRpc3RhbmNlLCBzaXplKSxcbiAgICAgIHJ5OiBNYXRoLm1heChkaXN0YW5jZSwgc2l6ZSlcbiAgICB9KTtcbiAgICB2YXIgY3ggPSBNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLm1pbihNYXRoLnBvdyhkaXN0YW5jZSwgMS4xKSwgc2l6ZS8zKjIpICsgcG9zO1xuICAgIHZhciBjeSA9IE1hdGguc2luKGFuZ2xlKSAqIE1hdGgubWluKE1hdGgucG93KGRpc3RhbmNlLCAxLjEpLCBzaXplLzMqMikgKyBwb3M7XG4gICAgc3BlY3VsYXIuZGF0YSh7XG4gICAgICB4OiBjeCxcbiAgICAgIHk6IGN5LFxuICAgICAgcng6IHNpemUvOCAqIChzaXplLWRpc3RhbmNlKS9zaXplXG4gICAgfSkudHJhbnNmb3JtKCdyb3RhdGUoJyArIFthbmdsZSAvIE1hdGguUEkgKiAxODAsIGN4LCBjeV0uam9pbigpICsgJyknKTtcbiAgfVxufSk7XG5cbi8vIFJlbW92ZSBsb2FkaW5nIHBsYWNlaG9sZGVyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZycpLnJlbW92ZSgpOyJdfQ==
