
// takes an image file and returns a canvas with that picture on it
function fileToCanvas(file) {
    var canvas = document.createElement("canvas");
    var cx = canvas.getContext("2d");
    var reader = new FileReader();
    reader.addEventListener("load", function() {
        var image = document.createElement("img");   // Step 2: create temporary img to fascilitate transfer to canvas
        image.addEventListener("load", function() {
            cx.canvas.width = image.width;
            cx.canvas.height = image.height;
            cx.drawImage(image, 0, 0);               // Step 4: image is drawn to canvas
            return canvas;                           // Step 5: return canvas with image loaded onto it
        });
        image.src = reader.result;                   // Step 3: result from readAsDataURL is loaded onto the img
    });
    reader.readAsDataURL(file);                      // Step 1: start here, read file
}
