#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uPointerDiff;
uniform float uDeltaWheel;
uniform float uTime;

float isGridLine (vec2 coord) {
  vec2 pixelsPerGrid = vec2( 150. + uDeltaWheel, 150. + uDeltaWheel);
  vec2 gridCoords = fract(coord / pixelsPerGrid);
  vec2 gridPixelCoords = gridCoords * pixelsPerGrid;
  vec2 gridLine = step(gridPixelCoords, vec2(1.0));
  float isGridLine = max(gridLine.x, gridLine.y);
  return isGridLine;
}

void main () {
  vec2 coord = gl_FragCoord.xy - uPointerDiff;
  coord.x -= uTime;
  vec3 color = vec3(0.1,0.1,0.3);
  gl_FragColor = vec4(color, 1.0);
}