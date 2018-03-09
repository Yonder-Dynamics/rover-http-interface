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
  const t0 = vec3.fromValues(triangle[0][0],triangle[0][1],triangle[0][2]);
  const v1 = vec3.fromValues(triangle[1][0],triangle[1][1],triangle[1][2]);
  const v2 = vec3.fromValues(triangle[2][0],triangle[2][1],triangle[2][2]);

  vec3.sub(v1,v1,t0);
  vec3.sub(v2,v2,t0);

  let diff = vec3.create();
  vec3.copy(diff,t0);
  // vec3.sub(diff,t0,ray);

  const norm = vec3.create();
  vec3.cross(norm,v1,v2); //assume ccw orientation

  const proj = vec3.create(); //distance along normal
  vec3.project(proj,diff,norm);

  //use rejection and a cross product as basis for planar space
  const rej = vec3.create(); //distance perpendicular to normal == along plane
  vec3.sub(rej,diff,proj);
  const vrx = vec3.length(rej);
  const vrcross = vec3.create();
  vec3.cross(vrcross,rej,norm); 
  const vry = vec3.length(vec3.project([0,0,0],diff,vrcross));

  const v1r = vec3.create(); //project the vertex vectors onto the planar vector to get a common coordinate system
  const v1rx = vec3.projectScalar(v1,rej);
  vec3.sub(v1r,v1,v1r);
  const v1ry = vec3.projectScalar(v1,vrcross);

  const v2r = vec3.create(); 
  const v2rx = vec3.projectScalar(v2,rej);
  const v2ry = vec3.projectScalar(v2,vrcross);

  const rayReject = vec3.create();
  vec3.project(rayReject,ray,norm);
  //how much to scale the projection (and thus ray) by to "touch" the triangle plane
  const scale = vec3.length(proj)/vec3.length(rayReject);
  vec3.sub(rayReject,ray,rayReject); //get the rejection of ray onto norm

  //get the angle between ray rejection and to-surface rejection
  //both of these vectors lie within the triangle plane
  const rayrx = vec3.projectScalar(rayReject,rej) * scale;
  const rayry = vec3.projectScalar(rayReject,vrcross) * scale;

  // console.log(rayrx);
  // console.log(rayry);

  //check if the ray-intersection lies within the triangle
  return pointInTriangle([rayrx,rayry],[[vrx,vry],[vrx+v1rx,vry+v1ry],[vrx+v2rx,vry+v2ry]]);
}

export {rayCast,pointInTriangle};
