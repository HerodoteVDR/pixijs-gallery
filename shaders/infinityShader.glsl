#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uPointerDown;
uniform sampler2D uSampler;
uniform vec2 uPointerDiff;


varying vec2 vTextureCoord; // Assurez-vous que cela est correctement défini dans le vertex shader

void main () {
    // Utilisation des coordonnées de texture interpolées
    vec2 uv = vTextureCoord - uPointerDiff * 0.01;


    // Opérations sur les coordonnées de texture
    uv = fract(uv * 1.5);

    // Récupérer la couleur de la texture
    vec4 col = texture2D(uSampler, uv);

    // Afficher la couleur d'entrée
    gl_FragColor = col;
}