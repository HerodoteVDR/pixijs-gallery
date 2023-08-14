// Get canvas view
const view = document.querySelector('.gallery-view');
const resources = PIXI.Loader.shared.resources;

// Target for pointer. If down, value is 1, else value is 0
let pointerDownTarget = 0
// Useful variables to keep track of the pointer
let pointerStart = new PIXI.Point()
let pointerDiffStart = new PIXI.Point()
let width, height, app, background, uniforms, diffX, diffY;

// Set dimensions
function initDimensions() {
    width = document.getElementById("gallery-container").offsetWidth;
    height = 800;
    diffX = 0
    diffY = 0
}

// Init the PixiJS Application
function initApp() {
    // Create a PixiJS Application, using the view (canvas) provided
    app = new PIXI.Application({view});
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
    initEvents();
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
    const backgroundFilter = new PIXI.Filter(undefined, backgroundFragmentShader, uniforms);
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


// Start listening events
function initEvents() {
    // Make stage interactive, so it can listen to events
    app.stage.interactive = true

    // Pointer & touch events are normalized into
    // the `pointer*` events for handling different events
    app.stage
        .on('pointerdown', onPointerDown)
        .on('pointerup', onPointerUp)
        .on('pointerupoutside', onPointerUp)
        .on('pointermove', onPointerMove)

    view.addEventListener('wheel', onWheelScroll);

    // Animation loop
    // Code here will be executed on every animation frame
    app.ticker.add(() => {
        // Multiply the values by a coefficient to get a smooth animation

        uniforms.uPointerDown += (pointerDownTarget - uniforms.uPointerDown) * 0.4
        uniforms.uPointerDiff.x += (diffX - uniforms.uPointerDiff.x) * 0.2;
        uniforms.uPointerDiff.y += (diffY - uniforms.uPointerDiff.y) * 0.2;


    })
}

// Set initial values for uniforms
function initUniforms() {
    uniforms = {
        uResolution: new PIXI.Point(width, height),
        uPointerDiff:  new PIXI.Point(),
        uPointerDown: pointerDownTarget,
        uDeltaWheel: 0
    }
}

function onPointerDown(e) {
    console.log('down')
    const {x, y} = e.data.global
    pointerDownTarget = 1
    pointerStart.set(x, y)
    pointerDiffStart = uniforms.uPointerDiff.clone()
}

// reset position of mouse
function onPointerUp() {
    console.log('up')
    pointerDownTarget = 0
}

function onPointerMove(e) {
    const { x, y } = e.data.global;
    if (pointerDownTarget) {
        diffX = pointerDiffStart.x + (x - pointerStart.x)
        diffY = pointerDiffStart.y + (y - pointerStart.y)

        // Mettre à jour les uniformes ici
        uniforms.uPointerDiff.x = diffX;
        uniforms.uPointerDiff.y = diffY;
    }
}

function onWheelScroll(e){
    if(Math.abs(uniforms.uDeltaWheel) >= 50 && e.deltaY > 0) return
    console.log(uniforms.uDeltaWheel)
    uniforms.uDeltaWheel -= e.deltaY * 0.02;
}

// Load resources, then init the app
PIXI.Loader.shared.add([
    'shaders/distortshader.glsl',
    'shaders/gridshader.glsl'
]).load(init);
