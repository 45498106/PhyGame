
/**
 * Module exports.
 */

if(typeof module !== 'undefined')
    module.exports = Rect;

function Rect(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Rect.prototype.CenterPointAt = function(centreX, centreY)
{
    this.x = -this.width/2 + centreX;
    this.y = -this.height/2 + centreY ;
}

Rect.prototype.ContactPoint = function(point)
{
    return (point.x < this.x || 
            point.y < this.y ||
            point.x > this.x + this.width || 
            point.y > this.y + this.height);
}

Rect.prototype.IntersectRect = function(rect)
{
    var sL = this.x, sR = this.x + this.width, sT = this.y; sB = this.y + this.height;
    var dL = rect.x, dR = rect.x + rect.width, dT = rect.y; dB = rect.y + rect.height;
    
    if (dL < sR &&
        dR > sL && 
        dT < sB &&
        dB > sT) {
       
        var x = (sL > dL) ? sL : dL;
        var y = (sR < dR) ? sR : dR;
        var width = x + (sT > dT) ? sT : dT;
        var height = y + (sB < dB) ? sB : dB;
            
        return new Rect(x, y, width, height);
        
    } else {
        return null;
    }
}
