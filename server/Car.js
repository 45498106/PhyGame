

var uint_up = new b2Vec2(0,1);

// 车轮
function Wheel(game, car, x, y, revolving, angle)
{
    this.angle = angle;
    this.position = new b2Vec2(x*game.physics.gameScale, y*game.physics.gameScale);
    var fixDef = new b2FixtureDef;
    fixDef.density = 0.1;
    fixDef.isSensor = true; //轮子不参与碰撞
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(
        4*game.physics.gameScale, //half width
        8*game.physics.gameScale  //half height
    );
    
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = car.position.x + this.position.x;
    bodyDef.position.y = car.position.y + this.position.y;
    var body = game.physics.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    this.body = body;
    this.car = car;
    
    var jointdef;
    if (revolving) {
        jointdef= new b2RevoluteJointDef();
        jointdef.Initialize(car.body, this.body, this.body.GetWorldCenter());
        jointdef.enableMotor = false; //我们自己手动控制旋转角度
        game.physics.world.CreateJoint(jointdef);
    }else {
        jointdef= new b2PrismaticJointDef();
        jointdef.Initialize(car.body, this.body, this.body.GetWorldCenter(), new b2Vec2(0, 1));
        jointdef.enableLimit = true;  //连接点不能移动
        jointdef.lowerTranslation=jointdef.upperTranslation=0;
    }
    game.physics.world.CreateJoint(jointdef);
    
    //--------------------------------------------------------------------
    Wheel.prototype.getLocalVelocity=function(){
        var res = this.car.body.GetLocalVector(this.car.body.GetLinearVelocityFromLocalPoint(this.position));
        return res;
    };

    this.getDirectionVector=function(){
        var x, y;
        if (this.getLocalVelocity().y > 0){
            x = 0, y = 1;
        }else{
            x = 0, y =-1;
        }
        
        var angle = this.body.GetAngle();
        return new b2Vec2(x*Math.cos(angle)-y*Math.sin(angle),
                          x*Math.sin(angle)+y*Math.cos(angle));
    };


    this.GetKillVelocityVector=function()
    {
        var velocity = this.body.GetLinearVelocity();
        var sideways_axis = this.getDirectionVector();
        var dotprod = b2Math.Dot(velocity, sideways_axis);
        return new b2Vec2(sideways_axis.x * dotprod, sideways_axis.y * dotprod);

    };
    
    this.KillSidewaysVelocity = function()
    {
        var kv = this.GetKillVelocityVector();
        this.body.SetLinearVelocity(kv);
    }
}
        
