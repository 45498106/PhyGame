if(typeof module !== 'undefined')
    module.exports = PhysicsGame;

var Box2D = require('./Box2dWeb-2.1.a.3.js');

b2Vec2 = Box2D.Common.Math.b2Vec2;
b2Math = Box2D.Common.Math.b2Math;
b2AABB = Box2D.Collision.b2AABB;
b2BodyDef = Box2D.Dynamics.b2BodyDef;
b2Body = Box2D.Dynamics.b2Body;
b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
b2Fixture = Box2D.Dynamics.b2Fixture;
b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;
b2World = Box2D.Dynamics.b2World;
b2MassData = Box2D.Collision.Shapes.b2MassData;
b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var Car = require('./Car.js');

var RoomName = "RoomName";
var WorldWidht = 320*10, WorldHeight = 480*10;
            
function CreataStaticBox(game, w, h, x, y) {
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

function CreateDynamicBox(game, w, h, x, y, angle) {
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
    this.carId = 0;

    this.physics = {}
    this.physics.world = new b2World(
        new b2Vec2(0, 0),   //gravity
        true                //allow sleep
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
    var player, carId, carPos, carAng;
    
    for (var i = 0; i < this.players.length; ++i) {
        player = this.players[i];
        player.car.Update(dt);
    }

    this.physics.world.Step(
               dt,      //frame-rate
               2,      //velocity iterations
               4       //position iterations
    );
    
    var datas = [];
    for (var i = 0; i < this.players.length; ++i) {
        player = this.players[i];
        carId = player.car.id;
        carPos = player.car.GetPosition();
        carAng = Util.Degrees(player.car.GetAngle());
        
        datas.push(carId);
        datas.push(parseInt(carPos.x));
        datas.push(parseInt(carPos.y));
        datas.push(parseInt(carAng));
    }
    if (datas.length > 0) {
        this.BroadcastPlayers('physicsSynchro', datas);
    }
    
    // 放在最后
    this.physics.world.ClearForces();
}

PhysicsGame.prototype.NewCarId = function()
{
    return ++this.carId;
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
        
        var newPlayer = { 'id' : socket.id,
                          'socket' : socket, 
                          'car' : new Car(server, server.NewCarId(), 100, 100) };

        client.player = newPlayer; 
        
        var carId = newPlayer.car.id;
        var carPos = newPlayer.car.GetPosition();
        var carAng = Util.Degrees(newPlayer.car.GetAngle());
        
        var data = { 'id' :  socket.id, 
                     'world_width' : WorldWidht, 'world_height' : WorldHeight,
                     'car_id' : carId,
                     'car_x' : carPos.x, 'car_y' : carPos.y, 'car_ang' : carAng };
        
        // 先通知自己创建自己的单位
        socket.emit('enterGameBack', data);
        // 再通知其他玩家创建自己的单位
        server.BroadcastPlayers("newPlayer", {'car_id' : carId, 'car_x' : carPos.x, 'car_y' : carPos.y, 'car_ang' : carAng });
        // 再自己创建其他玩家的单位 hack!!!
        server.SendPlayersTo(newPlayer);
        // 加入广播房间
        socket.join(RoomName);
        server.players.push(newPlayer);
    });
    
    socket.on('input', function (data) {
        var player = client.player;
        if (typeof data.accelerate !== 'undefined' && typeof data.turn !== 'undefined') {
            player.car.SetKeyBoardInput(data.accelerate, data.turn)
        }
        else if (typeof data.dir_x !== 'undefined' && typeof data.dir_y !== 'undefined') {
            player.car.SetJoystickInput(data.dir_x, data.dir_y);
        }
    });
}

PhysicsGame.prototype.DeleteClient = function(client)
{
    var player = client.player;
    if (player) {
        var carId = player.car.id;
        player.car.Destroy();
        player.socket.leave(RoomName);
        this.BroadcastPlayers("losePlayer", carId);
        var idx = Util.FindIndex(this.players, player.id);
        if ( idx >= 0 ) {
            this.players.splice(idx, 1);
        }
        client.player = null;
    }
}

PhysicsGame.prototype.BroadcastPlayers = function(action, data)
{
    IO.to(RoomName).emit(action, data);
}

PhysicsGame.prototype.SendPlayersTo = function(who)
{
    var player, carId, carPos, carAng;
    var datas = [];
    
    for (var i = 0; i < this.players.length; ++i){
        player = this.players[i];
        carId = player.car.id;
        carPos = player.car.GetPosition();
        carAng = Util.Degrees(player.car.GetAngle());
        var data = {'car_id' : carId, 'car_x' : carPos.x, 'car_y' : carPos.y, 'car_ang' : carAng }
        datas.push(data);
    }
    if (datas.length > 0) {
        who.socket.emit("playerList", datas);
    }
}

