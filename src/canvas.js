/**
 * canvas.js: sets up the html5 canvas that we will render to. also manages
 * the animation loop
 * 
 * Author: Alex Haggart
 */
import {mat4,vec4,vec3} from 'gl-matrix';
import {Link} from './link.js';
import {TransformLink} from './TransformLink.js';
import {OrientationAxes} from './cubic.js';
import {rayCast} from './VectorMath.js';
import {httpRequest} from './computeServer.js';

import {computeAddress} from './computeServer.js';

import {Voxel} from './voxel.js';

import {GoochShader} from './GoochShader.js';

const statusCallback = require('./odomDisplay.js');

const getScroll = require("./getScroll.js");

const PI = 3.14159265359

function makePerspectiveMatrix(gl){
  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  return projectionMatrix;
}

function initGL(gl){
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
}

function clearScreen(gl){
  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function initProgram(gl,programInfo){
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);
}

function screenCoords(gl,event){
  // const x = (event.clientX - event.currentTarget.offsetLeft - gl.canvas.clientWidth * (13.0 / 10.0))/gl.canvas.clientWidth*2;
  // const y = (event.clientY - event.currentTarget.offsetTop - gl.canvas.clientHeight * (3.0 / 4.0))/gl.canvas.clientHeight*2;
  let elem_pos = event.currentTarget.getBoundingClientRect();
  let mouse_pos = {
    x: event.clientX,
    y: event.clientY,
  }
  const x = (mouse_pos.x - elem_pos.x)/(gl.canvas.clientWidth/2)  - 1;
  const y = (mouse_pos.y - elem_pos.y)/(gl.canvas.clientHeight/2) - 1;
  return [x,y];
}

function draw(gl,programInfo,drawList,projection,fromCamera){
  // Set the shader uniforms
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projection);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.fromCameraMatrix,
      false,
      fromCamera);

  drawList.forEach((obj)=>obj.draw(gl));
}

