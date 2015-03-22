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

  var svgElements = {
    svg: ['xmlns:xlink', 'version', 'width', 'height'],
    g: ['transform'],
    rect: ['x', 'y', 'width', 'height']
  };
  var BVGIDCounter = 0;

  var BVG = function (svg, data, bind) {
    if (typeof svg === 'string')
      svg = document.createElementNS('http://www.w3.org/2000/svg', svg);
    if (!(svg instanceof SVGElement))
      throw new TypeError('svg (' + svg + ') must be SVG tag name or element.');

    var bvg = svg;
    bvg.isBVG = true;
    bvg.bind = bind;
    BVG.addFactoryMethods(bvg);

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

    return bvg;
  };

  BVG.create = function (htmlElement) {
    if (typeof htmlElement === 'string')
      htmlElement = document.querySelector(htmlElement);
    if (!(htmlElement instanceof HTMLElement))
      throw new TypeError('htmlElement (' + htmlElement + ') was not found.');

    var svg = BVG.svg('http://www.w3.org/1999/xlink',
                      1.1,
                      '100%',
                      '100%');
    htmlElement.appendChild(svg);
    return svg;
  };

  /** ### BVG.factory(svg, attrs)
    *
    * Populate the library with functions to create a BVG.
    *
    * This allows name checking for functions since calling an undefined
    * function would fail.
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

  BVG.bindEqual = function (svg, change) {
    if (change.type === 'add' || change.type === 'update') {
      svg.setAttribute(change.name, change.object[change.name]);
    } else if (change.type === 'remove') {
      svg.removeAttribute(change.name);
    }
  };

  return BVG;
});