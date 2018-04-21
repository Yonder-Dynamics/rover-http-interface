import {mat4,vec4,vec3} from 'gl-matrix';
import {GoochShader} from './GoochShader.js';
import {Voxel} from './voxel.js';
import {TransformLink} from './TransformLink.js';

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

function main(){
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    initGL(gl);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    const shader = new GoochShader(gl,[-5,0,0],[0.8,0.8,0.8],[0,0,0],0.6,0.6);
    shader.setup(gl);

    const programInfo = shader.getProgramInfo();
    const projectionMatrix = makePerspectiveMatrix(gl);

    var base_transform = mat4.create();
    var fromCamera = mat4.create();
    mat4.translate(fromCamera,fromCamera,[0,0.0,-20.0]);

    const base_link = new TransformLink(base_transform);
    const voxel_link = new TransformLink(mat4.create(),base_link);
    const testVoxel = new Voxel([1,1,1],[0,0,0],[1,0,0,1],voxel_link);
    testVoxel.build(gl,programInfo);


    const drawList = [];
    drawList.push(testVoxel);

    const updateCanvas = function(){
        clearScreen(gl);
        shader.useFull(gl,programInfo);
        //base_link.update();
        draw(gl,programInfo,drawList,projectionMatrix,fromCamera);
    }

    window.setInterval(updateCanvas,100);
}

//main();
  
var options = {
    zone:document.getElementById("joystick-container"),
    mode:"static",
}
var manager = require('nipplejs').create(options);

window.setInterval(()=>{},100);