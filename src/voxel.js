import {Cubic} from './cubic.js';
import {mat4} from 'gl-matrix';

class Voxel extends Cubic{
  constructor(size,position,color,parent){
    super(size[0],size[1],size[2]);
    this.color = color;
    this.drawWireFrame = false;
    this.transform = mat4.create(); mat4.fromTranslation(this.transform,position);
    this.parent = parent;
    this.parent.addChild(this);
    this.worldSpaceTransform = mat4.create();
    this.positions = [];

    this.update();
  }
  build(gl,programInfo){
    super.build(gl,programInfo);
    this.positions.modelViewMatrix = programInfo.uniformLocations.modelViewMatrix;
  }
  update(){
    mat4.mul(this.worldSpaceTransform,this.parent.getTransform(),this.transform);
  }
  draw(gl){
    gl.uniformMatrix4fv(
      this.positions.modelViewMatrix,
      false,
      this.worldSpaceTransform);
    super.draw(gl);
  }
}

export {Voxel};