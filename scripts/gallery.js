class MasonryGrid {
    constructor(gridSize, gridColumns, gridRows, gridMin) {
        this.gridSize = gridSize
        this.gridColumns = gridColumns
        this.gridRows = gridRows
        this.gridMin = gridMin
        this.rects = []
        this.currentRects = [{x: 0, y: 0, w: this.gridColumns, h: this.gridRows}]
    }

    // Takes the first rectangle on the list, and divides it in 2 more rectangles if possible
    splitCurrentRect() {
        if (this.currentRects.length) {
            const currentRect = this.currentRects.shift()
            const cutVertical = currentRect.w > currentRect.h
            const cutSide = cutVertical ? currentRect.w : currentRect.h
            const cutSize = cutVertical ? 'w' : 'h'
            const cutAxis = cutVertical ? 'x' : 'y'
            if (cutSide > this.gridMin * 2) {
                const rect1Size = randomInRange(this.gridMin, cutSide - this.gridMin)
                const rect1 = Object.assign({}, currentRect, {[cutSize]: rect1Size})
                const rect2 = Object.assign({}, currentRect, {
                    [cutAxis]: currentRect[cutAxis] + rect1Size,
                    [cutSize]: currentRect[cutSize] - rect1Size
                })
                this.currentRects.push(rect1, rect2)
            } else {
                this.rects.push(currentRect)
                this.splitCurrentRect()
            }
        }
    }

    generateRects() {
        while (this.currentRects.length) {
            this.splitCurrentRect()
        }
        return this.rects
    }
}

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


// Get canvas view
const view = document.querySelector('.gallery-view');
const resources = PIXI.Loader.shared.resources;

// Pointer tracking
let pointerDownTarget = 0;
let isDown = 1;
let pointerStart = new PIXI.Point()
let pointerDiffStart = new PIXI.Point()
let width, height, app, background, uniforms, diffX, diffY;

// Image grid and container
const gridSize = 100
const gridMin = 3
const imagePadding = 20
let gridColumnsCount, gridRowsCount, gridColumns, gridRows, grid
let widthRest, heightRest, centerX, centerY
let rects, images = [], imagesUrls = {}, animatedSprites = [];
let container;

let time;


