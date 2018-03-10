/*
 * link.js: basic transform link. will probably be further generalized and
 * subclassed in the future to allow more options for rendering
 * 
 * Author: Alex Haggart
 */
import {mat4} from 'gl-matrix';

const __id = mat4.create();

const NullParentTransform = {
  getTransform:()=>__id,
  addChild:()=>{},
}

class TransformLink{
  constructor(transform,parent=NullParentTransform){
    this.transform = transform;
    this.children = [];
    this.parent = parent;
    this.parent.addChild(this);
    this.connector = mat4.create();
    mat4.mul(this.connector,this.parent.getTransform(),this.transform)
  }

  rotateLink(angle,axis){
    mat4.rotate(this.transform,this.transform,angle,axis);
    this.update();
  }

  translateLink(xyz){
    mat4.translate(this.transform,this.transform,xyz);
    this.update();
  }

  scaleLink(xyz){
    mat4.scale(this.transform,this.transform,xyz);
    this.update();
  }

  transformLink(trans){
    mat4.mul(this.transform,this.transform,trans);
    this.update();
  }

  update(){
    mat4.mul(this.connector,this.parent.getTransform(),this.transform);
    this.children.forEach((child)=>child.update());
  }

  addChild(child){
    this.children.push(child);
  }

  getLocalTransform(){
    return this.transform;
  }

  getTransform(){
    return this.connector;
  }

  setTransform(transform){
    this.transform = transform;
    this.update();
  }
};

export {TransformLink}