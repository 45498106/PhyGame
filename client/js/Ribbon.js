
function Ribbon()
{
    this.partLife = 2.0;
    this.points = [];
    this.End();
}

Ribbon.prototype.Begin = function(target, samplingInterval, width)
{
    this.begun = true;
    this.target = target;
    this.samplingInterval = samplingInterval || 0.1;
    this.width = width || 6;
    var data = { 'x' : this.target.position.x, 'y' : this.target.position.y, 'life' : this.partLife, 'head' : true };
    this.points.push(data); 
}

Ribbon.prototype.IsBegin = function(target, samplingInterval, width)
{
    return this.begun; 
}

Ribbon.prototype.Update = function(dt)
{
    if (this.target !== null && this.begun === true) {
        this.time += dt;
        if (this.time > this.samplingInterval) {
            var data = { 'x' : this.target.position.x, 'y' : this.target.position.y, 
                         'life' : (this.points.length < 30) ? this.partLife : this.samplingInterval };
            this.points.push(data);            
            this.time -= this.samplingInterval;
        }
    }
    
    for (var i = this.points.length - 1; i >= 0; --i) {
        this.points[i].life -= dt;
        if (this.points[i].life < 0) {
           this.points.splice(i, 1);
        }
    }
}

function LeftOrRight(a, b) {
    var dot = a.x*-b.y + a.y*b.x;
    if(dot > 0)
        return -1;
    else if(dot < 0)
        return 1;
    else
        return 0;
}

Ribbon.prototype.Draw = function(ctx) 
{
    if (this.points.length > 1) {
        var p1,p2,x,y,a,b;
        ctx.save();
        ctx.lineWidth = this.width;
        var side = new Vec2(0,0);
        var first = new Vec2(0,0);
        for (var i = this.points.length - 1; i > 0; --i) {
            p1 = this.points[i];
            p2 = this.points[i-1];
            if (this.points[i].head === true) {
                first.x = first.y = 0;
                continue;
            }
            
            side.x = x = p1.x - p2.x;
            side.y = y = p1.y - p2.y;
            if (first.x !== side.x || first.y !== side.y)
            {
                // 向外的车轮Ribbon会比较长.这里用a,b来控制.
                var f = LeftOrRight(first, side);
                if (f === -1)
                    a = 1, b = 0;
                else if(f === 1)
                    a = 0, b = 1;
                else
                    a = b = 0;
            }
            side.x = y;
            side.y = x;
            side.NormalizeSelf();
            side.MulSelf(12);
            ctx.beginPath();
            ctx.globalAlpha = (this.points[i].life / this.partLife);
            ctx.moveTo(p1.x + side.x, p1.y - side.y);
            ctx.lineTo(p2.x + side.x - a*side.y/3, p2.y - side.y - a*side.x/3);
            ctx.moveTo(p1.x - side.x, p1.y + side.y);
            ctx.lineTo(p2.x - side.x - b*side.y/3, p2.y + side.y - b*side.x/3);
            ctx.closePath();
            ctx.stroke();
            first.x = x;
            first.y = y;
        }

        ctx.restore();
    }
    
}

Ribbon.prototype.End = function()
{
    this.begun = false;
    this.target = null;
    this.time = 0;
}

