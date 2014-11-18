var Color = require('./Color.js');

// Represents a picture made up of pixels
// Provides access to individual pixels
// can output in canvass, img

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