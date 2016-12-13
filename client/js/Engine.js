(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Module exports.
 */

if(typeof module !== 'undefined')
    module.exports = AABB;

var Vec2 = require('./Vec2.js');
var Util = require('./Utility.js');

function AABB(min, max)
{
    this.min = min;
    this.max = max;
}

AABB.prototype.ContactPoint = function(point)
{
    return point.x < this.min.x || point.y < this.min.y ||
           point.x > this.max.x || point.y > this.max.y;
}

AABB.prototype.Clamp = function(point)
{
    return new Vec2(Util.Clamp(point.x, this.min.x, this.max.x),
                    Util.Clamp(point.y, this.min.y, this.max.y));
}

},{"./Utility.js":5,"./Vec2.js":6}],2:[function(require,module,exports){
module.exports.Util = require('./Utility.js');
module.exports.Vec2 = require('./Vec2.js');
module.exports.AABB = require('./AABB.js');
module.exports.Rect = require('./Rect.js');
module.exports.Logger = require('./Logger.js');
},{"./AABB.js":1,"./Logger.js":3,"./Rect.js":4,"./Utility.js":5,"./Vec2.js":6}],3:[function(require,module,exports){

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

},{"./sprintf.js":7}],4:[function(require,module,exports){

/**
 * Module exports.
 */

if(typeof module !== 'undefined')
    module.exports = Rect;

function Rect(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Rect.prototype.CenterPointAt = function(centreX, centreY)
{
    this.x = -this.width/2 + centreX;
    this.y = -this.height/2 + centreY ;
}

Rect.prototype.ContactPoint = function(point)
{
    return (point.x < this.x || 
            point.y < this.y ||
            point.x > this.x + this.width || 
            point.y > this.y + this.height);
}

Rect.prototype.IntersectRect = function(rect)
{
    var sL = this.x, sR = this.x + this.width, sT = this.y; sB = this.y + this.height;
    var dL = rect.x, dR = rect.x + rect.width, dT = rect.y; dB = rect.y + rect.height;
    
    if (dL < sR &&
        dR > sL && 
        dT < sB &&
        dB > sT) {
       
        var x = (sL > dL) ? sL : dL;
        var y = (sR < dR) ? sR : dR;
        var width = x + (sT > dT) ? sT : dT;
        var height = y + (sB < dB) ? sB : dB;
            
        return new Rect(x, y, width, height);
        
    } else {
        return null;
    }
}

},{}],5:[function(require,module,exports){

var Util = {};
Util.FindIndex = function(array, id)
{
    for( var i = 0; i < array.length; ++i) {
        if(array[i].id === id)
            return i;
    }
    return -1;
}
    
Util.Clamp = function(x, a, b)
{
    var nx = x;
    if (a > b) {
        var t = b;
        b = a;
        a = t;
    }
    
    if (nx < a) { nx = a; }
    if (nx > b) { nx = b; }
    
    return nx;
}

Util.RandomRange = function(a, b)
{
    if (a < b) {
        var t = b;
        b = a;
        a = t;
    }
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

Util.Degrees=function(radians) {
    return radians*(180/Math.PI);
};

Util.Radians=function(degrees) {
    return degrees/(180/Math.PI);
};

/**
 * Module exports.
 */

if(typeof module !== 'undefined')
    module.exports = Util;
},{}],6:[function(require,module,exports){

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

},{}],7:[function(require,module,exports){
/**
*
*  Javascript sprintf
*  http://www.webtoolkit.info/
*
*

1.%% - 返回百分号本身
2.%b - 二进制数字
3.%c - ASCII对应的字符
4.%d - 整数
5.%f - 浮点数
6.%o - 八进制数字
7.%s - 字符串
8.%x - 16进制数字 (小写字母形式)
9.%X - 16进制数字 (大写字母形式)
在 % 号和通配字符之间可用的选项包括 (比如 %.2f)：
1.+      (强制在数字前面显示 + 和 - 符号作为正负数标记。缺省情况下只有负数才显示 - 符号)
2.-      (变量左对齐)
3.0      (使用0作为右对齐的填充字符)
4.[0-9]  (设置变量的最小宽度)
5..[0-9] (设置浮点数精度或字符串的长度)

**/

var sprintfWrapper = {
  init : function () {
    if (typeof arguments == "undefined") { return null; }
    if (arguments.length < 1) { return null; }
    if (typeof arguments[0] != "string") { return null; }
    if (typeof RegExp == "undefined") { return null; }
    var string = arguments[0];
    var exp = new RegExp(/(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
    var matches = new Array();
    var strings = new Array();
    var convCount = 0;
    var stringPosStart = 0;
    var stringPosEnd = 0;
    var matchPosEnd = 0;
    var newString = '';
    var match = null;
    while (match = exp.exec(string)) {
      if (match[9]) { convCount += 1; }
      stringPosStart = matchPosEnd;
      stringPosEnd = exp.lastIndex - match[0].length;
      strings[strings.length] = string.substring(stringPosStart, stringPosEnd);
      matchPosEnd = exp.lastIndex;
      matches[matches.length] = {
        match: match[0],
        left: match[3] ? true : false,
        sign: match[4] || '',
        pad: match[5] || ' ',
        min: match[6] || 0,
        precision: match[8],
        code: match[9] || '%',
        negative: parseInt(arguments[convCount]) < 0 ? true : false,
        argument: String(arguments[convCount])
      };
    }
    strings[strings.length] = string.substring(matchPosEnd);
    if (matches.length == 0) { return string; }
    if ((arguments.length - 1) < convCount) { return null; }
    var code = null;
    var match = null;
    var i = null;
    for (i=0; i<matches.length; i++) {
      if (matches[i].code == '%') { substitution = '%' }
      else if (matches[i].code == 'b') {
        matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
        substitution = sprintfWrapper.convert(matches[i], true);
      }
      else if (matches[i].code == 'c') {
        matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
        substitution = sprintfWrapper.convert(matches[i], true);
      }
      else if (matches[i].code == 'd') {
        matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
        substitution = sprintfWrapper.convert(matches[i]);
      }
      else if (matches[i].code == 'f') {
        matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
        substitution = sprintfWrapper.convert(matches[i]);
      }
      else if (matches[i].code == 'o') {
        matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
        substitution = sprintfWrapper.convert(matches[i]);
      }
      else if (matches[i].code == 's') {
        matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length)
        substitution = sprintfWrapper.convert(matches[i], true);
      }
      else if (matches[i].code == 'x') {
        matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
        substitution = sprintfWrapper.convert(matches[i]);
      }
      else if (matches[i].code == 'X') {
        matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
        substitution = sprintfWrapper.convert(matches[i]).toUpperCase();
      }
      else {
        substitution = matches[i].match;
      }
      newString += strings[i];
      newString += substitution;
    }
    newString += strings[i];
    return newString;
  },
  convert : function(match, nosign){
    if (nosign) {
      match.sign = '';
    } else {
      match.sign = match.negative ? '-' : match.sign;
    }
    var l = match.min - match.argument.length + 1 - match.sign.length;
    var pad = new Array(l < 0 ? 0 : l).join(match.pad);
    if (!match.left) {
      if (match.pad == "0" || nosign) {
        return match.sign + pad + match.argument;
      } else {
        return pad + match.sign + match.argument;
      }
    } else {
      if (match.pad == "0" || nosign) {
        return match.sign + match.argument + pad.replace(/0/g, ' ');
      } else {
        return match.sign + match.argument + pad;
      }
    }
  }
}

var sprintf = sprintfWrapper.init;

if(typeof module !== 'undefined')
    module.exports = sprintf;
},{}],8:[function(require,module,exports){
engine = {}
engine.commom = require("../common/CommonExport.js");
engine.core = {}
engine.core.Resource = new (require("./core/Resource.js"));
engine.core.Input = new (require("./core/Input.js"));
engine.core.Camera = require("./core/Camera.js");
engine.core.Sprite = require("./core/Sprite.js");
engine.core.SpriteSheet = require("./core/SpriteSheet.js");
engine.core.SpriteAnimation = require("./core/SpriteAnimation.js");

var isSafari = navigator.userAgent.indexOf("Safari") != -1;
var isIe = navigator.userAgent.indexOf("MSIE") != -1;
var isFireFox = navigator.userAgent.indexOf("Firefox") != -1;
var isIOS = navigator.userAgent.match(/iPad|iPod|iPhone/i) != null;
var isAndroid = navigator.userAgent.match(/Android/i) != null;
var isWindows = navigator.userAgent.match(/Windows/i) != null;

function CanvasResizeNotifyParent(canvas)
{
    var gameContainer = canvas.parentNode;
    if(gameContainer){
        gameContainer.style.width = canvas.width + "px";
    }
}

function FullScreenChangeCanvas(canvas)
{
    var ctx = canvas.getContext("2d");
    if(screenfull.isFullscreen)
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        engine.canvasScaleX = canvas.width / engine.designCanvasWidth;
        engine.canvasScaleY = canvas.height / engine.designCanvasHeight;
        
        ctx.save();
        ctx.scale(engine.canvasScaleX, engine.canvasScaleY);
    }
    else
    {
        canvas.width = engine.designCanvasWidth;
        canvas.height = engine.designCanvasHeight;
    
        engine.canvasScaleX = 1.0;
        engine.canvasScaleY = 1.0;
        
        ctx.restore();
    }
    
    CanvasResizeNotifyParent(canvas);
}
        
function FillCanvasToFullWindow(canvas)
{
    var ctx = canvas.getContext("2d");
    if (window.innerHeight > window.innerWidth) {
        canvas.width = window.innerWidth;
        
        var scale = canvas.width / engine.designCanvasWidth;
        canvas.height = Math.ceil(engine.designCanvasHeight * scale);
        
    }else {
        canvas.height = window.innerHeight;
    
        var scale = canvas.height / engine.designCanvasHeight;
        canvas.width = Math.ceil(engine.designCanvasWidth * scale);
    }

    engine.canvasScaleX = canvas.width / engine.designCanvasWidth;
    engine.canvasScaleY = canvas.height / engine.designCanvasHeight;
    
    ctx.scale(engine.canvasScaleX, engine.canvasScaleY);
    
    CanvasResizeNotifyParent(canvas);
}

engine.InitCanvas = function(canvas, fullCanvasWithWindow)
{
    engine.canvas = canvas;
    engine.context = canvas.getContext("2d");
    engine.designCanvasWidth = canvas.width;
    engine.designCanvasHeight = canvas.height;
    
    engine.canvasScaleX = 1.0;
    engine.canvasScaleY = 1.0;
   
    engine.core.Input.RegisterCanvasEvent(canvas);
    canvas.addEventListener('touchstart', function(e) { e.preventDefault(); },true);
    canvas.addEventListener('touchmove',function(e) { e.preventDefault(); },true);
    canvas.addEventListener('touchend', function(e) { e.preventDefault();  /* if(!isWindows && screenfull.enabled && !screenfull.isFullscreen){ screenfull.request();} */ }, true);
    
    // For Android
    canvas.addEventListener('dblclick',function(e) { e.preventDefault(); },true);
    canvas.addEventListener('click',function(e) { e.preventDefault();  /* if(!isWindows && screenfull.enabled && !screenfull.isFullscreen){ screenfull.request(); } */ },true);
    
    engine.fullCanvasWithWindow = false;
    if(fullCanvasWithWindow === true){
        FillCanvasToFullWindow(canvas);
        engine.fullCanvasWithWindow = true;
    }
    
    if(screenfull.enabled) {
        var fullPng = "url(data:image/png;base64,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)";
        var exitFullPng = "url(data:image/png;base64,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)";
        var new_element=document.createElement("style"); 
        new_element.innerHTML = '#drager {' +
        '   position: fixed;' +
        '   width: 36px;' +
        '   height: 36px;' +
        '   background-color: rgba(255, 255, 255, 0.5);' +
        '   z-index: 10000;' +
        '   cursor: pointer;' +
        '   top: 0px;' +
        '   left: 0px;' +
        '   border-radius: 20%;' +
        '   padding: 6px;' +
        ' }' +
        ' ' +
        ' #drager>div {' +
        '   width: 100%;' +
        '   height: 100%;' +
        '   background-image: '+fullPng+';' +
        '   background-repeat: no-repeat;' +
        '   background-size: 100% 100%;'
        '   transition: all 1.2s;' +
        '  -webkit-transition: all 1.2s;' +
        '  -moz-transition: all 1.2s;' +
        '  -o-transition: all 1.2s;' +
        ' }' +
        ' #drager:hover>div{' +
        '   background-image: '+exitFullPng+';' +
        ' } ';
        
        document.body.appendChild(new_element);
        new_element=document.createElement('div'); 
        new_element.setAttribute("id","drager");
        new_element.style.top="100px";
        new_element.style.left="0px";
        new_element.innerHTML = ' <div></div>' ;
        document.body.appendChild(new_element);

        var fdiv = document.getElementById("drager");
        var fdivSub = fdiv.children[0];
        var touchIdentifier = null;
        var touchX, touchY;
        var isDrag = false;
        
        function CheckBackgroundImage() {
            if (screenfull.isFullscreen) {
                fdivSub.style.backgroundImage = exitFullPng;
            }else{
                fdivSub.style.backgroundImage = fullPng;
            }
        }
        
        CheckBackgroundImage();
        
        document.addEventListener(screenfull.raw.fullscreenchange, function() { 
            window.setTimeout(function() {
                if (engine.fullCanvasWithWindow) {
                    if (!screenfull.isFullscreen) {
                        FillCanvasToFullWindow(canvas);
                    }
                    else {
                        FullScreenChangeCanvas(canvas);
                    }
                }
                
                CheckBackgroundImage(); 
            },  1000); 
        });

        fdiv.addEventListener('click', function (event) {
            event.preventDefault();
            if (screenfull.isFullscreen) {
                screenfull.exit(); 
                fdivSub.style.backgroundImage = fullPng; 
            } else {
                screenfull.request(); 
                fdivSub.style.backgroundImage = exitFullPng;
            }
        });

        fdiv.addEventListener('touchstart', function (event) { event.preventDefault();
            if (touchIdentifier === null) {
                touchIdentifier = event.changedTouches[0].identifier || 0;
                touchX = touch.pageY;
                touchY = touch.pageY;
                isDrag = false;
            }
            
        }, false);
        fdiv.addEventListener('touchmove',  function (event) { event.preventDefault();
            for( var i=0; i< event.changedTouches.length; i++) {
                touch = event.changedTouches[i];
                if(touch.identifier === touchIdentifier) {
                
                    if (isDrag === false && ( Math.abs(touch.pageX - touchX) > 20 || Math.abs(touch.pageY - touchY) > 20)){
                        isDrag = true;
                    }
                    
                    if (isDrag) {
                        fdiv.style.top = (touch.pageY - 18) + "px";
                        fdiv.style.left = (touch.pageX - 18) + "px";
                    }
                    break;
                }
            }
        }, false);
        
        fdiv.addEventListener('touchend',   function (event) { event.preventDefault();
            if (touchIdentifier !== null) {
                for( var i=0; i< event.changedTouches.length; i++) {
                    touch = event.changedTouches[i];
                    if(touch.identifier === touchIdentifier) {
                        if (isDrag === false) {
                            // onclick
                            if (screenfull.isFullscreen) {
                                screenfull.exit(); 
                                fdivSub.style.backgroundImage = fullPng; 
                            } else { 
                                screenfull.request(); 
                                fdivSub.style.backgroundImage = exitFullPng;
                            }
                            
                        } else {
                            var a = touch.pageX;
                            var b = touch.pageY;
                            var c = window.innerWidth - touch.pageX;
                            var d = window.innerHeight - touch.pageY;
                            var size = fdiv.clientWidth;
                            var hsize = size / 2;
                            if (a <= b && a <= c && a <= d) {
                                fdiv.style.left = "0px";
                                fdiv.style.top = (touch.pageY - hsize) + "px";
                            }
                            if (b <= a && b <= c && b <= d) {
                                fdiv.style.top = "0px";
                                fdiv.style.left = (touch.pageX - hsize) + "px";
                            }
                            if (c <= a && c <= b && c <= d) {
                                fdiv.style.left = window.innerWidth - size + "px";
                                fdiv.style.top = (touch.pageY - hsize) + "px";
                            }
                            if (d <= a && d <= b && d <= c) {
                                fdiv.style.top = window.innerHeight - size + "px";;
                                fdiv.style.left = (touch.pageX - hsize) + "px";
                            }
                        }
                        touchIdentifier = null;
                    }
                }
            }
        }, false);
    }
}

engine.Start = function()
{
    if (engine.onStart)
        engine.onStart();
        
    var requestAnimFrame = (function(callback)
    {
        return window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               function(callback) {
                   window.setTimeout(callback, 1000 / 60);
               };
    })();
    
    var prev_tick = this_tick = (new Date()).getTime();
    (function Step(){
        prev_tick = this_tick;
        this_tick = (new Date()).getTime();
        var deltaTime = (this_tick - prev_tick) * 0.001;

        if (engine.onFrame)
            engine.onFrame(deltaTime);

        if (engine.showStats) {
            if(typeof stats === 'undefined'){
                stats = new function(){function f(a,e,b){a=document.createElement(a);a.id=e;a.style.cssText=b;return a}function l(a,e,b){var c=f("div",a,"padding:0 0 3px 3px;text-align:left;background:"+b),d=f("div",a+"Text","font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px;color:"+e);d.innerHTML=a.toUpperCase();c.appendChild(d);a=f("div",a+"Graph","width:74px;height:30px;background:"+e);c.appendChild(a);for(e=0;74>e;e++)a.appendChild(f("span","","width:1px;height:30px;float:left;opacity:0.9;background:"+
b));return c}function m(a){for(var b=c.children,d=0;d<b.length;d++)b[d].style.display=d===a?"block":"none";n=a}function p(a,b){a.appendChild(a.firstChild).style.height=Math.min(30,30-30*b)+"px"}var q=self.performance&&self.performance.now?self.performance.now.bind(performance):Date.now,k=q(),r=k,t=0,n=0,c=f("div","stats","width:80px;opacity:0.9;cursor:pointer");c.addEventListener("mousedown",function(a){a.preventDefault();m(++n%c.children.length)},!1);var d=0,u=Infinity,v=0,b=l("fps","#0ff","#002"),
A=b.children[0],B=b.children[1];c.appendChild(b);var g=0,w=Infinity,x=0,b=l("ms","#0f0","#020"),C=b.children[0],D=b.children[1];c.appendChild(b);if(self.performance&&self.performance.memory){var h=0,y=Infinity,z=0,b=l("mb","#f08","#201"),E=b.children[0],F=b.children[1];c.appendChild(b)}m(n);return{REVISION:14,domElement:c,setMode:m,begin:function(){k=q()},end:function(){var a=q();g=a-k;w=Math.min(w,g);x=Math.max(x,g);C.textContent=(g|0)+" MS ("+(w|0)+"-"+(x|0)+")";p(D,g/200);t++;if(a>r+1E3&&(d=Math.round(1E3*
t/(a-r)),u=Math.min(u,d),v=Math.max(v,d),A.textContent=d+" FPS ("+u+"-"+v+")",p(B,d/100),r=a,t=0,void 0!==h)){var b=performance.memory.usedJSHeapSize,c=performance.memory.jsHeapSizeLimit;h=Math.round(9.54E-7*b);y=Math.min(y,h);z=Math.max(z,h);E.textContent=h+" MB ("+y+"-"+z+")";p(F,b/c)}return a},update:function(){k=this.end()}}};
                stats.domElement.style.position='absolute';
                stats.domElement.style.left="0px";
                stats.domElement.style.top="0px";
                document.body.appendChild( stats.domElement );
            }
            stats.update();
        }
                
        requestAnimFrame(Step);
    }());
}

module.exports = engine;
},{"../common/CommonExport.js":2,"./core/Camera.js":9,"./core/Input.js":10,"./core/Resource.js":11,"./core/Sprite.js":12,"./core/SpriteAnimation.js":13,"./core/SpriteSheet.js":14}],9:[function(require,module,exports){
/**
 * Module exports.
 */
 
if(typeof module !== 'undefined')
    module.exports = Camera;

function Camera()
{
    this.x = 0;
    this.y = 0;
    this.rotation = 0.0;
    this.zoom = 1.0;
}

// 把canvas默认向下为正,改成向上为正  >>>>>>>>>>>>>>hack.
Camera.prototype.EnableContext2DAcceptWorldCoordinates = function(context)
{
    // 覆盖drawImage
    context.CanvasRenderingContext2D_prototype_drawImage = CanvasRenderingContext2D.prototype.drawImage;
    context.drawImage = function() {
        if(arguments.length === 3) {
            var image   = arguments[0];
            var dx      = arguments[1];
            var dy      = -arguments[2];
            context.CanvasRenderingContext2D_prototype_drawImage.bind(this)(image, dx, dy);
        }
        else if(arguments.length === 5) {
            var image   = arguments[0];
            var dx      = arguments[1];
            var dy      = -arguments[2];
            var dWidth  = arguments[3];
            var dHeight = arguments[4];
            context.CanvasRenderingContext2D_prototype_drawImage.bind(this)(image, dx, dy, dWidth, dHeight);
        }
        else if(arguments.length === 9) {
            var image   = arguments[0];
            var sx      = arguments[1];
            var sy      = arguments[2];
            var sWidth  = arguments[3];
            var sHeight = arguments[4];
            var dx      = arguments[5];
            var dy      = arguments[6];
            var dWidth  = arguments[7];
            var dHeight = arguments[8];
            context.CanvasRenderingContext2D_prototype_drawImage.bind(this)(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        }
    }
    
    // 覆盖translate
    context.CanvasRenderingContext2D_prototype_translate = CanvasRenderingContext2D.prototype.translate;
    context.translate = function() {
        var x   = arguments[0];
        var y   = -arguments[1];
        context.CanvasRenderingContext2D_prototype_translate.bind(this)(x, y);
    }
    
    // 覆盖 fillText
    context.CanvasRenderingContext2D_prototype_fillText = CanvasRenderingContext2D.prototype.fillText;
    context.fillText = function() {
        if(arguments.length === 3) {
            var text = arguments[0]
            var x    = arguments[1];
            var y    = -arguments[2];
            context.CanvasRenderingContext2D_prototype_fillText.bind(this)(text, x, y);
        }
        else if(arguments.length === 4) {
            var text = arguments[0]
            var x    = arguments[1];
            var y    = -arguments[2];
            var maxWidth = arguments[3];
            context.CanvasRenderingContext2D_prototype_fillText.bind(this)(text, x, y, maxWidth);
        }
    }
    
    //覆盖 strokeText
    context.CanvasRenderingContext2D_prototype_strokeText = CanvasRenderingContext2D.prototype.strokeText;
    context.strokeText = function() {
        if(arguments.length === 3) {
            var text = arguments[0]
            var x    = arguments[1];
            var y    = -arguments[2];
            context.CanvasRenderingContext2D_prototype_strokeText.bind(this)(text, x, y);
        }
        else if(arguments.length === 4) {
            var text = arguments[0]
            var x    = arguments[1];
            var y    = -arguments[2];
            var maxWidth = arguments[3];
            context.CanvasRenderingContext2D_prototype_strokeText.bind(this)(text, x, y, maxWidth);
        }
    }
    
    // 覆盖 fillRect
    context.CanvasRenderingContext2D_prototype_fillRect = CanvasRenderingContext2D.prototype.fillRect;
    context.fillRect = function() {
        var x    = arguments[0];
        var y    = -arguments[1];
        var width = arguments[2];
        var height = -arguments[3];
        context.CanvasRenderingContext2D_prototype_fillRect.bind(this)(x, y, width, height);
    }
    
    // 覆盖moveTo
    context.CanvasRenderingContext2D_prototype_moveTo = CanvasRenderingContext2D.prototype.moveTo;
    context.moveTo = function() {
        var x    = arguments[0];
        var y    = -arguments[1];
        context.CanvasRenderingContext2D_prototype_moveTo.bind(this)(x, y);
    }
    
    // 覆盖lineTo
    context.CanvasRenderingContext2D_prototype_lineTo = CanvasRenderingContext2D.prototype.lineTo;
    context.lineTo = function() {
        var x    = arguments[0];
        var y    = -arguments[1];
        context.CanvasRenderingContext2D_prototype_lineTo.bind(this)(x, y);
    }
    
    // 覆盖arc
    context.CanvasRenderingContext2D_prototype_arc = CanvasRenderingContext2D.prototype.arc;
    context.arc = function() {
        var x    = arguments[0];
        var y    = -arguments[1];
        var radius = arguments[2];
        var startAngle = arguments[3];
        var endAngle = arguments[4];
        var counterclockwise = arguments[5];
        context.CanvasRenderingContext2D_prototype_arc.bind(this)(x, y, radius, startAngle, endAngle, counterclockwise);
    }
}

Camera.prototype.DisableContext2DAcceptWorldCoordinates = function(context)
{
    if ( context.CanvasRenderingContext2D_prototype_drawImage ) { context.drawImage = context.CanvasRenderingContext2D_prototype_drawImage; context.CanvasRenderingContext2D_prototype_drawImage = null; };
    if ( context.CanvasRenderingContext2D_prototype_translate ) { context.translate = context.CanvasRenderingContext2D_prototype_translate; context.CanvasRenderingContext2D_prototype_translate = null; };
    if ( context.CanvasRenderingContext2D_prototype_fillText ) { context.fillText = context.CanvasRenderingContext2D_prototype_fillText;    context.CanvasRenderingContext2D_prototype_fillText = null; };
    if ( context.CanvasRenderingContext2D_prototype_strokeText) { context.strokeText = context.CanvasRenderingContext2D_prototype_strokeText;    context.CanvasRenderingContext2D_prototype_strokeText = null; };
    if ( context.CanvasRenderingContext2D_prototype_fillRect ) { context.fillRect = context.CanvasRenderingContext2D_prototype_fillRect;    context.CanvasRenderingContext2D_prototype_fillRect = null; };
    if ( context.CanvasRenderingContext2D_prototype_moveTo ) { context.moveTo = context.CanvasRenderingContext2D_prototype_moveTo;    context.CanvasRenderingContext2D_prototype_moveTo = null; };
    if ( context.CanvasRenderingContext2D_prototype_lineTo ) { context.lineTo = context.CanvasRenderingContext2D_prototype_lineTo;    context.CanvasRenderingContext2D_prototype_lineTo = null; };
    if ( context.CanvasRenderingContext2D_prototype_arc ) { context.arc = context.CanvasRenderingContext2D_prototype_arc;    context.CanvasRenderingContext2D_prototype_arc = null; };
}

Camera.prototype.Begin = function(context, canvasWidht, canvasHeight)
{
    this.EnableContext2DAcceptWorldCoordinates(context);
    context.save();
    context.translate(0, -canvasHeight);
    var centerX = canvasWidht/(this.zoom*2);
    var centerY = canvasHeight/(this.zoom*2);
    context.scale(this.zoom, this.zoom);
    context.translate(centerX, centerY);
    context.rotate(this.rotation);
    context.translate(-this.x, -this.y);
}

Camera.prototype.End = function(context)
{
    this.DisableContext2DAcceptWorldCoordinates(context);
    context.restore();
}

},{}],10:[function(require,module,exports){

/**
 * Module exports.
 */
 
if(typeof module !== 'undefined')
    module.exports = Input;
 
function Input()
{
    // keyboard
    this.keyboard = {};
    this.keyboard.keysDown = [];
    this.keyboard.constant = {
        8: "backspace",
        9: "tab",
        13: "return",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "capslock",
        27: "escape",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        45: "insert",
        46: "delete",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        91: "lmeta",
        92: "rmeta",
        93: "mode",
        96: "kp0",
        97: "kp1",
        98: "kp2",
        99: "kp3",
        100: "kp4",
        101: "kp5",
        102: "kp6",
        103: "kp7",
        104: "kp8",
        105: "kp9",
        106: "kp*",
        107: "kp+",
        109: "kp-",
        110: "kp.",
        111: "kp/",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scrolllock",
        186: ",",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    };
    
    // mouse
    this.mouse = {};
    this.mouse.x = 0;
    this.mouse.y = 0;
    this.mouse.buttonsDown = [];
    this.mouse.constant = {
        0:"l",
        1:"m",
        2:"r"
    };
    
    // touch
    this.touches = {};
    
    document.addEventListener("keydown",    function (input) { return function(event) { input.HandleKeyboardDown(event); }; }(this), false);
    document.addEventListener("keyup",      function (input) { return function(event) { input.HandleKeyboardUp(event); }; }(this), false);
}

Input.prototype.RegisterCanvasEvent = function(canvas) {
    canvas.addEventListener("mousemove",  function (input) { return function(event) { input.HandleMouseMove(event); }; }(this), false);
    canvas.addEventListener("mousedown",  function (input) { return function(event) { input.HandleMouseDown(event); }; }(this), false);
    canvas.addEventListener("mouseup",    function (input) { return function(event) { input.HandleMouseUp(event); }; }(this), false);
    
    canvas.addEventListener('touchstart', function (input) { return function(event) { input.HandleTouchDown(event); }; }(this), true);
    canvas.addEventListener('touchmove',  function (input) { return function(event) { input.HandleTouchMove(event); }; }(this), true);
    canvas.addEventListener('touchend',   function (input) { return function(event) { input.HandleTouchUp(event); }; }(this), true);
}

Input.prototype.HandleKeyboardDown = function(event) {
    if (event.code == 'F8' ||event.code == 'F9' || event.code == 'F10' || event.code == 'F11' || event.code == 'F12') { return; }
    //event.preventDefault();
    var keyPressed = this.keyboard.constant[event.keyCode] || String.fromCharCode(event.keyCode).toLowerCase();
    if (this.keyboard.keysDown[keyPressed]) {
        if (this.keypressed) {
            this.keypressed(keyPressed);
        }
    }
    this.keyboard.keysDown[keyPressed] = true;
}

Input.prototype.HandleKeyboardUp = function(event) {
    if (event.code == 'F8' || event.code == 'F9' || event.code == 'F10' || event.code == 'F11' || event.code == 'F12') { return; }
    //event.preventDefault();
    var keyReleased = this.keyboard.constant[event.keyCode] || String.fromCharCode(event.keyCode).toLowerCase();
    if (this.keyreleased) {
        this.keyreleased(keyReleased);
    }
    this.keyboard.keysDown[keyReleased] = false;
}

Input.prototype.KeyboardIsDown = function() {
    for (var i = 0; i < arguments.length; i++) {
        if (this.keyboard.keysDown[arguments[i]]) {
            return true;
        }
    }
    return false;
}

Input.prototype.HandleMouseMove = function (event) {
    event.preventDefault();
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
}

Input.prototype.HandleMouseDown = function (event) {
    event.preventDefault();
    var mousepressed = this.mouse.constant[event.button];
    this.mouse.buttonsDown[mousepressed] = true;
    if (this.mousepressed) {
        this.mousepressed(event.clientX, event.clientY, mousepressed);
    }
}

Input.prototype.HandleMouseUp = function (event) {
    event.preventDefault();
    var mousereleased = this.mouse.constant[event.button];
    this.mouse.buttonsDown[mousereleased] = false;
    if (this.mousereleased) {
        this.mousereleased(event.clientX, event.clientY, mousereleased);
    }
}

Input.prototype.GetMouseX = function (canvas) {
    if (canvas) {
        var rect = canvas.getBoundingClientRect();
        return this.mouse.x - rect.left;
    }
    return this.mouse.x;
}

Input.prototype.GetMouseY = function (canvas) {
    if (canvas) {
        var rect = canvas.getBoundingClientRect();
        return this.mouse.y - rect.top;
    }
    return this.mouse.y;
}

Input.prototype.MouseIsDown = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (this.mouse.buttonsDown[arguments[i]]) {
            return true;
        }
    }
    return false;
}

Input.prototype.HandleTouchDown = function (event) {
    event.preventDefault();
    for( var i=0; i< event.changedTouches.length; i++) {
        touch = event.changedTouches[i];
        touch.identifier = touch.identifier || 0;
        
        this.touches[touch.identifier] = touch;
    }
}

Input.prototype.HandleTouchMove = function (event) {
    event.preventDefault();
    for( var i=0; i< event.changedTouches.length; i++) {
        touch = event.changedTouches[i];
        touch.identifier = touch.identifier || 0;
        
        if (this.touches[touch.identifier]) {
            this.touches[touch.identifier] = touch;
        }
    }
}

Input.prototype.HandleTouchUp = function (event) {
    event.preventDefault();
    for( var i=0; i< event.changedTouches.length; i++) {
        touch = event.changedTouches[i];
        touch.identifier = touch.identifier || 0;
        
        if (this.touches[touch.identifier]) {
            this.touches[touch.identifier] = undefined;
        }
    }
}

Input.prototype.GetTouches = function () {
    return this.touches;
}


},{}],11:[function(require,module,exports){

/**
 * Module exports.
 */
 
if(typeof module !== 'undefined')
    module.exports = Resource;
 
function Resource()
{
    this._images = {};
    this._sounds = {};
}

Resource.prototype.GetImage = function(url)
{
    if (this._images[url]){
        return this._images[url];
    }else{
        var img = new Image();
        img.src = url;
        this._images[url] = img;
        return img;
    }
}

Resource.prototype.GetSound = function(url)
{
    if (this._sounds[url]){
        return this._sounds[url];
    }else{
        var snd = new Audio();
        snd.src = url;
        snd.loop = false;
        snd.onloadeddata = function() {
            snd.loadComplete = true;
        }
        this._sounds[url] = snd;
        return snd;
    }
}

Resource.prototype.PrepareSound = function()
{
    for (var key in this._sounds) {
        var snd = this._sounds[key];
        if (snd.loadComplete === true && snd.prepareComplete !== true) {
            snd.play();
            snd.pause();
            snd.prepareComplete = true;
            engine.commom.Logger(snd.src + "加载完成!")
        }
    }
}
},{}],12:[function(require,module,exports){

/**
 * Module exports.
 */
 
if(typeof module !== 'undefined')
    module.exports = Sprite;
 
function Sprite()
{
    this.x = 0;
    this.y = 0;
    this.anchorPointX = 0.5;
    this.anchorPointY = 0.5;
    this.width = -1;
    this.height = -1;
    this.alpha = 1;
    this.rotation = 0;
    this.flipX = false;
    this.flipY = false;
    this.scaleX = 1;
    this.scaleY = 1;
    this.image = undefined;
    this.visible = true;
}

Sprite.prototype.UseSpriteSheet = function(key, spriteSheet)
{
    this._spriteSheetKey = key;
    this._spriteSheet = spriteSheet;
}

Sprite.prototype.GetUseSpriteSheet = function(key, spriteSheet)
{
    return this._spriteSheet;
}

Sprite.prototype.GetUseSpriteSheetKey = function(key, spriteSheet)
{
    return this._spriteSheetKeyl;
}

Sprite.prototype.Draw = function(ctx)
{
    if (!this.visible || this.alpha <= 0) {
        return false;
    }
   
    if (this._spriteSheet) {
        
        if (!this._spriteSheet.GetImage().complete)
            return false;

        if (typeof this._spriteSheet.GetKeyData(this._spriteSheetKey) === 'undefined' )
            return false;
    }
    else if (this.image) {
        if(!this.image.complete)
            return false;
    }
    else {
        return false;
    }
   
    // 保存当前画布状态
    ctx.save();
    
    // 透明度
    if (this.alpha < 1) {
        ctx.globalAlpha = this.alpha;
    }

    // 平移到坐标点
    ctx.translate(this.x, this.y);
    
    // 缩放和翻转
    ctx.scale(this.scaleX * (this.flipX ? -1 : 1), this.scaleY * (this.flipY ? -1 : 1));
           
    // 旋转
    if (this.rotation % 360 !== 0) {
        ctx.rotate(this.rotation % 360 / 180 * Math.PI);
    }

    if (this._spriteSheet) { 
        var data = this._spriteSheet.GetKeyData(this._spriteSheetKey);
        if (data) {
            this._spriteSheet.Draw(ctx, this._spriteSheetKey, -data.width * this.anchorPointX, -data.height * this.anchorPointY, data.width, data.height);
        }
    } else {
    
        var spriteWidth = this.width > 0 ? this.width : this.image.width;
        var spriteHeight = this.height > 0 ? this.height : this.image.height;
    
        ctx.drawImage(this.image,                           // 源图像
                      0, 0,                                 // 源图像起始x,y
                      this.image.width, this.image.height,  // 源图像尺寸
                      -spriteWidth * this.anchorPointX, -spriteHeight * this.anchorPointY, //所要绘制在画布的起始x,y
                      spriteWidth, spriteHeight);           //所要绘制在画布的大小。
    }

    // 恢复画布状态
    ctx.restore();
    
    return true;
}

},{}],13:[function(require,module,exports){

/**
 * Module exports.
 */
 
if(typeof module !== 'undefined')
    module.exports = SpriteAnimation;
 
function SpriteAnimation()
{
    this.x = 0;
    this.y = 0;
    this.anchorPointX = 0.5;
    this.anchorPointY = 0.5;
    this.width = -1;
    this.height = -1;
    this.alpha = 1;
    this.rotation = 0;
    this.flipX = false;
    this.flipY = false;
    this.scaleX = 1;
    this.scaleY = 1;
    this.visible = true;
    
    this._frames = [];
    this.duration = 0;
    this.interval = 0.05;
    this.frameIndex = 0; 
    this.loop = false;
    this.playing = false;
}

SpriteAnimation.prototype.SetAnimation = function(frames, spriteSheet) 
{
    this._frames = frames;
    this._spriteSheet = spriteSheet;
}

SpriteAnimation.prototype.Play = function(loop, callback)
{
    this.loop = loop;
    this.callback = callback;
    this.frameIndex = 0;
    this.playing = true;
}

SpriteAnimation.prototype.Stop = function()
{
    this.playing = false;
}

SpriteAnimation.prototype.Update = function(dt)
{
    if (!this.playing)
        return;

    this.duration += dt;
    if(this.duration > this.interval)
    {
        this.duration -= this.interval;
        ++this.frameIndex;
        if (this.frameIndex === this._frames.length) {
            
            if (this.callback) {
                this.callback(this);
            }
            
            if (this.loop === true) {
                this.frameIndex = 0;
            }
            else {
                this.playing = false;
            }
        }
    }
 }

SpriteAnimation.prototype.Draw = function(ctx)
{
    if (!this.visible || this.alpha <= 0) {
        return false;
    }
    
    if (!this._spriteSheet.GetImage().complete)
        return false;
   
    // 保存当前画布状态
    ctx.save();
    
    // 透明度
    if (this.alpha < 1) {
        ctx.globalAlpha = this.alpha;
    }

    // 平移到坐标点
    ctx.translate(this.x, this.y);
    
    // 缩放和翻转
    ctx.scale(this.scaleX * (this.flipX ? -1 : 1), this.scaleY * (this.flipY ? -1 : 1));
           
    // 旋转
    if (this.rotation % 360 !== 0) {
        ctx.rotate(this.rotation % 360 / 180 * Math.PI);
    }

    var data = this._spriteSheet.GetKeyData(this._frames[this.frameIndex]);
    if (data) {
        this._spriteSheet.Draw(ctx, this._frames[this.frameIndex], -data.width * this.anchorPointX, -data.height * this.anchorPointY, data.width, data.height);
    }

    // 恢复画布状态
    ctx.restore();
    
    return true;
}

},{}],14:[function(require,module,exports){

/**
 * Module exports.
 */
 
if(typeof module !== 'undefined')
    module.exports = SpriteSheet;
 
function SpriteSheet()
{
    this._map = { }; 
}

SpriteSheet.prototype.SetImage = function(image)
{
    this._image = image
}

SpriteSheet.prototype.GetImage = function()
{
    return this._image
}

SpriteSheet.prototype.Add = function(key, startX, startY, width, height){
    this._map[key] = { "startX" : startX, "startY" : startY, "width" : width, "height" : height  };
}

SpriteSheet.prototype.GetKeyData = function(key) {
    return this._map[key];
}

SpriteSheet.prototype.Draw = function(ctx, key, x, y, width, height)
{
    var sheet = this._map[key];
    if(sheet && this._image && this._image.complete){
        
        var imageWidth = width ? width : sheet.width;
        var imageHeight = height ? height : sheet.height;
        
        ctx.drawImage(this._image,                          // 源图像
                      sheet.startX, sheet.startY,           // 源图像起始x,y
                      sheet.width, sheet.height,            // 源图像尺寸
                      (x ? Math.floor(x) : 0), (y ? Math.floor(y) : 0), // 所要绘制在画布的起始x,y
                      imageWidth, imageHeight);             // 所要绘制在画布的大小。
        
        return true;
    }
    
    return false;
}

},{}]},{},[8]);