function initDimensions() {
    // width = document.getElementById("gallery-container").offsetWidth;
    width = window.innerWidth;
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
function initGrid() {
    // Getting columns
    gridColumnsCount = Math.ceil(width / gridSize)
    // Getting rows
    gridRowsCount = Math.ceil(height / gridSize)
    // Make the grid 5 times bigger than viewport
    gridColumns = gridColumnsCount * 5
    gridRows = gridRowsCount * 5
    // Create a new MasonryGrid instance with our settings
    grid = new MasonryGrid(gridSize, gridColumns, gridRows, gridMin)
    // Calculate the center position for the grid in the viewport
    widthRest = Math.ceil(gridColumnsCount * gridSize - width)
    heightRest = Math.ceil(gridRowsCount * gridSize - height)
    centerX = (gridColumns * gridSize / 2) - (gridColumnsCount * gridSize / 2)
    centerY = (gridRows * gridSize / 2) - (gridRowsCount * gridSize / 2)
    rects = grid.generateRects()
}

function initContainer() {
    container = new PIXI.Container()
    app.stage.addChild(container)
}

// Add solid rectangles and images
// So far, we will only add rectangles
function initRectsAndImages() {
    rects.forEach(rect => {

        const gifUrl = "https://media3.giphy.com/media/26gsr1DpFvpzXNtFm/giphy.gif?cid=ecf05e47slf8uig8bjlr4sgl9wnlngw1ue04lzz2g3e4z4b4&ep=v1_gifs_search&rid=giphy.gif&ct=g"
        drawGif(gifUrl, rect);
        // drawRect(0xffffff, rect)
        // drawImage(rect);
    })
}

function drawRect(color, rect) {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(color)
    graphics.drawRect(
        rect.x * gridSize,
        rect.y * gridSize,
        rect.w * gridSize - imagePadding,
        rect.h * gridSize - imagePadding)
    graphics.endFill()
    container.addChild(graphics)
}

function drawImage(rect) {
    const image = new PIXI.Sprite();

    image.x = rect.x * gridSize;
    image.y = rect.y * gridSize;
    image.width = rect.w * gridSize - imagePadding;
    image.height = rect.h * gridSize - imagePadding;

    image.alpha = 1;
    images.push(image);

    // const mask = new PIXI.Graphics();
    // mask.beginFill(0xffffff);
    // mask.drawRect(
    //     rect.x * gridSize,
    //     rect.y * gridSize,
    //     rect.w * gridSize - imagePadding,
    //     rect.h * gridSize - imagePadding
    // );
    // mask.endFill();
    //
    // image.mask = mask;

    container.addChild(image);
}


function drawGif(url, rect) {
    const sprite = new PIXI.AnimatedSprite.fromImages([url]);
    sprite.x = rect.x * gridSize;
    sprite.y = rect.y * gridSize;
    sprite.width = rect.w * gridSize - imagePadding;
    sprite.height = rect.h * gridSize - imagePadding;
    sprite.loop = true; // Loop the animation
    sprite.animationSpeed = 0.1; // Set the animation speed

    container.addChild(sprite);
    animatedSprites.push(sprite);
}

function loadTexture(i) {
    const image = images[i];

    const url = `https://images.prismic.io/20stm/f3800fa3-6042-45be-9b31-ca940fc76664_Thumbnail_Small_Things_Large.png?auto=compress,format&rect=0,100,1500,881&w=1260&h=740`
    const rect = rects[i];

    const {signal} = rect.controller = new AbortController();

    fetch(url, {signal}).then(r => {
        // Get image URL, and if it was downloaded before, load another image
        // Otherwise, save image URL and set the texture
        const id = r.url.split('?')[0]

        imagesUrls[id] = true
        image.texture = PIXI.Texture.from(r.url)
        rect.loaded = true
    }).catch(() => {
        console.log("erreur")
    })
}


function checkRectsAndImages() {
    rects.forEach((rect, index) => {
        const image = images[index]
        if (rectIntersectsWithViewport(rect)) {
            if (!rect.discovered) {
                rect.discovered = true;
                loadTexture(index);
            }
        }

    })
}

// Check if a rect intersects the viewport
function rectIntersectsWithViewport(rect) {
    return (
        1
    )
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

        time += 0.1;
        let speedMultiplier = 0.05;
        uniforms.uPointerDown += (pointerDownTarget - uniforms.uPointerDown) * 0.2 + 0.12
        uniforms.uPointerDiff.x += (diffX - uniforms.uPointerDiff.x) * speedMultiplier;
        uniforms.uPointerDiff.y += (diffY - uniforms.uPointerDiff.y) * speedMultiplier;


        uniforms.uTime += 1 * isDown;

        container.x = uniforms.uPointerDiff.x - centerX - uniforms.uTime;
        container.y = uniforms.uPointerDiff.y;

        container.scale.set(uniforms.uDeltaWheel * 0.01 + 1);

        checkRectsAndImages()
    })
}

// Set initial values for uniforms
function initUniforms() {
    uniforms = {
        uResolution: new PIXI.Point(width, height),
        uPointerDiff: new PIXI.Point(),
        uPointerDown: pointerDownTarget,
        uDeltaWheel: 0,
        uTime: 0
    }
}

function onPointerDown(e) {
    console.log('down')
    const {x, y} = e.data.global
    pointerDownTarget = 1
    isDown = 0;
    pointerStart.set(x, y)
    pointerDiffStart = uniforms.uPointerDiff.clone()
}

// reset position of mouse
function onPointerUp() {
    console.log('up')
    pointerDownTarget = 0
    isDown = 1;
}

function onPointerMove(e) {
    const {x, y} = e.data.global;
    if (pointerDownTarget) {
        let grabStrength = 1;
        diffX = pointerDiffStart.x + (x - pointerStart.x) * grabStrength
        diffY = pointerDiffStart.y + (y - pointerStart.y) * grabStrength
    }
}

function onWheelScroll(e) {
    if (uniforms.uDeltaWheel >= 50 && e.deltaY < 0) return
    if (uniforms.uDeltaWheel <= -50 && e.deltaY > 0) return
    uniforms.uDeltaWheel -= e.deltaY * 0.02;
}

// Init everything
function init() {
    initDimensions();
    initUniforms();
    initGrid()
    initApp();
    initBackground();
    initContainer();
    initRectsAndImages();
    initEvents();
    initDistortionFilter();
}

// Load resources, then init the app
PIXI.Loader.shared.add([
    'shaders/distortshader.glsl',
    'shaders/gridshader.glsl'
]).load(init);
