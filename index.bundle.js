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
var BVG = exports.BVG = function BVG(tag, data, binding) {
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
var BVGCanvas = exports.BVGCanvas = function BVGCanvas(htmlElement, xDimension, yDimension) {
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

var bvg = (0, _bvg.BVGCanvas)('#universe');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidmcuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0FDY0EsWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQzs7OztBQXNGYixTQUFTLE9BQU8sQ0FBRSxHQUFHLEVBQUUsUUFBUSxFQUFFOzs7O0FBSS9CLFFBQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVUsT0FBTyxFQUFFO0FBQ3JDLFdBQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxNQUFNLEVBQUU7OztBQUdoQyxVQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksTUFBTSxFQUFFO0FBQ3RDLGVBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ3JDO0tBQ0YsQ0FBQzs7O0FBQUMsQUFHSCxZQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztHQUM5QixDQUFDOzs7QUFBQyxBQUdILFFBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFO0FBQ3RDLFFBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLE1BQU0sRUFBRTtBQUM5QixhQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzdCO0dBQ0YsQ0FBQyxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7O0FBQUEsQUFXTSxJQUFJLEdBQUcsV0FBSCxHQUFHLEdBQUcsU0FBTixHQUFHLENBQWEsR0FBRyxFQUFFLElBQUksRUFB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QUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztLQUM3QixDQUFDLENBQUM7QUFDSCxRQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDN0UsUUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzdFLFlBQVEsQ0FBQyxJQUFJLENBQUM7QUFDWixPQUFDLEVBQUUsRUFBRTtBQUNMLE9BQUMsRUFBRSxFQUFFO0FBQ0wsUUFBRSxFQUFFLElBQUksR0FBQyxDQUFDLElBQUksSUFBSSxHQUFDLFFBQVEsQ0FBQSxBQUFDLEdBQUMsSUFBSTtLQUNsQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7R0FDeEU7Q0FDRixDQUFDOzs7QUFBQyxBQUdILFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9cbi8qKiAjIEJWRyAtIEJpbmRhYmxlIFZlY3RvciBHcmFwaGljc1xuICAqICoqUmVhbC10aW1lIGRhdGEtZHJpdmVuIHZpc3VhbGlzYXRpb24gZm9yIHRoZSB3ZWIuKipcbiAgKlxuICAqICFbRXhhbXBsZV0oaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1NwYXhlL0JWRy5qcy9tYXN0ZXIvZGVtby9pbmRleC5naWYpXG4gICpcbiAgKiBMaXZlIGV4YW1wbGU6IGh0dHA6Ly9zcGF4ZS5naXRodWIuaW8vQlZHLmpzL1xuICAqXG4gICogKkJpbmRhYmxlIFZlY3RvciBHcmFwaGljcyogd2FzIGJvcm4gb3V0IG9mIGZydXN0cmF0aW9uIGZvciBsYWNrIG9mIGFcbiAgKiBtaWRkbGUgbGV2ZWwgU1ZHIGxpYnJhcnkuIFtEMy5qc10oaHR0cDovL2QzanMub3JnLykgYWJzdHJhY3RzIHRvbyBtdWNoXG4gICogbG9naWMsIGFuZCBbU1ZHLmpzXShodHRwOi8vc3ZnanMuY29tLykgcHJvdmlkZXMgb25seSBsb3ctbGV2ZWwgU1ZHIGRyYXdpbmcuXG4gICogQmluZGFibGUgVmVjdG9yIEdyYXBoaWNzIG9mZmVycyBTVkcgZWxlbWVudHMgdGhhdCBjaGFuZ2UgYXMgdGhlIGRhdGEgY2hhbmdlLFxuICAqIGFuZCBnaXZlcyB5b3UgdG9vbHMgdG8gY29udHJvbCB0aGVpciBsb29rLlxuICAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKiogVGhlIGhlYXJ0IG9mIHRoaXMgbGlicmFyeSBpcyBhIHRyaW5pdHk6ICoqU1ZHICsgRGF0YSArIEJpbmRpbmcqKi4gVGhpc1xuICAqIGNvbm5lY3RzIHlvdXIgZGF0YSB0byB0aGUgU1ZHIGVsZW1lbnQgdGhyb3VnaCB0aGUgYmluZGluZyBmdW5jdGlvbiwgd2hpY2hcbiAgKiBjcmVhdGVzIGEgbGl2aW5nIGNvbm5lY3Rpb24gdGhhdCBjYW4gcmVhY3QgdG8gY2hhbmdlLiBCVkcgdXNlc1xuICAqIFtgT2JqZWN0Lm9ic2VydmUoKWBdKGh0dHA6Ly9jYW5pdXNlLmNvbS8jZmVhdD1vYmplY3Qtb2JzZXJ2ZSkgd2hpY2ggaXNcbiAgKiBhdmFpbGFibGUgb24gQ2hyb21lIDM2KywgT3BlcmEgMjcrIGFuZCBBbmRyb2lkIEJyb3dzZXIgMzcrLlxuICAqXG4gICogSWYgeW91IHdpc2ggdG8gdXNlIHRoaXMgZm9yIG9sZGVyIGJyb3dzZXJzLCB5b3UgY2FuIHBvbHlmaWxsIHdpdGhcbiAgKiBbYE1heEFydDI1MDEvT2JqZWN0Lm9ic2VydmVgXShodHRwczovL2dpdGh1Yi5jb20vTWF4QXJ0MjUwMS9vYmplY3Qtb2JzZXJ2ZSkuXG4gICpcbiAgKiAjIyBJbnN0YWxsYXRpb25cbiAgKlxuICAqICoqSW5zdGFsbCB1c2luZyBgbnBtYCoqOlxuICAqXG4gICogIDEuIEluc3RhbGwgTm9kZS5qczogaHR0cHM6Ly9kb2NzLm5wbWpzLmNvbS9nZXR0aW5nLXN0YXJ0ZWQvaW5zdGFsbGluZy1ub2RlXG4gICogIDIuIEluIHlvdXIgd29ya2luZyBkaXJlY3Rvcnk6XG4gICpcbiAgKiAgICAgYGBgXG4gICogICAgIG5wbSBpbnN0YWxsIGJ2Z1xuICAqICAgICBgYGBcbiAgKlxuICAqICoqSW5zdGFsbCB2aWEgR2l0SHViKio6XG4gICpcbiAgKiAgMS4gQ2xvbmUgdGhpcyByZXBvOlxuICAqXG4gICogICAgIGBgYFxuICAqICAgICBnaXQgY2xvbmUgaHR0cHM6Ly9naXRodWIuY29tL1NwYXhlL0JWRy5qcy5naXRcbiAgKiAgICAgYGBgXG4gICpcbiAgKiAgMi4gQ29weSBgcmVxdWlyZS5qc2AgYW5kIGBidmcuanNgIGludG8geW91ciB3b3JraW5nIGRpcmVjdG9yeS5cbiAgKlxuICAqICoqVG8gaW5jbHVkZSBgQlZHLmpzYCBpbiB5b3VyIHdlYnBhZ2UqKjpcbiAgKlxuICAqICAxLiBJbiB5b3VyIEhUTUwgYDxoZWFkPmAsIGluY2x1ZGUgdGhpcyBzY3JpcHQgdXNpbmcgYHJlcXVpcmUuanNgOlxuICAqXG4gICogICAgIGBgYEhUTUxcbiAgKiAgICAgPHNjcmlwdCBzcmM9XCJwYXRoL3RvL3JlcXVpcmUuanNcIiBkYXRhLW1haW49XCJ5b3VyLXNjcmlwdC5qc1wiPjwvc2NyaXB0PlxuICAqICAgICBgYGBcbiAgKlxuICAqICAyLiBJbiBgeW91ci1zY3JpcHQuanNgLCBkZWZpbmUgeW91ciBvd24gY29kZSB3aXRoXG4gICpcbiAgKiAgICAgYGBgSmF2YXNjcmlwdFxuICAqICAgICByZXF1aXJlKFsncGF0aC90by9idmcuanMnXSwgZnVuY3Rpb24gKEJWRykge1xuICAqICAgICAgIC8vIHlvdXIgY29kZSBnb2VzIGhlcmUgLi4uXG4gICogICAgIH0pO1xuICAqICAgICBgYGBcbiAgKlxuICAqICMjIFF1aWNrc3RhcnRcbiAgKlxuICAqICFbUXVpY2tzdGFydCBFeGFtcGxlXShodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vU3BheGUvQlZHLmpzL21hc3Rlci9kZW1vLzAwMS1oZWxsby5naWYpXG4gICpcbiAgKiBIVE1MOlxuICAqXG4gICogYGBgSFRNTFxuICAqIDxkaXYgaWQ9XCJidmctY29udGFpbmVyXCI+PC9kaXY+XG4gICogYGBgXG4gICpcbiAgKiBDU1MgKE1ha2UgdGhlIGNvbnRhaW5lciBsYXJnZSBlbm91Z2gpOlxuICAqXG4gICogYGBgQ1NTXG4gICogaHRtbCwgYm9keSwgI2J2Zy1jb250YWluZXIge1xuICAqICAgaGVpZ2h0OiAxMDAlO1xuICAqICAgbWFyZ2luOiAwO1xuICAqIH1cbiAgKiBgYGBcbiAgKlxuICAqIEphdmFzY3JpcHQ6XG4gICpcbiAgKiBgYGBKYXZhc2NyaXB0XG4gICogLy8gQ3JlYXRlIGEgQlZHIGNvbnRhaW5lciBiYXNlZCBvbiBzZWxlY3RlZCBIVE1MIGVsZW1lbnRcbiAgKiB2YXIgYnZnID0gQlZHLmNyZWF0ZSgnI2J2Zy1jb250YWluZXInKTtcbiAgKiAvLyBDcmVhdGUgYSBCaW5kYWJsZSBjaXJjbGUsIGNvbG91ciBpdCBvcmFuZ2VcbiAgKiB2YXIgY2lyY2xlID0gYnZnLmVsbGlwc2UoMCwgMCwgMTUwLCAxNTApXG4gICogICAgICAgICAgICAgICAgIC5maWxsKDIyMCwgNjQsIDEyKTtcbiAgKiAvLyBDaGFuZ2UgaXRzIHNpemUgYmFzZWQgb24gbW91c2UgbW92ZW1lbnRcbiAgKiBidmcudGFnKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICogICBjaXJjbGUuZGF0YSh7XG4gICogICAgIHJ4OiBldmVudC5jbGllbnRYLFxuICAqICAgICByeTogZXZlbnQuY2xpZW50WVxuICAqICAgfSk7XG4gICogfSk7XG4gICogYGBgXG4gICovXG5cbi8qLSBEZWVwIE9iamVjdC5vYnNlcnZlKCkgKi9cbmZ1bmN0aW9uIG9ic2VydmUgKG9iaiwgY2FsbGJhY2spIHtcblxuICAvLyBJbmNsdWRlIGh0dHBzOi8vZ2l0aHViLmNvbS9NYXhBcnQyNTAxL29iamVjdC1vYnNlcnZlIGlmIHlvdSB3aXNoIHRvIHdvcmtcbiAgLy8gd2l0aCBwb2x5ZmlsbCBvbiBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgT2JqZWN0Lm9ic2VydmUoKVxuICBPYmplY3Qub2JzZXJ2ZShvYmosIGZ1bmN0aW9uIChjaGFuZ2VzKSB7XG4gICAgY2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFuZ2UpIHtcblxuICAgICAgLy8gQmluZCBjaGlsZCBwcm9wZXJ0eSBpZiBpdCBpcyBhbiBvYmplY3QgZm9yIGRlZXAgb2JzZXJ2aW5nXG4gICAgICBpZiAob2JqW2NoYW5nZS5uYW1lXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICBvYnNlcnZlKG9ialtjaGFuZ2UubmFtZV0sIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRyaWdnZXIgdXNlciBjYWxsYmFja1xuICAgIGNhbGxiYWNrLmNhbGwodGhpcywgY2hhbmdlcyk7XG4gIH0pO1xuXG4gIC8vIEltbWVkaWF0ZWx5IGZpcmUgb2JzZXJ2ZSB0byBpbml0aWF0ZSBkZWVwIG9ic2VydmluZ1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChvYmpba2V5XSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgb2JzZXJ2ZShvYmpba2V5XSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qLSBgQlZHKHRhZywgZGF0YSwgYmluZGluZylgXG4gICogVGhlIHRyaW5pdHkgb2YgdGhpcyBsaWJyYXJ5OiBTVkcgKyBEYXRhICsgQmluZGluZyBGdW5jdGlvbi5cbiAgKlxuICAqIFJldHVybiB0aGUgQlZHIG9iamVjdCBjcmVhdGVkLlxuICAqXG4gICogIC0gYHRhZ2AgICAgOiBFaXRoZXIgYSBgU3RyaW5nYCBmb3IgdGhlIFNWRyBgdGFnTmFtZWAgb3IgYW55IFtgU1ZHRWxlbWVudGBdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1NWRy9FbGVtZW50KVxuICAqICAtIGBkYXRhYCAgIDogT2JqZWN0IHdpdGggYXJiaXRyYXJ5IGRhdGEgdG8geW91ciBkZXNpcmVcbiAgKiAgLSBgYmluZGluZ2A6IChvcHRpb25hbCkgQmluZGluZyBmdW5jdGlvbiB0aGF0IHNldHMgdGhlIHRhZyBhdHRyaWJ1dGVzXG4gICovXG5leHBvcnQgdmFyIEJWRyA9IGZ1bmN0aW9uICh0YWcsIGRhdGEsIGJpbmRpbmcpIHtcbiAgdmFyIGJ2ZyA9IHRoaXM7XG4gIHRhZyA9IHRhZyBpbnN0YW5jZW9mIFNWR0VsZW1lbnQgPyB0YWcgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnKTtcbiAgZGF0YSA9IGRhdGEgfHwge307XG4gIGJpbmRpbmcgPSBiaW5kaW5nIHx8IGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIHRhZy5zZXRBdHRyaWJ1dGUocHJvcCwgZGF0YVtwcm9wXSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIE9ic2VydmUgZGF0YSBvYmplY3QgYW5kIGFwcGx5IGJpbmRpbmcgcmlnaHQgYXdheVxuICBvYnNlcnZlKGRhdGEsIGZ1bmN0aW9uIChjaGFuZ2VzKSB7XG4gICAgYmluZGluZyh0YWcsIGRhdGEpO1xuICB9KTtcbiAgYmluZGluZyh0YWcsIGRhdGEpO1xuXG4gIC8vIElEIGZ1bmN0aW9uIGZyb20gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ29yZG9uYnJhbmRlci8yMjMwMzE3XG4gIHRhZy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ0JWR18nICsgdGFnLnRhZ05hbWUgKyAnXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgNykpO1xuICB0aGlzLl90YWcgPSB0YWc7XG4gIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB0aGlzLl9iaW5kaW5nID0gYmluZGluZztcblxuICAvLyBGdW5jdGlvbmFsIGNpcmN1bGFyIHJlZmVyZW5jZVxuICB0aGlzLl90YWcuX2dldEJWRyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYnZnO1xuICB9O1xuXG4gIGlmIChbJ3N2ZycsICdnJywgJ2EnXS5pbmRleE9mKHRhZy50YWdOYW1lKSA8IDApIHtcbiAgICBpZiAoIWRhdGEuc3Ryb2tlKSB0aGlzLnN0cm9rZSgxNzUpO1xuICAgIGlmICghZGF0YS5zdHJva2VXaWR0aCkgdGhpcy5zdHJva2VXaWR0aCgwLjUpO1xuICAgIGlmICghZGF0YS5maWxsKSB0aGlzLm5vRmlsbCgpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMgVGhlIEJWRyBDb250YWluZXJcbiAgKiBUaGUgcmVzdCBvZiB0aGUgZG9jdW1lbnRhdGlvbiB3aWxsIGFzc3VtZSBgYnZnYCBhcyBvdXIgQlZHIGNvbnRhaW5lclxuICAqIGNyZWF0ZWQgYnkgdGhlIGV4YW1wbGUgYmVsb3cuXG4gICovXG5cbi8qKiAjIyMgYEJWRy5jcmVhdGUoaHRtbEVsZW1lbnQpYFxuICAqIENyZWF0ZSBhIEJWRyBjb250YWluZXIgaW5zaWRlIGBodG1sRWxlbWVudGAuXG4gICpcbiAgKiBSZXR1cm4gdGhlIEJWRyBjb250YWluZXIgb2JqZWN0LlxuICAqXG4gICogIC0gYGh0bWxFbGVtZW50YCAgOiBFaXRoZXIgYSBbQ1NTIFNlbGVjdG9yXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9HdWlkZS9DU1MvR2V0dGluZ19TdGFydGVkL1NlbGVjdG9ycylcbiAgKiAgICAgICAgICAgICAgICAgICAgIG9yIGFueSBbSFRNTEVsZW1lbnRdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IVE1MRWxlbWVudCkuXG4gICpcbiAgKiBgYGBKYXZhc2NyaXB0XG4gICogLy8gQ3JlYXRlIGEgbmV3IEJWRyBjb250YWluZXIgYW5kIGFwcGVuZCBpdCB0byBhbiBleGlzdGluZyBIVE1MIGVsZW1lbnQuXG4gICogdmFyIGJ2ZyA9IEJWRy5jcmVhdGUoJyNidmctY29udGFpbmVyJyk7XG4gICogYGBgXG4gICovXG5leHBvcnQgdmFyIEJWR0NhbnZhcyA9IGZ1bmN0aW9uIChodG1sRWxlbWVudCwgeERpbWVuc2lvbiwgeURpbWVuc2lvbikge1xuICBpZiAodHlwZW9mIGh0bWxFbGVtZW50ID09PSAnc3RyaW5nJylcbiAgICBodG1sRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaHRtbEVsZW1lbnQpO1xuICBpZiAoIShodG1sRWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdodG1sRWxlbWVudCAoJyArIGh0bWxFbGVtZW50ICsgJykgd2FzIG5vdCBmb3VuZC4nKTtcblxuICB2YXIgZGF0YSA9IHtcbiAgICAneG1sbnM6eGxpbmsnOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gICAgdmVyc2lvbjogMS4xLFxuICAgIHdpZHRoOiAnMTAwJScsXG4gICAgaGVpZ2h0OiAnMTAwJSdcbiAgfTtcbiAgeURpbWVuc2lvbiA9IHlEaW1lbnNpb24gfHwgeERpbWVuc2lvbjtcbiAgaWYgKHhEaW1lbnNpb24pIHtcbiAgICBkYXRhLnZpZXdCb3ggPSBbMCwgMCwgeERpbWVuc2lvbiwgeURpbWVuc2lvbl0uam9pbignICcpO1xuICB9XG5cbiAgdmFyIGJ2ZyA9IG5ldyBCVkcoJ3N2ZycsIGRhdGEpO1xuICBodG1sRWxlbWVudC5hcHBlbmRDaGlsZChidmcudGFnKCkpO1xuICByZXR1cm4gYnZnO1xufTtcblxuLyoqICMjIEJWRyBFbGVtZW50c1xuICAqIEFsbCBCVkcgb2JqZWN0cywgaW5jbHVkaW5nIHRoZSBjb250YWluZXIsIGhhdmUgYWNjZXNzIHRvIGRyYXdpbmcgZnVuY3Rpb25zXG4gICogYW5kIHJldHVybiByZWZlcmVuY2UgdG8gdGhlIG5ldyBzaGFwZSwgd2hpY2ggaXMgYWxzbyBhIEJWRy5cbiAgKlxuICAqIGBgYEphdmFzY3JpcHRcbiAgKiAvLyBDcmVhdGUgYSByZWN0YW5nbGUgYXQgKDAsIDApIHdpdGggZGltZW5zaW9ucyAxMDB4MTAwIHB4IGFuZCBhZGQgaXQgdG8gYnZnXG4gICogdmFyIHJlY3QgPSBidmcucmVjdCgwLCAwLCAxMDAsIDEwMCk7XG4gICogYGBgXG4gICpcbiAgKiBUaGUgQlZHIG1vZHVsZSBhbHNvIGhhcyBkcmF3aW5nIGZ1bmN0aW9ucywgd2hpY2ggcmV0dXJuIHRoZSBCVkcgb2JqZWN0OlxuICAqXG4gICogYGBgSmF2YXNjcmlwdFxuICAqIC8vIENyZWF0ZSBhIHJlY3RhbmdsZSBhdCAoMCwgMCkgd2l0aCBkaW1lbnNpb25zIDEwMHgxMDAgcHhcbiAgKiAvLyBOb3RlIGl0IHVzZXMgdGhlIEJWRyBtb2R1bGUgZGlyZWN0bHkgdG8gY3JlYXRlIHRoZSByZWN0YW5nbGUuXG4gICogdmFyIHJlY3QgPSBCVkcucmVjdCgwLCAwLCAxMDAsIDEwMCk7XG4gICogLy8gQWRkIHRoZSByZWN0YW5nbGUgdG8gYW4gZXhpc3RpbmcgQlZHIGNvbnRhaW5lclxuICAqIGJ2Zy5hcHBlbmQocmVjdCk7XG4gICogYGBgXG4gICpcbiAgKiBEcmF3aW5nIGZ1bmN0aW9ucyBjYW4gYmUgY2FsbGVkIGluIGEgbnVtYmVyIG9mIHdheXMuIFRha2UgYGJ2Zy5yZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpYFxuICAqIGFzIGFuIGV4YW1wbGUgYmVsb3cuIFNvbWV0aW1lcyBpdCBpcyBlYXNpZXIgdG8gdXNlIG9uZSBvdmVyIGFub3RoZXIgc3R5bGUuXG4gICpcbiAgKiBgYGBKYXZhc2NyaXB0XG4gICogYnZnLnJlY3QoMCwgMTAsIDMwLCA3MCk7ICAgICAgLy8gQXJndW1lbnRzIHN0eWxlXG4gICogYnZnLnJlY3QoeyAgICAgICAgICAgICAgICAgICAgLy8gT2JqZWN0IHN0eWxlXG4gICogICB4OiAwLFxuICAqICAgeTogMTAsICAgICAgICAgICAgICAgICAgICAgIC8vIE5hbWUgb2YgdGhlIG9iamVjdCBwcm9wZXJ0aWVzIG11c3QgbWF0Y2hcbiAgKiAgIHdpZHRoOiAzMCwgICAgICAgICAgICAgICAgICAvLyBuYW1lcyBvZiB0aGUgYXJndW1lbnRzIGluIHRoZSBmdW5jdGlvbnMsXG4gICogICBoZWlnaHQ6IDcwICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoZSBvcmRlciBjYW4gYmUgYW55LlxuICAqIH0pO1xuICAqIGBgYFxuICAqL1xudmFyIGNyZWF0aW9uRnVuY3Rpb25zID0ge1xuICBzdmc6IGZ1bmN0aW9uICh4bGluaywgdmVyc2lvbiwgd2lkdGgsIGhlaWdodCkge1xuICAgIHJldHVybiBuZXcgQlZHKCdzdmcnLCB4bGluay5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHhsaW5rIDoge1xuICAgICAgJ3htbG5zOnhsaW5rJzogeGxpbmssXG4gICAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMjIGBidmcucmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KWBcbiAgICAqIENyZWF0ZSBhIHJlY3RhbmdsZSBhdCBwb3NpdGlvbiBgKHgsIHkpYCBhdCBgd2lkdGhgIHggYGhlaWdodGAgaW4gc2l6ZS5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgcmVjdCA9IGJ2Zy5yZWN0KDEwMCwgMTAwLCAzMDAsIDE1MCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICByZWN0OiBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIHJldHVybiBuZXcgQlZHKCdyZWN0JywgeC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHggOiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLmNpcmNsZShjeCwgY3ksIHIpYFxuICAgICogQ3JlYXRlIGEgY2lyY2xlIGNlbnRyZWQgb24gYChjeCwgY3kpYCB3aXRoIHJhZGl1cyBgcmAuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIGNpcmNsZSA9IGJ2Zy5lbGxpcHNlKDEwMCwgMTAwLCA1MCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBjaXJjbGU6IGZ1bmN0aW9uICh4LCB5LCByKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2NpcmNsZScsIHguY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4IDoge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICByOiByXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnY3gnLCBkYXRhLngpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnY3knLCBkYXRhLnkpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncicsIGRhdGEucik7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLmVsbGlwc2UoY3gsIGN5LCByeCwgcnkpYFxuICAgICogQ3JlYXRlIGEgZWxsaXBzZSBjZW50cmVkIG9uIGAoY3gsIGN5KWAgd2l0aCByYWRpaSBgcnhgIGFuZCBgcnlgLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciBlbGxpcHNlID0gYnZnLmVsbGlwc2UoMTAwLCAxMDAsIDIwMCwgMTgwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIGVsbGlwc2U6IGZ1bmN0aW9uICh4LCB5LCByeCwgcnkpIHtcbiAgICByZXR1cm4gbmV3IEJWRygnZWxsaXBzZScsIHguY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4IDoge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICByeDogcngsXG4gICAgICByeTogcnlcbiAgICB9LCBmdW5jdGlvbiAodGFnLCBkYXRhKSB7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdjeCcsIGRhdGEueCk7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdjeScsIGRhdGEueSk7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdyeCcsIGRhdGEucngpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncnknLCBkYXRhLnJ5KTtcbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMjIGBidmcubGluZSh4MSwgeTEsIHgyLCB5MilgXG4gICAgKiBDcmVhdGUgYSBsaW5lIGZyb20gYCh4MSwgeTEpYCB0byBgKHgyLCB5MilgLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciBsaW5lID0gYnZnLmxpbmUoMTAwLCAxMDAsIDIwMCwgMzAwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIGxpbmU6IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5Mikge1xuICAgIHJldHVybiBuZXcgQlZHKCdsaW5lJywgeDEuY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4MSA6IHtcbiAgICAgIHgxOiB4MSxcbiAgICAgIHkxOiB5MSxcbiAgICAgIHgyOiB4MixcbiAgICAgIHkyOiB5MlxuICAgIH0pO1xuICB9LFxuICAvKiogIyMjIGBidmcucG9seWxpbmUoW1t4MSwgeTFdLCBbeDIsIHkyXSwgLi4uXSlgXG4gICAgKiBDcmVhdGUgYSBzZXJpZXMgb2YgbGluZXMgZnJvbSBwb2ludCB0byBwb2ludC5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgcG9seWxpbmUgPSBidmcucG9seWxpbmUoW1sxMDAsIDIwMF0sIFsyMDAsIDMwMF0sIFs0MDAsIDgwMF1dKTtcbiAgICAqIGBgYFxuICAgICovXG4gIHBvbHlsaW5lOiBmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3BvbHlsaW5lJywgcG9pbnRzLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8gcG9pbnRzIDoge1xuICAgICAgcG9pbnRzOiBwb2ludHNcbiAgICB9LCBmdW5jdGlvbiAodGFnLCBkYXRhKSB7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdwb2ludHMnLCBkYXRhLnBvaW50cy5qb2luKCcgJykpO1xuICAgIH0pO1xuICB9LFxuICAvKiogIyMjIGBidmcucG9seWdvbihbW3gxLCB5MV0sIFt4MiwgeTJdLCAuLi5dKWBcbiAgICAqIENyZWF0ZSBhIGNsb3NlZCBwb2x5Z29uIGZyb20gcG9pbnQgdG8gcG9pbnQuIFRoZSBsYXN0IHBvaW50IHdpbGwgYmVcbiAgICAqIGNvbm5lY3RlZCBiYWNrIHRvIHRoZSBmaXJzdCBwb2ludC5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgcG9seWdvbiA9IGJ2Zy5wb2x5Z29uKFtbMTAwLCAyMDBdLCBbMjAwLCAzMDBdLCBbNDAwLCA4MDBdXSk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBwb2x5Z29uOiBmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3BvbHlnb24nLCBwb2ludHMuY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyBwb2ludHMgOiB7XG4gICAgICBwb2ludHM6IHBvaW50c1xuICAgIH0sIGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3BvaW50cycsIGRhdGEucG9pbnRzLmpvaW4oJyAnKSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIEdyb3VwaW5nIEVsZW1lbnRzXG4gICAgKiAjIyMgYGJ2Zy5ncm91cChbdHJhbnNmb3JtXSlgXG4gICAgKlxuICAgICogQ3JlYXRlIGEgZ3JvdXAgdG8gY29udGFpbiBCVkcgb2JqZWN0cy4gSXQgYWN0cyBsaWtlIGEgQlZHIGNvbnRhaW5lciB3aXRoXG4gICAgKiBhbiBvcHRpb25hbCBgdHJhbnNmb3JtYCBhdHRyaWJ1dGUuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogLy8gQ3JlYXRlIGEgbmV3IGdyb3VwIGFuZCBmaWxsIGl0IHdpdGggZGFzaGVzLlxuICAgICogdmFyIGRhc2hlcyA9IGJ2Zy5ncm91cCgpO1xuICAgICogZm9yIChpbnQgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAqICAgZGFoc2VzLnJlY3QoMTAsIDEwICsgaSAqIDMwLCA1MCwgMjApO1xuICAgICogfVxuICAgICogYGBgXG4gICAgKi9cbiAgZ3JvdXA6IGZ1bmN0aW9uICh0cmFuc2Zvcm0pIHtcbiAgICByZXR1cm4gbmV3IEJWRygnZycsIHRyYW5zZm9ybS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHRyYW5zZm9ybSA6IHtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtXG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIEh5cGVybGlua3NcbiAgICAqICMjIyBgYnZnLmh5cGVybGluayh1cmwpYFxuICAgICpcbiAgICAqIENyZWF0ZSBhIGh5cGVybGluayBCVkcgdG8gdGFyZ2V0IFVSTCBgdXJsYC4gSXQgZG9lcyBub3QgaGF2ZSBhbnkgZGlzcGxheVxuICAgICogZWxlbWVudHMuIE1ha2Ugc3VyZSB0byBhcHBlbmQgZWxlbWVudHMgdG8gaXQuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogLy8gQ2xpY2tpbmcgb24gdGhpcyBlbGVtZW50IHdpbGwgYnJpbmcgdGhlbSB0byB0aGUgR2l0aHViIHBhZ2VcbiAgICAqIHZhciBnaXRodWJMaW5rID0gYnZnLmh5cGVybGluaygnaHR0cHM6Ly9naXRodWIuY29tL3NwYXhlL0JWRy5qcycpO1xuICAgICogLy8gTWFrZSBhIGJ1dHRvbiBhbmQgYXR0YWNrIGl0IHRvIHRoZSBsaW5rXG4gICAgKiBnaXRodWJMaW5rLmVsbGlwc2UoMjAwLCAyMDAsIDUwLCA1MCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBoeXBlcmxpbms6IGZ1bmN0aW9uICh1cmwpIHtcbiAgICByZXR1cm4gbmV3IEJWRygnYScsIHVybC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHVybCA6IHtcbiAgICAgICd4bWxuczpocmVmJzogdXJsXG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIE90aGVyIEdlb21ldHJ5XG4gICAgKiAjIyMgYGJ2Zy50cmlhbmdsZShjeCwgY3ksIHIpYFxuICAgICogQ3JlYXRlIGEgcmVndWxhciB0cmlhbmdsZSBjZW50cmVkIG9uIGAoY3gsIGN5KWAgd2l0aCB2ZXJ0aWNlcyBgcmAgZGlzdGFuY2VcbiAgICAqIGF3YXkuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIHRyaWFuZ2xlID0gYnZnLnRyaWFuZ2xlKDUwLCA1MCwgMTApO1xuICAgICogYGBgXG4gICAgKi9cbiAgdHJpYW5nbGU6IGZ1bmN0aW9uICh4LCB5LCByKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3BvbHlnb24nLCB4LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geCA6IHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgcjogclxuICAgIH0sIGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICAgIHZhciBwb2ludHMgPSBbXG4gICAgICAgIFtkYXRhLngsIGRhdGEueS1kYXRhLnJdLFxuICAgICAgICBbZGF0YS54LWRhdGEuci8yKk1hdGguc3FydCgzKSwgZGF0YS55K2RhdGEuci8yXSxcbiAgICAgICAgW2RhdGEueCtkYXRhLnIvMipNYXRoLnNxcnQoMyksIGRhdGEueStkYXRhLnIvMl1cbiAgICAgIF07XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCdwb2ludHMnLCBwb2ludHMuam9pbignICcpKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMjIGBidmcuYXJjKGN4LCBjeSwgcngsIHJ5LCBzdGFydEFuZ2xlLCBlbmRBbmdsZSlgXG4gICAgKiBDcmVhdGUgYW4gYXJjIGNlbnRyZWQgb24gYChjeCwgY3kpYCB3aXRoIHJhZGl1cyBgcnhgIGFuZCBgcnlgLCBzdGFydGluZ1xuICAgICogZnJvbSBgc3RhcnRBbmdsZWAgYW50aS1jbG9ja3dpc2UgdG8gYGVuZEFuZ2xlYCwgd2hlcmUgMCBpcyB0aGUgcG9zaXRpdmVcbiAgICAqIHgtYXhpcy5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgYXJjID0gYnZnLmFyYyg1MCwgNTAsIDUwLCAxMDAsIDAsIE1hdGguUEkpO1xuICAgICogYGBgXG4gICAgKi9cbiAgYXJjOiBmdW5jdGlvbiAoeCwgeSwgcngsIHJ5LCBzdGFydEFuZ2xlLCBlbmRBbmdsZSkge1xuICAgIHJldHVybiBuZXcgQlZHKCdwYXRoJywgeC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHggOiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHJ4OiByeCxcbiAgICAgIHJ5OiByeSxcbiAgICAgIHN0YXJ0QW5nbGU6IHN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZTogZW5kQW5nbGVcbiAgICB9LCBmdW5jdGlvbiAodGFnLCBkYXRhKSB7XG4gICAgICB2YXIgcDEgPSBnZXRQb2ludE9uRWxsaXBzZShkYXRhLngsIGRhdGEueSwgZGF0YS5yeCwgZGF0YS5yeSwgZGF0YS5zdGFydEFuZ2xlKTtcbiAgICAgIHZhciBwMiA9IGdldFBvaW50T25FbGxpcHNlKGRhdGEueCwgZGF0YS55LCBkYXRhLnJ4LCBkYXRhLnJ5LCBkYXRhLmVuZEFuZ2xlKTtcbiAgICAgIHZhciBsYXJnZUFyYyA9IChkYXRhLmVuZEFuZ2xlIC0gZGF0YS5zdGFydEFuZ2xlKSA+IE1hdGguUEkgPyAxIDogMDtcbiAgICAgIHZhciBzd2VlcEFyYyA9IGRhdGEuZW5kQW5nbGUgPiBkYXRhLnN0YXJ0QW5nbGUgPyAxIDogMDtcbiAgICAgIHZhciBkID0gW1xuICAgICAgICBbJ00nLCBwMS54LCBwMS55XSxcbiAgICAgICAgWydBJywgZGF0YS5yeCwgZGF0YS5yeSwgMCwgbGFyZ2VBcmMsIHN3ZWVwQXJjLCBwMi54LCBwMi55XVxuICAgICAgXTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ2QnLCBkLm1hcChmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4geC5qb2luKCcgJyk7XG4gICAgICB9KS5qb2luKCcgJykpO1xuXG4gICAgICBmdW5jdGlvbiBnZXRQb2ludE9uRWxsaXBzZSh4LCB5LCByeCwgcnksIGFuZ2xlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogcnggKiBNYXRoLmNvcyhhbmdsZSkgKyB4LFxuICAgICAgICAgIHk6IHJ5ICogTWF0aC5zaW4oYW5nbGUpICsgeVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyMgYGJ2Zy50ZXh0KHRleHQsIHgsIHkpYFxuICAgICogQ3JlYXRlIGEgc3RyaW5nIG9mIGB0ZXh0YCB0ZXh0IGF0IGxvY2F0aW9uIGAoeCwgeSlgLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciB0ZXh0ID0gYnZnLnRleHQoJ01ycmFhIScsIDIwLCAxMCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICB0ZXh0OiBmdW5jdGlvbiAodGV4dCwgeCwgeSkge1xuICAgIHJldHVybiBuZXcgQlZHKCd0ZXh0JywgdGV4dC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHRleHQgOiB7XG4gICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgeDogeCxcbiAgICAgIHk6IHlcbiAgICB9LCBmdW5jdGlvbiAodGFnLCBkYXRhKSB7XG4gICAgICB0YWcuaW5uZXJIVE1MID0gZGF0YS50ZXh0O1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgneCcsIGRhdGEueCk7XG4gICAgICB0YWcuc2V0QXR0cmlidXRlKCd5JywgZGF0YS55KTtcbiAgICB9KS5maWxsKCdyZ2JhKDE3NSwgMTc1LCAxNzUsIDEpJylcbiAgICAgIC5zdHJva2UoJ3JnYmEoMCwgMCwgMCwgMCknKTtcbiAgfVxufTtcblxuT2JqZWN0LmtleXMoY3JlYXRpb25GdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGYpIHtcbiAgQlZHW2ZdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjcmVhdGlvbkZ1bmN0aW9uc1tmXS5hcHBseShCVkcsIGFyZ3VtZW50cyk7XG4gIH07XG4gIEJWRy5wcm90b3R5cGVbZl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJ2ZyA9IGNyZWF0aW9uRnVuY3Rpb25zW2ZdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5hcHBlbmQoYnZnKTtcbiAgICByZXR1cm4gYnZnO1xuICB9O1xufSk7XG5cbi8qKiAjIyBUaGUgQlZHIE9iamVjdFxuICAqIEJWR3MgYXJlIFNWR3Mgd2l0aCBleHRyYSBzdXBlcnBvd2Vycy5cbiAgKi9cblxuLyoqICMjIyBgYnZnLmZpbmQoc2VsZWN0b3IpYFxuICAqIFJldHVybiBhbiBhcnJheSBvZiBCVkdzIG1hdGNoaW5nIGBzZWxlY3RvcmAgaW5zaWRlIEJWRy4gYHNlbGVjdG9yYCBpc1xuICAqIGRlZmluZWQgYXMgW0NTUyBTZWxlY3RvcnNdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0d1aWRlL0NTUy9HZXR0aW5nX3N0YXJ0ZWQvU2VsZWN0b3JzKS5cbiAgKi9cbkJWRy5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5fdGFnLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICBpZiAocmVzdWx0KSB7XG4gICAgdmFyIGJ2Z3MgPSBbXTtcbiAgICBbXS5zbGljZS5jYWxsKHJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbiAocikge1xuICAgICAgYnZncy5wdXNoKHIuX2dldEJWRygpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYnZncztcbiAgfVxuICByZXR1cm4gW107XG59O1xuXG4vKiogIyMjIGBidmcuYXBwZW5kKGJ2ZylgXG4gICogSW5zZXJ0IGBjaGlsZF9idmdgIGluc2lkZSBgYnZnYC4gVGhpcyBpcyB1c2VmdWwgdG8gYWRkIGVsZW1lbnRzIGluc2lkZSBhXG4gICogYEJWRy5ncm91cCgpYC5cbiAgKi9cbkJWRy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24gKGNoaWxkX2J2Zykge1xuICB0aGlzLl90YWcuYXBwZW5kQ2hpbGQoY2hpbGRfYnZnLl90YWcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKiAjIyMgYGJ2Zy5yZW1vdmUoKWBcbiAgKiBSZW1vdmUgaXRzZWxmIGZyb20gaXRzIHBhcmVudC4gUmV0dXJuIHNlbGYgcmVmZXJlbmNlLlxuICAqL1xuQlZHLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudCgpO1xuICBpZiAocGFyZW50KSB7XG4gICAgcGFyZW50Ll90YWcucmVtb3ZlQ2hpbGQodGhpcy5fdGFnKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKiAjIyMgYGJ2Zy5wYXJlbnQoKWBcbiAgKiBSZXR1cm4gdGhlIHBhcmVudCBCVkcuIElmIHRoZXJlIGlzIG5vIHBhcmVudCAoc3VjaCBpcyB0aGUgY2FzZSBmb3IgdGhlIEJWR1xuICAqIGNvbnRhaW5lciBpdHNlbGYpLCByZXR1cm4gbnVsbC5cbiAgKi9cbkJWRy5wcm90b3R5cGUucGFyZW50ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fdGFnLnBhcmVudE5vZGUgJiYgdHlwZW9mIHRoaXMuX3RhZy5wYXJlbnROb2RlLl9nZXRCVkcgPT09ICdmdW5jdGlvbicpXG4gICByZXR1cm4gdGhpcy5fdGFnLnBhcmVudE5vZGUuX2dldEJWRygpO1xuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKiAjIyMgYGJ2Zy5jaGlsZHJlbigpYFxuICAqIFJldHVybiBhIGxpc3Qgb2YgQlZHIGVsZW1lbnRzIGluc2lkZSBgYnZnYC5cbiAgKi9cbkJWRy5wcm90b3R5cGUuY2hpbGRyZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl90YWcuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKylcbiAgICBpZiAodHlwZW9mIHRoaXMuX3RhZy5jaGlsZE5vZGVzW2ldLl9nZXRCVkcgPT09ICdmdW5jdGlvbicpXG4gICAgICBvdXRwdXQucHVzaCh0aGlzLl90YWcuY2hpbGROb2Rlc1tpXS5fZ2V0QlZHKCkpO1xuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqICMjIyBgYnZnLnRhZygpYFxuICAqIFJldHVybiB0aHcgQlZHIGdyYXBoaWNhbCBjb250ZW50LCBhIFNWRy5cbiAgKi9cbkJWRy5wcm90b3R5cGUudGFnID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5fdGFnO1xufTtcblxuIC8qKiAjIyMgYGJ2Zy5kYXRhKClgXG4gICogR2V0L3NldCB0aGUgYGRhdGFgIG9iamVjdCBpbiBhIEJWRy4gVGhlcmUgYXJlIGZvdXIgd2F5cyB0byB1c2UgdGhpc1xuICAqIGZ1bmN0aW9uLlxuICAqXG4gICogIC0gYGJ2Zy5kYXRhKClgOiBSZXR1cm4gYGRhdGFgIGJvdW5kIHRvIHRoZSBCVkcuXG4gICogIC0gYGJ2Zy5kYXRhKG5ld0RhdGEpYDogVXBkYXRlIGBkYXRhYCB3aXRoIGBuZXdEYXRhYCBvYmplY3QuXG4gICogIC0gYGJ2Zy5kYXRhKHByb3BlcnR5KWA6IFJldHVybiBgZGF0YVtwcm9wZXJ0eV1gIGZyb20gdGhlIEJWRy5cbiAgKiAgLSBgYnZnLmRhdGEocHJvcGVydHksIG5ld1ZhbHVlKWA6IFVwZGF0ZSBgcHJvcGVydHlgIHdpdGggYG5ld1ZhbHVlYC5cbiAgKlxuICAqIFJldHVybiBgYnZnYCBvYmplY3QgcmVmZXJlbmNlLlxuICAqL1xuQlZHLnByb3RvdHlwZS5kYXRhID0gZnVuY3Rpb24gKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoYXJndW1lbnRzWzBdLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrIGluIGFyZ3VtZW50c1swXSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzWzBdLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgdGhpcy5kYXRhKGssIGFyZ3VtZW50c1swXVtrXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGF0YVthcmd1bWVudHNbMF1dO1xuICAgIH1cbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgdGhpcy5fZGF0YVthcmd1bWVudHNbMF1dID0gYXJndW1lbnRzWzFdO1xuICAgIHJldHVybiB0aGlzO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKHRoaXMsICdkYXRhKCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDIgYXJndW1lbnRzLicpO1xuICB9XG59O1xuXG4vKiogIyMjIGBidmcuYXR0cigpYFxuICAqIEdldC9zZXQgYXR0cmlidXRlcyBvbiBhIEJWRy5cbiAgKlxuICAqICAtIGBidmcuYXR0cihhdHRyKWA6IFJldHVybiBhdHRyaWJ1dGUgdmFsdWUuXG4gICogIC0gYGJ2Zy5hdHRyKGF0dHIsIHZhbHVlKWA6IFVwZGF0ZSBgYXR0cmAgd2l0aCBgdmFsdWVgLlxuICAqL1xuQlZHLnByb3RvdHlwZS5hdHRyID0gZnVuY3Rpb24gKGF0dHIsIHZhbHVlKSB7XG4gIGlmICghYXR0cikgdGhyb3cgbmV3IEVycm9yKCdhdHRyIG11c3QgYmUgZGVmaW5lZCcpO1xuICBpZiAoIXZhbHVlKSByZXR1cm4gdGhpcy5fdGFnLmdldEF0dHJpYnV0ZShhdHRyKTtcbiAgZWxzZSB0aGlzLl90YWcuc2V0QXR0cmlidXRlKGF0dHIsIHZhbHVlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMjIGBidmcuZmlsbCgpYFxuICAqIEdldC9zZXQgdGhlIGZpbGxpbmcgY29sb3VyLlxuICAqXG4gICogIC0gYGJ2Zy5maWxsKClgOiBSZXR1cm4gYGZpbGxgIGNvbG91ciBhcyBbciwgZywgYiwgYV0sIG9yIGAnJ2AgKGVtcHR5XG4gICogICAgICAgICAgICAgICAgICBzdHJpZykgaWYgZmlsbCBpcyBub3Qgc3BlY2lmaWVkIG9uIHRoZSBvYmplY3QuXG4gICogIC0gYGJ2Zy5maWxsKHJnYilgOiBTZXQgYGZpbGxgIHdpdGggYSBncmV5c2NhbGUgY29sb3VyIHdpdGggZXF1YWxcbiAgKiAgICB2YWx1ZXMgYChyZ2IsIHJnYiwgcmdiKWAuXG4gICogIC0gYGJ2Zy5maWxsKHIsIGcsIGIsIFthXSlgOiBTZXQgYGZpbGxgIHdpdGggYChyLCBnLCBiLCBhKWAuIElmIGBhYFxuICAqICAgIGlzIG9taXR0ZWQsIGl0IGRlZmF1bHRzIHRvIGAxYC5cbiAgKlxuICAqIGByYCwgYGdgLCBgYmAgc2hvdWxkIGJlIGluIHRoZSByYW5nZSBvZiAwLTI1NSBpbmNsdXNpdmUuXG4gICovXG5CVkcucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgdmFyIGYgPSB0aGlzLmF0dHIoJ2ZpbGwnKTtcbiAgICBpZiAoZikgcmV0dXJuIEJWRy5leHRyYWN0TnVtYmVyQXJyYXkoZik7XG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ3N0cmluZycpIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCBhcmd1bWVudHNbMF0pO1xuICAgIGVsc2UgcmV0dXJuIHRoaXMuYXR0cignZmlsbCcsIEJWRy5yZ2JhKGFyZ3VtZW50c1swXSkpO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xuICAgIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCBCVkcucmdiYS5hcHBseShCVkcsIGFyZ3VtZW50cykpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKHRoaXMsICdmaWxsKCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDEgYXJndW1lbnQuJyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYGJ2Zy5ub0ZpbGwoKWBcbiAgKiBSZW1vdmUgQlZHIG9iamVjdCdzIGNvbG91ciBmaWxsaW5nIGNvbXBsZXRlbHkuXG4gICovXG5CVkcucHJvdG90eXBlLm5vRmlsbCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZmlsbCgncmdiYSgwLCAwLCAwLCAwKScpOyB9O1xuXG4vKiogIyMjIGBidmcuc3Ryb2tlKClgXG4gICogR2V0L3NldCB0aGUgb3V0bGluZSBjb2xvdXIuXG4gICpcbiAgKiAgLSBgYnZnLnN0cm9rZSgpYDogUmV0dXJuIGBzdHJva2VgIGNvbG91ciBhcyBbciwgZywgYiwgYV0uIElmIGBzdHJva2VgIGlzXG4gICogICAgbm90IHNwZWNpZmllZCwgcmV0dXJuIGAnJ2AgKGVtcHR5IHN0cmluZykuXG4gICogIC0gYGJ2Zy5zdHJva2UocmdiKWA6IFNldCBgc3Ryb2tlYCB3aXRoIGEgZ3JleXNjYWxlIGNvbG91ciB3aXRoIGVxdWFsXG4gICogICAgdmFsdWVzIGAocmdiLCByZ2IsIHJnYilgLlxuICAqICAtIGBidmcuc3Ryb2tlKHIsIGcsIGIsIFthXSlgOiBTZXQgYHN0cm9rZWAgd2l0aCBgKHIsIGcsIGIsIGEpYC4gSWYgYGFgXG4gICogICAgaXMgb21pdHRlZCwgaXQgZGVmYXVsdHMgdG8gYDFgLlxuICAqXG4gICogYHJgLCBgZ2AsIGBiYCBzaG91bGQgYmUgaW4gdGhlIHJhbmdlIG9mIDAtMjU1IGluY2x1c2l2ZS5cbiAgKi9cbkJWRy5wcm90b3R5cGUuc3Ryb2tlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHZhciBzID0gdGhpcy5hdHRyKCdzdHJva2UnKTtcbiAgICBpZiAocykgcmV0dXJuIEJWRy5leHRyYWN0TnVtYmVyQXJyYXkocyk7XG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ3N0cmluZycpIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZScsIGFyZ3VtZW50c1swXSk7XG4gICAgZWxzZSByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UnLCBCVkcucmdiYShhcmd1bWVudHNbMF0pKTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UnLCBCVkcucmdiYS5hcHBseShCVkcsIGFyZ3VtZW50cykpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKHRoaXMsICdzdHJva2UoKSByZWNlaXZlZCBtb3JlIHRoYW4gMSBhcmd1bWVudC4nKTtcbiAgfVxufTtcblxuLyoqICMjIyBgYnZnLnN0cm9rZVdpZHRoKFt3aWR0aF0pYFxuICAqIEdldC9zZXQgdGhlIG91dGxpbmUgdGhpY2tuZXNzLlxuICAqXG4gICogUmV0dXJucyB0aGUgY3VycmVudCBvdXRsaW5lIHRoaWNrbmVzcyBpZiBgd2lkdGhgIGlzIG9taXR0ZWQuIE90aGVyaXNlLFxuICAqIGl0IGFzc2lnbnMgdGhlIG91dGxpbmUgdGhpY2tuZXNzIHdpdGggYSBuZXcgdmFsdWUsIGFuZCByZXR1cm5zIHRoZSBgYnZnYFxuICAqIG9iamVjdCByZWZlcmVuY2UuXG4gICpcbiAgKiAgLSBgd2lkdGhgICA6IE91dGxpbmUgdGhpY2tuZXNzIGluIHBpeGVscy5cbiAgKi9cbkJWRy5wcm90b3R5cGUuc3Ryb2tlV2lkdGggPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlLXdpZHRoJyk7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHRoaXMuYXR0cignc3Ryb2tlLXdpZHRoJywgYXJndW1lbnRzWzBdKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcih0aGlzLCAnc3Ryb2tlV2lkdGgoKSByZWNlaXZlZCBtb3JlIHRoYW4gMSBhcmd1bWVudC4nKTtcbiAgfVxufTtcblxuLyoqICMjIyBgYnZnLm5vU3Ryb2tlKClgXG4gICogUmVtb3ZlIEJWRyBvYmplY3QncyBvdXRsaW5lIGNvbXBsZXRlbHkuXG4gICovXG5CVkcucHJvdG90eXBlLm5vU3Ryb2tlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5zdHJva2VXaWR0aCgwKS5zdHJva2UoJ3JnYmEoMCwgMCwgMCwgMCknKTtcbn07XG5cbkJWRy5wcm90b3R5cGUuY29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5fdGFnLmlubmVySFRNTDtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdGhpcy5fdGFnLmlubmVySFRNTCA9IGFyZ3VtZW50c1swXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcih0aGlzLCAnY29udGVudCgpIHJlY2VpdmVkIG1vcmUgdGhhbiAxIGFyZ3VtZW50LicpO1xuICB9XG59O1xuXG4vKiogIyMjIGBidmcuYWRkQ2xhc3MoYylgXG4qIEFkZCBhIGNsYXNzIG5hbWUgdG8gdGhlIGVsZW1lbnQuXG4qL1xuQlZHLnByb3RvdHlwZS5hZGRDbGFzcyA9IGZ1bmN0aW9uIChjKSB7XG4gIHRoaXMuX3RhZy5jbGFzc0xpc3QuYWRkKGMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKiAjIyMgYGJ2Zy5yZW1vdmVDbGFzcyhjKWBcbiAgKiBSZW1vdmUgYSBjbGFzcyBuYW1lIHRvIHRoZSBlbGVtZW50LlxuICAqL1xuQlZHLnByb3RvdHlwZS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChjKSB7XG4gIHRoaXMuX3RhZy5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKiAjIyMgYGJ2Zy5oYXNDbGFzcyhjKWBcbiAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZWxlbWVudCBoYXMgY2xhc3MgYGNgLlxuICAqL1xuQlZHLnByb3RvdHlwZS5oYXNDbGFzcyA9IGZ1bmN0aW9uIChjKSB7XG4gIHJldHVybiB0aGlzLl90YWcuY2xhc3NMaXN0LmNvbnRhaW5zKGMpO1xufTtcblxuLyoqICMjIyBgYnZnLnJlbW92ZUNsYXNzKGMpYFxuICAqIEFkZCBvciByZW1vdmUgdGhlIGNsYXNzIGBjYCB0byB0aGUgZWxlbWVudC5cbiAgKi9cbkJWRy5wcm90b3R5cGUudG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbiAoYykge1xuICB0aGlzLl90YWcuY2xhc3NMaXN0LnRvZ2dsZShjKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMgQWZmaW5lIFRyYW5zZm9ybWF0aW9ucyAqL1xuQlZHLnByb3RvdHlwZS50cmFuc2Zvcm0gPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RhZy5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpIHx8ICcnO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB0aGlzLl90YWcuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCBhcmd1bWVudHNbMF0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcigndHJhbnNmb3JtKCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDEgYXJndW1lbnQnKTtcbiAgfVxufTtcblxuLyoqICMjIyBgQlZHLnRyYW5zbGF0ZSh4LCBbeV0pYFxuICAqIEFwcGx5IGEgbW92aW5nIHRyYW5zbGF0aW9uIGJ5IGB4YCBhbmQgYHlgIHVuaXRzLiBJZiBgeWAgaXMgbm90IGdpdmVuLCBpdFxuICAqIGlzIGFzc3VtZWQgdG8gYmUgMC5cbiAgKi9cbkJWRy5wcm90b3R5cGUudHJhbnNsYXRlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgaWYgKHR5cGVvZiB4ICE9PSAnbnVtYmVyJyAmJiB0eXBlb2YgeSAhPT0gJ251bWJlcicpXG4gICAgdGhyb3cgbmV3IEVycm9yKCd0cmFuc2xhdGUoKSBvbmx5IHRha2UgbnVtYmVycyBhcyBhcmd1bWVudHMnKTtcbiAgeSA9IHkgfHwgMDtcbiAgdmFyIHRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3JtKCk7XG4gIHRoaXMuX3RhZy5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsIFt0cmFuc2Zvcm0sICcgdHJhbnNsYXRlKCcsIHgsICcgJywgeSwgJyknXS5qb2luKCcnKS50cmltKCkpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKiAjIyBVdGlsaXR5IE1ldGhvZHMgKi9cblxuLyoqICMjIyBgQlZHLnJnYmEociwgZywgYiwgW2FdKWBcbiAgKiBSZXR1cm4gYSBzdHJpbmcgaW4gdGhlIGZvcm0gb2YgYHJnYmEociwgZywgYiwgYSlgLlxuICAqXG4gICogSWYgb25seSBgcmAgaXMgZ2l2ZW4sIHRoZSB2YWx1ZSBpcyBjb3BpZWQgdG8gYGdgIGFuZCBgYmAgdG8gcHJvZHVjZSBhXG4gICogZ3JleXNjYWxlIHZhbHVlLlxuICAqL1xuQlZHLnJnYmEgPSBmdW5jdGlvbiAociwgZywgYiwgYT0xLjApIHtcbiAgaWYgKHR5cGVvZiByICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IFR5cGVFcnJvciAoJ3JnYmEoKSBtdXN0IHRha2UgbnVtZXJpY2FsIHZhbHVlcyBhcyBpbnB1dCcpO1xuICBnID0gZyB8fCByO1xuICBiID0gYiB8fCByO1xuICByZXR1cm4gJ3JnYmEoJyArIFtyLCBnLCBiLCBhXS5qb2luKCcsJykgKyAnKSc7XG59O1xuXG4vKiogIyMjIGBCVkcuaHNsYShodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcywgW2FscGhhXSlgXG4gICogUmV0dXJuIHRoZSBDU1MgcmVwcmVzZW50YXRpb24gaW4gYGhzbGEoKWAgYXMgYSBzdHJpbmcuXG4gICpcbiAgKiAgLSBgaHVlYDogQSB2YWx1ZSBiZXR3ZWVuIGAwYCBhbmQgYDM2MGAsIHdoZXJlIGAwYCBpcyByZWQsIGAxMjBgIGlzIGdyZWVuLFxuICAqICAgICAgICAgICBhbmQgYDI0MGAgaXMgYmx1ZS5cbiAgKiAgLSBgc2F0dXJhdGlvbmAgOiBBIHZhbHVlIGJldHdlZW4gYDBgIGFuZCBgMTAwYCwgd2hlcmUgYDBgIGlzIGdyZXkgYW5kXG4gICogICAgICAgICAgICAgICAgIGAxMDBgIGlzIGZ1bGx5IHNhdHVyYXRlLlxuICAqICAtIGBsaWdodG5lc3NgOiBBIHZhbHVlIGJldHdlZW4gYDBgIGFuZCBgMTAwYCwgd2hlcmUgYDBgIGlzIGJsYWNrIGFuZFxuICAqICAgICAgICAgICAgICAgICBgMTAwYCBpcyBmdWxsIGludGVuc2l0eSBvZiB0aGUgY29sb3VyLlxuICAqL1xuQlZHLmhzbGEgPSBmdW5jdGlvbiAoaHVlLCBzYXR1cmF0aW9uLCBsaWdodG5lc3MsIGFscGhhKSB7XG4gIGFscGhhID0gYWxwaGEgfHwgMS4wO1xuICByZXR1cm4gJ2hzbGEoJyArIFtodWUsIHNhdHVyYXRpb24gKyAnJScsIGxpZ2h0bmVzcyArICclJywgYWxwaGFdLmpvaW4oJywnKSArICcpJztcbn07XG5cbi8qKiAjIyMgYEJWRy5leHRyYWN0TnVtYmVyQXJyYXkoc3RyKWBcbiAgKiBSZXR1cm4gYW4gYXJyYXkgYFt4LCB5LCB6LCAuLi5dYCBmcm9tIGEgc3RyaW5nIGNvbnRhaW5pbmcgY29tbW9uLXNlcGFyYXRlZFxuICAqIG51bWJlcnMuXG4gICovXG5CVkcuZXh0cmFjdE51bWJlckFycmF5ID0gZnVuY3Rpb24gKHN0cikge1xuICByZXR1cm4gc3RyLm1hdGNoKC9cXGQqXFwuP1xcZCsvZykubWFwKE51bWJlcik7XG59O1xuXG5cbi8qKiAjIyBDb250cmlidXRlIHRvIHRoaXMgbGlicmFyeVxuKiBbTWFrZSBhIHB1bGwgcmVxdWVzdF0oaHR0cHM6Ly9naXRodWIuY29tL1NwYXhlL0JWRy5qcy9wdWxscykgb3JcbiogW3Bvc3QgYW4gaXNzdWVdKGh0dHBzOi8vZ2l0aHViLmNvbS9TcGF4ZS9CVkcuanMvaXNzdWVzKS4gU2F5IGhlbGxvIHRvXG4qIGNvbnRhY3RAeGFpdmVyaG8uY29tLlxuKi8iLCJpbXBvcnQgeyBCVkcsIEJWR0NhbnZhcyB9IGZyb20gJy4vYnZnJztcblxudmFyIGJ2ZyA9IEJWR0NhbnZhcygnI3VuaXZlcnNlJyk7XG5cbnZhciBzaXplID0gMTI4O1xudmFyIHBvcyA9IDQwMDtcblxudmFyIGFsYmVkbyA9IGJ2Zy5lbGxpcHNlKHBvcywgcG9zLCBzaXplLCBzaXplKVxuICAgICAgICAgICAgICAgICAuZmlsbCg2NCk7XG5cbnZhciBkaWZmdXNlID0gYnZnLmVsbGlwc2UocG9zLCBwb3MsIHNpemUsIHNpemUpXG4gICAgICAgICAgICAgICAgIC5maWxsKDI1NSwgMjU1LCAyNTUsIDAuNClcbiAgICAgICAgICAgICAgICAgLm5vU3Ryb2tlKCk7XG5cbnZhciBzcGVjdWxhciA9IGJ2Zy5lbGxpcHNlKHBvcywgcG9zLCBzaXplLzgsIHNpemUvOClcbiAgICAgICAgICAgICAgICAgIC5maWxsKDI1NSwgMjU1LCAyNTUsIDAuNSlcbiAgICAgICAgICAgICAgICAgIC5ub1N0cm9rZSgpO1xuXG52YXIgb3V0bGluZSA9IGJ2Zy5lbGxpcHNlKHBvcywgcG9zLCBzaXplLCBzaXplKVxuICAgICAgICAgICAgICAgICAuZmlsbCgwLCAwLCAwLCAwKVxuICAgICAgICAgICAgICAgICAuc3Ryb2tlKDMyKVxuICAgICAgICAgICAgICAgICAuc3Ryb2tlV2lkdGgoOCk7XG5cbmJ2Zy50YWcoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgdmFyIG14ID0gZXZlbnQuY2xpZW50WDtcbiAgdmFyIG15ID0gZXZlbnQuY2xpZW50WTtcbiAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuMihteS1wb3MsIG14LXBvcyk7XG4gIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhteCAtIHBvcywgMikgKyBNYXRoLnBvdyhteSAtIHBvcywgMikpO1xuICBkaXN0YW5jZSA9IE1hdGgubWluKGRpc3RhbmNlLCBzaXplLzIpO1xuICBpZiAoIWlzTmFOKGFuZ2xlKSkge1xuICAgIGRpZmZ1c2UuZGF0YSh7XG4gICAgICB4OiBNYXRoLmNvcyhhbmdsZSkgKiBkaXN0YW5jZSArIHBvcyxcbiAgICAgIHk6IE1hdGguc2luKGFuZ2xlKSAqIGRpc3RhbmNlICsgcG9zLFxuICAgICAgcng6IE1hdGgubWF4KGRpc3RhbmNlLCBzaXplKSxcbiAgICAgIHJ5OiBNYXRoLm1heChkaXN0YW5jZSwgc2l6ZSlcbiAgICB9KTtcbiAgICB2YXIgY3ggPSBNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLm1pbihNYXRoLnBvdyhkaXN0YW5jZSwgMS4xKSwgc2l6ZS8zKjIpICsgcG9zO1xuICAgIHZhciBjeSA9IE1hdGguc2luKGFuZ2xlKSAqIE1hdGgubWluKE1hdGgucG93KGRpc3RhbmNlLCAxLjEpLCBzaXplLzMqMikgKyBwb3M7XG4gICAgc3BlY3VsYXIuZGF0YSh7XG4gICAgICB4OiBjeCxcbiAgICAgIHk6IGN5LFxuICAgICAgcng6IHNpemUvOCAqIChzaXplLWRpc3RhbmNlKS9zaXplXG4gICAgfSkudHJhbnNmb3JtKCdyb3RhdGUoJyArIFthbmdsZSAvIE1hdGguUEkgKiAxODAsIGN4LCBjeV0uam9pbigpICsgJyknKTtcbiAgfVxufSk7XG5cbi8vIFJlbW92ZSBsb2FkaW5nIHBsYWNlaG9sZGVyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZycpLnJlbW92ZSgpOyJdfQ==
