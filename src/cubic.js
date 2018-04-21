/**
 * cubic.js: basic rectangular prism object with specified dimensions,
 * centered on origin. users of Cubic objects should apply their own
 * ModelViewProjection transforms before calling Cubic.draw
 * 
 * Author: Alex Haggart
 */

function createAndBindBuffer(gl,type,data,usage){
  const buffer = gl.createBuffer();
  gl.bindBuffer(type,buffer);
  gl.bufferData(type,data,usage);
  return buffer;
}

function enableVertexFloatArrayBuffer(gl,buffer,position,indexSize){
  const numComponents = indexSize;  // number of values per iteration
  const type = gl.FLOAT;    // the data in the buffer is 32bit floats
  const normalize = false;  // don't normalize
  const stride = 0;         // how many bytes to get from one set of values to the next
                            // 0 = use type and numComponents above
  const offset = 0;         // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
      position,
      numComponents,
      type,
      normalize,
      stride,
      offset);
  gl.enableVertexAttribArray(
      position);
}

class Cubic{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;

    //rgba
    this.color = [0.2,0.2,0.9,1.0];

    this.buffers = {};
    this.positions = {};
    this.uniforms = {};

    this.vertices = [];
    this.indices = [];
    this.colors = [];
    this.triangles = [];
    this.normals = [];

    this.drawWireFrame = true;
    this.drawSides = true;
  }

  build(gl,programInfo){
    //create vertex array
    this.vertices = [
      -this.x/2,  -this.y/2,  this.z/2, //front face
       this.x/2,  -this.y/2,  this.z/2,
       this.x/2,   this.y/2,  this.z/2,
      -this.x/2,   this.y/2,  this.z/2,

      -this.x/2,  -this.y/2, -this.z/2, //back face
       this.x/2,  -this.y/2, -this.z/2,
       this.x/2,   this.y/2, -this.z/2,
      -this.x/2,   this.y/2, -this.z/2,

       this.x/2,  -this.y/2,  this.z/2, //right face
       this.x/2,  -this.y/2, -this.z/2,
       this.x/2,   this.y/2, -this.z/2,
       this.x/2,   this.y/2,  this.z/2,

      -this.x/2,  -this.y/2, -this.z/2, //left face
      -this.x/2,  -this.y/2,  this.z/2,
      -this.x/2,   this.y/2,  this.z/2,
      -this.x/2,   this.y/2, -this.z/2,

      -this.x/2,   this.y/2,  this.z/2, //top face
       this.x/2,   this.y/2,  this.z/2,
       this.x/2,   this.y/2, -this.z/2,
      -this.x/2,   this.y/2, -this.z/2,

      -this.x/2,  -this.y/2, -this.z/2, //bottom face
       this.x/2,  -this.y/2, -this.z/2,
       this.x/2,  -this.y/2,  this.z/2,
      -this.x/2,  -this.y/2,  this.z/2,

    ];

    this.triangles = [ //set of indices prodicing triangles that cover the cube
      0,1,3, //front lower
      2,3,1, //front upper

      5,4,7, //back lower
      7,6,5, //back upper

      8,9,10, //right lower
      10,11,8, //right upper

      12,13,14, //left lower
      14,15,12, //left upper

      16,17,18, //top lower
      18,19,16, //top upper

      20,21,22, //bottom lower
      22,23,20, //bottom upper
    ]; 

    this.buffers.triangleBuffer = createAndBindBuffer(gl,gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.triangles),gl.STATIC_DRAW);

    // this.buffers.vertexBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    this.buffers.vertexBuffer = createAndBindBuffer(gl,gl.ARRAY_BUFFER,new Float32Array(this.vertices),gl.STATIC_DRAW);

    this.colors = [
      this.color,
      this.color,
      this.color,
      this.color,

      this.color,
      this.color,
      this.color,
      this.color,

      this.color,
      this.color,
      this.color,
      this.color,
      // [0.9,0.4,0.4,1.0],
      // [0.9,0.4,0.4,1.0],
      // [0.9,0.4,0.4,1.0],
      // [0.9,0.4,0.4,1.0],

      this.color,
      this.color,
      this.color,
      this.color,

      this.color,
      this.color,
      this.color,
      this.color,

      this.color,
      this.color,
      this.color,
      this.color,
    ].reduce((flat,nextColor)=>{
      Array.prototype.push.apply(flat,nextColor);return flat;
    },[]);

    // console.log(this.colors);

    this.buffers.colorBuffer = createAndBindBuffer(gl,gl.ARRAY_BUFFER,new Float32Array(this.colors),gl.STATIC_DRAW);

    const nFront = [0,0,1];
    const nBack  = [0,0,-1];
    const nRight = [1,0,0];
    const nLeft  = [-1,0,0];
    const nTop   = [0,1,0];
    const nBot   = [0,-1,0];

    this.normals = [
      nFront, nFront, nFront, nFront,
      nBack,  nBack,  nBack,  nBack,
      nRight, nRight, nRight, nRight,
      nLeft,  nLeft,  nLeft,  nLeft,
      nTop,   nTop,   nTop,   nTop,
      nBot,   nBot,   nBot,   nBot,
    ].reduce((flat,nextComponent)=>{
      Array.prototype.push.apply(flat,nextComponent);return flat;
    },[]);

    this.normals = this.normals.map((norm,idx)=>norm+this.vertices[idx]);

    this.buffers.normalBuffer = createAndBindBuffer(gl,gl.ARRAY_BUFFER,new Float32Array(this.normals),gl.STATIC_DRAW);

    this.indices = [
      0,1,1,2,2,3,3,0, //front face
      4,5,5,6,6,7,7,4, //back face
      0,4,1,5,2,6,3,7, //connections
    ];

    this.buffers.indexBuffer = createAndBindBuffer(gl,gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.indices),gl.STATIC_DRAW);

    this.positions.vertexBuffer = programInfo.attribLocations.vertexPosition;
    this.positions.colorBuffer  = programInfo.attribLocations.vertexColor;
    this.positions.normalBuffer = programInfo.attribLocations.vertexNormal;

    return this;
  }

  draw(gl){

    enableVertexFloatArrayBuffer(gl,this.buffers.vertexBuffer,this.positions.vertexBuffer,3);
    enableVertexFloatArrayBuffer(gl,this.buffers.normalBuffer,this.positions.normalBuffer,3);
    enableVertexFloatArrayBuffer(gl,this.buffers.colorBuffer,this.positions.colorBuffer,4);

    // draw everything
    if(this.drawWireFrame){
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
      {
        const offset = 0;
        const vertexCount = 24;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.LINES,vertexCount,type,offset);
      }
    }
    if(this.drawSides){
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.triangleBuffer);
      {
        const offset = 0;
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES,vertexCount,type,offset);
      }
    }

  }

  getTriangles(){
    return this.triangles.map((index)=>this.vertices.slice(index*3,index*3+3));
  }
}

