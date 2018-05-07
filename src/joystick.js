const getScroll = require("./getScroll.js");

var computeAddress = window.location.hostname + ":8002/joystick";
// var computeAddress = "192.168.4.1:8002";

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null; 
    window.onwheel = null; 
    window.ontouchmove = null;  
    document.onkeydown = null;  
}

function httpRequest(addr,method,data,callbacks){
    const shouldBeAsync = true;
  
    const request = new XMLHttpRequest();
  
    request.onload = ()=>callbacks.onload(request);
    request.onerror = ()=>callbacks.onerror(request);
  
    request.open(method, "http://"+addr, shouldBeAsync);
  
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // request.setRequestHeader("goalv", "hello world");
  
    // Actually sends the request to the server.
    request.send(data);
}

var options = {
    zone:document.getElementById("joystick-container"),
    mode:"static",
    size:500,
}
const manager = require('nipplejs').create(options);
const j0 = manager.get(0);

console.log(j0);

const callbacks = {
    onload:()=>{ console.log("sent some data"); },
    onerror:()=>{},
};

const joy_msg = {
    updated:false,
    axes:[0,0],
    buttons:[],
};

j0.on("move end",(evt,data)=>{
    if(evt.type === "move"){
        let angle = data.angle.radian;
        let mag = data.distance / (options.size/2);
        let x = mag*Math.cos(angle);
        let y = mag*Math.sin(angle);
        joy_msg.axes[0] = x;
        joy_msg.axes[1] = y;
        joy_msg.updated = true;
        console.log("x: " + x + " y: " + y);
    }else if(evt.type === "end"){
        joy_msg.axes[0] = 0;
        joy_msg.axes[1] = 0;
        joy_msg.updated = true;
        console.log("released joystick");
    }
});

const pack_joy_msg = function(msg){
    return JSON.stringify({
        action:"joystick-drive",
        data:msg,
    });
};

window.setInterval(()=>{
    if(joy_msg.updated){
        httpRequest(computeAddress,"POST",pack_joy_msg(joy_msg),callbacks);
        joy_msg.updated = false;
    }
},100);

var pos;
var scroll = getScroll();

manager.forEach(function (nipple) {
    pos = nipple.el.getBoundingClientRect();
    nipple.position = {
        x: scroll.x + pos.left,
        y: scroll.y + pos.top
    };
});

// disableScroll();

// console.log(window.location.hostname)
