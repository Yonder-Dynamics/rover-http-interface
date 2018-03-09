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

    this.rayTest = false;
  }

  build(gl,shaderProgram){
    //create vertex array
    this.vertices = [
      -this.x/2,  -this.y/2, -this.z/2, //front face
       this.x/2,  -this.y/2, -this.z/2,
       this.x/2,   this.y/2, -this.z/2,
      -this.x/2,   this.y/2, -this.z/2,

      -this.x/2,  -this.y/2,  this.z/2, //back face
       this.x/2,  -this.y/2,  this.z/2,
       this.x/2,   this.y/2,  this.z/2,
      -this.x/2,   this.y/2,  this.z/2,
    ];

    this.triangles = [ //set of indices prodicing triangles that cover the cube
      0,1,3, //front lower
      2,3,1, //front upper
      5,4,7, //back lower
      7,6,5, //back upper
      1,5,6, //right lower
      6,2,1, //right upper
      0,7,4, //left lower
      7,0,3, //left upper
      3,2,6, //top lower
      7,3,6, //top upper
      4,5,1, //bottom lower
      0,5,1, //bottom upper
    ]; 

    this.buffers.triangleBuffer = createAndBindBuffer(gl,gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.triangles),gl.STATIC_DRAW);

    // this.buffers.vertexBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    this.buffers.vertexBuffer = createAndBindBuffer(gl,gl.ARRAY_BUFFER,new Float32Array(this.vertices),gl.STATIC_DRAW);

    this.colors = [
      0.2,  0.2,  0.9,  1.0,
      0.2,  0.2,  0.9,  1.0,
      0.2,  0.2,  0.9,  1.0,
      0.2,  0.2,  0.9,  1.0,

      0.2,  0.2,  0.9,  1.0,
      0.2,  0.2,  0.9,  1.0,
      0.2,  0.2,  0.9,  1.0,
      0.2,  0.2,  0.9,  1.0,
    ];

    this.buffers.colorBuffer = createAndBindBuffer(gl,gl.ARRAY_BUFFER,new Float32Array(this.colors),gl.STATIC_DRAW);

    this.indices = [
      0,1,1,2,2,3,3,0, //front face
      4,5,5,6,6,7,7,4, //back face
      0,4,1,5,2,6,3,7, //connections
    ];

    this.buffers.indexBuffer = createAndBindBuffer(gl,gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.indices),gl.STATIC_DRAW);

    this.positions.vertexBuffer = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    this.positions.colorBuffer  = gl.getAttribLocation(shaderProgram, 'aVertexColor');

    return this;
  }

  draw(gl){

    enableVertexFloatArrayBuffer(gl,this.buffers.vertexBuffer,this.positions.vertexBuffer,3);
    enableVertexFloatArrayBuffer(gl,this.buffers.colorBuffer,this.positions.colorBuffer,4);

    // draw everything
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
    {
      const offset = 0;
      const vertexCount = 24;
      const type = gl.UNSIGNED_SHORT;
      gl.drawElements(gl.LINES,vertexCount,type,offset);
    }
    if(!this.rayTest){
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.triangleBuffer);
      {
        const offset = 0;
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES,vertexCount,type,offset);
      }
    }

    this.rayTest = false;
  }

  getTriangles(){
    return this.triangles.map((index)=>this.vertices.slice(index*3,index*3+3));
  }
}

export {Cubic};
