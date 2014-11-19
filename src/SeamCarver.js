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
        this.buildEnergy();
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