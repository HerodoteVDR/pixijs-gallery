// Get canvas view
const view = document.querySelector('.gallery-view');
const resources = PIXI.Loader.shared.resources;

// Pointer tracking
let pointerDownTarget = 0
let pointerStart = new PIXI.Point()
let pointerDiffStart = new PIXI.Point()
let width, height, app, background, uniforms, diffX, diffY;


// Image grid and container
const gridSize = 50;
const gridMin = 3;
let gridColumnsCount, gridRowsCount, gridColumns, gridRows, grid;
let widthRest, heightRest, centerX, centerY, rects;
let container;
const imagePadding = 20;


function initDimensions() {
    width = document.getElementById("gallery-container").offsetWidth;
    // height = document.getElementById("gallery-container").offsetHeight;
    height = window.innerHeight;
    diffX = 0
    diffY = 0
}

function initApp() {
    app = new PIXI.Application({view});
    app.renderer.autoDensity = true;
    app.renderer.resize(width, height);
}

function initBackground() {
    // Create a new empty Sprite and define its size
    background = new PIXI.Sprite();
    background.width = width;
    background.height = height;
    const backgroundFragmentShader = resources['shaders/gridshader.glsl'].data;
    const backgroundFilter = new PIXI.Filter(undefined, backgroundFragmentShader, uniforms);
    background.filters = [backgroundFilter];
    app.stage.addChild(background);
}

// Initialize the random grid layout
function initGrid () {
    // Getting columns
    gridColumnsCount = Math.ceil(width / gridSize)
    // Getting rows
    gridRowsCount = Math.ceil(height / gridSize)
    // Make the grid 5 times bigger than viewport
    gridColumns = gridColumnsCount * 5
    gridRows = gridRowsCount * 5
    // Create a new Grid instance with our settings
    grid = new Grid(gridSize, gridColumns, gridRows, gridMin)
    // Calculate the center position for the grid in the viewport
    widthRest = Math.ceil(gridColumnsCount * gridSize - width)
    heightRest = Math.ceil(gridRowsCount * gridSize - height)
    centerX = (gridColumns * gridSize / 2) - (gridColumnsCount * gridSize / 2)
    centerY = (gridRows * gridSize / 2) - (gridRowsCount * gridSize / 2)
    // Generate the list of rects
    rects = grid.generateRects()
}

function initContainer () {
    container = new PIXI.Container()
    app.stage.addChild(container)
}

function initRectsAndImages () {
    // Create a new Graphics element to draw solid rectangles
    const graphics = new PIXI.Graphics()
    // Select the color for rectangles
    graphics.beginFill(0xAA22CC)
    // Loop over each rect in the list
    rects.forEach(rect => {
        // Draw the rectangle
        graphics.drawRect(
            rect.x * gridSize,
            rect.y * gridSize,
            rect.w * gridSize - imagePadding,
            rect.h * gridSize - imagePadding
        )
    })
    // Ends the fill action
    graphics.endFill()
    // Add the graphics (with all drawn rects) to the container
    container.addChild(graphics)
}


function initDistortionFilter() {
    const distortionFragmentShaderCode = resources['shaders/distortshader.glsl'].data;

    const distortionFilter = new PIXI.Filter(undefined, distortionFragmentShaderCode, uniforms);

    app.stage.filters = [distortionFilter];
}


function initEvents() {
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

        let speedMultiplier = 0.005;
        uniforms.uPointerDown += (pointerDownTarget - uniforms.uPointerDown) * 0.2 + 0.12
        uniforms.uPointerDiff.x += (diffX - uniforms.uPointerDiff.x) * speedMultiplier;
        uniforms.uPointerDiff.y += (diffY - uniforms.uPointerDiff.y) * speedMultiplier;
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
        let grabStrength = 5;
        diffX = pointerDiffStart.x + (x - pointerStart.x) * grabStrength
        diffY = pointerDiffStart.y + (y - pointerStart.y) * grabStrength

    }
}

function onWheelScroll(e){
    console.log(uniforms.uDeltaWheel)

    if(uniforms.uDeltaWheel >= 50 && e.deltaY < 0) return
    if(uniforms.uDeltaWheel <= - 100 && e.deltaY > 0) return
    uniforms.uDeltaWheel -= e.deltaY * 0.02;
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

// Load resources, then init the app
PIXI.Loader.shared.add([
    'shaders/distortshader.glsl',
    'shaders/gridshader.glsl'
]).load(init);
