
/**
 * Module exports.
 */

if(typeof module !== 'undefined')
    module.exports = AABB;

var Vec2 = require('./Vec2.js');
var Util = require('./Utility.js');

function AABB(min, max)
{
    this.min = min;
    this.max = max;
}

AABB.prototype.ContactPoint = function(point)
{
    return point.x < this.min.x || point.y < this.min.y ||
           point.x > this.max.x || point.y > this.max.y;
}

AABB.prototype.Clamp = function(point)
{
    return new Vec2(Util.Clamp(point.x, this.min.x, this.max.x),
                    Util.Clamp(point.y, this.min.y, this.max.y));
}
