#ifdef GL_ES
precision mediump float;
#endif

// Uniforms from Javascript
uniform vec2 uResolution;
uniform float uDeltaWheel;

// The texture is defined by PixiJS
varying vec2 vTextureCoord;
uniform sampler2D uSampler;


void main () {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

//    uv.x += uDeltaWheel;

    vec4 col = texture2D(uSampler, uv);



    // Contrôler l'opacité en fonction de la position verticale

    gl_FragColor = vec4(col);

}