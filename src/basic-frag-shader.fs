precision mediump float;
uniform vec4  uWarmColor;
uniform vec4  uCoolColor;
uniform float uAlpha;
uniform float uBeta;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vLight;

void main() {
  vec3 normalVector = normalize(vNormal);
  vec3 lightVector  = normalize(vLight);

  float intensity = (1.0+dot(lightVector,normalVector))/2.0;

  vec4 coolColorMod = uCoolColor + vColor * uAlpha;
  vec4 warmColorMod = uWarmColor + vColor * uBeta;

  vec4 colorOut = mix(coolColorMod,warmColorMod,intensity);
  colorOut.a = vColor.a;
  // colorOut.xyz = normalVector;
  gl_FragColor = colorOut;
}