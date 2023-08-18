#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uPointerDown;
uniform sampler2D uSampler;
uniform vec2 uPointerDiff;

uniform float uTime;

varying vec2 vTextureCoord;

void main () {
    vec2 uv = vTextureCoord - uPointerDiff * 0.005;
    uv.x += uTime * 0.001;
    uv = fract(uv * 0.5);
    vec4 col = texture2D(uSampler, uv);
    gl_FragColor = col;
}