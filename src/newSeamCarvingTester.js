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
// var Timer = require('./Timer.js');

// Represents a picture made up of pixels
// Provides access to individual pixels
// Constructor options: 
//          Picture(width, height)
//          Picture(canvas)
//          Picture(Uint8ClampedArray)

function Picture() {
    "use strict";
    var width, height, data;

    if (arguments.length == 0 || arguments.length > 3)
        throw new Error("Invalid Arguments length.  arguments.length = " + arguments.length);
    
    // arguments: data, width, height
    if (arguments.length == 3) {
        data = arguments[0];
        width = arguments[1];
        height = arguments[2];
        if (!(data instanceof Uint8ClampedArray)) {
            throw new Error("Argument is not a Uint8ClampedArray. Argument is instanceof " + data.constructor.name);
        }
        checkWidthAndHeight(width, height); 
    }

    // arguments:  width,  height
    else if (arguments.length == 2) {     
        width  = arguments[0];
        height = arguments[1];
        // check that arguments are positve integers
        checkWidthAndHeight(width, height);
        data = new Uint8ClampedArray(width * height * 4);
    }

    else {  // arguments.length = 1
        var referenceCanvas = arguments[0];
        if (!(referenceCanvas instanceof HTMLCanvasElement))
            throw new Error("Argument is not a HTMLCanvasElement. Argument is instanceof " + referenceCanvas.constructor.name);
        if (referenceCanvas.width == 0 || referenceCanvas.height == 0)
            throw new Error("Canvas given as argument must have width and height greater than 0. Width = " + 
                            referenceCanvas.width + " height = " + referenceCanvas.height);
        // create a deep copy of canvas
        width = referenceCanvas.width;
        height = referenceCanvas.height;
        var cx = referenceCanvas.getContext("2d");
        var imageData = cx.getImageData(0, 0, width, height);
        data = imageData.data;
    }

    this.width  = function() {
        return width;
    };

    this.height = function() {
        return height;
    };

    // returns index number in data for this pixels first byte (red)
    this.getDataIndex = function(x, y) {
        return y * width * 4 + x * 4; 
    }

    // returns the Color of the pixel located at x,y
    this.at = function(x, y) {
        var i = this.getDataIndex(x, y);
        return new Color(data[i], data[i+1], data[i+2], data[i+3]);   // access Red, Green, Blue, Alpha  
    };

    // sets the pixel at x, y to be the given color
    this.set = function (x, y, color) {
        var i = this.getDataIndex(x, y);
        data[i]     = color.red;
        data[i + 1] = color.green;
        data[i + 2] = color.blue;
        data[i + 3] = color.alpha;
    };

    // returns a Uint8ClampedArray representing pixel data (RGBA)
    this.data = function() {
        return data;
    };

    this.toCanvas = function() {
        var newData = new ImageData(data, width, height);
        var newCanvas = document.createElement("canvas");
        newCanvas.width = width;
        newCanvas.height = height;
        var cx = newCanvas.getContext("2d");
        //var imageData = cx.getImageData(0, 0, w, h);
        //imageData.data = this.data();
        cx.putImageData(newData, 0, 0);
        return newCanvas;
    };
}

// check that width and height arguments are positive integers
function checkWidthAndHeight(width, height) {
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0 || width != parseInt(width) || height != parseInt(height))
            throw new Error("Arguments are not positive integers:\nwidth = " + width + " height = " + height);
}


function ImageData() {
    var i = 0;
    if(arguments[0] instanceof Uint8ClampedArray) {
        var data = arguments[i++];
    }
    var width = arguments[i++];
    var height = arguments[i];      

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(width, height);
    if(data) imageData.data.set(data);
    return imageData;
}

