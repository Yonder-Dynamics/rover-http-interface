/**
 * link.js: basic transform link. will probably be further generalized and
 * subclassed in the future to allow more options for rendering
 * 
 * Author: Alex Haggart
 */
import {mat4,vec3} from 'gl-matrix';
import {Cubic} from './cubic.js';
import {rayCast,pointInTriangle} from './VectorMath.js';

class Link{
  constructor(id,length,width,joint,parent){
    this.id = id;
    this.wireframe = new Cubic(length,width,width);
    this.uniforms = {};
    this.parent = parent;
    this.children = [];
    this.parent.addChild(this);
    this.joint = joint;
    this.length = length;

    this.buildTransforms();    
  }

  buildTransforms(){
    this.transform = mat4.create();

    mat4.fromRotation(this.transform,this.joint.angle,this.joint.axis);
    const translation = mat4.create();
    mat4.fromTranslation(translation,[this.length/2, 0.0, 0.0]); //position one end of segment 
    mat4.mul(this.transform,this.transform,translation);

    const world_space = mat4.create();
    mat4.copy(world_space,this.parent.getTransform());

    this.connector = mat4.create();
    mat4.fromTranslation(this.connector,[this.length/2,0,0]);
    mat4.mul(world_space,world_space,this.transform);
    mat4.mul(this.connector,world_space,this.connector);
  }

  build(gl,programInfo){
    this.wireframe.build(gl,programInfo);
    this.uniforms.transform = programInfo.uniformLocations.modelViewMatrix;

  }

  addChild(child){
    this.children.push(child);
  }

  update(angle=this.joint.angle){
    this.joint.angle = angle;
    this.buildTransforms();
    this.children.forEach((child)=>child.update());
  }

  rayCast(ray,mvp){
    let triangles = this.wireframe.getTriangles();
    let triangle = [];
    const v0 = vec3.create();
    const v1 = vec3.create();
    const v2 = vec3.create();
    const screenSpace = mat4.create();
    const world_space = mat4.create();
    this.getWorldSpace(world_space);
    mat4.mul(screenSpace,mvp,world_space);
    for(let i=0;i<triangles.length;i+=3){
      triangle = triangles.slice(i,i+3);
      vec3.set(v0,triangle[0][0],triangle[0][1],triangle[0][2]);
      vec3.set(v1,triangle[1][0],triangle[1][1],triangle[1][2]);
      vec3.set(v2,triangle[2][0],triangle[2][1],triangle[2][2]);

      vec3.transformMat4(v0,v0,screenSpace);
      vec3.transformMat4(v1,v1,screenSpace);
      vec3.transformMat4(v2,v2,screenSpace);

      // console.log(v0);

      if(pointInTriangle([ray[0],ray[1]],[[v0[0],v0[1]],[v1[0],v1[1]],[v2[0],v2[1]]])){
        this.wireframe.drawSides = false;
      }
    }
  }

  draw(gl){
    const world_space = mat4.create();
    this.getWorldSpace(world_space);


    gl.uniformMatrix4fv(
      this.uniforms.transform,
      false,
      world_space);

    this.wireframe.draw(gl);

    this.wireframe.drawSides = true;
  }

  getTransform(){
    return this.connector;
  }

  getWorldSpace(out){
    mat4.mul(out,this.parent.getTransform(),this.transform);
    return out;
  }
}

class ImmobileLink extends Link{
  constructor(id,size,offset,parent){
    this.wireframe = new Cubic(size[0],size[1],size[2]);
    this.uniforms = {};
    this.parent = parent;
    this.children = [];
    this.parent.addChild(this);
    this.buildTransforms();
  }
  buildTransforms(){
    this.transform = mat4.create();

    mat4.fromRotation(this.transform,this.joint.angle,this.joint.axis);
    const translation = mat4.create();
    mat4.fromTranslation(translation,[this.length/2, 0.0, 0.0]); //position one end of segment 
    mat4.mul(this.transform,this.transform,translation);

    const world_space = mat4.create();
    mat4.copy(world_space,this.parent.getTransform());

    this.connector = mat4.create();
    mat4.fromTranslation(this.connector,[this.length/2,0,0]);
    mat4.mul(world_space,world_space,this.transform);
    mat4.mul(this.connector,world_space,this.connector);
  }

  update(){
    this.buildTransforms();
    this.children.forEach((child)=>child.update());
  }
}

export {Link};

// export var __useDefault = true;

