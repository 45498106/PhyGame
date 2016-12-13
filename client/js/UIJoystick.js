// ingame uijoystick
function UIJoystick()
{
    this.spriteBg = new Sprite();
    this.spriteBg.image = engine.core.Resource.GetImage("./images/Joystick_bg.png");
    this.spriteBtn = new Sprite();
    this.spriteBtn.image = engine.core.Resource.GetImage("./images/Joystick_bt.png");
    
    this.touched = false;
    this.touchedKey = null;
    this.direction = "none";
    this.dirVector = new Vec2(0,0);
    this.dirNumber = 16;
}

// dir 16
var cos11dot25 = 0.98078    // cos (11.25')
var cos33dot75 = 0.83146    // cos (33.75')
var cos56dot25 = 0.55557    // cos (56.25')
var cos78dot75 = 0.19509    // cos (78.75')
var cos101dot25 = -0.19509    // cos (101.25')
var cos123dot75 = -0.55557    // cos (123.75')
var cos146dot25 = -0.83146    // cos (146.25')
var cos168dot75 = -0.98078    // cos (168.75')
// dir 8
var cos22dot5 = 0.92387     // cos( 22.5')
var cos67dot5 = 0.38268      // cos( 67.5')
var cos112dot5 = -0.38268    // cos(112.5')
var cos157dot5 = -0.92387    // cos(157.5')

UIJoystick.prototype.Update = function(dt)
{
    var release = true;
    var touches = Input.GetTouches();
    for (var key in touches){
        if(touches[key]) {
            if (this.touched === false) {
                var touchX = touches[key].pageX / engine.canvasScaleX;
                var touchY = touches[key].pageY / engine.canvasScaleY;
                this.touched = true;
                this.touchedKey = key;
                this.spriteBg.x = touchX;
                this.spriteBg.y = touchY;
                this.spriteBtn.x = touchX;
                this.spriteBtn.y = touchY;
                this.touched = true; 
                release = false; 
                break;
            
            }else {
                if (key === this.touchedKey) {
                    var touchX = touches[key].pageX / engine.canvasScaleX;
                    var touchY = touches[key].pageY / engine.canvasScaleY;
                    
                    var dir = new Vec2(touchX - this.spriteBg.x, touchY - this.spriteBg.y);
                    var length = dir.Length();
                    if( length < 40 ) {
                        this.spriteBtn.x = touchX;
                        this.spriteBtn.y = touchY;
                        dir.NormalizeSelf();
                    }
                    else {
                        dir.NormalizeSelf();
                        this.spriteBtn.x = this.spriteBg.x + dir.x * 40;
                        this.spriteBtn.y = this.spriteBg.y + dir.y * 40;
                    }
                    
                    this.dirVector = dir;
                    if (length < 5) {
                        this.direction = "none";
                    }
                    else {
                        var vleft = new Vec2(1.0, 0.0);
                        var dot = vleft.Dot(dir);
                        if (this.dirNumber == 16) {
                            if (dot > cos11dot25) // cos(11.25');
                            {
                                this.direction = "right";
                            }
                            else if (dot > cos33dot75) // cos(33.75')
                            {
                                if (dir.y < 0.0)
                                    this.direction = "right-less-up";
                                else
                                    this.direction = "right-less-down";
                            }
                            else if (dot > cos56dot25) // cos(56.25')
                            {
                                if (dir.y < 0.0)
                                    this.direction = "right-up";
                                else
                                    this.direction = "right-down";
                            }
                            else if (dot > cos78dot75) // cos(78.75')
                            {
                                if (dir.y < 0.0)
                                    this.direction = "right-more-up";
                                else
                                    this.direction = "right-more-down";
                            }else if (dot > cos101dot25) { // cos(101.25')
                                if (dir.y < 0.0)
                                    this.direction = "up";
                                else
                                    this.direction = "down";
                            }else if (dot > cos123dot75) { // cos(123.75')
                                if (dir.y < 0.0)
                                    this.direction = "left-more-up";
                                else
                                    this.direction = "left-more-down";
                            }else if (dot > cos146dot25) { // cos(146.25')
                                if (dir.y < 0.0)
                                    this.direction = "left-up";
                                else
                                    this.direction = "left-down";
                            }else if (dot > cos168dot75) { // cos(168.75')
                                if (dir.y < 0.0)
                                    this.direction = "left-less-up";
                                else
                                    this.direction = "left-less-down";
                            }else{
                                this.direction = "left";
                            }
                        }else if (this.dirNumber == 8) {
                            if (dot > cos22dot5) // cos(22.5');
                            {
                                this.direction = "right";
                            }
                            else if (dot > cos67dot5) // cos(67.5')
                            {
                                if (dir.y < 0.0)
                                    this.direction = "right-up";
                                else
                                    this.direction = "right-down";
                            }
                            else if (dot > cos112dot5) // cos(112.5')
                            {
                                if (dir.y < 0.0)
                                    this.direction = "up";
                                else
                                    this.direction = "down";
                            }
                            else if (dot > cos157dot5) // cos(157.5')
                            {
                                if (dir.y < 0.0)
                                    this.direction = "left-up";
                                else
                                    this.direction = "left-down";
                            }else{
                                this.direction = "left";
                            }
                        }
                    }
                                    
                    release = false; 
                    break;
                }
            }
        }
    }
    
    if (release === true) {
        this.touched = false;
        this.direction = "none";
    }
}

UIJoystick.prototype.GetDirection = function()
{
    return this.direction;
}

UIJoystick.prototype.GetDirVector = function()
{
    if (this.touched === true) {
        return new Vec2(this.dirVector.x, -this.dirVector.y);
    }
    return new Vec2(0, 0);
}

UIJoystick.prototype.Draw = function(ctx)
{
    if (this.touched === true) {
        this.spriteBg.Draw(ctx);
        this.spriteBtn.Draw(ctx);
    }
}