function Car(game, id, x, y)
{
    this.game = game;
    this.id = id;
    this.position = new b2Vec2(x*game.physics.gameScale, y*game.physics.gameScale);
    this.enginePower = 35;
    var fixDef = new b2FixtureDef;
    fixDef.density=0.1;
    fixDef.restitution=0.4;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(
        15*game.physics.gameScale, //half width
        30*game.physics.gameScale //half height
    );
    
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.linearDamping=0.5;
    bodyDef.angularDamping=0.5;
    bodyDef.position.x = this.position.x;
    bodyDef.position.y = this.position.y;
    var body = game.physics.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    this.body = body;
    
    var pos = this.body.GetWorldPoint(new b2Vec2(0,0));
    this.frontWheel = new Wheel(game, this, 0, 15, true, 0);
    
    var pos = this.body.GetWorldPoint(new b2Vec2(0,0));
    this.backWheel = new Wheel(game, this, 0, -15, false, 0);
    
    this.maxTrunAngle = 41.5;
    this.turnDir = 0;
    
    this.keyboardInput = { 'accelerate' : 0, 'turn' : 0 };
    this.joystickInput = { 'dir_x' : 0, 'dir_y' : 0 };
    this.controlMode = 0;
    
    //--------------------------------------------------------------------
    this.Update = function(dt) {
    
        var wheelAngleSpeed = (this.maxTrunAngle/0.25) * dt;
        
        if (this.controlMode === 1) {
            if(this.keyboardInput.accelerate !== 0) {
                var isUp = this.keyboardInput.accelerate === 1;
            
                var forword = this.body.GetWorldVector( uint_up );
                forword.x *= (this.enginePower * (isUp ? 1 : -1));
                forword.y *= (this.enginePower * (isUp ? 1 : -1));
                this.body.ApplyForce(forword, this.body.GetWorldCenter());
            }

            if (this.keyboardInput.turn === 1) {
                this.Turn(-1);
            }
            else if (this.keyboardInput.turn === 2) {
                this.Turn(1);
            }
            else{
                this.Turn(0);
            }
        }
        else if (this.controlMode === 2) {
            var v1 = new b2Vec2(this.joystickInput.dir_x, this.joystickInput.dir_y);
            var v2 = this.frontWheel.body.GetWorldVector( uint_up );
            var v1DotV2 = b2Math.Dot(v1, v2);
            if (v1.Length() > 0.0001){
                
                var forward = this.body.GetWorldVector( uint_up );
                if (b2Math.Dot(v1, forward) < -0.866) {
                    var backward = new b2Vec2(-forward.x,-forward.y);
                    backward.x *= this.enginePower;
                    backward.y *= this.enginePower;
                    this.body.ApplyForce(backward, this.body.GetWorldCenter());
                    this.Turn(0);
                }
                else
                {
                    forward.x *= this.enginePower;
                    forward.y *= this.enginePower;
                    this.body.ApplyForce(forward, this.body.GetWorldCenter());
                    
                    
                    if( Math.abs(v1.x - v2.x) < 0.0001 &&
                        Math.abs(v1.y - v2.y) < 0.0001) {
                        this.Turn(0);
                    }
                    else if (v1DotV2 > 0.9992) { // 小于2°
                        this.Turn(0);
                    }else {
                        if (v1DotV2 > Math.cos(Util.Radians(wheelAngleSpeed))) { // 比每帧添加的角度还小
                            wheelAngleSpeed = Util.Degrees(Math.acos(v1DotV2)); 
                        }
                    
                        var v1a = Math.atan2(v1.y, v1.x);
                        var v2a = Math.atan2(v2.y, v2.x);
                        if (v1a * v2a > 0) {
                            if (v1a > v2a) {
                                this.Turn(-1);
                            }else{
                                this.Turn(1);
                            }
                        }else {
                            if (v1a > 0) {
                                if (v1a - Math.PI < v2a) {
                                    this.Turn(-1)
                                }else {
                                    this.Turn(1)
                                }
                            }else{
                                if (v1a + Math.PI < v2a) {
                                    this.Turn(-1)
                                }else {
                                    this.Turn(1);
                                }
                            }
                        }
                    }
                }
            }else {
                this.Turn(0);
            }
        }
    
        this.frontWheel.KillSidewaysVelocity();
        this.backWheel.KillSidewaysVelocity();
        
        if (this.turnDir != 0) {
            if (this.turnDir === -1) {
                if (this.maxTrunAngle > this.frontWheel.angle){
                    this.frontWheel.angle = Math.min(this.maxTrunAngle, this.frontWheel.angle + wheelAngleSpeed);
                }
            } else {
            if (-this.maxTrunAngle < this.frontWheel.angle){
                    this.frontWheel.angle = Math.max(-this.maxTrunAngle, this.frontWheel.angle - wheelAngleSpeed);
                }
            }
        }else {
            if (this.frontWheel.angle > 0.1) {
                this.frontWheel.angle = Math.max(0, this.frontWheel.angle - wheelAngleSpeed*2);
            }else if(this.frontWheel.angle < -0.1){
                this.frontWheel.angle = Math.min(0, this.frontWheel.angle + wheelAngleSpeed*2);
            }
        }
        
        this.frontWheel.body.SetAngle(this.GetAngle() + Util.Radians(this.frontWheel.angle));
    },
    
    // -1 turn left, 0, keep direction, 1 turn right
    this.Turn = function(dir) {
        this.turnDir = dir;
    },
    
    this.GetAngle = function() {
        return this.body.GetAngle();
    },
    
    this.GetPosition = function() {
        var pos = this.body.GetPosition();
        return new b2Vec2(pos.x*this.game.physics.gameInvScale, pos.y*this.game.physics.gameInvScale);
    },
    
    this.GetForword = function() {
        var forword = this.body.GetWorldVector( new b2Vec2(0,1) );
        return forword;
    },
    
    this.SetKeyBoardInput = function(accelerate, turn) {
        this.keyboardInput.accelerate = accelerate;
        this.keyboardInput.turn = turn;
        this.controlMode = 1;
    },
    
    this.SetJoystickInput = function(dir_x, dir_y) {
        this.joystickInput.dir_x = dir_x;
        this.joystickInput.dir_y = dir_y;
        this.controlMode = 2;
    },
    
    this.Destroy = function() {  
        game.physics.world.DestroyBody(this.frontWheel.body);
        game.physics.world.DestroyBody(this.backWheel.body);
        game.physics.world.DestroyBody(this.body);
        this.frontWheel.body = null;
        this.backWheel.body = null;
        this.body = null;
    }
}


if(typeof module !== 'undefined')
    module.exports = Car;