(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// mutable data type Color

function Color(r, g, b, a) {
    if (arguments.length == 0)
        r = 0, g = 0, b = 0, a = 255;
    if (typeof a === "undefined")
        a = 255;
    this.red = r;
    this.green = g;
    this.blue = b;
    this.alpha = a;
}

Color.prototype = {
    constructor: Color,

    toString: function() {
        return "color{" + this.red + ", " + this.green + ", " + this.blue + "}";
    }
}

module.exports = Color;
},{}],2:[function(require,module,exports){
var Color = require('./Color.js');

// Represents a picture made up of pixels
// Provides access to individual pixels

// TODOs
// HTMLCanvasElement.toBlob() use this to output jpeg and png etc
// HTMLCanvasElement.toDataURL() to create html <img> 


/********************************************************************
* Picture(width, height) 
*   Initializes a new width-by-height Picture.
*   width and height must be positive integers
*
* Picture(canvas)
*   Initializes a new Picture from an existing canvas 
*   (creates a deep copy of the reference canvas)
*
* Picture.width()
*   returns width in pixels
*
* Picture.height()
*   returns height in pixels
*
* Picture.at(x, y)
*   returns the Color of pixel at position x, y
*
* Picture.set(x, y, Color)
*   sets pixel x, y to Color
*
* Picture.toCanvas()
*   returns a new canvas of picture in current state
*
* Picture.removeColumns(x[, howMany])
*   removes howMany columns starting at index x. howMany defaults to 1.
*
********************************************************************/

function Picture() {
    "use strict";
    var canvas, cx, canvasWidth, canvasHeight, imageData, data, updated, pixels;
    if (arguments.length == 0 || arguments.length > 2)
        throw new Error("Invalid Arguments length.  arguments.length = " + arguments.length);
    if (arguments.length == 2) {     // arguments: Number width, Number height
        var width  = arguments[0];
        var height = arguments[1];
        // check that arguments are positve integers
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0 || width != parseInt(width) || height != parseInt(height))
            throw new Error("Arguments are not positive integers:\nwidth = " + width + " height = " + height);
        canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        cx = canvas.getContext("2d");
    }
    else {  // arguments.length = 1
        var referenceCanvas = arguments[0];
        if (!(referenceCanvas instanceof HTMLCanvasElement))
            throw new Error("Argument is not a HTMLCanvasElement. Argument is instanceof " + referenceCanvas.constructor.name);
        if (referenceCanvas.width == 0 || referenceCanvas.height == 0)
            throw new Error("Canvas given as argument must have width and height greater than 0. Width = " + 
                            referenceCanvas.width + " height = " + referenceCanvas.height);
        // create a deep copy of canvas
        canvas = document.createElement("canvas");
        cx = canvas.getContext("2d");
        canvas.width = referenceCanvas.width;
        canvas.height = referenceCanvas.height;
        cx.drawImage(referenceCanvas, 0, 0);
    }

    canvasWidth  = canvas.width;
    canvasHeight = canvas.height;
    imageData = cx.getImageData(0, 0, canvasWidth, canvasHeight);
    data = imageData.data;
    pixels = dataToPixels(data);
    updated = true;        // true when data matches pixels

    this.width  = function() {
        return canvasWidth;
    };
    this.height = function() {
        return canvasHeight;
    };
    this.at = function(x, y) {
        return pixels[y * canvasWidth + x];
    };
    this.set = function (x, y, color) {
        if (updated)
            updated = false;
        pixels[y * canvasWidth + x] = color;
    };
    this.removeColumns = function(x, howMany) {
        if (typeof howMany === "undefined")
            howMany = 1;
        if (x < 0 || x + howMany > canvasWidth)
            throw new Error("Index out of bounds.  Picture is " + canvasWidth + " wide. Requested to remove " + howMany +
            " columns starting at index " + x + ".");
        if (updated)
            updated = false;
        for (var y = canvasHeight - 1; y >= 0; y--) {
            pixels.splice(y * canvasWidth + x, howMany);
        }
        canvasWidth -= howMany;
    }
    this.removeRows = function(y, howMany) {
        if (typeof howMany === "undefined")
            howMany = 1;
        if (y < 0 || y + howMany > canvasHeight)
            throw new Error("Index out of bounds.  Picture has height of " + canvasHeight + ". Requested to remove " + howMany +
            " rows starting at index " + y + ".");
        if (updated)
            updated = false;
        pixels.splice(y * canvasWidth, canvasWidth * howMany);
        canvasHeight -= howMany;
    }

    this.removeVerticalSeam = function(seam) {
        if (seam.length != canvasHeight)
            throw new Error("Invalid vertical seam length. Picture height = " + canvasHeight + " and Seam.length = " + seam.length);
        if (updated)
            updated = false;
        for (var y = canvasHeight - 1; y >= 0; y--) {
            pixels.splice(y * canvasWidth + seam[y], 1);
        }
        canvasWidth--;
        console.log("Seam removed!");
    },

    this.toCanvas = function() {
        if (updated)
            return canvas;
        else {
            canvas = this.buildNewCanvas(canvasWidth, canvasHeight, pixels);
            updated = true;
            return canvas;
        }
    };
}

function dataToPixels(data) {
    var pixels = [];
    var length = data.length;
    var index = 0;
    for (var i = 0; i < length; i += 4) {
        pixels.push(new Color(data[i], data[i+1], data[i+2], data[i+3]));
    }
    return pixels;
}

Picture.prototype = {
    constructor: Picture,

    buildNewCanvas: function (w, h, pixels) {
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var cx = canvas.getContext("2d");
        var imageData = cx.getImageData(0, 0, w, h);
        var data = imageData.data;
        var length = pixels.length;
        for (var i = 0; i < length; i++) {
            var index = i * 4;
            var color = pixels[i];
            data[index]     = color.red;
            data[index + 1] = color.green;
            data[index + 2] = color.blue;
            data[index + 3] = color.alpha;
        }
        cx.putImageData(imageData, 0, 0);
        console.log(canvas);
        return canvas;
    }
}

module.exports = Picture;
},{"./Color.js":1}],3:[function(require,module,exports){
var Picture = require('./Picture.js');

function SeamCarver(pic) {
    this.picture = pic;
    this.energy = this.buildEnergy();
}

SeamCarver.prototype = {
    constructor: SeamCarver,

    width: function() {
        return this.picture.width();
    },

    height: function() {
        return this.picture.height();
    },

    energyAt: function(x, y) {
        return this.energy[y * this.width() + x];
    },

    buildEnergy: function() {
        var energy = [];
        var W = this.width();
        var H = this.height();
        for (var y = 0; y < H; y++) {
            for (var x = 0; x < W; x++) {
                energy[y * W + x] = this.calculateEnergyAt(x, y);
            }
        }
        return energy;
    },

    // to find energy of a pixel, find the sum of the square of the differences between red, green, and blue components of neighbor pixels
    // calculate the difference left to right and then above to below and add the results
    calculateEnergyAt: function(x, y) {
        // border pixels receive max energy 255^2 + 255^2 + 255^2 = 195075.
        if (x == 0 || y == 0 || x == this.width() - 1 || y == this.height() - 1)
            return 195075;
        var left  = this.picture.at(x - 1, y);
        var right = this.picture.at(x + 1, y);
        var above = this.picture.at(x, y - 1);
        var below = this.picture.at(x, y + 1);
        var xGradient = (left.red   - right.red)    * (left.red   - right.red) + 
                        (left.green - right.green)  * (left.green - right.green) + 
                        (left.blue  - right.blue)   * (left.blue  - right.blue);
        var yGradient = (above.red   - below.red)   * (above.red   - below.red) +
                        (above.green - below.green) * (above.green - below.green) +
                        (above.blue  - below.blue)  * (above.blue  - below.blue);
        return xGradient + yGradient;
    },

    removeVerticalSeam: function() {
        var verticalSeam = this.findVerticalSeam();
        this.picture.removeVerticalSeam(verticalSeam);
        // TODO write function to update energy of affected instead of all pixels
        this.energy = this.buildEnergy();
    },

    findVerticalSeam: function() {
        var distTo = [];       // value represents the total energy needed to get to this pixel
        var edgeTo = [];       // value represents previous x index on shortest path to this value.
        var W = this.width();
        var H = this.height();

        // initialize first row of distTo to 0
        distTo[0] = [];
        edgeTo[0] = [];
        for (var x = 0; x < W; x++) {
            distTo[0][x] = 0;
            edgeTo[0][x] = null;
        }

        // initialize all other rows to infinity
        for (var y = 1; y < H; y++) {
            distTo[y] = [];
            edgeTo[y] = [];
            for (var x = 0; x < W; x++) {
                distTo[y][x] = Infinity; 
                edgeTo[y][x] = null;
            }
        }

        // find shortest paths from top to bottom
        for (var y = 0; y < H - 1; y++) {
            for (var x = 0; x < W; x++) {
                // relax children
                for (var i = -1; i <= 1; i++) {  // look at three pixels below this pixel
                    if (x + i < 0 || x + i >= W) // if index would be out of bounds, continue
                        continue;
                    if (distTo[y + 1][x + i] > distTo[y][x] + this.energyAt(x, y)) {  // if true, a lower energy path has been found
                        edgeTo[y + 1][x + i] = x;
                        distTo[y + 1][x + i] = distTo[y][x] + this.energyAt(x, y);
                    }
                }
            }
        }

        // find the shortest path
        var endPoint = 0;
        for (var i = 1; i < W; i++) {
            if (distTo[H - 1][i] < distTo[H - 1][endPoint])
                endPoint = i;
        }
        var verticalSeam = [endPoint];
        for (var h = H - 2; h >= 0; h--) {
            verticalSeam.unshift(edgeTo[h + 1][verticalSeam[0]]);  // find previous pixel in edgeTo
        }
        return verticalSeam;
    },

    toCanvas: function() {
        return this.picture.toCanvas();
    }

}





module.exports = SeamCarver;
},{"./Picture.js":2}],4:[function(require,module,exports){
var Picture = require('./Picture.js');
var Color = require('./Color.js');
var SeamCarver = require('./SeamCarver.js');

/***********************************************************
** Set up a file uploader and wait for user to
** upload an image.
***********************************************************/

// expects a div element ie: <div id="seamCarver"></div>
var seamCarver = document.getElementById("seamCarver");

// creates and displays an input field to upload images
var fileUploader = elt("input", {type: "file", id: "input"});
fileUploader.addEventListener("change", handleFiles); 
seamCarver.appendChild(fileUploader);

// canvas will hold the picture once it is loaded
var canvas;
var cx;
var imageData;
var pixelData;
var picture;
var seamCarver;

function handleFiles() {
    var fileList = this.files;
    var file = fileList[0];
      console.log("You chose", file.name);
      if (file.type)
        console.log("It has type", file.type);
    var imageType = /image.*/;

    if (file.type.match(imageType)) {
        // creates a preview div element within seamCarver.  Modify display settings with CSS #preview {}
        var preview = elt("div", {id: "preview"});
        seamCarver.appendChild(preview);

        // displays img in preview.  Modify display settings with CSS #preview img {}
        var previewImage = document.createElement("img");
        // creates another img to hold full pixel data
        var img = document.createElement("img");
        previewImage.file = file;
        img.file = file;
        preview.appendChild(previewImage); // Assuming that "preview" is a the div output where the content will be displayed.

        // creates initial canvas for picture modifications
        canvas = elt("canvas");
        cx = canvas.getContext("2d");

        var reader = new FileReader();
        reader.onloadend = function () {
            previewImage.src = reader.result;
            img.src = reader.result;
            console.log(" Width = " + img.width);
            console.log("Height = " + img.height);
            // put image on 
            cx.canvas.width = img.width;
            cx.canvas.height = img.height;
            cx.drawImage(img, 0, 0);
            // display only for bug checking

            // preview.appendChild(canvas);
            picture = new Picture(canvas); //!!! Here is the Picture test
            seamCarver = new SeamCarver(picture);
            // console.log("Energy for picture: ");
            // console.log(seamCarver.energy);
            // console.log("Vertical seam: ");
            // console.log(seamCarver.findVerticalSeam());
            carveToSquare();
        };
        reader.readAsDataURL(file);
    }
}

function makePictureBlue() {
    var blue = new Color(0, 247, 255);
    var W = picture.width();
    var H = picture.height();
    for (var w = 0; w < W; w++) {
        for (var h = 0; h < H; h++) {
            picture.set(w, h, blue);
        }
    }
    canvas = picture.toCanvas();
    preview.appendChild(canvas);
    var colorCheck = picture.at(2,7);
    console.log("Color at 2,7 is " + colorCheck);
    console.log("alpha = " + colorCheck.alpha);
}

function cropToSquare() {
    if (picture.width() > picture.height()) {
        console.log("original width: " + picture.width());
        var columnsToRemove = picture.width() - picture.height();
        picture.removeColumns(picture.height(), columnsToRemove);
        canvas = picture.toCanvas();
        preview.appendChild(canvas);
        console.log(" cropped width: " + picture.width());
    }
    else {
        console.log("original height: " + picture.height());
        var rowsToRemove = picture.height() - picture.width();
        picture.removeRows(picture.width(), rowsToRemove);
        canvas = picture.toCanvas();
        preview.appendChild(canvas);
        console.log(" cropped height: " + picture.height());
    }
}

function carveToSquare() {
    //logEnergy(seamCarver);
    while (seamCarver.width() > seamCarver.height()) {
        seamCarver.removeVerticalSeam();
    }
    //seamCarver.removeVerticalSeam();
    //console.log("\n...removing one vertical seam...");
    //logEnergy(seamCarver);
    var carvedCanvas = seamCarver.toCanvas();
    preview.appendChild(carvedCanvas);
}

function logEnergy(carver) {
    var W = seamCarver.width();
    var H = seamCarver.height();
    var energyOutput = "PIXEL ENERGY:";
    for (var y = 0; y < H; y++) {
        energyOutput += "\n";
        for (var x = 0; x < W; x++) {
            var energyCell = "" + carver.energyAt(x,y) + "  ";
            while (energyCell.length < 8)
                energyCell += " ";
            energyOutput += energyCell;
        }
    }
    console.log(energyOutput);
}


// extracts pixel data from canvas
function getImageData() {
    imageData = cx.getImageData(0, 0, cx.canvas.width, cx.canvas.height);
    pixelData = imageData.data;   
    console.log("Data = \n " + pixelData);
    logPixelData();
}

function logPixelData() {
    for (var i = 0; i < 20000; i++) {
        console.log("data[" + i + "] = " + pixelData[i]);
        pixelData[i] = 255;
    }
    cx.putImageData(imageData, 0, 0);
}



// helper function that creates a DOM element and assigns attributes
function elt(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    for (var attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}
},{"./Color.js":1,"./Picture.js":2,"./SeamCarver.js":3}]},{},[4]);
