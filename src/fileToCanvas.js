
// takes an image file and returns a canvas with that picture on it
function fileToCanvas(file) {
    var canvas = document.createElement("canvas");
    var cx = canvas.getContext("2d");
    var reader = new FileReader();
    reader.addEventListener("load", function() {
         console.log("Step 2");
        var image = document.createElement("img");   // Step 2: create temporary img to fascilitate transfer to canvas
        image.addEventListener("load", function() {
            cx.canvas.width = image.width;
            cx.canvas.height = image.height;
             console.log("Step 4");
            cx.drawImage(image, 0, 0);               // Step 4: image is drawn to canvas
             console.log("Step 5");
            return canvas;                           // Step 5: return canvas with image loaded onto it
        });
         console.log("Step 3");
        image.src = reader.result;                   // Step 3: result from readAsDataURL is loaded onto the img
    });
    console.log("Step 1");
    reader.readAsDataURL(file);                      // Step 1: start here, read file
}
