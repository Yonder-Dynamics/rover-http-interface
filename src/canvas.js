/**
 * canvas.js: sets up the html5 canvas that we will render to. also manages
 * the animation loop
 * 
 * Author: Alex Haggart
 */
import {mat4,vec4,vec3} from 'gl-matrix';
import {Link} from './link.js';
import {OrientationAxes} from './cubic.js';
import {httpRequest} from './computeServer.js';
import {TransformLink} from './TransformLink.js';

import vsSource from './basic-vertex-shader.vs';
import fsSource from './basic-frag-shader.fs';

import {rayCast} from './VectorMath.js';

const PI = 3.14159265359

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

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
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);

}

function clearScreen(gl){
  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function initProgram(gl,programInfo){
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);
}

function useShadow(gl,programInfo){
  gl.uniform3f(
      programInfo.uniformLocations.lightSourcePosition,
      -5,0,0);

  gl.uniform4f(
      programInfo.uniformLocations.warmColor,
      1,1,1,1);

  gl.uniform4f(
      programInfo.uniformLocations.coolColor,
      0,0,0,1);

  gl.uniform1f(
      programInfo.uniformLocations.alpha,
      0.6);

  gl.uniform1f(
      programInfo.uniformLocations.beta,
      0.6);
}

function noShadow(gl,programInfo){
  gl.uniform3f(
      programInfo.uniformLocations.lightSourcePosition,
      0,0,0);

  gl.uniform4f(
      programInfo.uniformLocations.warmColor,
      0,0,0,1);

  gl.uniform4f(
      programInfo.uniformLocations.coolColor,
      0,0,0,1);

  gl.uniform1f(
      programInfo.uniformLocations.alpha,
      1.0);

  gl.uniform1f(
      programInfo.uniformLocations.beta,
      1.0);
}

function screenCoords(gl,event){
  const x = (event.pageX - event.currentTarget.offsetLeft - gl.canvas.clientWidth/2 )/gl.canvas.clientWidth*2;
  const y = (event.clientY - event.currentTarget.offsetTop - gl.canvas.clientHeight/2)/gl.canvas.clientHeight*2;
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

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // const vsSource = require('./basic-vertex-shader.vs');
  
  // const fsSource = require('./basic-frag-shader.fs');

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram,'aVertexColor'),
      vertexNormal: gl.getAttribLocation(shaderProgram,'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      fromCameraMatrix: gl.getUniformLocation(shaderProgram, 'uFromCameraMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      lightSourcePosition: gl.getUniformLocation(shaderProgram, 'uLightSource'),
      warmColor: gl.getUniformLocation(shaderProgram, 'uWarmColor'),
      coolColor: gl.getUniformLocation(shaderProgram, 'uCoolColor'),
      alpha: gl.getUniformLocation(shaderProgram, 'uAlpha'),
      beta: gl.getUniformLocation(shaderProgram, 'uBeta'),
    },
  };

  initGL(gl);
  initProgram(gl,programInfo);

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

  const links = [
    base0,
    link0,link1,link2,
    finger00,finger01,
    finger10,finger11,
  ];

  const drawList = links.map((link)=>link);
  // drawList.push(axes);

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
        links.forEach((link)=>{
          link.update(response[link.id]);
          link.rayCast([canvasX,-canvasY,0],combinedViewMatrix);
        });
        statusText.innerHTML = request.responseText;
        clearScreen(gl);
        useShadow(gl,programInfo);
        draw(gl,programInfo,drawList,projectionMatrix,fromCamera);
        noShadow(gl,programInfo);
        draw(gl,programInfo,[axes],projectionMatrix,guiSpace3D);
        mouseUpdate = false;
      },
    "onerror":(error)=>{
      active = false;
      statusGlyph.className = "glyphicon glyphicon-remove";
    },
  }

  window.setInterval(()=>{
    if(active){
      httpRequest("127.0.0.1:8002/status","GET","",requestCallbacks);
    }
  },100);

  document.getElementById("reload-connection").onclick = ()=>{
    active = true;
    statusGlyph.className = "glyphicon glyphicon-ok";
  };

  //allow mouse click and drag to change the perspective
  var mouseHold = false;
  const worldX = vec4.fromValues(1,0,0,0);
  const worldY = vec4.fromValues(0,1,0,0);
  const worldZ = vec4.fromValues(0,0,1,0);
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
      rho -= speedFactor*(Math.acos(canvasY) - Math.acos(sc[1]));
      mat4.fromRotation(rotationX,theta,worldY);
      mat4.fromRotation(rotationY,-rho,worldX);
      mat4.mul(rotationTotal,rotationX,rotationY);

      base_link.setTransform(rotationTotal);
      // base_link.update();
    }
    canvasX = sc[0];
    canvasY = sc[1];
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
