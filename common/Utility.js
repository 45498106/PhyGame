
var Util = {};
Util.FindIndex = function(array, id)
{
    for( var i = 0; i < array.length; ++i) {
        if(array[i].id === id)
            return i;
    }
    return -1;
}
    
Util.Clamp = function(x, a, b)
{
    var nx = x;
    if (a > b) {
        var t = b;
        b = a;
        a = t;
    }
    
    if (nx < a) { nx = a; }
    if (nx > b) { nx = b; }
    
    return nx;
}

Util.RandomRange = function(a, b)
{
    if (a < b) {
        var t = b;
        b = a;
        a = t;
    }
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

Util.Degrees=function(radians) {
    return radians*(180/Math.PI);
};

Util.Radians=function(degrees) {
    return degrees/(180/Math.PI);
};

/**
 * Module exports.
 */

if(typeof module !== 'undefined')
    module.exports = Util;