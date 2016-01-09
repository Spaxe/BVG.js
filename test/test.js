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

var _bvg = require('../bvg');

var _bvg2 = _interopRequireDefault(_bvg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('BVG.js', function () {
  var bvg;
  var dummy;
  var container;

  before(function () {
    container = document.createElement('div');
    container.id = 'container';
    document.body.appendChild(container);
  });

  it('should be able to create a container', function () {
    _bvg2.default.should.be.a('function');
    _bvg2.default.create.should.be.a('function');
    bvg = _bvg2.default.create('#container');
    bvg.should.be.instanceof(_bvg2.default);
    should.not.exist(bvg.parent());
    bvg.tag().should.be.instanceof(SVGElement);
    _bvg2.default.create.bind(_bvg2.default, '#not-container').should.Throw(TypeError);
  });

  it('should be able to remove itself from parent', function () {
    dummy = _bvg2.default.create(container);
    var rect = dummy.rect(10, 20, 30, 40);
    rect.parent().should.equal(dummy);
    rect.remove();
    should.not.exist(rect.parent());
  });

  it('should provide basic shape functions', function () {
    ['rect', 'ellipse', 'line'].forEach(function (f) {
      _bvg2.default[f].should.be.a('function');
      var shape = _bvg2.default[f](10, 20, 30, 40);
      shape.tag().should.be.instanceof(SVGElement);
    });
    var polyline = _bvg2.default.polyline([[10, 20], [30, 40]]);
    polyline.tag().should.be.instanceof(SVGElement);
    polyline.data('points').should.eql([[10, 20], [30, 40]]);
    var polygon = _bvg2.default.polygon([[100, 20], [20, 70], [50, 60]]);
    polygon.tag().should.be.instanceof(SVGElement);
    polygon.data('points').should.eql([[100, 20], [20, 70], [50, 60]]);
  });

  it('should provide access to data, strokes and fills', function () {
    var data = {
      x: 10,
      y: 20,
      width: 30,
      height: 40
    };
    var shape = _bvg2.default.rect(data);
    shape.data('x').should.equal(10);
    shape.data().should.equal(data);
    shape.data('y', 50);
    shape.data('y').should.equal(50);

    var c = [255, 30, 50, 1];
    shape.stroke.apply(shape, c);
    shape.stroke().should.eql(c);
    shape.stroke(255, 20, 50);
    shape.stroke().should.not.eql(c);
    shape.stroke(255, 30, 50, 1);
    shape.stroke().should.eql(c);
    shape.stroke(255);
    shape.stroke().should.eql([255, 255, 255, 1]);
    shape.noStroke();
    shape.stroke().should.eql([0, 0, 0, 0]);

    shape.fill.apply(shape, c);
    shape.fill().should.eql(c);
    shape.fill(255, 20, 50);
    shape.fill().should.not.eql(c);
    shape.fill(255, 30, 50, 1);
    shape.fill().should.eql(c);
    shape.fill(255);
    shape.fill().should.eql([255, 255, 255, 1]);
    shape.noFill();
    shape.fill().should.eql([0, 0, 0, 0]);
  });

  it('should draw geometry', function () {
    var triangle = _bvg2.default.triangle(50, 50, 60);
    triangle.tag().should.be.instanceof(SVGElement);
    var arc = _bvg2.default.arc(250, 250, 100, 200, 0, Math.PI / 3);
    arc.tag().should.be.instanceof(SVGElement);
    arc = _bvg2.default.arc(600, 350, 200, 200, Math.PI, Math.PI * 2 - 0.1);
    arc.tag().should.be.instanceof(SVGElement);
    arc = _bvg2.default.arc(624, 375, 200, 200, Math.PI, Math.PI / 2);
    arc.tag().should.be.instanceof(SVGElement);
  });

  it('should render text', function () {
    var text = bvg.text('Mrraa!', 30, 40).fill(0);
    text.tag().should.be.instanceof(SVGElement);
    text.tag().tagName.should.eql('text');
    text.parent().should.equal(bvg);
    text.remove();
  });

  it('should provide access to parent and children nodes', function () {
    [[10, 20, 30, 40], [30, 20, 40, 30]].forEach(function (args) {
      bvg.rect.apply(bvg, args);
    });
    var children = bvg.children();
    children.length.should.eql(2);
    children[0].parent().should.equal(bvg);
    children[0].data('x').should.eql(10);
    children[0].data('height').should.eql(40);
    children[0].remove();
    children[1].remove();
  });

  it('should provide selection functions for nodes inside', function () {
    [[10, 20, 30, 40], [30, 20, 40, 30]].forEach(function (args) {
      var b = bvg.rect.apply(bvg, args);
      b.tag().setAttribute('class', 'test');
    });
    var children = bvg.find('.test');
    children.length.should.eql(2);
    children[0].parent().should.equal(bvg);
    children[0].data('x').should.eql(10);
    children[0].data('height').should.eql(40);
    children[0].remove();
    children[1].remove();
  });

  it('should support RGBA and HSLA colour functions', function () {
    _bvg2.default.rgba(255).should.eql('rgba(255,255,255,1)');
    _bvg2.default.rgba(255, 200, 244).should.eql('rgba(255,200,244,1)');
    _bvg2.default.rgba(255, 200, 244, 0.5).should.eql('rgba(255,200,244,0.5)');
    _bvg2.default.hsla(230, 100, 75, 0.3).should.eql('hsla(230,100%,75%,0.3)');
    _bvg2.default.hsla(230, 100, 75).should.eql('hsla(230,100%,75%,1)');
  });

  it('should have affine transformations', function () {
    var b = bvg.rect(0, 0, 10, 10);
    b.transform().should.eql('');
    b.transform('matrix(0 0 0 1 1 1)');
    b.transform().should.eql('matrix(0 0 0 1 1 1)');
    b.transform('');

    b.translate(10, 10);
    b.transform().should.eql('translate(10 10)');
    b.transform('');
    b.translate(-90);
    b.transform().should.eql('translate(-90 0)');
  });
}); /* global mocha: true, define: true, describe: true, it: true, before: true, after: true */

},{"../bvg":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidmcuanMiLCJ0ZXN0L2Jhc2ljLnVuaXR0ZXN0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0FDY0EsWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQzs7OztrQkF3SFcsR0FBRztBQWxDM0IsU0FBUyxPQUFPLENBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRTs7OztBQUkvQixRQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxVQUFVLE9BQU8sRUFBRTtBQUNyQyxXQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFOzs7QUFHaEMsVUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLE1BQU0sRUFBRTtBQUN0QyxlQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztPQUNyQztLQUNGLENBQUM7OztBQUFDLEFBR0gsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDOUIsQ0FBQzs7O0FBQUMsQUFHSCxRQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUN0QyxRQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxNQUFNLEVBQUU7QUFDOUIsYUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM3QjtHQUNGLENBQUMsQ0FBQztDQUNKOzs7Ozs7Ozs7OztBQUFBLEFBV2MsU0FBUyxHQUFHLENBQUUsR0FBRyxFQUFFLElBQUks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R0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDN0MsS0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQixLQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakIsS0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztHQUM5QyxDQUFDLENBQUM7Q0FDSixDQUFDO0FBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9cbi8qKiAjIEJWRyAtIEJpbmRhYmxlIFZlY3RvciBHcmFwaGljc1xuICAqICoqUmVhbC10aW1lIGRhdGEtZHJpdmVuIHZpc3VhbGlzYXRpb24gZm9yIHRoZSB3ZWIuKipcbiAgKlxuICAqICFbRXhhbXBsZV0oaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1NwYXhlL0JWRy5qcy9tYXN0ZXIvZGVtby9pbmRleC5naWYpXG4gICpcbiAgKiBMaXZlIGV4YW1wbGU6IGh0dHA6Ly9zcGF4ZS5naXRodWIuaW8vQlZHLmpzL1xuICAqXG4gICogKkJpbmRhYmxlIFZlY3RvciBHcmFwaGljcyogd2FzIGJvcm4gb3V0IG9mIGZydXN0cmF0aW9uIGZvciBsYWNrIG9mIGFcbiAgKiBtaWRkbGUgbGV2ZWwgU1ZHIGxpYnJhcnkuIFtEMy5qc10oaHR0cDovL2QzanMub3JnLykgYWJzdHJhY3RzIHRvbyBtdWNoXG4gICogbG9naWMsIGFuZCBbU1ZHLmpzXShodHRwOi8vc3ZnanMuY29tLykgcHJvdmlkZXMgb25seSBsb3ctbGV2ZWwgU1ZHIGRyYXdpbmcuXG4gICogQmluZGFibGUgVmVjdG9yIEdyYXBoaWNzIG9mZmVycyBTVkcgZWxlbWVudHMgdGhhdCBjaGFuZ2UgYXMgdGhlIGRhdGEgY2hhbmdlLFxuICAqIGFuZCBnaXZlcyB5b3UgdG9vbHMgdG8gY29udHJvbCB0aGVpciBsb29rLlxuICAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKiogVGhlIGhlYXJ0IG9mIHRoaXMgbGlicmFyeSBpcyBhIHRyaW5pdHk6ICoqU1ZHICsgRGF0YSArIEJpbmRpbmcqKi4gVGhpc1xuICAqIGNvbm5lY3RzIHlvdXIgZGF0YSB0byB0aGUgU1ZHIGVsZW1lbnQgdGhyb3VnaCB0aGUgYmluZGluZyBmdW5jdGlvbiwgd2hpY2hcbiAgKiBjcmVhdGVzIGEgbGl2aW5nIGNvbm5lY3Rpb24gdGhhdCBjYW4gcmVhY3QgdG8gY2hhbmdlLiBCVkcgdXNlc1xuICAqIFtgT2JqZWN0Lm9ic2VydmUoKWBdKGh0dHA6Ly9jYW5pdXNlLmNvbS8jZmVhdD1vYmplY3Qtb2JzZXJ2ZSkgd2hpY2ggaXNcbiAgKiBhdmFpbGFibGUgb24gQ2hyb21lIDM2KywgT3BlcmEgMjcrIGFuZCBBbmRyb2lkIEJyb3dzZXIgMzcrLlxuICAqXG4gICogSWYgeW91IHdpc2ggdG8gdXNlIHRoaXMgZm9yIG9sZGVyIGJyb3dzZXJzLCB5b3UgY2FuIHBvbHlmaWxsIHdpdGhcbiAgKiBbYE1heEFydDI1MDEvT2JqZWN0Lm9ic2VydmVgXShodHRwczovL2dpdGh1Yi5jb20vTWF4QXJ0MjUwMS9vYmplY3Qtb2JzZXJ2ZSkuXG4gICpcbiAgKiAjIyBJbnN0YWxsYXRpb25cbiAgKlxuICAqICoqSW5zdGFsbCB1c2luZyBgbnBtYCoqOlxuICAqXG4gICogIDEuIEluc3RhbGwgTm9kZS5qczogaHR0cHM6Ly9kb2NzLm5wbWpzLmNvbS9nZXR0aW5nLXN0YXJ0ZWQvaW5zdGFsbGluZy1ub2RlXG4gICogIDIuIEluIHlvdXIgd29ya2luZyBkaXJlY3Rvcnk6XG4gICpcbiAgKiAgICAgYGBgXG4gICogICAgIG5wbSBpbnN0YWxsIGJ2Z1xuICAqICAgICBgYGBcbiAgKlxuICAqICoqSW5zdGFsbCB2aWEgR2l0SHViKio6XG4gICpcbiAgKiAgMS4gQ2xvbmUgdGhpcyByZXBvOlxuICAqXG4gICogICAgIGBgYFxuICAqICAgICBnaXQgY2xvbmUgaHR0cHM6Ly9naXRodWIuY29tL1NwYXhlL0JWRy5qcy5naXRcbiAgKiAgICAgYGBgXG4gICpcbiAgKiAgMi4gQ29weSBgcmVxdWlyZS5qc2AgYW5kIGBidmcuanNgIGludG8geW91ciB3b3JraW5nIGRpcmVjdG9yeS5cbiAgKlxuICAqICoqVG8gaW5jbHVkZSBgQlZHLmpzYCBpbiB5b3VyIHdlYnBhZ2UqKjpcbiAgKlxuICAqICAxLiBJbiB5b3VyIEhUTUwgYDxoZWFkPmAsIGluY2x1ZGUgdGhpcyBzY3JpcHQgdXNpbmcgYHJlcXVpcmUuanNgOlxuICAqXG4gICogICAgIGBgYEhUTUxcbiAgKiAgICAgPHNjcmlwdCBzcmM9XCJwYXRoL3RvL3JlcXVpcmUuanNcIiBkYXRhLW1haW49XCJ5b3VyLXNjcmlwdC5qc1wiPjwvc2NyaXB0PlxuICAqICAgICBgYGBcbiAgKlxuICAqICAyLiBJbiBgeW91ci1zY3JpcHQuanNgLCBkZWZpbmUgeW91ciBvd24gY29kZSB3aXRoXG4gICpcbiAgKiAgICAgYGBgSmF2YXNjcmlwdFxuICAqICAgICByZXF1aXJlKFsncGF0aC90by9idmcuanMnXSwgZnVuY3Rpb24gKEJWRykge1xuICAqICAgICAgIC8vIHlvdXIgY29kZSBnb2VzIGhlcmUgLi4uXG4gICogICAgIH0pO1xuICAqICAgICBgYGBcbiAgKlxuICAqICMjIFF1aWNrc3RhcnRcbiAgKlxuICAqICFbUXVpY2tzdGFydCBFeGFtcGxlXShodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vU3BheGUvQlZHLmpzL21hc3Rlci9kZW1vLzAwMS1oZWxsby5naWYpXG4gICpcbiAgKiBIVE1MOlxuICAqXG4gICogYGBgSFRNTFxuICAqIDxkaXYgaWQ9XCJidmctY29udGFpbmVyXCI+PC9kaXY+XG4gICogYGBgXG4gICpcbiAgKiBDU1MgKE1ha2UgdGhlIGNvbnRhaW5lciBsYXJnZSBlbm91Z2gpOlxuICAqXG4gICogYGBgQ1NTXG4gICogaHRtbCwgYm9keSwgI2J2Zy1jb250YWluZXIge1xuICAqICAgaGVpZ2h0OiAxMDAlO1xuICAqICAgbWFyZ2luOiAwO1xuICAqIH1cbiAgKiBgYGBcbiAgKlxuICAqIEphdmFzY3JpcHQ6XG4gICpcbiAgKiBgYGBKYXZhc2NyaXB0XG4gICogLy8gQ3JlYXRlIGEgQlZHIGNvbnRhaW5lciBiYXNlZCBvbiBzZWxlY3RlZCBIVE1MIGVsZW1lbnRcbiAgKiB2YXIgYnZnID0gQlZHLmNyZWF0ZSgnI2J2Zy1jb250YWluZXInKTtcbiAgKiAvLyBDcmVhdGUgYSBCaW5kYWJsZSBjaXJjbGUsIGNvbG91ciBpdCBvcmFuZ2VcbiAgKiB2YXIgY2lyY2xlID0gYnZnLmVsbGlwc2UoMCwgMCwgMTUwLCAxNTApXG4gICogICAgICAgICAgICAgICAgIC5maWxsKDIyMCwgNjQsIDEyKTtcbiAgKiAvLyBDaGFuZ2UgaXRzIHNpemUgYmFzZWQgb24gbW91c2UgbW92ZW1lbnRcbiAgKiBidmcudGFnKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICogICBjaXJjbGUuZGF0YSh7XG4gICogICAgIHJ4OiBldmVudC5jbGllbnRYLFxuICAqICAgICByeTogZXZlbnQuY2xpZW50WVxuICAqICAgfSk7XG4gICogfSk7XG4gICogYGBgXG4gICovXG5cbi8qLSBEZWVwIE9iamVjdC5vYnNlcnZlKCkgKi9cbmZ1bmN0aW9uIG9ic2VydmUgKG9iaiwgY2FsbGJhY2spIHtcblxuICAvLyBJbmNsdWRlIGh0dHBzOi8vZ2l0aHViLmNvbS9NYXhBcnQyNTAxL29iamVjdC1vYnNlcnZlIGlmIHlvdSB3aXNoIHRvIHdvcmtcbiAgLy8gd2l0aCBwb2x5ZmlsbCBvbiBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgT2JqZWN0Lm9ic2VydmUoKVxuICBPYmplY3Qub2JzZXJ2ZShvYmosIGZ1bmN0aW9uIChjaGFuZ2VzKSB7XG4gICAgY2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFuZ2UpIHtcblxuICAgICAgLy8gQmluZCBjaGlsZCBwcm9wZXJ0eSBpZiBpdCBpcyBhbiBvYmplY3QgZm9yIGRlZXAgb2JzZXJ2aW5nXG4gICAgICBpZiAob2JqW2NoYW5nZS5uYW1lXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICBvYnNlcnZlKG9ialtjaGFuZ2UubmFtZV0sIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRyaWdnZXIgdXNlciBjYWxsYmFja1xuICAgIGNhbGxiYWNrLmNhbGwodGhpcywgY2hhbmdlcyk7XG4gIH0pO1xuXG4gIC8vIEltbWVkaWF0ZWx5IGZpcmUgb2JzZXJ2ZSB0byBpbml0aWF0ZSBkZWVwIG9ic2VydmluZ1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChvYmpba2V5XSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgb2JzZXJ2ZShvYmpba2V5XSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qLSBgQlZHKHRhZywgZGF0YSwgYmluZGluZylgXG4gICogVGhlIHRyaW5pdHkgb2YgdGhpcyBsaWJyYXJ5OiBTVkcgKyBEYXRhICsgQmluZGluZyBGdW5jdGlvbi5cbiAgKlxuICAqIFJldHVybiB0aGUgQlZHIG9iamVjdCBjcmVhdGVkLlxuICAqXG4gICogIC0gYHRhZ2AgICAgOiBFaXRoZXIgYSBgU3RyaW5nYCBmb3IgdGhlIFNWRyBgdGFnTmFtZWAgb3IgYW55IFtgU1ZHRWxlbWVudGBdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1NWRy9FbGVtZW50KVxuICAqICAtIGBkYXRhYCAgIDogT2JqZWN0IHdpdGggYXJiaXRyYXJ5IGRhdGEgdG8geW91ciBkZXNpcmVcbiAgKiAgLSBgYmluZGluZ2A6IChvcHRpb25hbCkgQmluZGluZyBmdW5jdGlvbiB0aGF0IHNldHMgdGhlIHRhZyBhdHRyaWJ1dGVzXG4gICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCVkcgKHRhZywgZGF0YSwgYmluZGluZykge1xuICB2YXIgYnZnID0gdGhpcztcbiAgdGFnID0gdGFnIGluc3RhbmNlb2YgU1ZHRWxlbWVudCA/IHRhZyA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWcpO1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgYmluZGluZyA9IGJpbmRpbmcgfHwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgIGZvciAodmFyIHByb3AgaW4gZGF0YSkge1xuICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgdGFnLnNldEF0dHJpYnV0ZShwcm9wLCBkYXRhW3Byb3BdKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gT2JzZXJ2ZSBkYXRhIG9iamVjdCBhbmQgYXBwbHkgYmluZGluZyByaWdodCBhd2F5XG4gIG9ic2VydmUoZGF0YSwgZnVuY3Rpb24gKGNoYW5nZXMpIHtcbiAgICBiaW5kaW5nKHRhZywgZGF0YSk7XG4gIH0pO1xuICBiaW5kaW5nKHRhZywgZGF0YSk7XG5cbiAgLy8gSUQgZnVuY3Rpb24gZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9nb3Jkb25icmFuZGVyLzIyMzAzMTdcbiAgdGFnLnNldEF0dHJpYnV0ZSgnaWQnLCAnQlZHXycgKyB0YWcudGFnTmFtZSArICdfJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA3KSk7XG4gIHRoaXMuX3RhZyA9IHRhZztcbiAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIHRoaXMuX2JpbmRpbmcgPSBiaW5kaW5nO1xuXG4gIC8vIEZ1bmN0aW9uYWwgY2lyY3VsYXIgcmVmZXJlbmNlXG4gIHRoaXMuX3RhZy5fZ2V0QlZHID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBidmc7XG4gIH07XG5cbiAgaWYgKFsnc3ZnJywgJ2cnLCAnYSddLmluZGV4T2YodGFnLnRhZ05hbWUpIDwgMCkge1xuICAgIGlmICghZGF0YS5zdHJva2UpIHRoaXMuc3Ryb2tlKDE3NSk7XG4gICAgaWYgKCFkYXRhLnN0cm9rZVdpZHRoKSB0aGlzLnN0cm9rZVdpZHRoKDAuNSk7XG4gICAgaWYgKCFkYXRhLmZpbGwpIHRoaXMubm9GaWxsKCk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKiAjIyBUaGUgQlZHIENvbnRhaW5lclxuICAqIFRoZSByZXN0IG9mIHRoZSBkb2N1bWVudGF0aW9uIHdpbGwgYXNzdW1lIGBidmdgIGFzIG91ciBCVkcgY29udGFpbmVyXG4gICogY3JlYXRlZCBieSB0aGUgZXhhbXBsZSBiZWxvdy5cbiAgKi9cblxuLyoqICMjIyBgQlZHLmNyZWF0ZShodG1sRWxlbWVudClgXG4gICogQ3JlYXRlIGEgQlZHIGNvbnRhaW5lciBpbnNpZGUgYGh0bWxFbGVtZW50YC5cbiAgKlxuICAqIFJldHVybiB0aGUgQlZHIGNvbnRhaW5lciBvYmplY3QuXG4gICpcbiAgKiAgLSBgaHRtbEVsZW1lbnRgICA6IEVpdGhlciBhIFtDU1MgU2VsZWN0b3JdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0d1aWRlL0NTUy9HZXR0aW5nX1N0YXJ0ZWQvU2VsZWN0b3JzKVxuICAqICAgICAgICAgICAgICAgICAgICAgb3IgYW55IFtIVE1MRWxlbWVudF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxFbGVtZW50KS5cbiAgKlxuICAqIGBgYEphdmFzY3JpcHRcbiAgKiAvLyBDcmVhdGUgYSBuZXcgQlZHIGNvbnRhaW5lciBhbmQgYXBwZW5kIGl0IHRvIGFuIGV4aXN0aW5nIEhUTUwgZWxlbWVudC5cbiAgKiB2YXIgYnZnID0gQlZHLmNyZWF0ZSgnI2J2Zy1jb250YWluZXInKTtcbiAgKiBgYGBcbiAgKi9cbkJWRy5jcmVhdGUgPSBmdW5jdGlvbiAoaHRtbEVsZW1lbnQsIHhEaW1lbnNpb24sIHlEaW1lbnNpb24pIHtcbiAgaWYgKHR5cGVvZiBodG1sRWxlbWVudCA9PT0gJ3N0cmluZycpXG4gICAgaHRtbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGh0bWxFbGVtZW50KTtcbiAgaWYgKCEoaHRtbEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaHRtbEVsZW1lbnQgKCcgKyBodG1sRWxlbWVudCArICcpIHdhcyBub3QgZm91bmQuJyk7XG5cbiAgdmFyIGRhdGEgPSB7XG4gICAgJ3htbG5zOnhsaW5rJzogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgIHZlcnNpb246IDEuMSxcbiAgICB3aWR0aDogJzEwMCUnLFxuICAgIGhlaWdodDogJzEwMCUnXG4gIH07XG4gIHlEaW1lbnNpb24gPSB5RGltZW5zaW9uIHx8IHhEaW1lbnNpb247XG4gIGlmICh4RGltZW5zaW9uKSB7XG4gICAgZGF0YS52aWV3Qm94ID0gWzAsIDAsIHhEaW1lbnNpb24sIHlEaW1lbnNpb25dLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBidmcgPSBuZXcgQlZHKCdzdmcnLCBkYXRhKTtcbiAgaHRtbEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnZnLnRhZygpKTtcbiAgcmV0dXJuIGJ2Zztcbn07XG5cbi8qKiAjIyBCVkcgRWxlbWVudHNcbiAgKiBBbGwgQlZHIG9iamVjdHMsIGluY2x1ZGluZyB0aGUgY29udGFpbmVyLCBoYXZlIGFjY2VzcyB0byBkcmF3aW5nIGZ1bmN0aW9uc1xuICAqIGFuZCByZXR1cm4gcmVmZXJlbmNlIHRvIHRoZSBuZXcgc2hhcGUsIHdoaWNoIGlzIGFsc28gYSBCVkcuXG4gICpcbiAgKiBgYGBKYXZhc2NyaXB0XG4gICogLy8gQ3JlYXRlIGEgcmVjdGFuZ2xlIGF0ICgwLCAwKSB3aXRoIGRpbWVuc2lvbnMgMTAweDEwMCBweCBhbmQgYWRkIGl0IHRvIGJ2Z1xuICAqIHZhciByZWN0ID0gYnZnLnJlY3QoMCwgMCwgMTAwLCAxMDApO1xuICAqIGBgYFxuICAqXG4gICogVGhlIEJWRyBtb2R1bGUgYWxzbyBoYXMgZHJhd2luZyBmdW5jdGlvbnMsIHdoaWNoIHJldHVybiB0aGUgQlZHIG9iamVjdDpcbiAgKlxuICAqIGBgYEphdmFzY3JpcHRcbiAgKiAvLyBDcmVhdGUgYSByZWN0YW5nbGUgYXQgKDAsIDApIHdpdGggZGltZW5zaW9ucyAxMDB4MTAwIHB4XG4gICogLy8gTm90ZSBpdCB1c2VzIHRoZSBCVkcgbW9kdWxlIGRpcmVjdGx5IHRvIGNyZWF0ZSB0aGUgcmVjdGFuZ2xlLlxuICAqIHZhciByZWN0ID0gQlZHLnJlY3QoMCwgMCwgMTAwLCAxMDApO1xuICAqIC8vIEFkZCB0aGUgcmVjdGFuZ2xlIHRvIGFuIGV4aXN0aW5nIEJWRyBjb250YWluZXJcbiAgKiBidmcuYXBwZW5kKHJlY3QpO1xuICAqIGBgYFxuICAqXG4gICogRHJhd2luZyBmdW5jdGlvbnMgY2FuIGJlIGNhbGxlZCBpbiBhIG51bWJlciBvZiB3YXlzLiBUYWtlIGBidmcucmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KWBcbiAgKiBhcyBhbiBleGFtcGxlIGJlbG93LiBTb21ldGltZXMgaXQgaXMgZWFzaWVyIHRvIHVzZSBvbmUgb3ZlciBhbm90aGVyIHN0eWxlLlxuICAqXG4gICogYGBgSmF2YXNjcmlwdFxuICAqIGJ2Zy5yZWN0KDAsIDEwLCAzMCwgNzApOyAgICAgIC8vIEFyZ3VtZW50cyBzdHlsZVxuICAqIGJ2Zy5yZWN0KHsgICAgICAgICAgICAgICAgICAgIC8vIE9iamVjdCBzdHlsZVxuICAqICAgeDogMCxcbiAgKiAgIHk6IDEwLCAgICAgICAgICAgICAgICAgICAgICAvLyBOYW1lIG9mIHRoZSBvYmplY3QgcHJvcGVydGllcyBtdXN0IG1hdGNoXG4gICogICB3aWR0aDogMzAsICAgICAgICAgICAgICAgICAgLy8gbmFtZXMgb2YgdGhlIGFyZ3VtZW50cyBpbiB0aGUgZnVuY3Rpb25zLFxuICAqICAgaGVpZ2h0OiA3MCAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGUgb3JkZXIgY2FuIGJlIGFueS5cbiAgKiB9KTtcbiAgKiBgYGBcbiAgKi9cbnZhciBjcmVhdGlvbkZ1bmN0aW9ucyA9IHtcbiAgc3ZnOiBmdW5jdGlvbiAoeGxpbmssIHZlcnNpb24sIHdpZHRoLCBoZWlnaHQpIHtcbiAgICByZXR1cm4gbmV3IEJWRygnc3ZnJywgeGxpbmsuY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4bGluayA6IHtcbiAgICAgICd4bWxuczp4bGluayc6IHhsaW5rLFxuICAgICAgdmVyc2lvbjogdmVyc2lvbixcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLnJlY3QoeCwgeSwgd2lkdGgsIGhlaWdodClgXG4gICAgKiBDcmVhdGUgYSByZWN0YW5nbGUgYXQgcG9zaXRpb24gYCh4LCB5KWAgYXQgYHdpZHRoYCB4IGBoZWlnaHRgIGluIHNpemUuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIHJlY3QgPSBidmcucmVjdCgxMDAsIDEwMCwgMzAwLCAxNTApO1xuICAgICogYGBgXG4gICAgKi9cbiAgcmVjdDogZnVuY3Rpb24gKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICByZXR1cm4gbmV3IEJWRygncmVjdCcsIHguY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4IDoge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyMgYGJ2Zy5jaXJjbGUoY3gsIGN5LCByKWBcbiAgICAqIENyZWF0ZSBhIGNpcmNsZSBjZW50cmVkIG9uIGAoY3gsIGN5KWAgd2l0aCByYWRpdXMgYHJgLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciBjaXJjbGUgPSBidmcuZWxsaXBzZSgxMDAsIDEwMCwgNTApO1xuICAgICogYGBgXG4gICAgKi9cbiAgY2lyY2xlOiBmdW5jdGlvbiAoeCwgeSwgcikge1xuICAgIHJldHVybiBuZXcgQlZHKCdjaXJjbGUnLCB4LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geCA6IHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgcjogclxuICAgIH0sIGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ2N4JywgZGF0YS54KTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ2N5JywgZGF0YS55KTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3InLCBkYXRhLnIpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyMgYGJ2Zy5lbGxpcHNlKGN4LCBjeSwgcngsIHJ5KWBcbiAgICAqIENyZWF0ZSBhIGVsbGlwc2UgY2VudHJlZCBvbiBgKGN4LCBjeSlgIHdpdGggcmFkaWkgYHJ4YCBhbmQgYHJ5YC5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgZWxsaXBzZSA9IGJ2Zy5lbGxpcHNlKDEwMCwgMTAwLCAyMDAsIDE4MCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBlbGxpcHNlOiBmdW5jdGlvbiAoeCwgeSwgcngsIHJ5KSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2VsbGlwc2UnLCB4LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geCA6IHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgcng6IHJ4LFxuICAgICAgcnk6IHJ5XG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnY3gnLCBkYXRhLngpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnY3knLCBkYXRhLnkpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncngnLCBkYXRhLnJ4KTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3J5JywgZGF0YS5yeSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLmxpbmUoeDEsIHkxLCB4MiwgeTIpYFxuICAgICogQ3JlYXRlIGEgbGluZSBmcm9tIGAoeDEsIHkxKWAgdG8gYCh4MiwgeTIpYC5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgbGluZSA9IGJ2Zy5saW5lKDEwMCwgMTAwLCAyMDAsIDMwMCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBsaW5lOiBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIpIHtcbiAgICByZXR1cm4gbmV3IEJWRygnbGluZScsIHgxLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geDEgOiB7XG4gICAgICB4MTogeDEsXG4gICAgICB5MTogeTEsXG4gICAgICB4MjogeDIsXG4gICAgICB5MjogeTJcbiAgICB9KTtcbiAgfSxcbiAgLyoqICMjIyBgYnZnLnBvbHlsaW5lKFtbeDEsIHkxXSwgW3gyLCB5Ml0sIC4uLl0pYFxuICAgICogQ3JlYXRlIGEgc2VyaWVzIG9mIGxpbmVzIGZyb20gcG9pbnQgdG8gcG9pbnQuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIHBvbHlsaW5lID0gYnZnLnBvbHlsaW5lKFtbMTAwLCAyMDBdLCBbMjAwLCAzMDBdLCBbNDAwLCA4MDBdXSk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBwb2x5bGluZTogZnVuY3Rpb24gKHBvaW50cykge1xuICAgIHJldHVybiBuZXcgQlZHKCdwb2x5bGluZScsIHBvaW50cy5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHBvaW50cyA6IHtcbiAgICAgIHBvaW50czogcG9pbnRzXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgZGF0YS5wb2ludHMuam9pbignICcpKTtcbiAgICB9KTtcbiAgfSxcbiAgLyoqICMjIyBgYnZnLnBvbHlnb24oW1t4MSwgeTFdLCBbeDIsIHkyXSwgLi4uXSlgXG4gICAgKiBDcmVhdGUgYSBjbG9zZWQgcG9seWdvbiBmcm9tIHBvaW50IHRvIHBvaW50LiBUaGUgbGFzdCBwb2ludCB3aWxsIGJlXG4gICAgKiBjb25uZWN0ZWQgYmFjayB0byB0aGUgZmlyc3QgcG9pbnQuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIHBvbHlnb24gPSBidmcucG9seWdvbihbWzEwMCwgMjAwXSwgWzIwMCwgMzAwXSwgWzQwMCwgODAwXV0pO1xuICAgICogYGBgXG4gICAgKi9cbiAgcG9seWdvbjogZnVuY3Rpb24gKHBvaW50cykge1xuICAgIHJldHVybiBuZXcgQlZHKCdwb2x5Z29uJywgcG9pbnRzLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8gcG9pbnRzIDoge1xuICAgICAgcG9pbnRzOiBwb2ludHNcbiAgICB9LCBmdW5jdGlvbiAodGFnLCBkYXRhKSB7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdwb2ludHMnLCBkYXRhLnBvaW50cy5qb2luKCcgJykpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyBHcm91cGluZyBFbGVtZW50c1xuICAgICogIyMjIGBidmcuZ3JvdXAoW3RyYW5zZm9ybV0pYFxuICAgICpcbiAgICAqIENyZWF0ZSBhIGdyb3VwIHRvIGNvbnRhaW4gQlZHIG9iamVjdHMuIEl0IGFjdHMgbGlrZSBhIEJWRyBjb250YWluZXIgd2l0aFxuICAgICogYW4gb3B0aW9uYWwgYHRyYW5zZm9ybWAgYXR0cmlidXRlLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIC8vIENyZWF0ZSBhIG5ldyBncm91cCBhbmQgZmlsbCBpdCB3aXRoIGRhc2hlcy5cbiAgICAqIHZhciBkYXNoZXMgPSBidmcuZ3JvdXAoKTtcbiAgICAqIGZvciAoaW50IGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgKiAgIGRhaHNlcy5yZWN0KDEwLCAxMCArIGkgKiAzMCwgNTAsIDIwKTtcbiAgICAqIH1cbiAgICAqIGBgYFxuICAgICovXG4gIGdyb3VwOiBmdW5jdGlvbiAodHJhbnNmb3JtKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2cnLCB0cmFuc2Zvcm0uY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB0cmFuc2Zvcm0gOiB7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyBIeXBlcmxpbmtzXG4gICAgKiAjIyMgYGJ2Zy5oeXBlcmxpbmsodXJsKWBcbiAgICAqXG4gICAgKiBDcmVhdGUgYSBoeXBlcmxpbmsgQlZHIHRvIHRhcmdldCBVUkwgYHVybGAuIEl0IGRvZXMgbm90IGhhdmUgYW55IGRpc3BsYXlcbiAgICAqIGVsZW1lbnRzLiBNYWtlIHN1cmUgdG8gYXBwZW5kIGVsZW1lbnRzIHRvIGl0LlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIC8vIENsaWNraW5nIG9uIHRoaXMgZWxlbWVudCB3aWxsIGJyaW5nIHRoZW0gdG8gdGhlIEdpdGh1YiBwYWdlXG4gICAgKiB2YXIgZ2l0aHViTGluayA9IGJ2Zy5oeXBlcmxpbmsoJ2h0dHBzOi8vZ2l0aHViLmNvbS9zcGF4ZS9CVkcuanMnKTtcbiAgICAqIC8vIE1ha2UgYSBidXR0b24gYW5kIGF0dGFjayBpdCB0byB0aGUgbGlua1xuICAgICogZ2l0aHViTGluay5lbGxpcHNlKDIwMCwgMjAwLCA1MCwgNTApO1xuICAgICogYGBgXG4gICAgKi9cbiAgaHlwZXJsaW5rOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2EnLCB1cmwuY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB1cmwgOiB7XG4gICAgICAneG1sbnM6aHJlZic6IHVybFxuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyBPdGhlciBHZW9tZXRyeVxuICAgICogIyMjIGBidmcudHJpYW5nbGUoY3gsIGN5LCByKWBcbiAgICAqIENyZWF0ZSBhIHJlZ3VsYXIgdHJpYW5nbGUgY2VudHJlZCBvbiBgKGN4LCBjeSlgIHdpdGggdmVydGljZXMgYHJgIGRpc3RhbmNlXG4gICAgKiBhd2F5LlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciB0cmlhbmdsZSA9IGJ2Zy50cmlhbmdsZSg1MCwgNTAsIDEwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIHRyaWFuZ2xlOiBmdW5jdGlvbiAoeCwgeSwgcikge1xuICAgIHJldHVybiBuZXcgQlZHKCdwb2x5Z29uJywgeC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHggOiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHI6IHJcbiAgICB9LCBmdW5jdGlvbiAodGFnLCBkYXRhKSB7XG4gICAgICB2YXIgcG9pbnRzID0gW1xuICAgICAgICBbZGF0YS54LCBkYXRhLnktZGF0YS5yXSxcbiAgICAgICAgW2RhdGEueC1kYXRhLnIvMipNYXRoLnNxcnQoMyksIGRhdGEueStkYXRhLnIvMl0sXG4gICAgICAgIFtkYXRhLngrZGF0YS5yLzIqTWF0aC5zcXJ0KDMpLCBkYXRhLnkrZGF0YS5yLzJdXG4gICAgICBdO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgcG9pbnRzLmpvaW4oJyAnKSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLmFyYyhjeCwgY3ksIHJ4LCByeSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUpYFxuICAgICogQ3JlYXRlIGFuIGFyYyBjZW50cmVkIG9uIGAoY3gsIGN5KWAgd2l0aCByYWRpdXMgYHJ4YCBhbmQgYHJ5YCwgc3RhcnRpbmdcbiAgICAqIGZyb20gYHN0YXJ0QW5nbGVgIGFudGktY2xvY2t3aXNlIHRvIGBlbmRBbmdsZWAsIHdoZXJlIDAgaXMgdGhlIHBvc2l0aXZlXG4gICAgKiB4LWF4aXMuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIGFyYyA9IGJ2Zy5hcmMoNTAsIDUwLCA1MCwgMTAwLCAwLCBNYXRoLlBJKTtcbiAgICAqIGBgYFxuICAgICovXG4gIGFyYzogZnVuY3Rpb24gKHgsIHksIHJ4LCByeSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUpIHtcbiAgICByZXR1cm4gbmV3IEJWRygncGF0aCcsIHguY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4IDoge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICByeDogcngsXG4gICAgICByeTogcnksXG4gICAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGU6IGVuZEFuZ2xlXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdmFyIHAxID0gZ2V0UG9pbnRPbkVsbGlwc2UoZGF0YS54LCBkYXRhLnksIGRhdGEucngsIGRhdGEucnksIGRhdGEuc3RhcnRBbmdsZSk7XG4gICAgICB2YXIgcDIgPSBnZXRQb2ludE9uRWxsaXBzZShkYXRhLngsIGRhdGEueSwgZGF0YS5yeCwgZGF0YS5yeSwgZGF0YS5lbmRBbmdsZSk7XG4gICAgICB2YXIgbGFyZ2VBcmMgPSAoZGF0YS5lbmRBbmdsZSAtIGRhdGEuc3RhcnRBbmdsZSkgPiBNYXRoLlBJID8gMSA6IDA7XG4gICAgICB2YXIgc3dlZXBBcmMgPSBkYXRhLmVuZEFuZ2xlID4gZGF0YS5zdGFydEFuZ2xlID8gMSA6IDA7XG4gICAgICB2YXIgZCA9IFtcbiAgICAgICAgWydNJywgcDEueCwgcDEueV0sXG4gICAgICAgIFsnQScsIGRhdGEucngsIGRhdGEucnksIDAsIGxhcmdlQXJjLCBzd2VlcEFyYywgcDIueCwgcDIueV1cbiAgICAgIF07XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdkJywgZC5tYXAoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHguam9pbignICcpO1xuICAgICAgfSkuam9pbignICcpKTtcblxuICAgICAgZnVuY3Rpb24gZ2V0UG9pbnRPbkVsbGlwc2UoeCwgeSwgcngsIHJ5LCBhbmdsZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHJ4ICogTWF0aC5jb3MoYW5nbGUpICsgeCxcbiAgICAgICAgICB5OiByeSAqIE1hdGguc2luKGFuZ2xlKSArIHlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMjIGBidmcudGV4dCh0ZXh0LCB4LCB5KWBcbiAgICAqIENyZWF0ZSBhIHN0cmluZyBvZiBgdGV4dGAgdGV4dCBhdCBsb2NhdGlvbiBgKHgsIHkpYC5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgdGV4dCA9IGJ2Zy50ZXh0KCdNcnJhYSEnLCAyMCwgMTApO1xuICAgICogYGBgXG4gICAgKi9cbiAgdGV4dDogZnVuY3Rpb24gKHRleHQsIHgsIHkpIHtcbiAgICByZXR1cm4gbmV3IEJWRygndGV4dCcsIHRleHQuY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB0ZXh0IDoge1xuICAgICAgdGV4dDogdGV4dCxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLmlubmVySFRNTCA9IGRhdGEudGV4dDtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3gnLCBkYXRhLngpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgneScsIGRhdGEueSk7XG4gICAgfSkuZmlsbCgncmdiYSgxNzUsIDE3NSwgMTc1LCAxKScpXG4gICAgICAuc3Ryb2tlKCdyZ2JhKDAsIDAsIDAsIDApJyk7XG4gIH1cbn07XG5cbk9iamVjdC5rZXlzKGNyZWF0aW9uRnVuY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChmKSB7XG4gIEJWR1tmXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY3JlYXRpb25GdW5jdGlvbnNbZl0uYXBwbHkoQlZHLCBhcmd1bWVudHMpO1xuICB9O1xuICBCVkcucHJvdG90eXBlW2ZdID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBidmcgPSBjcmVhdGlvbkZ1bmN0aW9uc1tmXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuYXBwZW5kKGJ2Zyk7XG4gICAgcmV0dXJuIGJ2ZztcbiAgfTtcbn0pO1xuXG4vKiogIyMgVGhlIEJWRyBPYmplY3RcbiAgKiBCVkdzIGFyZSBTVkdzIHdpdGggZXh0cmEgc3VwZXJwb3dlcnMuXG4gICovXG5cbi8qKiAjIyMgYGJ2Zy5maW5kKHNlbGVjdG9yKWBcbiAgKiBSZXR1cm4gYW4gYXJyYXkgb2YgQlZHcyBtYXRjaGluZyBgc2VsZWN0b3JgIGluc2lkZSBCVkcuIGBzZWxlY3RvcmAgaXNcbiAgKiBkZWZpbmVkIGFzIFtDU1MgU2VsZWN0b3JzXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9HdWlkZS9DU1MvR2V0dGluZ19zdGFydGVkL1NlbGVjdG9ycykuXG4gICovXG5CVkcucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIHJlc3VsdCA9IHRoaXMuX3RhZy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHZhciBidmdzID0gW107XG4gICAgW10uc2xpY2UuY2FsbChyZXN1bHQpLmZvckVhY2goZnVuY3Rpb24gKHIpIHtcbiAgICAgIGJ2Z3MucHVzaChyLl9nZXRCVkcoKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGJ2Z3M7XG4gIH1cbiAgcmV0dXJuIFtdO1xufTtcblxuLyoqICMjIyBgYnZnLmFwcGVuZChidmcpYFxuICAqIEluc2VydCBgY2hpbGRfYnZnYCBpbnNpZGUgYGJ2Z2AuIFRoaXMgaXMgdXNlZnVsIHRvIGFkZCBlbGVtZW50cyBpbnNpZGUgYVxuICAqIGBCVkcuZ3JvdXAoKWAuXG4gICovXG5CVkcucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uIChjaGlsZF9idmcpIHtcbiAgdGhpcy5fdGFnLmFwcGVuZENoaWxkKGNoaWxkX2J2Zy5fdGFnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMjIGBidmcucmVtb3ZlKClgXG4gICogUmVtb3ZlIGl0c2VsZiBmcm9tIGl0cyBwYXJlbnQuIFJldHVybiBzZWxmIHJlZmVyZW5jZS5cbiAgKi9cbkJWRy5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQoKTtcbiAgaWYgKHBhcmVudCkge1xuICAgIHBhcmVudC5fdGFnLnJlbW92ZUNoaWxkKHRoaXMuX3RhZyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMjIGBidmcucGFyZW50KClgXG4gICogUmV0dXJuIHRoZSBwYXJlbnQgQlZHLiBJZiB0aGVyZSBpcyBubyBwYXJlbnQgKHN1Y2ggaXMgdGhlIGNhc2UgZm9yIHRoZSBCVkdcbiAgKiBjb250YWluZXIgaXRzZWxmKSwgcmV0dXJuIG51bGwuXG4gICovXG5CVkcucHJvdG90eXBlLnBhcmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX3RhZy5wYXJlbnROb2RlICYmIHR5cGVvZiB0aGlzLl90YWcucGFyZW50Tm9kZS5fZ2V0QlZHID09PSAnZnVuY3Rpb24nKVxuICAgcmV0dXJuIHRoaXMuX3RhZy5wYXJlbnROb2RlLl9nZXRCVkcoKTtcbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKiogIyMjIGBidmcuY2hpbGRyZW4oKWBcbiAgKiBSZXR1cm4gYSBsaXN0IG9mIEJWRyBlbGVtZW50cyBpbnNpZGUgYGJ2Z2AuXG4gICovXG5CVkcucHJvdG90eXBlLmNoaWxkcmVuID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fdGFnLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspXG4gICAgaWYgKHR5cGVvZiB0aGlzLl90YWcuY2hpbGROb2Rlc1tpXS5fZ2V0QlZHID09PSAnZnVuY3Rpb24nKVxuICAgICAgb3V0cHV0LnB1c2godGhpcy5fdGFnLmNoaWxkTm9kZXNbaV0uX2dldEJWRygpKTtcbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKiAjIyMgYGJ2Zy50YWcoKWBcbiAgKiBSZXR1cm4gdGh3IEJWRyBncmFwaGljYWwgY29udGVudCwgYSBTVkcuXG4gICovXG5CVkcucHJvdG90eXBlLnRhZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX3RhZztcbn07XG5cbiAvKiogIyMjIGBidmcuZGF0YSgpYFxuICAqIEdldC9zZXQgdGhlIGBkYXRhYCBvYmplY3QgaW4gYSBCVkcuIFRoZXJlIGFyZSBmb3VyIHdheXMgdG8gdXNlIHRoaXNcbiAgKiBmdW5jdGlvbi5cbiAgKlxuICAqICAtIGBidmcuZGF0YSgpYDogUmV0dXJuIGBkYXRhYCBib3VuZCB0byB0aGUgQlZHLlxuICAqICAtIGBidmcuZGF0YShuZXdEYXRhKWA6IFVwZGF0ZSBgZGF0YWAgd2l0aCBgbmV3RGF0YWAgb2JqZWN0LlxuICAqICAtIGBidmcuZGF0YShwcm9wZXJ0eSlgOiBSZXR1cm4gYGRhdGFbcHJvcGVydHldYCBmcm9tIHRoZSBCVkcuXG4gICogIC0gYGJ2Zy5kYXRhKHByb3BlcnR5LCBuZXdWYWx1ZSlgOiBVcGRhdGUgYHByb3BlcnR5YCB3aXRoIGBuZXdWYWx1ZWAuXG4gICpcbiAgKiBSZXR1cm4gYGJ2Z2Agb2JqZWN0IHJlZmVyZW5jZS5cbiAgKi9cbkJWRy5wcm90b3R5cGUuZGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKGFyZ3VtZW50c1swXS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIgayBpbiBhcmd1bWVudHNbMF0pIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1swXS5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIHRoaXMuZGF0YShrLCBhcmd1bWVudHNbMF1ba10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2RhdGFbYXJndW1lbnRzWzBdXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHRoaXMuX2RhdGFbYXJndW1lbnRzWzBdXSA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcih0aGlzLCAnZGF0YSgpIHJlY2VpdmVkIG1vcmUgdGhhbiAyIGFyZ3VtZW50cy4nKTtcbiAgfVxufTtcblxuLyoqICMjIyBgYnZnLmF0dHIoKWBcbiAgKiBHZXQvc2V0IGF0dHJpYnV0ZXMgb24gYSBCVkcuXG4gICpcbiAgKiAgLSBgYnZnLmF0dHIoYXR0cilgOiBSZXR1cm4gYXR0cmlidXRlIHZhbHVlLlxuICAqICAtIGBidmcuYXR0cihhdHRyLCB2YWx1ZSlgOiBVcGRhdGUgYGF0dHJgIHdpdGggYHZhbHVlYC5cbiAgKi9cbkJWRy5wcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uIChhdHRyLCB2YWx1ZSkge1xuICBpZiAoIWF0dHIpIHRocm93IG5ldyBFcnJvcignYXR0ciBtdXN0IGJlIGRlZmluZWQnKTtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuIHRoaXMuX3RhZy5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gIGVsc2UgdGhpcy5fdGFnLnNldEF0dHJpYnV0ZShhdHRyLCB2YWx1ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIyBgYnZnLmZpbGwoKWBcbiAgKiBHZXQvc2V0IHRoZSBmaWxsaW5nIGNvbG91ci5cbiAgKlxuICAqICAtIGBidmcuZmlsbCgpYDogUmV0dXJuIGBmaWxsYCBjb2xvdXIgYXMgW3IsIGcsIGIsIGFdLCBvciBgJydgIChlbXB0eVxuICAqICAgICAgICAgICAgICAgICAgc3RyaWcpIGlmIGZpbGwgaXMgbm90IHNwZWNpZmllZCBvbiB0aGUgb2JqZWN0LlxuICAqICAtIGBidmcuZmlsbChyZ2IpYDogU2V0IGBmaWxsYCB3aXRoIGEgZ3JleXNjYWxlIGNvbG91ciB3aXRoIGVxdWFsXG4gICogICAgdmFsdWVzIGAocmdiLCByZ2IsIHJnYilgLlxuICAqICAtIGBidmcuZmlsbChyLCBnLCBiLCBbYV0pYDogU2V0IGBmaWxsYCB3aXRoIGAociwgZywgYiwgYSlgLiBJZiBgYWBcbiAgKiAgICBpcyBvbWl0dGVkLCBpdCBkZWZhdWx0cyB0byBgMWAuXG4gICpcbiAgKiBgcmAsIGBnYCwgYGJgIHNob3VsZCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMC0yNTUgaW5jbHVzaXZlLlxuICAqL1xuQlZHLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHZhciBmID0gdGhpcy5hdHRyKCdmaWxsJyk7XG4gICAgaWYgKGYpIHJldHVybiBCVkcuZXh0cmFjdE51bWJlckFycmF5KGYpO1xuICAgIHJldHVybiAnJztcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdzdHJpbmcnKSByZXR1cm4gdGhpcy5hdHRyKCdmaWxsJywgYXJndW1lbnRzWzBdKTtcbiAgICBlbHNlIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCBCVkcucmdiYShhcmd1bWVudHNbMF0pKTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyKCdmaWxsJywgQlZHLnJnYmEuYXBwbHkoQlZHLCBhcmd1bWVudHMpKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcih0aGlzLCAnZmlsbCgpIHJlY2VpdmVkIG1vcmUgdGhhbiAxIGFyZ3VtZW50LicpO1xuICB9XG59O1xuXG4vKiogIyMjIGBidmcubm9GaWxsKClgXG4gICogUmVtb3ZlIEJWRyBvYmplY3QncyBjb2xvdXIgZmlsbGluZyBjb21wbGV0ZWx5LlxuICAqL1xuQlZHLnByb3RvdHlwZS5ub0ZpbGwgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZpbGwoJ3JnYmEoMCwgMCwgMCwgMCknKTsgfTtcblxuLyoqICMjIyBgYnZnLnN0cm9rZSgpYFxuICAqIEdldC9zZXQgdGhlIG91dGxpbmUgY29sb3VyLlxuICAqXG4gICogIC0gYGJ2Zy5zdHJva2UoKWA6IFJldHVybiBgc3Ryb2tlYCBjb2xvdXIgYXMgW3IsIGcsIGIsIGFdLiBJZiBgc3Ryb2tlYCBpc1xuICAqICAgIG5vdCBzcGVjaWZpZWQsIHJldHVybiBgJydgIChlbXB0eSBzdHJpbmcpLlxuICAqICAtIGBidmcuc3Ryb2tlKHJnYilgOiBTZXQgYHN0cm9rZWAgd2l0aCBhIGdyZXlzY2FsZSBjb2xvdXIgd2l0aCBlcXVhbFxuICAqICAgIHZhbHVlcyBgKHJnYiwgcmdiLCByZ2IpYC5cbiAgKiAgLSBgYnZnLnN0cm9rZShyLCBnLCBiLCBbYV0pYDogU2V0IGBzdHJva2VgIHdpdGggYChyLCBnLCBiLCBhKWAuIElmIGBhYFxuICAqICAgIGlzIG9taXR0ZWQsIGl0IGRlZmF1bHRzIHRvIGAxYC5cbiAgKlxuICAqIGByYCwgYGdgLCBgYmAgc2hvdWxkIGJlIGluIHRoZSByYW5nZSBvZiAwLTI1NSBpbmNsdXNpdmUuXG4gICovXG5CVkcucHJvdG90eXBlLnN0cm9rZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB2YXIgcyA9IHRoaXMuYXR0cignc3Ryb2tlJyk7XG4gICAgaWYgKHMpIHJldHVybiBCVkcuZXh0cmFjdE51bWJlckFycmF5KHMpO1xuICAgIHJldHVybiAnJztcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdzdHJpbmcnKSByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UnLCBhcmd1bWVudHNbMF0pO1xuICAgIGVsc2UgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlJywgQlZHLnJnYmEoYXJndW1lbnRzWzBdKSk7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyB8fCBhcmd1bWVudHMubGVuZ3RoID09PSA0KSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlJywgQlZHLnJnYmEuYXBwbHkoQlZHLCBhcmd1bWVudHMpKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcih0aGlzLCAnc3Ryb2tlKCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDEgYXJndW1lbnQuJyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYGJ2Zy5zdHJva2VXaWR0aChbd2lkdGhdKWBcbiAgKiBHZXQvc2V0IHRoZSBvdXRsaW5lIHRoaWNrbmVzcy5cbiAgKlxuICAqIFJldHVybnMgdGhlIGN1cnJlbnQgb3V0bGluZSB0aGlja25lc3MgaWYgYHdpZHRoYCBpcyBvbWl0dGVkLiBPdGhlcmlzZSxcbiAgKiBpdCBhc3NpZ25zIHRoZSBvdXRsaW5lIHRoaWNrbmVzcyB3aXRoIGEgbmV3IHZhbHVlLCBhbmQgcmV0dXJucyB0aGUgYGJ2Z2BcbiAgKiBvYmplY3QgcmVmZXJlbmNlLlxuICAqXG4gICogIC0gYHdpZHRoYCAgOiBPdXRsaW5lIHRoaWNrbmVzcyBpbiBwaXhlbHMuXG4gICovXG5CVkcucHJvdG90eXBlLnN0cm9rZVdpZHRoID0gZnVuY3Rpb24gKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZS13aWR0aCcpO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB0aGlzLmF0dHIoJ3N0cm9rZS13aWR0aCcsIGFyZ3VtZW50c1swXSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IodGhpcywgJ3N0cm9rZVdpZHRoKCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDEgYXJndW1lbnQuJyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYGJ2Zy5ub1N0cm9rZSgpYFxuICAqIFJlbW92ZSBCVkcgb2JqZWN0J3Mgb3V0bGluZSBjb21wbGV0ZWx5LlxuICAqL1xuQlZHLnByb3RvdHlwZS5ub1N0cm9rZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc3Ryb2tlV2lkdGgoMCkuc3Ryb2tlKCdyZ2JhKDAsIDAsIDAsIDApJyk7XG59O1xuXG5CVkcucHJvdG90eXBlLmNvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RhZy5pbm5lckhUTUw7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHRoaXMuX3RhZy5pbm5lckhUTUwgPSBhcmd1bWVudHNbMF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IodGhpcywgJ2NvbnRlbnQoKSByZWNlaXZlZCBtb3JlIHRoYW4gMSBhcmd1bWVudC4nKTtcbiAgfVxufTtcblxuLyoqICMjIyBgYnZnLmFkZENsYXNzKGMpYFxuKiBBZGQgYSBjbGFzcyBuYW1lIHRvIHRoZSBlbGVtZW50LlxuKi9cbkJWRy5wcm90b3R5cGUuYWRkQ2xhc3MgPSBmdW5jdGlvbiAoYykge1xuICB0aGlzLl90YWcuY2xhc3NMaXN0LmFkZChjKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMjIGBidmcucmVtb3ZlQ2xhc3MoYylgXG4gICogUmVtb3ZlIGEgY2xhc3MgbmFtZSB0byB0aGUgZWxlbWVudC5cbiAgKi9cbkJWRy5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoYykge1xuICB0aGlzLl90YWcuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMjIGBidmcuaGFzQ2xhc3MoYylgXG4gICogUmV0dXJuIHRydWUgaWYgdGhlIGVsZW1lbnQgaGFzIGNsYXNzIGBjYC5cbiAgKi9cbkJWRy5wcm90b3R5cGUuaGFzQ2xhc3MgPSBmdW5jdGlvbiAoYykge1xuICByZXR1cm4gdGhpcy5fdGFnLmNsYXNzTGlzdC5jb250YWlucyhjKTtcbn07XG5cbi8qKiAjIyMgYGJ2Zy5yZW1vdmVDbGFzcyhjKWBcbiAgKiBBZGQgb3IgcmVtb3ZlIHRoZSBjbGFzcyBgY2AgdG8gdGhlIGVsZW1lbnQuXG4gICovXG5CVkcucHJvdG90eXBlLnRvZ2dsZUNsYXNzID0gZnVuY3Rpb24gKGMpIHtcbiAgdGhpcy5fdGFnLmNsYXNzTGlzdC50b2dnbGUoYyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIEFmZmluZSBUcmFuc2Zvcm1hdGlvbnMgKi9cbkJWRy5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24gKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzLl90YWcuZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKSB8fCAnJztcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdGhpcy5fdGFnLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgYXJndW1lbnRzWzBdKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RyYW5zZm9ybSgpIHJlY2VpdmVkIG1vcmUgdGhhbiAxIGFyZ3VtZW50Jyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYEJWRy50cmFuc2xhdGUoeCwgW3ldKWBcbiAgKiBBcHBseSBhIG1vdmluZyB0cmFuc2xhdGlvbiBieSBgeGAgYW5kIGB5YCB1bml0cy4gSWYgYHlgIGlzIG5vdCBnaXZlbiwgaXRcbiAgKiBpcyBhc3N1bWVkIHRvIGJlIDAuXG4gICovXG5CVkcucHJvdG90eXBlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIGlmICh0eXBlb2YgeCAhPT0gJ251bWJlcicgJiYgdHlwZW9mIHkgIT09ICdudW1iZXInKVxuICAgIHRocm93IG5ldyBFcnJvcigndHJhbnNsYXRlKCkgb25seSB0YWtlIG51bWJlcnMgYXMgYXJndW1lbnRzJyk7XG4gIHkgPSB5IHx8IDA7XG4gIHZhciB0cmFuc2Zvcm0gPSB0aGlzLnRyYW5zZm9ybSgpO1xuICB0aGlzLl90YWcuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCBbdHJhbnNmb3JtLCAnIHRyYW5zbGF0ZSgnLCB4LCAnICcsIHksICcpJ10uam9pbignJykudHJpbSgpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMgVXRpbGl0eSBNZXRob2RzICovXG5cbi8qKiAjIyMgYEJWRy5yZ2JhKHIsIGcsIGIsIFthXSlgXG4gICogUmV0dXJuIGEgc3RyaW5nIGluIHRoZSBmb3JtIG9mIGByZ2JhKHIsIGcsIGIsIGEpYC5cbiAgKlxuICAqIElmIG9ubHkgYHJgIGlzIGdpdmVuLCB0aGUgdmFsdWUgaXMgY29waWVkIHRvIGBnYCBhbmQgYGJgIHRvIHByb2R1Y2UgYVxuICAqIGdyZXlzY2FsZSB2YWx1ZS5cbiAgKi9cbkJWRy5yZ2JhID0gZnVuY3Rpb24gKHIsIGcsIGIsIGE9MS4wKSB7XG4gIGlmICh0eXBlb2YgciAhPT0gJ251bWJlcicpIHRocm93IG5ldyBUeXBlRXJyb3IgKCdyZ2JhKCkgbXVzdCB0YWtlIG51bWVyaWNhbCB2YWx1ZXMgYXMgaW5wdXQnKTtcbiAgZyA9IGcgfHwgcjtcbiAgYiA9IGIgfHwgcjtcbiAgcmV0dXJuICdyZ2JhKCcgKyBbciwgZywgYiwgYV0uam9pbignLCcpICsgJyknO1xufTtcblxuLyoqICMjIyBgQlZHLmhzbGEoaHVlLCBzYXR1cmF0aW9uLCBsaWdodG5lc3MsIFthbHBoYV0pYFxuICAqIFJldHVybiB0aGUgQ1NTIHJlcHJlc2VudGF0aW9uIGluIGBoc2xhKClgIGFzIGEgc3RyaW5nLlxuICAqXG4gICogIC0gYGh1ZWA6IEEgdmFsdWUgYmV0d2VlbiBgMGAgYW5kIGAzNjBgLCB3aGVyZSBgMGAgaXMgcmVkLCBgMTIwYCBpcyBncmVlbixcbiAgKiAgICAgICAgICAgYW5kIGAyNDBgIGlzIGJsdWUuXG4gICogIC0gYHNhdHVyYXRpb25gIDogQSB2YWx1ZSBiZXR3ZWVuIGAwYCBhbmQgYDEwMGAsIHdoZXJlIGAwYCBpcyBncmV5IGFuZFxuICAqICAgICAgICAgICAgICAgICBgMTAwYCBpcyBmdWxseSBzYXR1cmF0ZS5cbiAgKiAgLSBgbGlnaHRuZXNzYDogQSB2YWx1ZSBiZXR3ZWVuIGAwYCBhbmQgYDEwMGAsIHdoZXJlIGAwYCBpcyBibGFjayBhbmRcbiAgKiAgICAgICAgICAgICAgICAgYDEwMGAgaXMgZnVsbCBpbnRlbnNpdHkgb2YgdGhlIGNvbG91ci5cbiAgKi9cbkJWRy5oc2xhID0gZnVuY3Rpb24gKGh1ZSwgc2F0dXJhdGlvbiwgbGlnaHRuZXNzLCBhbHBoYSkge1xuICBhbHBoYSA9IGFscGhhIHx8IDEuMDtcbiAgcmV0dXJuICdoc2xhKCcgKyBbaHVlLCBzYXR1cmF0aW9uICsgJyUnLCBsaWdodG5lc3MgKyAnJScsIGFscGhhXS5qb2luKCcsJykgKyAnKSc7XG59O1xuXG4vKiogIyMjIGBCVkcuZXh0cmFjdE51bWJlckFycmF5KHN0cilgXG4gICogUmV0dXJuIGFuIGFycmF5IGBbeCwgeSwgeiwgLi4uXWAgZnJvbSBhIHN0cmluZyBjb250YWluaW5nIGNvbW1vbi1zZXBhcmF0ZWRcbiAgKiBudW1iZXJzLlxuICAqL1xuQlZHLmV4dHJhY3ROdW1iZXJBcnJheSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5tYXRjaCgvXFxkKlxcLj9cXGQrL2cpLm1hcChOdW1iZXIpO1xufTtcblxuXG4vKiogIyMgQ29udHJpYnV0ZSB0byB0aGlzIGxpYnJhcnlcbiogW01ha2UgYSBwdWxsIHJlcXVlc3RdKGh0dHBzOi8vZ2l0aHViLmNvbS9TcGF4ZS9CVkcuanMvcHVsbHMpIG9yXG4qIFtwb3N0IGFuIGlzc3VlXShodHRwczovL2dpdGh1Yi5jb20vU3BheGUvQlZHLmpzL2lzc3VlcykuIFNheSBoZWxsbyB0b1xuKiBjb250YWN0QHhhaXZlcmhvLmNvbS5cbiovIiwiLyogZ2xvYmFsIG1vY2hhOiB0cnVlLCBkZWZpbmU6IHRydWUsIGRlc2NyaWJlOiB0cnVlLCBpdDogdHJ1ZSwgYmVmb3JlOiB0cnVlLCBhZnRlcjogdHJ1ZSAqL1xuaW1wb3J0IEJWRyBmcm9tICcuLi9idmcnO1xuXG5kZXNjcmliZSgnQlZHLmpzJywgZnVuY3Rpb24gKCkge1xuICB2YXIgYnZnO1xuICB2YXIgZHVtbXk7XG4gIHZhciBjb250YWluZXI7XG5cbiAgYmVmb3JlKGZ1bmN0aW9uICgpIHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb250YWluZXIuaWQgPSAnY29udGFpbmVyJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgYmUgYWJsZSB0byBjcmVhdGUgYSBjb250YWluZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgQlZHLnNob3VsZC5iZS5hKCdmdW5jdGlvbicpO1xuICAgIEJWRy5jcmVhdGUuc2hvdWxkLmJlLmEoJ2Z1bmN0aW9uJyk7XG4gICAgYnZnID0gQlZHLmNyZWF0ZSgnI2NvbnRhaW5lcicpO1xuICAgIGJ2Zy5zaG91bGQuYmUuaW5zdGFuY2VvZihCVkcpO1xuICAgIHNob3VsZC5ub3QuZXhpc3QoYnZnLnBhcmVudCgpKTtcbiAgICBidmcudGFnKCkuc2hvdWxkLmJlLmluc3RhbmNlb2YoU1ZHRWxlbWVudCk7XG4gICAgQlZHLmNyZWF0ZS5iaW5kKEJWRywgJyNub3QtY29udGFpbmVyJykuc2hvdWxkLlRocm93KFR5cGVFcnJvcik7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgYmUgYWJsZSB0byByZW1vdmUgaXRzZWxmIGZyb20gcGFyZW50JywgZnVuY3Rpb24gKCkge1xuICAgIGR1bW15ID0gQlZHLmNyZWF0ZShjb250YWluZXIpO1xuICAgIHZhciByZWN0ID0gZHVtbXkucmVjdCgxMCwgMjAsIDMwLCA0MCk7XG4gICAgcmVjdC5wYXJlbnQoKS5zaG91bGQuZXF1YWwoZHVtbXkpO1xuICAgIHJlY3QucmVtb3ZlKCk7XG4gICAgc2hvdWxkLm5vdC5leGlzdChyZWN0LnBhcmVudCgpKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBwcm92aWRlIGJhc2ljIHNoYXBlIGZ1bmN0aW9ucycsIGZ1bmN0aW9uICgpIHtcbiAgICBbJ3JlY3QnLCAnZWxsaXBzZScsICdsaW5lJ10uZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgQlZHW2ZdLnNob3VsZC5iZS5hKCdmdW5jdGlvbicpO1xuICAgICAgdmFyIHNoYXBlID0gQlZHW2ZdKDEwLCAyMCwgMzAsIDQwKTtcbiAgICAgIHNoYXBlLnRhZygpLnNob3VsZC5iZS5pbnN0YW5jZW9mKFNWR0VsZW1lbnQpO1xuICAgIH0pO1xuICAgIHZhciBwb2x5bGluZSA9IEJWRy5wb2x5bGluZShbXG4gICAgICBbMTAsIDIwXSwgWzMwLCA0MF1cbiAgICBdKTtcbiAgICBwb2x5bGluZS50YWcoKS5zaG91bGQuYmUuaW5zdGFuY2VvZihTVkdFbGVtZW50KTtcbiAgICBwb2x5bGluZS5kYXRhKCdwb2ludHMnKS5zaG91bGQuZXFsKFtbMTAsIDIwXSwgWzMwLCA0MF1dKTtcbiAgICB2YXIgcG9seWdvbiA9IEJWRy5wb2x5Z29uKFtcbiAgICAgIFsxMDAsIDIwXSwgWzIwLCA3MF0sIFs1MCwgNjBdXG4gICAgXSk7XG4gICAgcG9seWdvbi50YWcoKS5zaG91bGQuYmUuaW5zdGFuY2VvZihTVkdFbGVtZW50KTtcbiAgICBwb2x5Z29uLmRhdGEoJ3BvaW50cycpLnNob3VsZC5lcWwoW1sxMDAsIDIwXSwgWzIwLCA3MF0sIFs1MCwgNjBdXSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgcHJvdmlkZSBhY2Nlc3MgdG8gZGF0YSwgc3Ryb2tlcyBhbmQgZmlsbHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICB4OiAxMCxcbiAgICAgIHk6IDIwLFxuICAgICAgd2lkdGg6IDMwLFxuICAgICAgaGVpZ2h0OiA0MFxuICAgIH07XG4gICAgdmFyIHNoYXBlID0gQlZHLnJlY3QoZGF0YSk7XG4gICAgc2hhcGUuZGF0YSgneCcpLnNob3VsZC5lcXVhbCgxMCk7XG4gICAgc2hhcGUuZGF0YSgpLnNob3VsZC5lcXVhbChkYXRhKTtcbiAgICBzaGFwZS5kYXRhKCd5JywgNTApO1xuICAgIHNoYXBlLmRhdGEoJ3knKS5zaG91bGQuZXF1YWwoNTApO1xuXG4gICAgdmFyIGMgPSBbMjU1LCAzMCwgNTAsIDFdO1xuICAgIHNoYXBlLnN0cm9rZS5hcHBseShzaGFwZSwgYyk7XG4gICAgc2hhcGUuc3Ryb2tlKCkuc2hvdWxkLmVxbChjKTtcbiAgICBzaGFwZS5zdHJva2UoMjU1LCAyMCwgNTApO1xuICAgIHNoYXBlLnN0cm9rZSgpLnNob3VsZC5ub3QuZXFsKGMpO1xuICAgIHNoYXBlLnN0cm9rZSgyNTUsIDMwLCA1MCwgMSk7XG4gICAgc2hhcGUuc3Ryb2tlKCkuc2hvdWxkLmVxbChjKTtcbiAgICBzaGFwZS5zdHJva2UoMjU1KTtcbiAgICBzaGFwZS5zdHJva2UoKS5zaG91bGQuZXFsKFsyNTUsIDI1NSwgMjU1LCAxXSk7XG4gICAgc2hhcGUubm9TdHJva2UoKTtcbiAgICBzaGFwZS5zdHJva2UoKS5zaG91bGQuZXFsKFswLCAwLCAwLCAwXSk7XG5cbiAgICBzaGFwZS5maWxsLmFwcGx5KHNoYXBlLCBjKTtcbiAgICBzaGFwZS5maWxsKCkuc2hvdWxkLmVxbChjKTtcbiAgICBzaGFwZS5maWxsKDI1NSwgMjAsIDUwKTtcbiAgICBzaGFwZS5maWxsKCkuc2hvdWxkLm5vdC5lcWwoYyk7XG4gICAgc2hhcGUuZmlsbCgyNTUsIDMwLCA1MCwgMSk7XG4gICAgc2hhcGUuZmlsbCgpLnNob3VsZC5lcWwoYyk7XG4gICAgc2hhcGUuZmlsbCgyNTUpO1xuICAgIHNoYXBlLmZpbGwoKS5zaG91bGQuZXFsKFsyNTUsIDI1NSwgMjU1LCAxXSk7XG4gICAgc2hhcGUubm9GaWxsKCk7XG4gICAgc2hhcGUuZmlsbCgpLnNob3VsZC5lcWwoWzAsIDAsIDAsIDBdKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBkcmF3IGdlb21ldHJ5JywgZnVuY3Rpb24gKCkge1xuICAgIHZhciB0cmlhbmdsZSA9IEJWRy50cmlhbmdsZSg1MCwgNTAsIDYwKTtcbiAgICB0cmlhbmdsZS50YWcoKS5zaG91bGQuYmUuaW5zdGFuY2VvZihTVkdFbGVtZW50KTtcbiAgICB2YXIgYXJjID0gQlZHLmFyYygyNTAsIDI1MCwgMTAwLCAyMDAsIDAsIE1hdGguUEkvMyk7XG4gICAgYXJjLnRhZygpLnNob3VsZC5iZS5pbnN0YW5jZW9mKFNWR0VsZW1lbnQpO1xuICAgIGFyYyA9IEJWRy5hcmMoNjAwLCAzNTAsIDIwMCwgMjAwLCBNYXRoLlBJLCBNYXRoLlBJKjItMC4xKTtcbiAgICBhcmMudGFnKCkuc2hvdWxkLmJlLmluc3RhbmNlb2YoU1ZHRWxlbWVudCk7XG4gICAgYXJjID0gQlZHLmFyYyg2MjQsIDM3NSwgMjAwLCAyMDAsIE1hdGguUEksIE1hdGguUEkvMik7XG4gICAgYXJjLnRhZygpLnNob3VsZC5iZS5pbnN0YW5jZW9mKFNWR0VsZW1lbnQpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHJlbmRlciB0ZXh0JywgZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0ID0gYnZnLnRleHQoJ01ycmFhIScsIDMwLCA0MCkuZmlsbCgwKTtcbiAgICB0ZXh0LnRhZygpLnNob3VsZC5iZS5pbnN0YW5jZW9mKFNWR0VsZW1lbnQpO1xuICAgIHRleHQudGFnKCkudGFnTmFtZS5zaG91bGQuZXFsKCd0ZXh0Jyk7XG4gICAgdGV4dC5wYXJlbnQoKS5zaG91bGQuZXF1YWwoYnZnKTtcbiAgICB0ZXh0LnJlbW92ZSgpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHByb3ZpZGUgYWNjZXNzIHRvIHBhcmVudCBhbmQgY2hpbGRyZW4gbm9kZXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgW1xuICAgICAgWzEwLCAyMCwgMzAsIDQwXSxcbiAgICAgIFszMCwgMjAsIDQwLCAzMF1cbiAgICBdLmZvckVhY2goZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgIGJ2Zy5yZWN0LmFwcGx5KGJ2ZywgYXJncyk7XG4gICAgfSk7XG4gICAgdmFyIGNoaWxkcmVuID0gYnZnLmNoaWxkcmVuKCk7XG4gICAgY2hpbGRyZW4ubGVuZ3RoLnNob3VsZC5lcWwoMik7XG4gICAgY2hpbGRyZW5bMF0ucGFyZW50KCkuc2hvdWxkLmVxdWFsKGJ2Zyk7XG4gICAgY2hpbGRyZW5bMF0uZGF0YSgneCcpLnNob3VsZC5lcWwoMTApO1xuICAgIGNoaWxkcmVuWzBdLmRhdGEoJ2hlaWdodCcpLnNob3VsZC5lcWwoNDApO1xuICAgIGNoaWxkcmVuWzBdLnJlbW92ZSgpO1xuICAgIGNoaWxkcmVuWzFdLnJlbW92ZSgpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHByb3ZpZGUgc2VsZWN0aW9uIGZ1bmN0aW9ucyBmb3Igbm9kZXMgaW5zaWRlJywgZnVuY3Rpb24gKCkge1xuICAgIFtcbiAgICAgIFsxMCwgMjAsIDMwLCA0MF0sXG4gICAgICBbMzAsIDIwLCA0MCwgMzBdXG4gICAgXS5mb3JFYWNoKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICB2YXIgYiA9IGJ2Zy5yZWN0LmFwcGx5KGJ2ZywgYXJncyk7XG4gICAgICBiLnRhZygpLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAndGVzdCcpO1xuICAgIH0pO1xuICAgIHZhciBjaGlsZHJlbiA9IGJ2Zy5maW5kKCcudGVzdCcpO1xuICAgIGNoaWxkcmVuLmxlbmd0aC5zaG91bGQuZXFsKDIpO1xuICAgIGNoaWxkcmVuWzBdLnBhcmVudCgpLnNob3VsZC5lcXVhbChidmcpO1xuICAgIGNoaWxkcmVuWzBdLmRhdGEoJ3gnKS5zaG91bGQuZXFsKDEwKTtcbiAgICBjaGlsZHJlblswXS5kYXRhKCdoZWlnaHQnKS5zaG91bGQuZXFsKDQwKTtcbiAgICBjaGlsZHJlblswXS5yZW1vdmUoKTtcbiAgICBjaGlsZHJlblsxXS5yZW1vdmUoKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBzdXBwb3J0IFJHQkEgYW5kIEhTTEEgY29sb3VyIGZ1bmN0aW9ucycsIGZ1bmN0aW9uICgpIHtcbiAgICBCVkcucmdiYSgyNTUpLnNob3VsZC5lcWwoJ3JnYmEoMjU1LDI1NSwyNTUsMSknKTtcbiAgICBCVkcucmdiYSgyNTUsIDIwMCwgMjQ0KS5zaG91bGQuZXFsKCdyZ2JhKDI1NSwyMDAsMjQ0LDEpJyk7XG4gICAgQlZHLnJnYmEoMjU1LCAyMDAsIDI0NCwgMC41KS5zaG91bGQuZXFsKCdyZ2JhKDI1NSwyMDAsMjQ0LDAuNSknKTtcbiAgICBCVkcuaHNsYSgyMzAsIDEwMCwgNzUsIDAuMykuc2hvdWxkLmVxbCgnaHNsYSgyMzAsMTAwJSw3NSUsMC4zKScpO1xuICAgIEJWRy5oc2xhKDIzMCwgMTAwLCA3NSkuc2hvdWxkLmVxbCgnaHNsYSgyMzAsMTAwJSw3NSUsMSknKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBoYXZlIGFmZmluZSB0cmFuc2Zvcm1hdGlvbnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGIgPSBidmcucmVjdCgwLCAwLCAxMCwgMTApO1xuICAgIGIudHJhbnNmb3JtKCkuc2hvdWxkLmVxbCgnJyk7XG4gICAgYi50cmFuc2Zvcm0oJ21hdHJpeCgwIDAgMCAxIDEgMSknKTtcbiAgICBiLnRyYW5zZm9ybSgpLnNob3VsZC5lcWwoJ21hdHJpeCgwIDAgMCAxIDEgMSknKTtcbiAgICBiLnRyYW5zZm9ybSgnJyk7XG5cbiAgICBiLnRyYW5zbGF0ZSgxMCwgMTApO1xuICAgIGIudHJhbnNmb3JtKCkuc2hvdWxkLmVxbCgndHJhbnNsYXRlKDEwIDEwKScpO1xuICAgIGIudHJhbnNmb3JtKCcnKTtcbiAgICBiLnRyYW5zbGF0ZSgtOTApO1xuICAgIGIudHJhbnNmb3JtKCkuc2hvdWxkLmVxbCgndHJhbnNsYXRlKC05MCAwKScpO1xuICB9KTtcbn0pO1xuIl19
