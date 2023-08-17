#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uPointerDiff;
uniform float uDeltaWheel;
uniform float uTime;

// This function returns 1 if `coord` correspond to a grid line, 0 otherwise
float isGridLine (vec2 coord) {
  vec2 pixelsPerGrid = vec2( 150. + uDeltaWheel, 150. + uDeltaWheel);
  vec2 gridCoords = fract(coord / pixelsPerGrid);
  vec2 gridPixelCoords = gridCoords * pixelsPerGrid;
  vec2 gridLine = step(gridPixelCoords, vec2(1.0));
  float isGridLine = max(gridLine.x, gridLine.y);
  return isGridLine;
}

// Main function
void main () {
  // Coordinates minus the `uPointerDiff` value
  vec2 coord = gl_FragCoord.xy - uPointerDiff;
  coord.x -= uTime;
  // Background color here
  vec3 color = vec3(0.1,0.1,0.3);
  // Grid color here
  // color.r = isGridLine(coord) * 0.8;
  gl_FragColor = vec4(color, 1.0);
}