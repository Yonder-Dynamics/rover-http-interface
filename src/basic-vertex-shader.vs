attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec4 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uFromCameraMatrix;
uniform vec3 uLightSource;

varying mediump vec4 vColor;
varying mediump vec3 vNormal;
varying mediump vec3 vLight;

void main() {
  vec4 worldPosition  = uModelViewMatrix * aVertexPosition;
  vec4 normalPosition = uModelViewMatrix * aVertexNormal;

  vNormal = normalPosition.xyz;

  vColor = aVertexColor;

  vLight = uLightSource - worldPosition.xyz;

  gl_Position = uProjectionMatrix * uFromCameraMatrix * worldPosition;
}