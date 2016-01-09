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
function observe (obj, callback) {

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
export var BVG = function (tag, data, binding) {
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
export var BVGCanvas = function (htmlElement, xDimension, yDimension) {
  if (typeof htmlElement === 'string')
    htmlElement = document.querySelector(htmlElement);
  if (!(htmlElement instanceof HTMLElement))
    throw new TypeError('htmlElement (' + htmlElement + ') was not found.');

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
  ellipse: function (x, y, rx, ry) {
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
  polygon: function (points) {
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
    }, function (tag, data) {
      var points = [
        [data.x, data.y-data.r],
        [data.x-data.r/2*Math.sqrt(3), data.y+data.r/2],
        [data.x+data.r/2*Math.sqrt(3), data.y+data.r/2]
      ];
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
  arc: function (x, y, rx, ry, startAngle, endAngle) {
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
      var largeArc = (data.endAngle - data.startAngle) > Math.PI ? 1 : 0;
      var sweepArc = data.endAngle > data.startAngle ? 1 : 0;
      var d = [
        ['M', p1.x, p1.y],
        ['A', data.rx, data.ry, 0, largeArc, sweepArc, p2.x, p2.y]
      ];
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
  text: function (text, x, y) {
    return new BVG('text', text.constructor.name === 'Object' ? text : {
      text: text,
      x: x,
      y: y
    }, function (tag, data) {
      tag.innerHTML = data.text;
      tag.setAttribute('x', data.x);
      tag.setAttribute('y', data.y);
    }).fill('rgba(175, 175, 175, 1)')
      .stroke('rgba(0, 0, 0, 0)');
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
  if (this._tag.parentNode && typeof this._tag.parentNode._getBVG === 'function')
   return this._tag.parentNode._getBVG();
  return null;
};

/** ### `bvg.children()`
  * Return a list of BVG elements inside `bvg`.
  */
BVG.prototype.children = function () {
  var output = [];
  for (var i = 0; i < this._tag.childNodes.length; i++)
    if (typeof this._tag.childNodes[i]._getBVG === 'function')
      output.push(this._tag.childNodes[i]._getBVG());
  return output;
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
  if (!value) return this._tag.getAttribute(attr);
  else this._tag.setAttribute(attr, value);
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
    if (typeof arguments[0] === 'string') return this.attr('fill', arguments[0]);
    else return this.attr('fill', BVG.rgba(arguments[0]));
  } else if (arguments.length === 3 || arguments.length === 4) {
    return this.attr('fill', BVG.rgba.apply(BVG, arguments));
  } else {
    throw new RangeError(this, 'fill() received more than 1 argument.');
  }
};

/** ### `bvg.noFill()`
  * Remove BVG object's colour filling completely.
  */
BVG.prototype.noFill = function () { return this.fill('rgba(0, 0, 0, 0)'); };

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
    if (typeof arguments[0] === 'string') return this.attr('stroke', arguments[0]);
    else return this.attr('stroke', BVG.rgba(arguments[0]));
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
  if (typeof x !== 'number' && typeof y !== 'number')
    throw new Error('translate() only take numbers as arguments');
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
BVG.rgba = function (r, g, b, a=1.0) {
  if (typeof r !== 'number') throw new TypeError ('rgba() must take numerical values as input');
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