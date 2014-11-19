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
            getImageData();
        };
        reader.readAsDataURL(file);
    }
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


