// 相机跟随
function CameraFllow()
{
    this.attachObject =  undefined;
}

CameraFllow.prototype.Init = function(camera, bound)
{
    this._camera = camera;
    this._bound = bound;
}

CameraFllow.prototype.Attach = function(object, offset, damping)
{
    this._attachObject = object;
    this._offset = offset;
    this._offset.x = Math.abs(this._offset.x);
    this._offset.y = Math.abs(this._offset.x);
    this._damping = damping || 0.04;
}

CameraFllow.prototype.Detach = function()
{
    this._attachObject =  undefined;
}

CameraFllow.prototype.MoveTo = function(dest, time, callback)
{
    if (typeof this.attachObject !== 'undefined')
    {
        alert("already attach object!");
        return;
    }
    
    var offset = dest.Sub(new Vec2(this._camera.x, this._camera.y));
    this.MoveBy(offset, time, callback);
}

CameraFllow.prototype.MoveBy = function(offset, time, callback)
{
    if (typeof this.attachObject !== 'undefined')
    {
        alert("already attach object!");
        return;
    }
    
    if (offset.x === 0 && offset.y === 0)
        return;
        
    if (time <= 0.01) {
        this._camera.x += offset.x;
        this._camera.y += offset.y;
    }else {
        this._animationTime = time;
        this._remainTime = time;
        this._cameraOldPosition = new Vec2(this._camera.x, this._camera.y);
        this._cameraDestPosition = this._cameraOldPosition.Add(offset);
        this._callback = callback;
    }
}

CameraFllow.prototype.Update = function(dt)
{
    if (this._attachObject) {
        this._attachObject.position 
           
        var delta = this._attachObject.position.Sub(new Vec2(this._camera.x, this._camera.y));       
        if (Math.abs(delta.x) < 0.5 && Math.abs(delta.y) < 0.5) { return; }
        
        if (this._offset.x < Math.abs(delta.x)){
            var damping = this._damping;
            if (delta.x < 0){
                damping *= -1.0;
            }
            delta.x = (Math.abs(delta.x) - this._offset.x) * damping;
        }
        
        if (this._offset.y < Math.abs(delta.y)){
            var damping = this._damping;
            if (delta.y < 0){
                damping *= -1.0;
            }
            delta.y = (Math.abs(delta.y) - this._offset.y) * damping;
        }
        
        this._camera.x += delta.x;
        this._camera.y += delta.y;
        
        this.ClampBound();
    }
    else{
        
        if (this._remainTime > 0)
        {
            this._remainTime -= dt;
            
            var cubicEaseOut = function(t) {
                t = t - 1;
                return t * t * t + 1;
            }

            var t = 1.0 - (this._remainTime / this._animationTime);
            t = cubicEaseOut(t);
            
            var a = this._cameraOldPosition;
            var b = this._cameraDestPosition;
            var c = a.Add(b.Sub(a).Mul(t));

            this._camera.x = c.x;
            this._camera.y = c.y;
            
            this.ClampBound();
            
            if (this._remainTime <= 0){
                this._camera.x = this._cameraDestPosition.x;
                this._camera.y = this._cameraDestPosition.y;
                
                this.ClampBound();
                
                if(this._callback) {
                    this._callback();
                    this._callback = undefined;
                }
            }
        }
    }
}


CameraFllow.prototype.ClampBound = function()
{
    if(this._bound) { 
        var p = this._bound.Clamp(new Vec2(this._camera.x, this._camera.y)); 
        this._camera.x = p.x;
        this._camera.y = p.y;
    }
}