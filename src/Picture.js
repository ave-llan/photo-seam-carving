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