//
// start here
//
function main() {
  const canvas = document.querySelector("#glCanvas");
  // Initialize the GL context
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (!gl) {
    console.error("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  initKeys();
  initGL(gl);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const shader = new GoochShader(gl,[-5,0,0],[0.8,0.8,0.8],[0,0,0],0.6,0.6);
  shader.setup(gl);
  const programInfo = shader.getProgramInfo();

  const projectionMatrix = makePerspectiveMatrix(gl);

  var base_transform = mat4.create();
  var fromCamera = mat4.create();
  mat4.translate(fromCamera,fromCamera,[0,0.0,-20.0])

  const base_link = new TransformLink(base_transform);

  const base_joint0 = {angle:0,axis:[0,1,0]};
  const base0 = new Link("base0",0,0,base_joint0,base_link);
  base0.build(gl,programInfo);

  const joint0 = {angle:PI/4,axis:[0,0,1]};
  const link0 = new Link("joint0",4,1,joint0,base0);
  link0.build(gl,programInfo);

  const joint1 = {angle:-PI/4,axis:[0,0,1]};
  const link1 = new Link("joint1",4,0.9,joint1,link0);
  link1.build(gl,programInfo);

  const joint2 = {angle:-PI/4,axis:[0,0,1]};
  const link2 = new Link("joint2",4,1,joint2,link1);
  link2.build(gl,programInfo);

  const knuckle00 = {angle:-PI/3,axis:[0,0,1]};
  const finger00 = new Link("finger00",1,0.5,knuckle00,link2);
  finger00.build(gl,programInfo);

  const knuckle01 = {angle:PI/3,axis:[0,0,1]};
  const finger01 = new Link("finger01",1,0.5,knuckle01,finger00);
  finger01.build(gl,programInfo);

  const knuckle10 = {angle:PI/3,axis:[0,0,1]};
  const finger10 = new Link("finger10",1,0.5,knuckle10,link2);
  finger10.build(gl,programInfo);

  const knuckle11 = {angle:-PI/3,axis:[0,0,1]};
  const finger11 = new Link("finger11",1,0.5,knuckle11,finger10);
  finger11.build(gl,programInfo);

  const axes = new OrientationAxes(1,base_link);
  axes.build(gl,programInfo);

  const axes1 = new OrientationAxes(10,base_link,true);
  axes1.build(gl,programInfo);

  const voxel_link = new TransformLink(mat4.create(),base_link);
  const testVoxel = new Voxel([1,1,1],[0,0,0],[1,0,0,1],voxel_link);
  testVoxel.build(gl,programInfo);

  const links = [
    base0,
    link0,link1,link2,
    finger00,finger01,
    finger10,finger11,
  ];

  const drawList = links.map((link)=>link);
  drawList.push(testVoxel);

  var active = true;

  const statusText = document.getElementById("status-text");
  const statusGlyph = document.getElementById("server-status");

  var canvasX = 0;
  var canvasY = 0;
  var mouseUpdate = false;

  const combinedViewMatrix = mat4.create();
  mat4.mul(combinedViewMatrix,projectionMatrix,fromCamera);

  const guiSpace3D = mat4.create();
  mat4.fromTranslation(guiSpace3D,[4,3,-10]);

  const requestCallbacks = {
    "onload":(request)=>{
        let response = JSON.parse(request.responseText);
        statusCallback(response);
        links.forEach((link)=>{
          link.update(response[link.id]);
          link.rayCast([canvasX,canvasY,0],combinedViewMatrix);
        });
        statusText.innerHTML = request.responseText;
        clearScreen(gl);
        shader.useFull(gl,programInfo);
        draw(gl,programInfo,drawList,projectionMatrix,fromCamera);
        shader.useBasic(gl,programInfo);
        draw(gl,programInfo,[axes1],projectionMatrix,fromCamera);
        draw(gl,programInfo,[axes],projectionMatrix,guiSpace3D);
        // draw(gl,programInfo,[mouseRayDrawer],projectionMatrix,mat4.create());
        mouseUpdate = false;
      },
    "onerror":(error)=>{
      active = false;
      statusGlyph.className = "glyphicon glyphicon-remove";
    },
  }

  window.setInterval(()=>{
    if(active){
      httpRequest(computeAddress+"/status","GET","",requestCallbacks);
    }
  },100);

  document.getElementById("reload-connection").onclick = ()=>{
    active = true;
    statusGlyph.className = "glyphicon glyphicon-ok";
  };

  //allow mouse click and drag to change the perspective
  var mouseHold = false;
  const worldX = vec4.fromValues(1,0,0,1);
  const worldY = vec4.fromValues(0,1,0,1);
  const worldZ = vec4.fromValues(0,0,1,1);
  const dragFactorY = 2*PI/gl.canvas.clientHeight;
  const dragFactorX = 2*PI/gl.canvas.clientWidth;
  const origin = vec4.create();

  const rotationTotal = mat4.create();
  const rotationX = mat4.create();
  const rotationY = mat4.create();
  var currDir = 0;
  var theta = 0;
  var rho = 0;
  var speedFactor = 2;

  const mouseRay = vec4.create();
  const invert = mat4.create();

  const t0 = vec4.fromValues(0,0,0,1);
  const t1 = vec4.fromValues(10,0,0,1);
  const t2 = vec4.fromValues(0,10,0,1);

  const tt0 = vec4.create();
  const tt1 = vec4.create();
  const tt2 = vec4.create();

  const mouseRayCast = function(){
    vec4.set(mouseRay,canvasX,canvasY,100,1);
    mat4.invert(invert,projectionMatrix);
    vec4.transformMat4(mouseRay,mouseRay,invert);
    mouseRay[3] = 1;

    vec4.transformMat4(tt0,t0,axes1.parent.getTransform());
    vec4.transformMat4(tt1,t1,axes1.parent.getTransform());
    vec4.transformMat4(tt2,t2,axes1.parent.getTransform());

    vec4.transformMat4(tt0,tt0,fromCamera);
    vec4.transformMat4(tt1,tt1,fromCamera);
    vec4.transformMat4(tt2,tt2,fromCamera);

    const translation = vec3.fromValues.apply(null,rayCast(mouseRay.slice(0,3),[tt0,tt1,tt2]));
    const wst = vec4.fromValues(translation[0],translation[1],translation[2],1);

    // transform from world space into planar space
    const cameraInvert = mat4.create(); mat4.invert(cameraInvert,fromCamera);
    const transInvert = mat4.create(); mat4.invert(transInvert,axes1.parent.getTransform());
    vec4.transformMat4(wst,wst,cameraInvert);
    vec4.transformMat4(wst,wst,transInvert);

    const tmat = mat4.create();
    mat4.fromTranslation(tmat,wst);
    voxel_link.setTransform(tmat);
  }
  // var mousePos = {x:0,y:0};
  canvas.onmousedown = (e)=>{
    mouseHold = true;
  };

  canvas.onmouseup = (e)=>{
    mouseHold = false;
  };

  canvas.onmouseout = (e)=>{
    mouseHold = false;
  };

  canvas.onmousemove = (e)=>{
    const sc = screenCoords(gl,e);
    if(mouseHold){
      //the mathy way to do it; not very intuitive to control
      // let fromMouse = mat4.fromValues(e.movementX,e.movementY,0);
      // let mag = vec3.length(fromMouse);
      // vec3.normalize(fromMouse,fromMouse);
      // vec3.cross(fromMouse,fromScreen,fromMouse);
      // base_link.rotate(mag/10,fromMouse);
      
      //the more intuitive control scheme
      theta += speedFactor*(Math.acos(canvasX) - Math.acos(sc[0]));
      rho -= speedFactor*(Math.acos(-sc[1])-Math.acos(canvasY));
      mat4.fromRotation(rotationX,theta,worldY);
      mat4.fromRotation(rotationY,-rho,worldX);
      mat4.mul(rotationTotal,rotationX,rotationY);

      base_link.setTransform(rotationTotal);
      // base_link.update();
    }
    canvasX = sc[0];
    canvasY = -sc[1];
    mouseRayCast();
    // console.log("x: " + canvasX + " y: " + canvasY);
    mouseUpdate = true;
  };

  // console.log(pointInTriangle([0.9,0.01],[[0,0],[1,0],[0,1]]));
}

var keys;
function initKeys(){
  keys = {
    'q':false,
    'w':false,
    'e':false,
    'a':false,
    's':false,
    'd':false,
    'z':false,
    'c':false,
    ' ':false,
  }
  window.addEventListener('keydown',keyDown,false);
  window.addEventListener('keyup',keyUp,false);
}

function keyDown(e){
  if(e.key in keys){
    keys[e.key] = true;
  }
}

function keyUp(e){
  if(e.key in keys){
    keys[e.key] = false;
  }
}

main();
