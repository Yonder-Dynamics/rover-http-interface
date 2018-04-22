var computeAddress = "127.0.0.1:8002";

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
    size:100,
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

// j0.on("move",(evt,data)=>{
//     let angle = data.angle.radian;
//     let mag = data.distance / (options.size/2);
//     let x = mag*Math.cos(angle);
//     let y = mag*Math.sin(angle);
//     joy_msg.axes[0] = x;
//     joy_msg.axes[1] = y;
//     joy_msg.updated = true;
//     // console.log("x: " + x + " y: " + y);
// });

j0.on("end",(evt,data)=>{
    joy_msg.axes[0] = 0;
    joy_msg.axes[1] = 0;
    joy_msg.updated = true;
    console.log("released joystick");
});

const pack_joy_msg = function(msg){
    return JSON.stringify({
        action:"joystick-drive",
        data:JSON.stringify(msg),
    });
};

window.setInterval(()=>{
    if(joy_msg.updated){
        httpRequest(computeAddress,"POST",pack_joy_msg(joy_msg),callbacks);
        joy_msg.updated = false;
    }
},100);

var pos;
const getScroll = function () {
    var x = (window.pageXOffset !== undefined) ?
        window.pageXOffset :
        (document.documentElement || document.body.parentNode || document.body)
            .scrollLeft;

    var y = (window.pageYOffset !== undefined) ?
        window.pageYOffset :
        (document.documentElement || document.body.parentNode || document.body)
            .scrollTop;
    return {
        x: x,
        y: y
    };
};
var scroll = getScroll();

manager.forEach(function (nipple) {
    pos = nipple.el.getBoundingClientRect();
    nipple.position = {
        x: scroll.x + pos.left,
        y: scroll.y + pos.top
    };
});

// window.setInterval(()=>{},100);