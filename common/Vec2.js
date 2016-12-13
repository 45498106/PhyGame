
/**
 * Module exports.
 */

if(typeof module !== 'undefined')
    module.exports = Vec2;

function Vec2(x, y)
{
    this.x = x;
    this.y = y;
}

Vec2.prototype.Sub = function(vector)
{
    return new Vec2(this.x - vector.x, this.y - vector.y);
}

Vec2.prototype.SubSelf = function(vector)
{
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
}

Vec2.prototype.Add = function(vector)
{
    return new Vec2(this.x + vector.x, this.y + vector.y);
}

Vec2.prototype.AddSelf = function(vector)
{
    this.x += vector.x;
    this.y += vector.y;
    return this;
}

Vec2.prototype.Mul = function(scale)
{
    return new Vec2(this.x * scale, this.y * scale);
}

Vec2.prototype.MulSelf = function(scale)
{
    this.x *= scale;
    this.y *= scale;
    return this;
}

Vec2.prototype.Div = function(scale)
{
    var x, y;
    if (scale !== 0) {
        x = this.x / scale;
        y = this.y / scale;
    }
    else {
        x = 0;
        y = 0;
    }
    return new Vec2(x, y);
}

Vec2.prototype.DivSelf = function(scale)
{
    if (scale !== 0) {
        this.x /= scale;
        this.y /= scale;
    }
    else {
        this.x = 0;
        this.y = 0;
    }
    return this;
}

Vec2.prototype.Dot = function(vector)
{
    return this.x * vector.x + this.y * vector.y;
}

Vec2.prototype.Length = function()
{
    return Math.sqrt(this.x * this.x + this.y * this.y);
}

Vec2.prototype.Normalize = function()
{
    var len = this.Length();
    if(len > 0){
        var invLen = 1.0 / len;
        return new Vec2(this.x * invLen, this.y * invLen);
    }
    return new Vec2(this.x, this.y);
}

Vec2.prototype.NormalizeSelf = function()
{
    var len = this.Length();
    if(len > 0){
        var invLen = 1.0 / len;
        this.x *= invLen;
        this.y *= invLen;
    }
    return this;
}

Vec2.prototype.Rotation = function(angle)
{
    var radian = angle / 180 * Math.PI;
    var cosA = Math.cos(radian);
    var sinA = Math.sin(radian);
    var newX = cosA * this.x + sinA * this.y;
    var newY = -sinA * this.x + cosA * this.y;
    return new Vec2(newX, newY);
}

Vec2.prototype.RotationSelf = function(angle)
{
    var radian = angle / 180 * Math.PI;
    var cosA = Math.cos(radian);
    var sinA = Math.sin(radian);
    var newX = cosA * this.x + sinA * this.y;
    var newY = -sinA * this.x + cosA * this.y;
    this.x = newX; this.y = newY;
    return this;
}

Vec2.prototype.Lerp = function(vector, t)
{
    var x = (1.0 - t) * this.x + vector.x * t;
    var y = (1.0 - t) * this.y + vector.y * t;
    return new Vec2(x, y);
}

Vec2.prototype.Distance = function(vector)
{
    return this.Sub(vector).Length();
}
