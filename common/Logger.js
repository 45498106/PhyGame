
var sprintf = require('./sprintf.js');

// 封装日志函数
var Logger = function ()
{
    var date = new Date();
    var time = sprintf("%02d", date.getMonth() + 1) + "/" + sprintf("%02d", date.getDate()) + ' ' + 
               sprintf("%02d", date.getHours()) + ':' + sprintf("%02d", date.getMinutes()) + ' ' + 
               sprintf("%02d", date.getSeconds()) + '.' + sprintf("%03d", date.getMilliseconds());

    var args = Array.prototype.slice.call(arguments);
    args.unshift(time);
    console.log.apply(console, args);
    
    if (typeof Logger.socket !== 'undefined' && Logger.socket.connected === true) {
        /*
        var str = "";
        if (arguments.length > 0) {
            str = JSON.stringify(arguments[0]);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; ++i) {
                    str += ","+JSON.stringify(arguments[i]);
                }
            }
        }
        
        Logger.socket.emit("Log", time + " " + str);
        */
        Logger.socket.emit("Log", args);
    }
}

if(typeof module !== 'undefined')
    module.exports = Logger;
