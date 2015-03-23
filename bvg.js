/* globals define */
/** # BVG - Bindable Vector Graphics
  * **Real-time data-driven visualisation for the web.**
  *
  * Examples to come.
  *
  * *Bindable Vector Graphics* was born out of frustration for lack of a
  * middle level SVG library. [D3.js](http://d3js.org/) abstracts too much
  * logic, and [SVG.js](http://svgjs.com/) provides only low-level SVG drawing.
  * Bindable Vector Graphics offers SVG elements that change as the data change,
  * and gives you all the tools to control their look.
  */
define([], function () {

  // Factory methods
  var svgElements = {
    svg: ['xmlns:xlink', 'version', 'width', 'height'],
    g: ['transform'],
    rect: ['x', 'y', 'width', 'height']
  };
  var BVGIDCounter = 0;

  /** ## Module Functions */

  /** ### `BVG(svg, data, bind)`
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

  /** ### `BVG.create(htmlElement)`
    * Create a BVG container inside `htmlElement`.
    *
    * Return the BVG container object.
    *
    *  - `htmlElement`  : Either a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
    *                     or any [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).
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

  /** ## The BVG Object
    * BVGs are SVGs with extra superpowers. In addition to all the [SVG methods](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model#SVG_interfaces),
    * BVG has the following:
    */
  BVG.addUtilityMethods = function (bvg, data, bind) {

    /** ### `bvg.data()`
      * Get/set the `data` object in a BVG. There are four ways to use this
      * function.
      *
      * **`bvg.data()`**: Return `data` bound to the BVG.
      *
      * **`bvg.data(property)`**: Return `data[property]` from the BVG.
      *
      * **`bvg.data(objectToUpdate)`**: Update `data` with `objectToUpdate`,
      * adding and replacing any properties. Return `bvg` object reference.
      *
      * **`bvg.data(property, newValue)`**: Update `property` with `newValue`.
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

    bvg.stroke = function () {
      if (arguments.length === 0) {
        return bvg.getAttribute('stroke');
      } else if (arguments.length === 1) {
        bvg.setAttribute('stroke', BVG.rgba(arguments[0], true))
      }
    };
  };

  /*- Internal methods */

  /*- ### `BVG.factory(svg, attrs)`
    * Populate the library with functions to create a BVG.
    */
  BVG.factory = function (bvg, svg, attrs) {
    bvg[svg] = function () {
      var newBVG;
      if (arguments.length === 2 &&
          arguments[0] instanceof Object &&
          typeof arguments[1] === 'function') {
        newBVG = BVG(svg, arguments[0]. arguments[1]);
      } else {
        var data = {};
        var paranmeters = [];
        for (var i = 0; i < arguments.length; i++) {
          paranmeters.push(arguments[i]);
        }
        attrs.forEach(function (arg) {
          data[arg] = paranmeters.shift();
        });
        newBVG = BVG(svg, data, bvg.bindEqual);
      }
      if (bvg.isBVG)
        bvg.appendChild(newBVG);
      return newBVG;
    };
    bvg[svg + 'Array'] = function(data, bind) {
      return data.map(function (datum) {
        var newBVG = BVG[svg].apply(BVG[svg], datum);
        if (bvg.isBVG)
          bvg.appendChild(newBVG);
        return newBVG;
      });
    };
  };

  BVG.addFactoryMethods = function (bvg) {
    for (var tagName in svgElements) {
      BVG.factory(bvg, tagName, svgElements[tagName]);
    }
  };
  BVG.addFactoryMethods(BVG);

  /*- ### `BVG.bindEqual(svg, change)`
   *  Default callback function that assigns each data property to BVG data.
   */
  BVG.bindEqual = function (svg, change) {
    if (change.type === 'add' || change.type === 'update') {
      svg.setAttribute(change.name, change.object[change.name]);
    } else if (change.type === 'remove') {
      svg.removeAttribute(change.name);
    }
  };

  /*- ### `BVG.rgba(hex)`
   *  Converts #XXXXXX to rgba(r, g, b, a). Returns an array [r, g, b, 1].
   *
   *  if `css` is `true`, it returns `'rgba(r, g, b, a)'` instead.
   */
  BVG.rgba = function (hex, css) {
    var h = '';
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      for (var i = 0; i < hex.length; i++) {
        h += hex[i] + hex[i];
      }
    } else {
      h = hex;
    }
    if (h.length !== 6 && h.length !== 8) {
      throw new Error('hex (' + hex + ') is not a valid colour.');
    }

    var colour = [];
    for (var i = 0; i < h.length; i+=2) {
      colour.push(parseInt(h.substring(i, i+2), 16));
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