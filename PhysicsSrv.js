/*
    server websocket framework.
*/

var express = require('express');
var app = express();
var http = require('http').Server(app);

var AV = require('leanengine');
AV.init({
  appId: process.env.LEANCLOUD_APP_ID || 'rH2mPgbjWGEf228we1rNQxMw-9Nh9j0Va',
  appKey: process.env.LEANCLOUD_APP_KEY || 'yikuJUITOfqB1lIqm3zPfom3',
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY || 'hAC6X9v0Ya7bvsM46NNLKLfE'
});
app.use(AV.express());

app.use(express.static(__dirname + "/client"));

var port = process.env.LEANCLOUD_APP_PORT || 80
http.listen( port, function() {
    console.log('[DEBUG] Listening on *:' + port);
});

IO = require('socket.io')(http);

Util = require("./common/Utility.js");
GameLog = require('./common/Logger.js');

var phyGame = new (require('./server/PhysicsGame.js'))();
phyGame.Init();

//--------------------------------------------------
// 常量
//--------------------------------------------------
var c_HeartbeatCheckMS = 1000;          //心跳检测毫秒数
var c_HeartbeatCheckTimeoutCount = 2;   //心跳检测超时数量

//--------------------------------------------------
// 全局变量
//--------------------------------------------------
var clients = [];

IO.on('connection', function (socket) {
    GameLog('Client [' + socket.id + '] connected!');
    
    // 创建一个客户链接信息.
    var client = { 
                    id: socket.id, 
                    socket : socket,
                    timeoutCount : 0,
                    heartbeatTime : new Date().getTime(), 
                    SetHeartbeatTime : function() { this.heartbeatTime = new Date().getTime() },
                };

    clients.push(client);
    
    IO.emit('clientJoin', { name: client.id });
    
    GameLog('Total client: ' + clients.length);
    
    // 心跳响应
    socket.on('heartbeat', function () {
        client.SetHeartbeatTime();
        socket.emit('heartbeatBack');
    });
    
    // 断开链接
    socket.on('disconnect', function () {
        GameLog('Client [' + client.id + '] disconnected!');

        // 通知phyGame 删除client
        phyGame.DeleteClient(client);
        
        client.socket.broadcast.emit('clientDisconnect', { name: client.id  });
            
        var idx = Util.FindIndex(clients, client.id);
        if ( idx >= 0 ) {
            clients.splice(idx, 1);
        }
            
        GameLog('Total players: ' + clients.length);
    });
    
    // 通知phyGame 进入新client
    phyGame.NewClient(client);
});

// 检测客户心跳
function CheckClientHeartbeat()
{
    var now = new Date().getTime();
    
    for (var i = clients.length - 1; i >=0; --i) {
        var client = clients[i];
        if (now - client.heartbeatTime > c_HeartbeatCheckMS) {
            ++client.timeoutCount;
            if (client.timeoutCount > c_HeartbeatCheckTimeoutCount) {
                // 超过超时次数,断开客户链接
                client.socket.disconnect();
            }
        }else {
            client.timeoutCount = 0;
        }
    }
}

setInterval(CheckClientHeartbeat, c_HeartbeatCheckMS);

/*

//--------------------------------------------------
// client websocket framework :
//--------------------------------------------------

    var heartbeatTime = new Date().getTime();
    var heartbeatHandler = null;
    var socket = io('http://192.168.1.222');
        
    socket.on('clientJoin', function(data) {
        console.log(data.name + " client 加入.");
    });
        
    socket.on('clientDisconnect', function(data) {
        console.log(data.name + " client 离开.");
    });
    
    socket.on('heartbeatBack', function() {
        var interval = new Date().getTime() - heartbeatTime;
        console.log(interval);
    });
    
    socket.on('disconnect', function() {
        console.log("你已经断开链接.");
        if (heartbeatHandler) {
            clearInterval(heartbeatHandler);
            heartbeatHandler = null;
        }
    });
    
    heartbeatHandler = setInterval(function() {
        heartbeatTime = new Date().getTime();
        socket.emit('heartbeat');
    }, 1000);

*/