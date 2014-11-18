// takes a canvas as argument
// provides access to pixel data with the option to change pixels

function Pixels(canvas) {
    
    var canvasWidth  = canvas.width;
    var canvasHeight = canvas.height;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    var data = imageData.data;

    this.width  = function() {
        return canvasWidth;
    };
    this.height = function() {
        return canvasHeight;
    };
}

Pixels.prototype = {
    constructor: Pixels
}

module.exports = Pixels;