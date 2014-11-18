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
        console.log("Building new canvas!");
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
        //console.log(imageData);
        return canvas;
    }
}

module.exports = Picture;
},{"./Color.js":1}],3:[function(require,module,exports){
var Picture = require('./Picture.js');
var Color = require('./Color.js');

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

            preview.appendChild(canvas);
            picture = new Picture(canvas); //!!! Here is the Picture test
            makePictureBlue();
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
},{"./Color.js":1,"./Picture.js":2}]},{},[3]);
