// It is required to set the float precision for fragment shaders in OpenGL ES
// More info here: https://stackoverflow.com/a/28540641/4908989
#ifdef GL_ES
precision mediump float;
#endif


// Uniforms from Javascript
uniform vec2 uResolution;
uniform float uPointerDown;
uniform vec2 uPointerDiff;

// The texture is defined by PixiJS
varying vec2 vTextureCoord;
uniform sampler2D uSampler;


// This function returns 1 if `coord` correspond to a grid line, 0 otherwise
float isGridLine (vec2 coord) {
  vec2 pixelsPerGrid = vec2(120.0, 120.0);
  vec2 gridCoords = fract(coord / pixelsPerGrid);
  vec2 gridPixelCoords = gridCoords * pixelsPerGrid;
  vec2 gridLine = step(gridPixelCoords, vec2(1.0));
  float isGridLine = max(gridLine.x, gridLine.y);
  return isGridLine;
}

// Function used to get the distortion effect
vec2 computeUV (vec2 uv, float k, float kcube) {
  vec2 t = uv - 0.5;
  float r2 = t.x * t.x + t.y * t.y;
  float f = 0.0;
  if (kcube == 0.0) {
    f = 1.0 + r2 * k;
  } else {
    f = 1.0 + r2 * (k + kcube * sqrt(r2));
  }
  vec2 nUv = f * t + 0.5;
  nUv.y = 1.0 - nUv.y;
  return nUv;
}

// Main function
void main () {
  // Coordinates for the current pixel
  vec2 coord = gl_FragCoord.xy - uPointerDiff;
  // Set `color` to black
  vec3 color = vec3(0.0);
  // If it is a grid line, change blue channel to 0.3
  color.b = isGridLine(coord) * 0.3;
  // Assing the final rgba color to `gl_FragColor`
  gl_FragColor = vec4(color, 1.0);

}

