if(typeof module !== 'undefined')
    module.exports = Net;

function AppendText(text)
{
    var e = document.createElement("a");
        e.innerHTML = "<p>" + text + "</p>";
        document.body.appendChild(e);
}

function Net()
{
    this.pingInterval = 0;
    this.disconnected = false;
}

Net.prototype.Start = function()
{
    var heartbeatTime = new Date().getTime();
    var heartbeatHandler = null;
    var socket = io('http://ppcar.leanapp.cn');
    this.socket = socket;
    var net = this;
    
    socket.on('clientJoin', function(data) {
        AppendText(data.name + " client 加入.");
    });
    
    socket.on('clientDisconnect', function(data) {
        AppendText(data.name + " client 离开.");
    });
    
    socket.on('heartbeatBack', function() {
        var interval = new Date().getTime() - heartbeatTime;
        net.pingInterval = interval;
        //console.log("ping : " + interval + " MS");
    });
    
    socket.on('disconnect', function() {
        net.disconnected = true;
        AppendText("你已经断开链接.");
        alert("你已经断开链接. 请刷新页面.");
        if (heartbeatHandler) {
            clearInterval(heartbeatHandler);
            heartbeatHandler = null;
        }
    });
    
    heartbeatHandler = setInterval(function() {
        heartbeatTime = new Date().getTime();
        socket.emit('heartbeat');
    }, 1000);
}


