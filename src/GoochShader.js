import vsSource from './basic-vertex-shader.vs';
import fsSource from './basic-frag-shader.fs';
import {initShaderProgram,} from './shader.js';

class GoochShader{
  constructor(gl,sourcePosition,warmColor,coolColor,alpha,beta){
    this.sourcePosition = sourcePosition;
    this.warmColor = warmColor;
    this.coolColor = coolColor;
    this.alpha = alpha;
    this.beta = beta;

    this.program = initShaderProgram(gl,vsSource,fsSource);

    this.programInfo = {
      program: this.program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(this.program, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(this.program,'aVertexColor'),
        vertexNormal: gl.getAttribLocation(this.program,'aVertexNormal'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(this.program, 'uProjectionMatrix'),
        fromCameraMatrix: gl.getUniformLocation(this.program, 'uFromCameraMatrix'),
        modelViewMatrix: gl.getUniformLocation(this.program, 'uModelViewMatrix'),
        lightSourcePosition: gl.getUniformLocation(this.program, 'uLightSource'),
        warmColor: gl.getUniformLocation(this.program, 'uWarmColor'),
        coolColor: gl.getUniformLocation(this.program, 'uCoolColor'),
        alpha: gl.getUniformLocation(this.program, 'uAlpha'),
        beta: gl.getUniformLocation(this.program, 'uBeta'),
      },
    };
  }

  setup(gl){
    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
  }

  getProgram(){
    return this.program;
  }

  getProgramInfo(){
    return this.programInfo;
  }

  setUniforms(gl,sourcePosition,warmColor,coolColor,alpha,beta){
    gl.uniform3f(
        this.programInfo.uniformLocations.lightSourcePosition,
        sourcePosition[0],sourcePosition[1],sourcePosition[2]);

    gl.uniform4f(
        this.programInfo.uniformLocations.warmColor,
        warmColor[0],warmColor[1],warmColor[2],1);

    gl.uniform4f(
        this.programInfo.uniformLocations.coolColor,
        coolColor[0],coolColor[1],coolColor[2],1);

    gl.uniform1f(
        this.programInfo.uniformLocations.alpha,
        alpha);

    gl.uniform1f(
        this.programInfo.uniformLocations.beta,
        beta);
  }

  useFull(gl){
    this.setUniforms(gl,this.sourcePosition,this.warmColor,this.coolColor,this.alpha,this.beta);
  }

  useBasic(gl){
    this.setUniforms(gl,[0,0,0],[0,0,0],[0,0,0],1.0,1.0);
  }
}

export {GoochShader};