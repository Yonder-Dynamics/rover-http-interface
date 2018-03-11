/**
 * VectorMath.js: extension/expansion of gl-matrix functions for ray casting
 * 
 * Author: Alex Haggart
 */
import {mat4,vec3} from 'gl-matrix';
vec3.project = function(out,a,b){
  let b2 = vec3.squaredLength(b);
  let dot = vec3.dot(a,b);
  vec3.scale(out,b,dot/b2);
  return out;
}

vec3.projectScalar = function(a,b){
  let bMag = vec3.length(b);
  let dot = vec3.dot(a,b);
  return dot/bMag;
}

function pointInTriangle(point,triangle){
  //polygon is a list of coordinate pairs (within plane of polygon)
  //point is a single coordintate pair (within plane of polygon)
  //from: http://mathworld.wolfram.com/TriangleInterior.html
  const v0x = triangle[0][0];
  const v0y = triangle[0][1];

  const v1x = triangle[1][0] - v0x;
  const v1y = triangle[1][1] - v0y;

  const v2x = triangle[2][0] - v0x;
  const v2y = triangle[2][1] - v0y;

  const vx = point[0];
  const vy = point[1];

  const det12 = v1x*v2y - v2x*v1y;

  const a =  ((vx*v2y - v2x*vy) - (v0x*v2y - v2x*v0y))/det12;
  const b = -((vx*v1y - v1x*vy) - (v0x*v1y - v1x*v0y))/det12;

  return ((a + b) < 1) && (a > 0) && (b > 0);
}

function rayCast(ray,triangle){
  ray = vec3.fromValues(ray[0],ray[1],ray[2]);
  const t0 = vec3.fromValues(triangle[0][0],triangle[0][1],triangle[0][2]);
  const v1 = vec3.fromValues(triangle[1][0],triangle[1][1],triangle[1][2]);
  const v2 = vec3.fromValues(triangle[2][0],triangle[2][1],triangle[2][2]);

  // console.log("t0: " + t0);
  // console.log("v1: " + v1);
  // console.log("v2: " + v2);

  vec3.sub(v1,v1,t0);
  vec3.sub(v2,v2,t0);

  const diff = vec3.create();
  vec3.copy(diff,t0);

  //use v1 as a basis for planar coordinate space
  const base0 = vec3.create(); vec3.normalize(base0,v1);
  const rej = vec3.create();
  vec3.project(rej,v2,v1); //project v2 onto v1
  vec3.sub(rej,v2,rej); //subtract project from vector to get reject

  //use rejection of v2 onto v1 as second basis
  const base1 = vec3.create(); vec3.normalize(base1,rej);

  //get the normal of the place
  const norm = vec3.create();
  vec3.cross(norm,v1,v2); //assume ccw orientation

  const originToPlane = vec3.projectScalar(diff,norm);

  const rayToPlane = vec3.projectScalar(ray,norm);

  const scaledRay = vec3.create();
  vec3.scale(scaledRay,ray,originToPlane/rayToPlane);

  const rayInPlane = vec3.create();
  vec3.project(rayInPlane,scaledRay,norm);
  vec3.sub(rayInPlane,scaledRay,rayInPlane);

  const rayInBasis = vec3.fromValues(vec3.projectScalar(rayInPlane,base0),vec3.projectScalar(rayInPlane,base1),0);
  // console.log(rayInBasis)

  return scaledRay;
  // return rayInBasis;
}

export {rayCast,pointInTriangle};
