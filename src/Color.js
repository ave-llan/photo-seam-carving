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