class OrientationAxes{
  constructor(size,parent,lines=false){
    this.buffers = [];
    this.positions = [];
    this.parent = parent;
    this.size = size;
    this.lines = lines;
  }
  build(gl,programInfo){
    this.vertices = [ 0,0,0,  this.size,0,0,  0,this.size,0,  0,0,this.size ];
    this.buffers.vertexBuffer = createAndBindBuffer(gl,gl.ARRAY_BUFFER,new Float32Array(this.vertices),gl.STATIC_DRAW);
    // this.indices = [  0,1,  2,3,  4,5,  1,3,  1,5,  3,5 ];
    if(this.lines){
      this.indices = [  0,1,  0,2,  0,3,   ];
    }else{
      this.indices = [  0,1,2, 0,1,3, 0,2,3];
    }
    this.buffers.indexBuffer  = createAndBindBuffer(gl,gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.indices),gl.STATIC_DRAW);
    // this.colors = [ 0,0,0,1,  1,0,0,1,  0,1,0,1,  0,1,0,1,  0,0,1,1,  0,0,1,1 ];
    this.colors = [ 0,0,0,1,  1,0,0,1,  0,1,0,1,   0,0,1,1 ];
    this.buffers.colorBuffer  = createAndBindBuffer(gl,gl.ARRAY_BUFFER,new Float32Array(this.colors),gl.STATIC_DRAW);

    this.positions.vertexBuffer = programInfo.attribLocations.vertexPosition;
    this.positions.colorBuffer  = programInfo.attribLocations.vertexColor;
    this.positions.modelViewMatrix  = programInfo.uniformLocations.modelViewMatrix;

    // this.transform = mat4.create();
  }
  draw(gl){
    // console.log(this.getTransform())
    gl.uniformMatrix4fv(
        this.positions.modelViewMatrix,
        false,
        this.parent.getTransform());
    enableVertexFloatArrayBuffer(gl,this.buffers.vertexBuffer,this.positions.vertexBuffer,3);
    enableVertexFloatArrayBuffer(gl,this.buffers.colorBuffer,this.positions.colorBuffer,4);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
    const offset = 0;
    const type = gl.UNSIGNED_SHORT;
    gl.disable(gl.CULL_FACE);
    if(!this.lines){
      const vertexCount = 9;
      gl.drawElements(gl.TRIANGLES,vertexCount,type,offset);
    } else{
      const vertexCount = 6;
      gl.drawElements(gl.LINES,vertexCount,type,offset);      
    }
    gl.enable(gl.CULL_FACE);
  }
}

export {Cubic,OrientationAxes};