module.exports = Picture;
},{"./Color.js":1}],3:[function(require,module,exports){
var Picture = require('./Picture.js');
var Timer   = require('./Timer.js');

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
        var W = this.width();
        var H = this.height();
        var energy = new Array(W * H);
        var index = 0;
        for (var y = 0; y < H; y++) {
            for (var x = 0; x < W; x++) {
                energy[index++] = this.calculateEnergyAt(x, y);
            }
        }
        return energy;
    },

    // to find energy of a pixel, find the sum of the square of the differences between red, green, and blue components of neighbor pixels
    // calculate the difference left to right and then above to below
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
        console.log("\n");
        var timer = new Timer("1.         findVerticalSeam");
        var verticalSeam = this.findVerticalSeam();
        timer.logElapsedTime();
        
        timer = new Timer("3.              carveColumn");
        this.carveColumn(verticalSeam);
        timer.logElapsedTime();

        timer = new Timer("2. updateVerticalSeamEnergy");
        this.updateVerticalSeamEnergy(verticalSeam);   // must call this BEFORE removing seam or width will be one too short
        timer.logElapsedTime();

        /*
        timer = new Timer("4.              buildEnergy");
        this.energy = this.buildEnergy();
        timer.logElapsedTime();
        */
        console.log("\n");
    },

    updateVerticalSeamEnergy: function(seam) {
        var W = this.width() + 1;         // picture has already been carved and this needs the old width
        var H = this.height();
        var energy = this.energy;
        var newEnergy = new Array((W - 1) * H);
        var index = 0;
        for (var y = 0; y < H; y++) {
            for (var x = 0; x < W; x++) {
                if (seam[y] != x) {
                    newEnergy[index++] = energy[y * W + x];
                }
            }
        }
        energy = newEnergy;
        W--;                              // width is now correct
        for (var y = 1; y < H - 1; y++) { // skip first and last rows because they will not change
            if (seam[y] - 1 >= 0) {       // if in bounds, update energy on the left side of the seam
                energy[y * W + seam[y] - 1] = this.calculateEnergyAt(seam[y] - 1, y);
            }
            if (seam[y] < W) {            // if in bounds, update energy on the right side of the seam
                energy[y * W + seam[y]] = this.calculateEnergyAt(seam[y], y);
            }
        }
        this.energy = energy;
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
    },

    // returns a new picture object with the given vertical seam removed
    carveColumn: function(seam) {
        if (seam.length != this.height())
            throw new Error("Invalid vertical seam length. Picture height = " + this.height() + " and Seam.length = " + seam.length);
        var W = this.width();
        var H = this.height();
        var data = this.picture.data();
        var newData = new Uint8ClampedArray((W - 1) * H * 4);

        // copy data (minus seam) to newData
        var newIndex = 0;
        for (var y = 0; y < H; y++) {
            for (var x = 0; x < W; x++) {
                if (seam[y] != x) {
                    var oldIndex = y * W * 4 + x * 4
                    newData[newIndex++] = data[oldIndex++];    // Red
                    newData[newIndex++] = data[oldIndex++];    // Green
                    newData[newIndex++] = data[oldIndex++];    // Blue
                    newData[newIndex++] = data[oldIndex];      // alpha
                }
            }
        }
        this.picture = new Picture(newData, W - 1, H);        
    }

}

module.exports = SeamCarver;
},{"./Picture.js":2,"./Timer.js":4}],4:[function(require,module,exports){

function Timer(name) {
    this.start = Date.now();
    this.name = name;
}

Timer.prototype = {
    constructor: Timer,

    logElapsedTime: function() {
        var end = Date.now();
        var elapsedTime = end - this.start;
        console.log(this.name + " took " + elapsedTime + " milliseconds. (" + (elapsedTime/1000) + " seconds).");
    }
}

module.exports = Timer;
},{}],5:[function(require,module,exports){
var Picture = require('./Picture.js');
var Color = require('./Color.js');
var SeamCarver = require('./SeamCarver.js');
var Timer = require('./Timer.js');

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
            // makePictureBlue();
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
    newCanvas = picture.toCanvas();
    preview.appendChild(newCanvas);
    console.log("newCanvas width  = " + newCanvas.width);
    console.log("newCanvas height = " + newCanvas.height);
    var data = picture.data();
    for (var i = 0; i < data.length; i++) {
        data[i++] = 94;
        data[i++] = 133;
        data[i++] = 72;
        data[i]   = 255;
    }
    var dataPicture = new Picture(data, W, H);
    newestCanvas = dataPicture.toCanvas();
    preview.appendChild(newestCanvas);
    console.log("newestCanvas width  = " + newestCanvas.width);
    console.log("newestCanvas height = " + newestCanvas.height);


}

function carveToSquare() {
    //logEnergy(seamCarver);
    var totalTimer = new Timer("\ncarveToSquare");
    while (seamCarver.width() > seamCarver.height()) {
        console.log("____________");
        var timer = new Timer("Whole seam removal operation");
        seamCarver.removeVerticalSeam();
        timer.logElapsedTime();
        console.log("____________\n\n\n");
    }
    totalTimer.logElapsedTime();
    //seamCarver.removeVerticalSeam();
    //console.log("\n...removing one vertical seam...");
    //logEnergy(seamCarver);
    var carvedCanvas = seamCarver.toCanvas();
    preview.appendChild(carvedCanvas);
}

/*
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
*/


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
},{"./Color.js":1,"./Picture.js":2,"./SeamCarver.js":3,"./Timer.js":4}]},{},[5]);
