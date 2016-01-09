(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.BVG = f();
  }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (require, module, exports) {
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
      var create = exports.create = BVG.create = function (htmlElement, xDimension, yDimension) {
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
    }, {}] }, {}, [1])(1);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidmcuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQUEsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLE1BQUcsUUFBTyxPQUFPLHlDQUFQLE9BQU8sT0FBRyxRQUFRLElBQUUsT0FBTyxNQUFNLEtBQUcsV0FBVyxFQUFDO0FBQUMsVUFBTSxDQUFDLE9BQU8sR0FBQyxDQUFDLEVBQUUsQ0FBQTtHQUFDLE1BQUssSUFBRyxPQUFPLE1BQU0sS0FBRyxVQUFVLElBQUUsTUFBTSxDQUFDLEdBQUcsRUFBQztBQUFDLFVBQU0sQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxNQUFJO0FBQUMsUUFBSSxDQUFDLENBQUMsSUFBRyxPQUFPLE1BQU0sS0FBRyxXQUFXLEVBQUM7QUFBQyxPQUFDLEdBQUMsTUFBTSxDQUFBO0tBQUMsTUFBSyxJQUFHLE9BQU8sTUFBTSxLQUFHLFdBQVcsRUFBQztBQUFDLE9BQUMsR0FBQyxNQUFNLENBQUE7S0FBQyxNQUFLLElBQUcsT0FBTyxJQUFJLEtBQUcsV0FBVyxFQUFDO0FBQUMsT0FBQyxHQUFDLElBQUksQ0FBQTtLQUFDLE1BQUk7QUFBQyxPQUFDLEdBQUMsSUFBSSxDQUFBO0tBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQTtHQUFDO0NBQUMsQ0FBQSxDQUFFLFlBQVU7QUFBQyxNQUFJLE1BQU0sRUFBQyxNQUFNLEVBQUMsT0FBTyxDQUFDLE9BQU8sQUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLGFBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsWUFBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLGNBQUksQ0FBQyxHQUFDLE9BQU8sT0FBTyxJQUFFLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRyxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxLQUFLLENBQUMsc0JBQXNCLEdBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBQyxrQkFBa0IsRUFBQyxDQUFDLENBQUE7U0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBQyxPQUFPLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsY0FBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7U0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO09BQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO0tBQUMsSUFBSSxDQUFDLEdBQUMsT0FBTyxPQUFPLElBQUUsVUFBVSxJQUFFLE9BQU8sQ0FBQyxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUU7QUFBQyxPQUFDLENBQUMsQ0FBQyxDQUFD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QUMsQ0FBQyxJQUFJLElBQUksR0FBQyxRQUFRLENBQUEsQUFBQyxHQUFDLElBQUk7S0FDbEMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0dBQ3hFO0NBQ0YsQ0FBQzs7O0FBQUMsQUFHSCxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZil9ZWxzZXt2YXIgZztpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7Zz13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7Zz1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe2c9c2VsZn1lbHNle2c9dGhpc31nLkJWRyA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8vXG4vKiogIyBCVkcgLSBCaW5kYWJsZSBWZWN0b3IgR3JhcGhpY3NcbiAgKiAqKlJlYWwtdGltZSBkYXRhLWRyaXZlbiB2aXN1YWxpc2F0aW9uIGZvciB0aGUgd2ViLioqXG4gICpcbiAgKiAhW0V4YW1wbGVdKGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9TcGF4ZS9CVkcuanMvbWFzdGVyL2RlbW8vaW5kZXguZ2lmKVxuICAqXG4gICogTGl2ZSBleGFtcGxlOiBodHRwOi8vc3BheGUuZ2l0aHViLmlvL0JWRy5qcy9cbiAgKlxuICAqICpCaW5kYWJsZSBWZWN0b3IgR3JhcGhpY3MqIHdhcyBib3JuIG91dCBvZiBmcnVzdHJhdGlvbiBmb3IgbGFjayBvZiBhXG4gICogbWlkZGxlIGxldmVsIFNWRyBsaWJyYXJ5LiBbRDMuanNdKGh0dHA6Ly9kM2pzLm9yZy8pIGFic3RyYWN0cyB0b28gbXVjaFxuICAqIGxvZ2ljLCBhbmQgW1NWRy5qc10oaHR0cDovL3N2Z2pzLmNvbS8pIHByb3ZpZGVzIG9ubHkgbG93LWxldmVsIFNWRyBkcmF3aW5nLlxuICAqIEJpbmRhYmxlIFZlY3RvciBHcmFwaGljcyBvZmZlcnMgU1ZHIGVsZW1lbnRzIHRoYXQgY2hhbmdlIGFzIHRoZSBkYXRhIGNoYW5nZSxcbiAgKiBhbmQgZ2l2ZXMgeW91IHRvb2xzIHRvIGNvbnRyb2wgdGhlaXIgbG9vay5cbiAgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqIFRoZSBoZWFydCBvZiB0aGlzIGxpYnJhcnkgaXMgYSB0cmluaXR5OiAqKlNWRyArIERhdGEgKyBCaW5kaW5nKiouIFRoaXNcbiAgKiBjb25uZWN0cyB5b3VyIGRhdGEgdG8gdGhlIFNWRyBlbGVtZW50IHRocm91Z2ggdGhlIGJpbmRpbmcgZnVuY3Rpb24sIHdoaWNoXG4gICogY3JlYXRlcyBhIGxpdmluZyBjb25uZWN0aW9uIHRoYXQgY2FuIHJlYWN0IHRvIGNoYW5nZS4gQlZHIHVzZXNcbiAgKiBbYE9iamVjdC5vYnNlcnZlKClgXShodHRwOi8vY2FuaXVzZS5jb20vI2ZlYXQ9b2JqZWN0LW9ic2VydmUpIHdoaWNoIGlzXG4gICogYXZhaWxhYmxlIG9uIENocm9tZSAzNissIE9wZXJhIDI3KyBhbmQgQW5kcm9pZCBCcm93c2VyIDM3Ky5cbiAgKlxuICAqIElmIHlvdSB3aXNoIHRvIHVzZSB0aGlzIGZvciBvbGRlciBicm93c2VycywgeW91IGNhbiBwb2x5ZmlsbCB3aXRoXG4gICogW2BNYXhBcnQyNTAxL09iamVjdC5vYnNlcnZlYF0oaHR0cHM6Ly9naXRodWIuY29tL01heEFydDI1MDEvb2JqZWN0LW9ic2VydmUpLlxuICAqXG4gICogIyMgSW5zdGFsbGF0aW9uXG4gICpcbiAgKiAqKkluc3RhbGwgdXNpbmcgYG5wbWAqKjpcbiAgKlxuICAqICAxLiBJbnN0YWxsIE5vZGUuanM6IGh0dHBzOi8vZG9jcy5ucG1qcy5jb20vZ2V0dGluZy1zdGFydGVkL2luc3RhbGxpbmctbm9kZVxuICAqICAyLiBJbiB5b3VyIHdvcmtpbmcgZGlyZWN0b3J5OlxuICAqXG4gICogICAgIGBgYFxuICAqICAgICBucG0gaW5zdGFsbCBidmdcbiAgKiAgICAgYGBgXG4gICpcbiAgKiAqKkluc3RhbGwgdmlhIEdpdEh1YioqOlxuICAqXG4gICogIDEuIENsb25lIHRoaXMgcmVwbzpcbiAgKlxuICAqICAgICBgYGBcbiAgKiAgICAgZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9TcGF4ZS9CVkcuanMuZ2l0XG4gICogICAgIGBgYFxuICAqXG4gICogIDIuIENvcHkgYHJlcXVpcmUuanNgIGFuZCBgYnZnLmpzYCBpbnRvIHlvdXIgd29ya2luZyBkaXJlY3RvcnkuXG4gICpcbiAgKiAqKlRvIGluY2x1ZGUgYEJWRy5qc2AgaW4geW91ciB3ZWJwYWdlKio6XG4gICpcbiAgKiAgMS4gSW4geW91ciBIVE1MIGA8aGVhZD5gLCBpbmNsdWRlIHRoaXMgc2NyaXB0IHVzaW5nIGByZXF1aXJlLmpzYDpcbiAgKlxuICAqICAgICBgYGBIVE1MXG4gICogICAgIDxzY3JpcHQgc3JjPVwicGF0aC90by9yZXF1aXJlLmpzXCIgZGF0YS1tYWluPVwieW91ci1zY3JpcHQuanNcIj48L3NjcmlwdD5cbiAgKiAgICAgYGBgXG4gICpcbiAgKiAgMi4gSW4gYHlvdXItc2NyaXB0LmpzYCwgZGVmaW5lIHlvdXIgb3duIGNvZGUgd2l0aFxuICAqXG4gICogICAgIGBgYEphdmFzY3JpcHRcbiAgKiAgICAgcmVxdWlyZShbJ3BhdGgvdG8vYnZnLmpzJ10sIGZ1bmN0aW9uIChCVkcpIHtcbiAgKiAgICAgICAvLyB5b3VyIGNvZGUgZ29lcyBoZXJlIC4uLlxuICAqICAgICB9KTtcbiAgKiAgICAgYGBgXG4gICpcbiAgKiAjIyBRdWlja3N0YXJ0XG4gICpcbiAgKiAhW1F1aWNrc3RhcnQgRXhhbXBsZV0oaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1NwYXhlL0JWRy5qcy9tYXN0ZXIvZGVtby8wMDEtaGVsbG8uZ2lmKVxuICAqXG4gICogSFRNTDpcbiAgKlxuICAqIGBgYEhUTUxcbiAgKiA8ZGl2IGlkPVwiYnZnLWNvbnRhaW5lclwiPjwvZGl2PlxuICAqIGBgYFxuICAqXG4gICogQ1NTIChNYWtlIHRoZSBjb250YWluZXIgbGFyZ2UgZW5vdWdoKTpcbiAgKlxuICAqIGBgYENTU1xuICAqIGh0bWwsIGJvZHksICNidmctY29udGFpbmVyIHtcbiAgKiAgIGhlaWdodDogMTAwJTtcbiAgKiAgIG1hcmdpbjogMDtcbiAgKiB9XG4gICogYGBgXG4gICpcbiAgKiBKYXZhc2NyaXB0OlxuICAqXG4gICogYGBgSmF2YXNjcmlwdFxuICAqIC8vIENyZWF0ZSBhIEJWRyBjb250YWluZXIgYmFzZWQgb24gc2VsZWN0ZWQgSFRNTCBlbGVtZW50XG4gICogdmFyIGJ2ZyA9IEJWRy5jcmVhdGUoJyNidmctY29udGFpbmVyJyk7XG4gICogLy8gQ3JlYXRlIGEgQmluZGFibGUgY2lyY2xlLCBjb2xvdXIgaXQgb3JhbmdlXG4gICogdmFyIGNpcmNsZSA9IGJ2Zy5lbGxpcHNlKDAsIDAsIDE1MCwgMTUwKVxuICAqICAgICAgICAgICAgICAgICAuZmlsbCgyMjAsIDY0LCAxMik7XG4gICogLy8gQ2hhbmdlIGl0cyBzaXplIGJhc2VkIG9uIG1vdXNlIG1vdmVtZW50XG4gICogYnZnLnRhZygpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAqICAgY2lyY2xlLmRhdGEoe1xuICAqICAgICByeDogZXZlbnQuY2xpZW50WCxcbiAgKiAgICAgcnk6IGV2ZW50LmNsaWVudFlcbiAgKiAgIH0pO1xuICAqIH0pO1xuICAqIGBgYFxuICAqL1xuXG4vKi0gRGVlcCBPYmplY3Qub2JzZXJ2ZSgpICovXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBCVkc7XG5mdW5jdGlvbiBvYnNlcnZlKG9iaiwgY2FsbGJhY2spIHtcblxuICAvLyBJbmNsdWRlIGh0dHBzOi8vZ2l0aHViLmNvbS9NYXhBcnQyNTAxL29iamVjdC1vYnNlcnZlIGlmIHlvdSB3aXNoIHRvIHdvcmtcbiAgLy8gd2l0aCBwb2x5ZmlsbCBvbiBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgT2JqZWN0Lm9ic2VydmUoKVxuICBPYmplY3Qub2JzZXJ2ZShvYmosIGZ1bmN0aW9uIChjaGFuZ2VzKSB7XG4gICAgY2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFuZ2UpIHtcblxuICAgICAgLy8gQmluZCBjaGlsZCBwcm9wZXJ0eSBpZiBpdCBpcyBhbiBvYmplY3QgZm9yIGRlZXAgb2JzZXJ2aW5nXG4gICAgICBpZiAob2JqW2NoYW5nZS5uYW1lXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICBvYnNlcnZlKG9ialtjaGFuZ2UubmFtZV0sIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRyaWdnZXIgdXNlciBjYWxsYmFja1xuICAgIGNhbGxiYWNrLmNhbGwodGhpcywgY2hhbmdlcyk7XG4gIH0pO1xuXG4gIC8vIEltbWVkaWF0ZWx5IGZpcmUgb2JzZXJ2ZSB0byBpbml0aWF0ZSBkZWVwIG9ic2VydmluZ1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChvYmpba2V5XSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgb2JzZXJ2ZShvYmpba2V5XSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qLSBgQlZHKHRhZywgZGF0YSwgYmluZGluZylgXG4gICogVGhlIHRyaW5pdHkgb2YgdGhpcyBsaWJyYXJ5OiBTVkcgKyBEYXRhICsgQmluZGluZyBGdW5jdGlvbi5cbiAgKlxuICAqIFJldHVybiB0aGUgQlZHIG9iamVjdCBjcmVhdGVkLlxuICAqXG4gICogIC0gYHRhZ2AgICAgOiBFaXRoZXIgYSBgU3RyaW5nYCBmb3IgdGhlIFNWRyBgdGFnTmFtZWAgb3IgYW55IFtgU1ZHRWxlbWVudGBdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1NWRy9FbGVtZW50KVxuICAqICAtIGBkYXRhYCAgIDogT2JqZWN0IHdpdGggYXJiaXRyYXJ5IGRhdGEgdG8geW91ciBkZXNpcmVcbiAgKiAgLSBgYmluZGluZ2A6IChvcHRpb25hbCkgQmluZGluZyBmdW5jdGlvbiB0aGF0IHNldHMgdGhlIHRhZyBhdHRyaWJ1dGVzXG4gICovXG5mdW5jdGlvbiBCVkcodGFnLCBkYXRhLCBiaW5kaW5nKSB7XG4gIHZhciBidmcgPSB0aGlzO1xuICB0YWcgPSB0YWcgaW5zdGFuY2VvZiBTVkdFbGVtZW50ID8gdGFnIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZyk7XG4gIGRhdGEgPSBkYXRhIHx8IHt9O1xuICBiaW5kaW5nID0gYmluZGluZyB8fCBmdW5jdGlvbiAodGFnLCBkYXRhKSB7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBkYXRhKSB7XG4gICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICB0YWcuc2V0QXR0cmlidXRlKHByb3AsIGRhdGFbcHJvcF0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBPYnNlcnZlIGRhdGEgb2JqZWN0IGFuZCBhcHBseSBiaW5kaW5nIHJpZ2h0IGF3YXlcbiAgb2JzZXJ2ZShkYXRhLCBmdW5jdGlvbiAoY2hhbmdlcykge1xuICAgIGJpbmRpbmcodGFnLCBkYXRhKTtcbiAgfSk7XG4gIGJpbmRpbmcodGFnLCBkYXRhKTtcblxuICAvLyBJRCBmdW5jdGlvbiBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2dvcmRvbmJyYW5kZXIvMjIzMDMxN1xuICB0YWcuc2V0QXR0cmlidXRlKCdpZCcsICdCVkdfJyArIHRhZy50YWdOYW1lICsgJ18nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDcpKTtcbiAgdGhpcy5fdGFnID0gdGFnO1xuICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgdGhpcy5fYmluZGluZyA9IGJpbmRpbmc7XG5cbiAgLy8gRnVuY3Rpb25hbCBjaXJjdWxhciByZWZlcmVuY2VcbiAgdGhpcy5fdGFnLl9nZXRCVkcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGJ2ZztcbiAgfTtcblxuICBpZiAoWydzdmcnLCAnZycsICdhJ10uaW5kZXhPZih0YWcudGFnTmFtZSkgPCAwKSB7XG4gICAgaWYgKCFkYXRhLnN0cm9rZSkgdGhpcy5zdHJva2UoMTc1KTtcbiAgICBpZiAoIWRhdGEuc3Ryb2tlV2lkdGgpIHRoaXMuc3Ryb2tlV2lkdGgoMC41KTtcbiAgICBpZiAoIWRhdGEuZmlsbCkgdGhpcy5ub0ZpbGwoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIFRoZSBCVkcgQ29udGFpbmVyXG4gICogVGhlIHJlc3Qgb2YgdGhlIGRvY3VtZW50YXRpb24gd2lsbCBhc3N1bWUgYGJ2Z2AgYXMgb3VyIEJWRyBjb250YWluZXJcbiAgKiBjcmVhdGVkIGJ5IHRoZSBleGFtcGxlIGJlbG93LlxuICAqL1xuXG4vKiogIyMjIGBCVkcuY3JlYXRlKGh0bWxFbGVtZW50KWBcbiAgKiBDcmVhdGUgYSBCVkcgY29udGFpbmVyIGluc2lkZSBgaHRtbEVsZW1lbnRgLlxuICAqXG4gICogUmV0dXJuIHRoZSBCVkcgY29udGFpbmVyIG9iamVjdC5cbiAgKlxuICAqICAtIGBodG1sRWxlbWVudGAgIDogRWl0aGVyIGEgW0NTUyBTZWxlY3Rvcl0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL0dldHRpbmdfU3RhcnRlZC9TZWxlY3RvcnMpXG4gICogICAgICAgICAgICAgICAgICAgICBvciBhbnkgW0hUTUxFbGVtZW50XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSFRNTEVsZW1lbnQpLlxuICAqXG4gICogYGBgSmF2YXNjcmlwdFxuICAqIC8vIENyZWF0ZSBhIG5ldyBCVkcgY29udGFpbmVyIGFuZCBhcHBlbmQgaXQgdG8gYW4gZXhpc3RpbmcgSFRNTCBlbGVtZW50LlxuICAqIHZhciBidmcgPSBCVkcuY3JlYXRlKCcjYnZnLWNvbnRhaW5lcicpO1xuICAqIGBgYFxuICAqL1xudmFyIGNyZWF0ZSA9IGV4cG9ydHMuY3JlYXRlID0gQlZHLmNyZWF0ZSA9IGZ1bmN0aW9uIChodG1sRWxlbWVudCwgeERpbWVuc2lvbiwgeURpbWVuc2lvbikge1xuICBpZiAodHlwZW9mIGh0bWxFbGVtZW50ID09PSAnc3RyaW5nJykgaHRtbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGh0bWxFbGVtZW50KTtcbiAgaWYgKCEoaHRtbEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2h0bWxFbGVtZW50ICgnICsgaHRtbEVsZW1lbnQgKyAnKSB3YXMgbm90IGZvdW5kLicpO1xuXG4gIHZhciBkYXRhID0ge1xuICAgICd4bWxuczp4bGluayc6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICB2ZXJzaW9uOiAxLjEsXG4gICAgd2lkdGg6ICcxMDAlJyxcbiAgICBoZWlnaHQ6ICcxMDAlJ1xuICB9O1xuICB5RGltZW5zaW9uID0geURpbWVuc2lvbiB8fCB4RGltZW5zaW9uO1xuICBpZiAoeERpbWVuc2lvbikge1xuICAgIGRhdGEudmlld0JveCA9IFswLCAwLCB4RGltZW5zaW9uLCB5RGltZW5zaW9uXS5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgYnZnID0gbmV3IEJWRygnc3ZnJywgZGF0YSk7XG4gIGh0bWxFbGVtZW50LmFwcGVuZENoaWxkKGJ2Zy50YWcoKSk7XG4gIHJldHVybiBidmc7XG59O1xuXG4vKiogIyMgQlZHIEVsZW1lbnRzXG4gICogQWxsIEJWRyBvYmplY3RzLCBpbmNsdWRpbmcgdGhlIGNvbnRhaW5lciwgaGF2ZSBhY2Nlc3MgdG8gZHJhd2luZyBmdW5jdGlvbnNcbiAgKiBhbmQgcmV0dXJuIHJlZmVyZW5jZSB0byB0aGUgbmV3IHNoYXBlLCB3aGljaCBpcyBhbHNvIGEgQlZHLlxuICAqXG4gICogYGBgSmF2YXNjcmlwdFxuICAqIC8vIENyZWF0ZSBhIHJlY3RhbmdsZSBhdCAoMCwgMCkgd2l0aCBkaW1lbnNpb25zIDEwMHgxMDAgcHggYW5kIGFkZCBpdCB0byBidmdcbiAgKiB2YXIgcmVjdCA9IGJ2Zy5yZWN0KDAsIDAsIDEwMCwgMTAwKTtcbiAgKiBgYGBcbiAgKlxuICAqIFRoZSBCVkcgbW9kdWxlIGFsc28gaGFzIGRyYXdpbmcgZnVuY3Rpb25zLCB3aGljaCByZXR1cm4gdGhlIEJWRyBvYmplY3Q6XG4gICpcbiAgKiBgYGBKYXZhc2NyaXB0XG4gICogLy8gQ3JlYXRlIGEgcmVjdGFuZ2xlIGF0ICgwLCAwKSB3aXRoIGRpbWVuc2lvbnMgMTAweDEwMCBweFxuICAqIC8vIE5vdGUgaXQgdXNlcyB0aGUgQlZHIG1vZHVsZSBkaXJlY3RseSB0byBjcmVhdGUgdGhlIHJlY3RhbmdsZS5cbiAgKiB2YXIgcmVjdCA9IEJWRy5yZWN0KDAsIDAsIDEwMCwgMTAwKTtcbiAgKiAvLyBBZGQgdGhlIHJlY3RhbmdsZSB0byBhbiBleGlzdGluZyBCVkcgY29udGFpbmVyXG4gICogYnZnLmFwcGVuZChyZWN0KTtcbiAgKiBgYGBcbiAgKlxuICAqIERyYXdpbmcgZnVuY3Rpb25zIGNhbiBiZSBjYWxsZWQgaW4gYSBudW1iZXIgb2Ygd2F5cy4gVGFrZSBgYnZnLnJlY3QoeCwgeSwgd2lkdGgsIGhlaWdodClgXG4gICogYXMgYW4gZXhhbXBsZSBiZWxvdy4gU29tZXRpbWVzIGl0IGlzIGVhc2llciB0byB1c2Ugb25lIG92ZXIgYW5vdGhlciBzdHlsZS5cbiAgKlxuICAqIGBgYEphdmFzY3JpcHRcbiAgKiBidmcucmVjdCgwLCAxMCwgMzAsIDcwKTsgICAgICAvLyBBcmd1bWVudHMgc3R5bGVcbiAgKiBidmcucmVjdCh7ICAgICAgICAgICAgICAgICAgICAvLyBPYmplY3Qgc3R5bGVcbiAgKiAgIHg6IDAsXG4gICogICB5OiAxMCwgICAgICAgICAgICAgICAgICAgICAgLy8gTmFtZSBvZiB0aGUgb2JqZWN0IHByb3BlcnRpZXMgbXVzdCBtYXRjaFxuICAqICAgd2lkdGg6IDMwLCAgICAgICAgICAgICAgICAgIC8vIG5hbWVzIG9mIHRoZSBhcmd1bWVudHMgaW4gdGhlIGZ1bmN0aW9ucyxcbiAgKiAgIGhlaWdodDogNzAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhlIG9yZGVyIGNhbiBiZSBhbnkuXG4gICogfSk7XG4gICogYGBgXG4gICovXG52YXIgY3JlYXRpb25GdW5jdGlvbnMgPSB7XG4gIHN2ZzogZnVuY3Rpb24gc3ZnKHhsaW5rLCB2ZXJzaW9uLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3N2ZycsIHhsaW5rLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geGxpbmsgOiB7XG4gICAgICAneG1sbnM6eGxpbmsnOiB4bGluayxcbiAgICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyMgYGJ2Zy5yZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpYFxuICAgICogQ3JlYXRlIGEgcmVjdGFuZ2xlIGF0IHBvc2l0aW9uIGAoeCwgeSlgIGF0IGB3aWR0aGAgeCBgaGVpZ2h0YCBpbiBzaXplLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciByZWN0ID0gYnZnLnJlY3QoMTAwLCAxMDAsIDMwMCwgMTUwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIHJlY3Q6IGZ1bmN0aW9uIHJlY3QoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIHJldHVybiBuZXcgQlZHKCdyZWN0JywgeC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHggOiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLmNpcmNsZShjeCwgY3ksIHIpYFxuICAgICogQ3JlYXRlIGEgY2lyY2xlIGNlbnRyZWQgb24gYChjeCwgY3kpYCB3aXRoIHJhZGl1cyBgcmAuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIGNpcmNsZSA9IGJ2Zy5lbGxpcHNlKDEwMCwgMTAwLCA1MCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBjaXJjbGU6IGZ1bmN0aW9uIGNpcmNsZSh4LCB5LCByKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2NpcmNsZScsIHguY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4IDoge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICByOiByXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnY3gnLCBkYXRhLngpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnY3knLCBkYXRhLnkpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncicsIGRhdGEucik7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLmVsbGlwc2UoY3gsIGN5LCByeCwgcnkpYFxuICAgICogQ3JlYXRlIGEgZWxsaXBzZSBjZW50cmVkIG9uIGAoY3gsIGN5KWAgd2l0aCByYWRpaSBgcnhgIGFuZCBgcnlgLlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciBlbGxpcHNlID0gYnZnLmVsbGlwc2UoMTAwLCAxMDAsIDIwMCwgMTgwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIGVsbGlwc2U6IGZ1bmN0aW9uIGVsbGlwc2UoeCwgeSwgcngsIHJ5KSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2VsbGlwc2UnLCB4LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geCA6IHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgcng6IHJ4LFxuICAgICAgcnk6IHJ5XG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnY3gnLCBkYXRhLngpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnY3knLCBkYXRhLnkpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncngnLCBkYXRhLnJ4KTtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3J5JywgZGF0YS5yeSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLmxpbmUoeDEsIHkxLCB4MiwgeTIpYFxuICAgICogQ3JlYXRlIGEgbGluZSBmcm9tIGAoeDEsIHkxKWAgdG8gYCh4MiwgeTIpYC5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiB2YXIgbGluZSA9IGJ2Zy5saW5lKDEwMCwgMTAwLCAyMDAsIDMwMCk7XG4gICAgKiBgYGBcbiAgICAqL1xuICBsaW5lOiBmdW5jdGlvbiBsaW5lKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2xpbmUnLCB4MS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHgxIDoge1xuICAgICAgeDE6IHgxLFxuICAgICAgeTE6IHkxLFxuICAgICAgeDI6IHgyLFxuICAgICAgeTI6IHkyXG4gICAgfSk7XG4gIH0sXG4gIC8qKiAjIyMgYGJ2Zy5wb2x5bGluZShbW3gxLCB5MV0sIFt4MiwgeTJdLCAuLi5dKWBcbiAgICAqIENyZWF0ZSBhIHNlcmllcyBvZiBsaW5lcyBmcm9tIHBvaW50IHRvIHBvaW50LlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciBwb2x5bGluZSA9IGJ2Zy5wb2x5bGluZShbWzEwMCwgMjAwXSwgWzIwMCwgMzAwXSwgWzQwMCwgODAwXV0pO1xuICAgICogYGBgXG4gICAgKi9cbiAgcG9seWxpbmU6IGZ1bmN0aW9uIHBvbHlsaW5lKHBvaW50cykge1xuICAgIHJldHVybiBuZXcgQlZHKCdwb2x5bGluZScsIHBvaW50cy5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHBvaW50cyA6IHtcbiAgICAgIHBvaW50czogcG9pbnRzXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgZGF0YS5wb2ludHMuam9pbignICcpKTtcbiAgICB9KTtcbiAgfSxcbiAgLyoqICMjIyBgYnZnLnBvbHlnb24oW1t4MSwgeTFdLCBbeDIsIHkyXSwgLi4uXSlgXG4gICAgKiBDcmVhdGUgYSBjbG9zZWQgcG9seWdvbiBmcm9tIHBvaW50IHRvIHBvaW50LiBUaGUgbGFzdCBwb2ludCB3aWxsIGJlXG4gICAgKiBjb25uZWN0ZWQgYmFjayB0byB0aGUgZmlyc3QgcG9pbnQuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIHBvbHlnb24gPSBidmcucG9seWdvbihbWzEwMCwgMjAwXSwgWzIwMCwgMzAwXSwgWzQwMCwgODAwXV0pO1xuICAgICogYGBgXG4gICAgKi9cbiAgcG9seWdvbjogZnVuY3Rpb24gcG9seWdvbihwb2ludHMpIHtcbiAgICByZXR1cm4gbmV3IEJWRygncG9seWdvbicsIHBvaW50cy5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0JyA/IHBvaW50cyA6IHtcbiAgICAgIHBvaW50czogcG9pbnRzXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgZGF0YS5wb2ludHMuam9pbignICcpKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKiogIyMgR3JvdXBpbmcgRWxlbWVudHNcbiAgICAqICMjIyBgYnZnLmdyb3VwKFt0cmFuc2Zvcm1dKWBcbiAgICAqXG4gICAgKiBDcmVhdGUgYSBncm91cCB0byBjb250YWluIEJWRyBvYmplY3RzLiBJdCBhY3RzIGxpa2UgYSBCVkcgY29udGFpbmVyIHdpdGhcbiAgICAqIGFuIG9wdGlvbmFsIGB0cmFuc2Zvcm1gIGF0dHJpYnV0ZS5cbiAgICAqXG4gICAgKiBgYGBKYXZhc2NyaXB0XG4gICAgKiAvLyBDcmVhdGUgYSBuZXcgZ3JvdXAgYW5kIGZpbGwgaXQgd2l0aCBkYXNoZXMuXG4gICAgKiB2YXIgZGFzaGVzID0gYnZnLmdyb3VwKCk7XG4gICAgKiBmb3IgKGludCBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICogICBkYWhzZXMucmVjdCgxMCwgMTAgKyBpICogMzAsIDUwLCAyMCk7XG4gICAgKiB9XG4gICAgKiBgYGBcbiAgICAqL1xuICBncm91cDogZnVuY3Rpb24gZ3JvdXAodHJhbnNmb3JtKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2cnLCB0cmFuc2Zvcm0uY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB0cmFuc2Zvcm0gOiB7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyBIeXBlcmxpbmtzXG4gICAgKiAjIyMgYGJ2Zy5oeXBlcmxpbmsodXJsKWBcbiAgICAqXG4gICAgKiBDcmVhdGUgYSBoeXBlcmxpbmsgQlZHIHRvIHRhcmdldCBVUkwgYHVybGAuIEl0IGRvZXMgbm90IGhhdmUgYW55IGRpc3BsYXlcbiAgICAqIGVsZW1lbnRzLiBNYWtlIHN1cmUgdG8gYXBwZW5kIGVsZW1lbnRzIHRvIGl0LlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIC8vIENsaWNraW5nIG9uIHRoaXMgZWxlbWVudCB3aWxsIGJyaW5nIHRoZW0gdG8gdGhlIEdpdGh1YiBwYWdlXG4gICAgKiB2YXIgZ2l0aHViTGluayA9IGJ2Zy5oeXBlcmxpbmsoJ2h0dHBzOi8vZ2l0aHViLmNvbS9zcGF4ZS9CVkcuanMnKTtcbiAgICAqIC8vIE1ha2UgYSBidXR0b24gYW5kIGF0dGFjayBpdCB0byB0aGUgbGlua1xuICAgICogZ2l0aHViTGluay5lbGxpcHNlKDIwMCwgMjAwLCA1MCwgNTApO1xuICAgICogYGBgXG4gICAgKi9cbiAgaHlwZXJsaW5rOiBmdW5jdGlvbiBoeXBlcmxpbmsodXJsKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ2EnLCB1cmwuY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB1cmwgOiB7XG4gICAgICAneG1sbnM6aHJlZic6IHVybFxuICAgIH0pO1xuICB9LFxuXG4gIC8qKiAjIyBPdGhlciBHZW9tZXRyeVxuICAgICogIyMjIGBidmcudHJpYW5nbGUoY3gsIGN5LCByKWBcbiAgICAqIENyZWF0ZSBhIHJlZ3VsYXIgdHJpYW5nbGUgY2VudHJlZCBvbiBgKGN4LCBjeSlgIHdpdGggdmVydGljZXMgYHJgIGRpc3RhbmNlXG4gICAgKiBhd2F5LlxuICAgICpcbiAgICAqIGBgYEphdmFzY3JpcHRcbiAgICAqIHZhciB0cmlhbmdsZSA9IGJ2Zy50cmlhbmdsZSg1MCwgNTAsIDEwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIHRyaWFuZ2xlOiBmdW5jdGlvbiB0cmlhbmdsZSh4LCB5LCByKSB7XG4gICAgcmV0dXJuIG5ldyBCVkcoJ3BvbHlnb24nLCB4LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8geCA6IHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgcjogclxuICAgIH0sIGZ1bmN0aW9uICh0YWcsIGRhdGEpIHtcbiAgICAgIHZhciBwb2ludHMgPSBbW2RhdGEueCwgZGF0YS55IC0gZGF0YS5yXSwgW2RhdGEueCAtIGRhdGEuciAvIDIgKiBNYXRoLnNxcnQoMyksIGRhdGEueSArIGRhdGEuciAvIDJdLCBbZGF0YS54ICsgZGF0YS5yIC8gMiAqIE1hdGguc3FydCgzKSwgZGF0YS55ICsgZGF0YS5yIC8gMl1dO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgcG9pbnRzLmpvaW4oJyAnKSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLmFyYyhjeCwgY3ksIHJ4LCByeSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUpYFxuICAgICogQ3JlYXRlIGFuIGFyYyBjZW50cmVkIG9uIGAoY3gsIGN5KWAgd2l0aCByYWRpdXMgYHJ4YCBhbmQgYHJ5YCwgc3RhcnRpbmdcbiAgICAqIGZyb20gYHN0YXJ0QW5nbGVgIGFudGktY2xvY2t3aXNlIHRvIGBlbmRBbmdsZWAsIHdoZXJlIDAgaXMgdGhlIHBvc2l0aXZlXG4gICAgKiB4LWF4aXMuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIGFyYyA9IGJ2Zy5hcmMoNTAsIDUwLCA1MCwgMTAwLCAwLCBNYXRoLlBJKTtcbiAgICAqIGBgYFxuICAgICovXG4gIGFyYzogZnVuY3Rpb24gYXJjKHgsIHksIHJ4LCByeSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUpIHtcbiAgICByZXR1cm4gbmV3IEJWRygncGF0aCcsIHguY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCcgPyB4IDoge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICByeDogcngsXG4gICAgICByeTogcnksXG4gICAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGU6IGVuZEFuZ2xlXG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdmFyIHAxID0gZ2V0UG9pbnRPbkVsbGlwc2UoZGF0YS54LCBkYXRhLnksIGRhdGEucngsIGRhdGEucnksIGRhdGEuc3RhcnRBbmdsZSk7XG4gICAgICB2YXIgcDIgPSBnZXRQb2ludE9uRWxsaXBzZShkYXRhLngsIGRhdGEueSwgZGF0YS5yeCwgZGF0YS5yeSwgZGF0YS5lbmRBbmdsZSk7XG4gICAgICB2YXIgbGFyZ2VBcmMgPSBkYXRhLmVuZEFuZ2xlIC0gZGF0YS5zdGFydEFuZ2xlID4gTWF0aC5QSSA/IDEgOiAwO1xuICAgICAgdmFyIHN3ZWVwQXJjID0gZGF0YS5lbmRBbmdsZSA+IGRhdGEuc3RhcnRBbmdsZSA/IDEgOiAwO1xuICAgICAgdmFyIGQgPSBbWydNJywgcDEueCwgcDEueV0sIFsnQScsIGRhdGEucngsIGRhdGEucnksIDAsIGxhcmdlQXJjLCBzd2VlcEFyYywgcDIueCwgcDIueV1dO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnZCcsIGQubWFwKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiB4LmpvaW4oJyAnKTtcbiAgICAgIH0pLmpvaW4oJyAnKSk7XG5cbiAgICAgIGZ1bmN0aW9uIGdldFBvaW50T25FbGxpcHNlKHgsIHksIHJ4LCByeSwgYW5nbGUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiByeCAqIE1hdGguY29zKGFuZ2xlKSArIHgsXG4gICAgICAgICAgeTogcnkgKiBNYXRoLnNpbihhbmdsZSkgKyB5XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqICMjIyBgYnZnLnRleHQodGV4dCwgeCwgeSlgXG4gICAgKiBDcmVhdGUgYSBzdHJpbmcgb2YgYHRleHRgIHRleHQgYXQgbG9jYXRpb24gYCh4LCB5KWAuXG4gICAgKlxuICAgICogYGBgSmF2YXNjcmlwdFxuICAgICogdmFyIHRleHQgPSBidmcudGV4dCgnTXJyYWEhJywgMjAsIDEwKTtcbiAgICAqIGBgYFxuICAgICovXG4gIHRleHQ6IGZ1bmN0aW9uIHRleHQoX3RleHQsIHgsIHkpIHtcbiAgICByZXR1cm4gbmV3IEJWRygndGV4dCcsIF90ZXh0LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdPYmplY3QnID8gX3RleHQgOiB7XG4gICAgICB0ZXh0OiBfdGV4dCxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSwgZnVuY3Rpb24gKHRhZywgZGF0YSkge1xuICAgICAgdGFnLmlubmVySFRNTCA9IGRhdGEudGV4dDtcbiAgICAgIHRhZy5zZXRBdHRyaWJ1dGUoJ3gnLCBkYXRhLngpO1xuICAgICAgdGFnLnNldEF0dHJpYnV0ZSgneScsIGRhdGEueSk7XG4gICAgfSkuZmlsbCgncmdiYSgxNzUsIDE3NSwgMTc1LCAxKScpLnN0cm9rZSgncmdiYSgwLCAwLCAwLCAwKScpO1xuICB9XG59O1xuXG5PYmplY3Qua2V5cyhjcmVhdGlvbkZ1bmN0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICBCVkdbZl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNyZWF0aW9uRnVuY3Rpb25zW2ZdLmFwcGx5KEJWRywgYXJndW1lbnRzKTtcbiAgfTtcbiAgQlZHLnByb3RvdHlwZVtmXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYnZnID0gY3JlYXRpb25GdW5jdGlvbnNbZl0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmFwcGVuZChidmcpO1xuICAgIHJldHVybiBidmc7XG4gIH07XG59KTtcblxuLyoqICMjIFRoZSBCVkcgT2JqZWN0XG4gICogQlZHcyBhcmUgU1ZHcyB3aXRoIGV4dHJhIHN1cGVycG93ZXJzLlxuICAqL1xuXG4vKiogIyMjIGBidmcuZmluZChzZWxlY3RvcilgXG4gICogUmV0dXJuIGFuIGFycmF5IG9mIEJWR3MgbWF0Y2hpbmcgYHNlbGVjdG9yYCBpbnNpZGUgQlZHLiBgc2VsZWN0b3JgIGlzXG4gICogZGVmaW5lZCBhcyBbQ1NTIFNlbGVjdG9yc10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL0dldHRpbmdfc3RhcnRlZC9TZWxlY3RvcnMpLlxuICAqL1xuQlZHLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciByZXN1bHQgPSB0aGlzLl90YWcucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIGlmIChyZXN1bHQpIHtcbiAgICB2YXIgYnZncyA9IFtdO1xuICAgIFtdLnNsaWNlLmNhbGwocmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7XG4gICAgICBidmdzLnB1c2goci5fZ2V0QlZHKCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBidmdzO1xuICB9XG4gIHJldHVybiBbXTtcbn07XG5cbi8qKiAjIyMgYGJ2Zy5hcHBlbmQoYnZnKWBcbiAgKiBJbnNlcnQgYGNoaWxkX2J2Z2AgaW5zaWRlIGBidmdgLiBUaGlzIGlzIHVzZWZ1bCB0byBhZGQgZWxlbWVudHMgaW5zaWRlIGFcbiAgKiBgQlZHLmdyb3VwKClgLlxuICAqL1xuQlZHLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbiAoY2hpbGRfYnZnKSB7XG4gIHRoaXMuX3RhZy5hcHBlbmRDaGlsZChjaGlsZF9idmcuX3RhZyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIyBgYnZnLnJlbW92ZSgpYFxuICAqIFJlbW92ZSBpdHNlbGYgZnJvbSBpdHMgcGFyZW50LiBSZXR1cm4gc2VsZiByZWZlcmVuY2UuXG4gICovXG5CVkcucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50KCk7XG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQuX3RhZy5yZW1vdmVDaGlsZCh0aGlzLl90YWcpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIyBgYnZnLnBhcmVudCgpYFxuICAqIFJldHVybiB0aGUgcGFyZW50IEJWRy4gSWYgdGhlcmUgaXMgbm8gcGFyZW50IChzdWNoIGlzIHRoZSBjYXNlIGZvciB0aGUgQlZHXG4gICogY29udGFpbmVyIGl0c2VsZiksIHJldHVybiBudWxsLlxuICAqL1xuQlZHLnByb3RvdHlwZS5wYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl90YWcucGFyZW50Tm9kZSAmJiB0eXBlb2YgdGhpcy5fdGFnLnBhcmVudE5vZGUuX2dldEJWRyA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRoaXMuX3RhZy5wYXJlbnROb2RlLl9nZXRCVkcoKTtcbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKiogIyMjIGBidmcuY2hpbGRyZW4oKWBcbiAgKiBSZXR1cm4gYSBsaXN0IG9mIEJWRyBlbGVtZW50cyBpbnNpZGUgYGJ2Z2AuXG4gICovXG5CVkcucHJvdG90eXBlLmNoaWxkcmVuID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fdGFnLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3RhZy5jaGlsZE5vZGVzW2ldLl9nZXRCVkcgPT09ICdmdW5jdGlvbicpIG91dHB1dC5wdXNoKHRoaXMuX3RhZy5jaGlsZE5vZGVzW2ldLl9nZXRCVkcoKSk7XG4gIH1yZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqICMjIyBgYnZnLnRhZygpYFxuICAqIFJldHVybiB0aHcgQlZHIGdyYXBoaWNhbCBjb250ZW50LCBhIFNWRy5cbiAgKi9cbkJWRy5wcm90b3R5cGUudGFnID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5fdGFnO1xufTtcblxuLyoqICMjIyBgYnZnLmRhdGEoKWBcbiAqIEdldC9zZXQgdGhlIGBkYXRhYCBvYmplY3QgaW4gYSBCVkcuIFRoZXJlIGFyZSBmb3VyIHdheXMgdG8gdXNlIHRoaXNcbiAqIGZ1bmN0aW9uLlxuICpcbiAqICAtIGBidmcuZGF0YSgpYDogUmV0dXJuIGBkYXRhYCBib3VuZCB0byB0aGUgQlZHLlxuICogIC0gYGJ2Zy5kYXRhKG5ld0RhdGEpYDogVXBkYXRlIGBkYXRhYCB3aXRoIGBuZXdEYXRhYCBvYmplY3QuXG4gKiAgLSBgYnZnLmRhdGEocHJvcGVydHkpYDogUmV0dXJuIGBkYXRhW3Byb3BlcnR5XWAgZnJvbSB0aGUgQlZHLlxuICogIC0gYGJ2Zy5kYXRhKHByb3BlcnR5LCBuZXdWYWx1ZSlgOiBVcGRhdGUgYHByb3BlcnR5YCB3aXRoIGBuZXdWYWx1ZWAuXG4gKlxuICogUmV0dXJuIGBidmdgIG9iamVjdCByZWZlcmVuY2UuXG4gKi9cbkJWRy5wcm90b3R5cGUuZGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKGFyZ3VtZW50c1swXS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnT2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIgayBpbiBhcmd1bWVudHNbMF0pIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1swXS5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIHRoaXMuZGF0YShrLCBhcmd1bWVudHNbMF1ba10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2RhdGFbYXJndW1lbnRzWzBdXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHRoaXMuX2RhdGFbYXJndW1lbnRzWzBdXSA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcih0aGlzLCAnZGF0YSgpIHJlY2VpdmVkIG1vcmUgdGhhbiAyIGFyZ3VtZW50cy4nKTtcbiAgfVxufTtcblxuLyoqICMjIyBgYnZnLmF0dHIoKWBcbiAgKiBHZXQvc2V0IGF0dHJpYnV0ZXMgb24gYSBCVkcuXG4gICpcbiAgKiAgLSBgYnZnLmF0dHIoYXR0cilgOiBSZXR1cm4gYXR0cmlidXRlIHZhbHVlLlxuICAqICAtIGBidmcuYXR0cihhdHRyLCB2YWx1ZSlgOiBVcGRhdGUgYGF0dHJgIHdpdGggYHZhbHVlYC5cbiAgKi9cbkJWRy5wcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uIChhdHRyLCB2YWx1ZSkge1xuICBpZiAoIWF0dHIpIHRocm93IG5ldyBFcnJvcignYXR0ciBtdXN0IGJlIGRlZmluZWQnKTtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuIHRoaXMuX3RhZy5nZXRBdHRyaWJ1dGUoYXR0cik7ZWxzZSB0aGlzLl90YWcuc2V0QXR0cmlidXRlKGF0dHIsIHZhbHVlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMjIGBidmcuZmlsbCgpYFxuICAqIEdldC9zZXQgdGhlIGZpbGxpbmcgY29sb3VyLlxuICAqXG4gICogIC0gYGJ2Zy5maWxsKClgOiBSZXR1cm4gYGZpbGxgIGNvbG91ciBhcyBbciwgZywgYiwgYV0sIG9yIGAnJ2AgKGVtcHR5XG4gICogICAgICAgICAgICAgICAgICBzdHJpZykgaWYgZmlsbCBpcyBub3Qgc3BlY2lmaWVkIG9uIHRoZSBvYmplY3QuXG4gICogIC0gYGJ2Zy5maWxsKHJnYilgOiBTZXQgYGZpbGxgIHdpdGggYSBncmV5c2NhbGUgY29sb3VyIHdpdGggZXF1YWxcbiAgKiAgICB2YWx1ZXMgYChyZ2IsIHJnYiwgcmdiKWAuXG4gICogIC0gYGJ2Zy5maWxsKHIsIGcsIGIsIFthXSlgOiBTZXQgYGZpbGxgIHdpdGggYChyLCBnLCBiLCBhKWAuIElmIGBhYFxuICAqICAgIGlzIG9taXR0ZWQsIGl0IGRlZmF1bHRzIHRvIGAxYC5cbiAgKlxuICAqIGByYCwgYGdgLCBgYmAgc2hvdWxkIGJlIGluIHRoZSByYW5nZSBvZiAwLTI1NSBpbmNsdXNpdmUuXG4gICovXG5CVkcucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgdmFyIGYgPSB0aGlzLmF0dHIoJ2ZpbGwnKTtcbiAgICBpZiAoZikgcmV0dXJuIEJWRy5leHRyYWN0TnVtYmVyQXJyYXkoZik7XG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ3N0cmluZycpIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCBhcmd1bWVudHNbMF0pO2Vsc2UgcmV0dXJuIHRoaXMuYXR0cignZmlsbCcsIEJWRy5yZ2JhKGFyZ3VtZW50c1swXSkpO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xuICAgIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCBCVkcucmdiYS5hcHBseShCVkcsIGFyZ3VtZW50cykpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKHRoaXMsICdmaWxsKCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDEgYXJndW1lbnQuJyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYGJ2Zy5ub0ZpbGwoKWBcbiAgKiBSZW1vdmUgQlZHIG9iamVjdCdzIGNvbG91ciBmaWxsaW5nIGNvbXBsZXRlbHkuXG4gICovXG5CVkcucHJvdG90eXBlLm5vRmlsbCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZmlsbCgncmdiYSgwLCAwLCAwLCAwKScpO1xufTtcblxuLyoqICMjIyBgYnZnLnN0cm9rZSgpYFxuICAqIEdldC9zZXQgdGhlIG91dGxpbmUgY29sb3VyLlxuICAqXG4gICogIC0gYGJ2Zy5zdHJva2UoKWA6IFJldHVybiBgc3Ryb2tlYCBjb2xvdXIgYXMgW3IsIGcsIGIsIGFdLiBJZiBgc3Ryb2tlYCBpc1xuICAqICAgIG5vdCBzcGVjaWZpZWQsIHJldHVybiBgJydgIChlbXB0eSBzdHJpbmcpLlxuICAqICAtIGBidmcuc3Ryb2tlKHJnYilgOiBTZXQgYHN0cm9rZWAgd2l0aCBhIGdyZXlzY2FsZSBjb2xvdXIgd2l0aCBlcXVhbFxuICAqICAgIHZhbHVlcyBgKHJnYiwgcmdiLCByZ2IpYC5cbiAgKiAgLSBgYnZnLnN0cm9rZShyLCBnLCBiLCBbYV0pYDogU2V0IGBzdHJva2VgIHdpdGggYChyLCBnLCBiLCBhKWAuIElmIGBhYFxuICAqICAgIGlzIG9taXR0ZWQsIGl0IGRlZmF1bHRzIHRvIGAxYC5cbiAgKlxuICAqIGByYCwgYGdgLCBgYmAgc2hvdWxkIGJlIGluIHRoZSByYW5nZSBvZiAwLTI1NSBpbmNsdXNpdmUuXG4gICovXG5CVkcucHJvdG90eXBlLnN0cm9rZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB2YXIgcyA9IHRoaXMuYXR0cignc3Ryb2tlJyk7XG4gICAgaWYgKHMpIHJldHVybiBCVkcuZXh0cmFjdE51bWJlckFycmF5KHMpO1xuICAgIHJldHVybiAnJztcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdzdHJpbmcnKSByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UnLCBhcmd1bWVudHNbMF0pO2Vsc2UgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlJywgQlZHLnJnYmEoYXJndW1lbnRzWzBdKSk7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyB8fCBhcmd1bWVudHMubGVuZ3RoID09PSA0KSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlJywgQlZHLnJnYmEuYXBwbHkoQlZHLCBhcmd1bWVudHMpKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcih0aGlzLCAnc3Ryb2tlKCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDEgYXJndW1lbnQuJyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYGJ2Zy5zdHJva2VXaWR0aChbd2lkdGhdKWBcbiAgKiBHZXQvc2V0IHRoZSBvdXRsaW5lIHRoaWNrbmVzcy5cbiAgKlxuICAqIFJldHVybnMgdGhlIGN1cnJlbnQgb3V0bGluZSB0aGlja25lc3MgaWYgYHdpZHRoYCBpcyBvbWl0dGVkLiBPdGhlcmlzZSxcbiAgKiBpdCBhc3NpZ25zIHRoZSBvdXRsaW5lIHRoaWNrbmVzcyB3aXRoIGEgbmV3IHZhbHVlLCBhbmQgcmV0dXJucyB0aGUgYGJ2Z2BcbiAgKiBvYmplY3QgcmVmZXJlbmNlLlxuICAqXG4gICogIC0gYHdpZHRoYCAgOiBPdXRsaW5lIHRoaWNrbmVzcyBpbiBwaXhlbHMuXG4gICovXG5CVkcucHJvdG90eXBlLnN0cm9rZVdpZHRoID0gZnVuY3Rpb24gKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZS13aWR0aCcpO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB0aGlzLmF0dHIoJ3N0cm9rZS13aWR0aCcsIGFyZ3VtZW50c1swXSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IodGhpcywgJ3N0cm9rZVdpZHRoKCkgcmVjZWl2ZWQgbW9yZSB0aGFuIDEgYXJndW1lbnQuJyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYGJ2Zy5ub1N0cm9rZSgpYFxuICAqIFJlbW92ZSBCVkcgb2JqZWN0J3Mgb3V0bGluZSBjb21wbGV0ZWx5LlxuICAqL1xuQlZHLnByb3RvdHlwZS5ub1N0cm9rZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc3Ryb2tlV2lkdGgoMCkuc3Ryb2tlKCdyZ2JhKDAsIDAsIDAsIDApJyk7XG59O1xuXG5CVkcucHJvdG90eXBlLmNvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RhZy5pbm5lckhUTUw7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHRoaXMuX3RhZy5pbm5lckhUTUwgPSBhcmd1bWVudHNbMF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IodGhpcywgJ2NvbnRlbnQoKSByZWNlaXZlZCBtb3JlIHRoYW4gMSBhcmd1bWVudC4nKTtcbiAgfVxufTtcblxuLyoqICMjIyBgYnZnLmFkZENsYXNzKGMpYFxuKiBBZGQgYSBjbGFzcyBuYW1lIHRvIHRoZSBlbGVtZW50LlxuKi9cbkJWRy5wcm90b3R5cGUuYWRkQ2xhc3MgPSBmdW5jdGlvbiAoYykge1xuICB0aGlzLl90YWcuY2xhc3NMaXN0LmFkZChjKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMjIGBidmcucmVtb3ZlQ2xhc3MoYylgXG4gICogUmVtb3ZlIGEgY2xhc3MgbmFtZSB0byB0aGUgZWxlbWVudC5cbiAgKi9cbkJWRy5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoYykge1xuICB0aGlzLl90YWcuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiogIyMjIGBidmcuaGFzQ2xhc3MoYylgXG4gICogUmV0dXJuIHRydWUgaWYgdGhlIGVsZW1lbnQgaGFzIGNsYXNzIGBjYC5cbiAgKi9cbkJWRy5wcm90b3R5cGUuaGFzQ2xhc3MgPSBmdW5jdGlvbiAoYykge1xuICByZXR1cm4gdGhpcy5fdGFnLmNsYXNzTGlzdC5jb250YWlucyhjKTtcbn07XG5cbi8qKiAjIyMgYGJ2Zy5yZW1vdmVDbGFzcyhjKWBcbiAgKiBBZGQgb3IgcmVtb3ZlIHRoZSBjbGFzcyBgY2AgdG8gdGhlIGVsZW1lbnQuXG4gICovXG5CVkcucHJvdG90eXBlLnRvZ2dsZUNsYXNzID0gZnVuY3Rpb24gKGMpIHtcbiAgdGhpcy5fdGFnLmNsYXNzTGlzdC50b2dnbGUoYyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIEFmZmluZSBUcmFuc2Zvcm1hdGlvbnMgKi9cbkJWRy5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24gKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzLl90YWcuZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKSB8fCAnJztcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdGhpcy5fdGFnLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgYXJndW1lbnRzWzBdKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RyYW5zZm9ybSgpIHJlY2VpdmVkIG1vcmUgdGhhbiAxIGFyZ3VtZW50Jyk7XG4gIH1cbn07XG5cbi8qKiAjIyMgYEJWRy50cmFuc2xhdGUoeCwgW3ldKWBcbiAgKiBBcHBseSBhIG1vdmluZyB0cmFuc2xhdGlvbiBieSBgeGAgYW5kIGB5YCB1bml0cy4gSWYgYHlgIGlzIG5vdCBnaXZlbiwgaXRcbiAgKiBpcyBhc3N1bWVkIHRvIGJlIDAuXG4gICovXG5CVkcucHJvdG90eXBlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIGlmICh0eXBlb2YgeCAhPT0gJ251bWJlcicgJiYgdHlwZW9mIHkgIT09ICdudW1iZXInKSB0aHJvdyBuZXcgRXJyb3IoJ3RyYW5zbGF0ZSgpIG9ubHkgdGFrZSBudW1iZXJzIGFzIGFyZ3VtZW50cycpO1xuICB5ID0geSB8fCAwO1xuICB2YXIgdHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm0oKTtcbiAgdGhpcy5fdGFnLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgW3RyYW5zZm9ybSwgJyB0cmFuc2xhdGUoJywgeCwgJyAnLCB5LCAnKSddLmpvaW4oJycpLnRyaW0oKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqICMjIFV0aWxpdHkgTWV0aG9kcyAqL1xuXG4vKiogIyMjIGBCVkcucmdiYShyLCBnLCBiLCBbYV0pYFxuICAqIFJldHVybiBhIHN0cmluZyBpbiB0aGUgZm9ybSBvZiBgcmdiYShyLCBnLCBiLCBhKWAuXG4gICpcbiAgKiBJZiBvbmx5IGByYCBpcyBnaXZlbiwgdGhlIHZhbHVlIGlzIGNvcGllZCB0byBgZ2AgYW5kIGBiYCB0byBwcm9kdWNlIGFcbiAgKiBncmV5c2NhbGUgdmFsdWUuXG4gICovXG5CVkcucmdiYSA9IGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gIHZhciBhID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gMS4wIDogYXJndW1lbnRzWzNdO1xuXG4gIGlmICh0eXBlb2YgciAhPT0gJ251bWJlcicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3JnYmEoKSBtdXN0IHRha2UgbnVtZXJpY2FsIHZhbHVlcyBhcyBpbnB1dCcpO1xuICBnID0gZyB8fCByO1xuICBiID0gYiB8fCByO1xuICByZXR1cm4gJ3JnYmEoJyArIFtyLCBnLCBiLCBhXS5qb2luKCcsJykgKyAnKSc7XG59O1xuXG4vKiogIyMjIGBCVkcuaHNsYShodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcywgW2FscGhhXSlgXG4gICogUmV0dXJuIHRoZSBDU1MgcmVwcmVzZW50YXRpb24gaW4gYGhzbGEoKWAgYXMgYSBzdHJpbmcuXG4gICpcbiAgKiAgLSBgaHVlYDogQSB2YWx1ZSBiZXR3ZWVuIGAwYCBhbmQgYDM2MGAsIHdoZXJlIGAwYCBpcyByZWQsIGAxMjBgIGlzIGdyZWVuLFxuICAqICAgICAgICAgICBhbmQgYDI0MGAgaXMgYmx1ZS5cbiAgKiAgLSBgc2F0dXJhdGlvbmAgOiBBIHZhbHVlIGJldHdlZW4gYDBgIGFuZCBgMTAwYCwgd2hlcmUgYDBgIGlzIGdyZXkgYW5kXG4gICogICAgICAgICAgICAgICAgIGAxMDBgIGlzIGZ1bGx5IHNhdHVyYXRlLlxuICAqICAtIGBsaWdodG5lc3NgOiBBIHZhbHVlIGJldHdlZW4gYDBgIGFuZCBgMTAwYCwgd2hlcmUgYDBgIGlzIGJsYWNrIGFuZFxuICAqICAgICAgICAgICAgICAgICBgMTAwYCBpcyBmdWxsIGludGVuc2l0eSBvZiB0aGUgY29sb3VyLlxuICAqL1xuQlZHLmhzbGEgPSBmdW5jdGlvbiAoaHVlLCBzYXR1cmF0aW9uLCBsaWdodG5lc3MsIGFscGhhKSB7XG4gIGFscGhhID0gYWxwaGEgfHwgMS4wO1xuICByZXR1cm4gJ2hzbGEoJyArIFtodWUsIHNhdHVyYXRpb24gKyAnJScsIGxpZ2h0bmVzcyArICclJywgYWxwaGFdLmpvaW4oJywnKSArICcpJztcbn07XG5cbi8qKiAjIyMgYEJWRy5leHRyYWN0TnVtYmVyQXJyYXkoc3RyKWBcbiAgKiBSZXR1cm4gYW4gYXJyYXkgYFt4LCB5LCB6LCAuLi5dYCBmcm9tIGEgc3RyaW5nIGNvbnRhaW5pbmcgY29tbW9uLXNlcGFyYXRlZFxuICAqIG51bWJlcnMuXG4gICovXG5CVkcuZXh0cmFjdE51bWJlckFycmF5ID0gZnVuY3Rpb24gKHN0cikge1xuICByZXR1cm4gc3RyLm1hdGNoKC9cXGQqXFwuP1xcZCsvZykubWFwKE51bWJlcik7XG59O1xuXG4vKiogIyMgQ29udHJpYnV0ZSB0byB0aGlzIGxpYnJhcnlcbiogW01ha2UgYSBwdWxsIHJlcXVlc3RdKGh0dHBzOi8vZ2l0aHViLmNvbS9TcGF4ZS9CVkcuanMvcHVsbHMpIG9yXG4qIFtwb3N0IGFuIGlzc3VlXShodHRwczovL2dpdGh1Yi5jb20vU3BheGUvQlZHLmpzL2lzc3VlcykuIFNheSBoZWxsbyB0b1xuKiBjb250YWN0QHhhaXZlcmhvLmNvbS5cbiovXG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiLCJpbXBvcnQgQlZHIGZyb20gJy4vYnZnJztcblxudmFyIGJ2ZyA9IEJWRy5jcmVhdGUoJyN1bml2ZXJzZScpO1xuXG52YXIgc2l6ZSA9IDEyODtcbnZhciBwb3MgPSA0MDA7XG5cbnZhciBhbGJlZG8gPSBidmcuZWxsaXBzZShwb3MsIHBvcywgc2l6ZSwgc2l6ZSlcbiAgICAgICAgICAgICAgICAgLmZpbGwoNjQpO1xuXG52YXIgZGlmZnVzZSA9IGJ2Zy5lbGxpcHNlKHBvcywgcG9zLCBzaXplLCBzaXplKVxuICAgICAgICAgICAgICAgICAuZmlsbCgyNTUsIDI1NSwgMjU1LCAwLjQpXG4gICAgICAgICAgICAgICAgIC5ub1N0cm9rZSgpO1xuXG52YXIgc3BlY3VsYXIgPSBidmcuZWxsaXBzZShwb3MsIHBvcywgc2l6ZS84LCBzaXplLzgpXG4gICAgICAgICAgICAgICAgICAuZmlsbCgyNTUsIDI1NSwgMjU1LCAwLjUpXG4gICAgICAgICAgICAgICAgICAubm9TdHJva2UoKTtcblxudmFyIG91dGxpbmUgPSBidmcuZWxsaXBzZShwb3MsIHBvcywgc2l6ZSwgc2l6ZSlcbiAgICAgICAgICAgICAgICAgLmZpbGwoMCwgMCwgMCwgMClcbiAgICAgICAgICAgICAgICAgLnN0cm9rZSgzMilcbiAgICAgICAgICAgICAgICAgLnN0cm9rZVdpZHRoKDgpO1xuXG5idmcudGFnKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHZhciBteCA9IGV2ZW50LmNsaWVudFg7XG4gIHZhciBteSA9IGV2ZW50LmNsaWVudFk7XG4gIHZhciBhbmdsZSA9IE1hdGguYXRhbjIobXktcG9zLCBteC1wb3MpO1xuICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3cobXggLSBwb3MsIDIpICsgTWF0aC5wb3cobXkgLSBwb3MsIDIpKTtcbiAgZGlzdGFuY2UgPSBNYXRoLm1pbihkaXN0YW5jZSwgc2l6ZS8yKTtcbiAgaWYgKCFpc05hTihhbmdsZSkpIHtcbiAgICBkaWZmdXNlLmRhdGEoe1xuICAgICAgeDogTWF0aC5jb3MoYW5nbGUpICogZGlzdGFuY2UgKyBwb3MsXG4gICAgICB5OiBNYXRoLnNpbihhbmdsZSkgKiBkaXN0YW5jZSArIHBvcyxcbiAgICAgIHJ4OiBNYXRoLm1heChkaXN0YW5jZSwgc2l6ZSksXG4gICAgICByeTogTWF0aC5tYXgoZGlzdGFuY2UsIHNpemUpXG4gICAgfSk7XG4gICAgdmFyIGN4ID0gTWF0aC5jb3MoYW5nbGUpICogTWF0aC5taW4oTWF0aC5wb3coZGlzdGFuY2UsIDEuMSksIHNpemUvMyoyKSArIHBvcztcbiAgICB2YXIgY3kgPSBNYXRoLnNpbihhbmdsZSkgKiBNYXRoLm1pbihNYXRoLnBvdyhkaXN0YW5jZSwgMS4xKSwgc2l6ZS8zKjIpICsgcG9zO1xuICAgIHNwZWN1bGFyLmRhdGEoe1xuICAgICAgeDogY3gsXG4gICAgICB5OiBjeSxcbiAgICAgIHJ4OiBzaXplLzggKiAoc2l6ZS1kaXN0YW5jZSkvc2l6ZVxuICAgIH0pLnRyYW5zZm9ybSgncm90YXRlKCcgKyBbYW5nbGUgLyBNYXRoLlBJICogMTgwLCBjeCwgY3ldLmpvaW4oKSArICcpJyk7XG4gIH1cbn0pO1xuXG4vLyBSZW1vdmUgbG9hZGluZyBwbGFjZWhvbGRlclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmcnKS5yZW1vdmUoKTsiXX0=
