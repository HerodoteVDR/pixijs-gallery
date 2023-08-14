// Get canvas view
const view = document.querySelector('.gallery-view');
const resources = PIXI.Loader.shared.resources;
let width, height, app, background, uniforms;

let pointerDownTarget = 1

// Set dimensions
function initDimensions() {
    width = document.getElementById("gallery-container").offsetWidth;
    height = 800;
}

// Init the PixiJS Application
function initApp() {
    // Create a PixiJS Application, using the view (canvas) provided
    app = new PIXI.Application({ view });
    // Resizes renderer view in CSS pixels to allow for resolutions other than 1
    app.renderer.autoDensity = true;
    // Resize the view to match viewport dimensions
    app.renderer.resize(width, height);
}

// Init everything
function init() {
    initDimensions();
    initUniforms();
    initApp();
    initBackground();
    initDistortionFilter();
}

// Init the gridded background
function initBackground() {
    // Create a new empty Sprite and define its size
    background = new PIXI.Sprite();
    background.width = width;
    background.height = height;
    // Get the code for the fragment shader from the loaded resources
    const backgroundFragmentShader = resources['shaders/gridshader.glsl'].data;
    // Create a new Filter using the fragment shader
    // We don't need a custom vertex shader, so we set it as `undefined`
    const backgroundFilter = new PIXI.Filter(undefined, backgroundFragmentShader);
    // Assign the filter to the background Sprite
    background.filters = [backgroundFilter];
    // Add the background to the stage
    app.stage.addChild(background);
}


// Init the distortion filter for the entire stage
function initDistortionFilter() {
    // Get the code for the distortion fragment shader
    const distortionFragmentShaderCode = resources['shaders/distortshader.glsl'].data;

    // Create a new Filter using the distortion fragment shader
    const distortionFilter = new PIXI.Filter(undefined, distortionFragmentShaderCode, uniforms);

    // Apply the filter to the entire stage
    app.stage.filters = [distortionFilter];
}

// Set initial values for uniforms
function initUniforms () {
    uniforms = {
        uResolution: new PIXI.Point(width, height),
        uPointerDown: pointerDownTarget
    }
}

// Load resources, then init the app
PIXI.Loader.shared.add([
    'shaders/distortshader.glsl',
    'shaders/gridshader.glsl'
]).load(init);
