
function Timer(name) {
    this.start = Date.now();
    this.name = name;
}

Timer.prototype = {
    constructor: Timer,

    logElapsedTime: function() {
        var end = Date.now();
        var elapsedTime = end - this.start;
        console.log(this.name + " took " + elapsedTime + " milliseconds. (" + (elapsedTime/1000) + " seconds).");
    }
}

module.exports = Timer;