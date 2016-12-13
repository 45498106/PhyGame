if(typeof module !== 'undefined')
    module.exports = PhysicsGame;

var Box2D = require('./Box2dWeb-2.1.a.3.js');

var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2Math = Box2D.Common.Math.b2Math,
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef,
    b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef,
    b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var WorldWidht = 320, WorldHeight = 480;
var BodyWidth = 40, BodyHeight = 40;
            
function CreataStaticBox(game,w,h,x,y) {
    var fixDef = new b2FixtureDef;
    fixDef.restitution = 0.0;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(w/2*game.physics.gameScale, h/2*game.physics.gameScale);
        
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody; //默认是静态的
    bodyDef.position.x = x * game.physics.gameScale;
    bodyDef.position.y = y * game.physics.gameScale;
    game.physics.world.CreateBody(bodyDef).CreateFixture(fixDef);
}

function CreateDynamicBox(game,w,h,x,y,angle) {
    var fixDef = new b2FixtureDef;
    fixDef.density=0.1;
    fixDef.restitution=1.0;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(
        w/2*game.physics.gameScale, //half width
        h/2*game.physics.gameScale //half height
    );
    
    fixDef.shape.SetAsBox(w/2*game.physics.gameScale, h/2*game.physics.gameScale);
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.angle = Util.Degrees(angle);
    bodyDef.linearDamping=0.0;
    bodyDef.angularDamping=0.0;
    bodyDef.position.x = x * game.physics.gameScale;
    bodyDef.position.y = y * game.physics.gameScale;
    var body = game.physics.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    return body;
}


function getBodyAtMouse(game, mouseX, mouseY) {
    var mousePVec = new b2Vec2(mouseX, mouseY);
    var aabb = new b2AABB();
    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
    
    function getBodyCB(fixture) {
        if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
           if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
              selectedBody = fixture.GetBody();
              return false;
           }
        }
        return true;
    }

    // Query the world for overlapping shapes.
    selectedBody = null;
    game.physics.world.QueryAABB(getBodyCB, aabb);
    return selectedBody;
}

        
function PhysicsGame()
{

}

PhysicsGame.prototype.Init = function()
{
    this.players = [];

    this.physics = {}
    this.physics.world = new b2World(
        new b2Vec2(0, -9.8),    //gravity
        true                 //allow sleep
    );
    this.physics.gameScale = (1 / 10);
    this.physics.gameInvScale = 10;
    this.mouseJoint = null;
    this.physics.bodys = [];
    
    // 创建包围墙
    CreataStaticBox(this, WorldWidht, 10, WorldWidht/2, 5);
    CreataStaticBox(this, 10, WorldHeight, 5, WorldHeight/2);
    CreataStaticBox(this, WorldWidht, 10, WorldWidht/2, WorldHeight-5);
    CreataStaticBox(this, 10, WorldHeight, WorldWidht-5, WorldHeight/2);
    
    for (var i = 0; i < 10; ++i) {
        var body = CreateDynamicBox(this, BodyWidth, BodyHeight, WorldWidht/2, WorldHeight/2, Math.random() * 180);
        this.physics.bodys.push(body);
    }

    // 设置更新
    setInterval(function(){
        this._pdt = (new Date().getTime() - this._pdte) / 1000.0;
        this._pdte = new Date().getTime();
        if (this._pdt > 0.04) {
            GameLog("!!!###########this._pdt=", this._pdt);
        }
        this.Update(this._pdt);
    }.bind(this), 1000.0/30.0);
}

PhysicsGame.prototype.Update = function(dt)
{
    //
    //console.log(p.x, p.y);

    this.physics.world.Step(
               dt,      //frame-rate
               2,      //velocity iterations
               4       //position iterations
    );
    
    var body, pos, ang;
    var bodyDatas = [];
    var player;
    for (var ib = 0; ib < this.physics.bodys.length; ++ib) {
        body = this.physics.bodys[ib];
        pos = body.GetPosition();
        ang = body.GetAngle();
        bodyDatas.push(parseInt(pos.x * this.physics.gameInvScale));
        bodyDatas.push(parseInt(pos.y * this.physics.gameInvScale));
        bodyDatas.push(parseInt(Util.Degrees(ang)));
    }
    
    for (var i = 0; i < this.players.length; ++i) {
        player = this.players[i];
        player.socket.emit('physicsSynchro', bodyDatas);
    }
    
    // 放在最后
    this.physics.world.ClearForces();
}


PhysicsGame.prototype.NewClient = function(client)
{
    var socket = client.socket;
    var server = this;
    
    socket.on('enterGame', function (data) {
        
        if (typeof client.player !== 'undefined') {
            GameLog(socket.id + "repeat enterGame");
            return;
        }
        
        var newPlayer = { 'socket' : socket  }
        client.player = newPlayer; 
        server.players.push(newPlayer);
        
        var data = { 'id' :  socket.id, 'body_width' : BodyWidth, 'body_height' : BodyHeight,  'bodys': server.physics.bodys.length };
        socket.emit('enterGameBack', data);
    });
    
    socket.on('input', function (data) {
        if(data.state === 1 && (!client.player.mouseJoint)) {
            var mx = data.x * server.physics.gameScale;
            var my = data.y * server.physics.gameScale;
            var body = getBodyAtMouse(server, mx, my);
            if(body) {
                var md = new b2MouseJointDef();
                md.bodyA = server.physics.world.GetGroundBody();
                md.bodyB = body;
                md.target.Set(mx, my);
                md.collideConnected = true;
                md.maxForce = 300.0 * body.GetMass();
                client.player.mouseJoint = server.physics.world.CreateJoint(md);
                body.SetAwake(true);
            }
        }
        
        if(client.player.mouseJoint) {
           if(data.state === 1) {
                var mx = data.x * server.physics.gameScale;
                var my = data.y * server.physics.gameScale;
                client.player.mouseJoint.SetTarget(new b2Vec2(mx, my));
           } else {
              server.physics.world.DestroyJoint(client.player.mouseJoint);
              client.player.mouseJoint = null;
           }
        }
    });
}

PhysicsGame.prototype.DeleteClient = function(client)
{
    var player = client.player;
    if (player) {
        var idx = Util.FindIndex(this.players, player.id);
        if ( idx >= 0 ) {
            this.players.splice(idx, 1);
        }
        client.player = null;
    }
}