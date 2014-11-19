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