import {AnimatedGIF} from "@pixi/gif";


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
const gridSize = 80
const gridMin = 2
const imagePadding = 15
let gridColumnsCount, gridRowsCount, gridColumns, gridRows, grid
let widthRest, heightRest, centerX, centerY
let rects, images = [], imagesUrls = {}, animatedSprites = [];
let container;

// shader rendering
let fboInfinite, fboDistortion;
function initFBOs() {
    fboInfinite = PIXI.RenderTexture.create();
    fboDistortion = PIXI.RenderTexture.create();
}

function applyInfinityFilter() {
    const infinityFragmentShader = resources['shaders/infinityShader.glsl'].data;
    const infinityFilter = new PIXI.Filter(null, infinityFragmentShader, uniforms);
    app.renderer.render(container, fboInfinite, false, infinityFilter);
}

function applyDistortionFilter() {
    const distortionFragmentShaderCode = resources['shaders/distortshader.glsl'].data;
    const distortionFilter = new PIXI.Filter(null, distortionFragmentShaderCode, uniforms);
    app.renderer.render(container, fboDistortion, false, distortionFilter);
}

function renderFinalScene() {
    const finalFilter = new PIXI.Filter(null, finalShaderCode, {
        textureInfinity: fboInfinite,
        textureDistortion: fboDistortion
    });
    app.stage.filters = [finalFilter];
}
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
    // Calculer le nombre de colonnes et de lignes en fonction de la taille de l'écran
    gridColumnsCount = Math.floor(width / gridSize) + 1.2;
    gridRowsCount = Math.floor(height / gridSize) + 1.3;

    gridColumns = gridColumnsCount;
    gridRows = gridRowsCount;
    grid = new MasonryGrid(gridSize, gridColumns, gridRows, gridMin);

    widthRest = Math.ceil(gridColumnsCount * gridSize - width)
    heightRest = Math.ceil(gridRowsCount * gridSize - height)
    centerX = (gridColumns * gridSize / 2) - (gridColumnsCount * gridSize / 2)
    centerY = (gridRows * gridSize / 2) - (gridRowsCount * gridSize / 2)
    rects = grid.generateRects()
}

function initContainer() {
    container = new PIXI.Container();
    app.stage.addChild(container);

    // Utiliser les dimensions de la fenêtre ajustées
    const totalGridWidth = gridColumnsCount * gridSize;
    const totalGridHeight = gridRowsCount * gridSize;

    // Calculer les coordonnées de départ pour centrer le conteneur
    const centerX = (width - totalGridWidth) / 2 - 520;
    const centerY = (height - totalGridHeight) / 2 - 20;

    container.position.set(centerX, centerY);
}
// Add solid rectangles and images
// So far, we will only add rectangles
function initRectsAndImages() {
    for (const rect of rects) {
        const gifUrl = "./src/gif/funny.gif"
        if (randomInRange(0, 3) < 2) drawMp4(rect, "./src/mp4/luffy.mp4");
        else drawImage(rect, "./src/jpg/op.jpg", "./src/jpg/op2.png", "./src/jpg/op3.jpg");
    }

    const container2 = container;
    container2.x += 500;

}

function drawImage(rect, urlV, urlH, urlC) {
    let imageUrl;

    if (rect.w > rect.h) {
        imageUrl = urlH;
    } else if (rect.h > rect.w) {
        imageUrl = urlV;
    } else {
        imageUrl = urlC;
    }

    const image = new Image();
    image.src = imageUrl;

    image.addEventListener('load', () => {
        const imageTexture = PIXI.Texture.from(image);

        const sprite = new PIXI.Sprite(imageTexture);

        sprite.x = rect.x * gridSize;
        sprite.y = rect.y * gridSize;
        sprite.width = rect.w * gridSize - imagePadding;
        sprite.height = rect.h * gridSize - imagePadding;

        sprite.alpha = 1;
        images.push(sprite);
        container.addChild(sprite);
    });
}

function drawMp4(rect, url) {
    const videoTexture = PIXI.Texture.from(url);
    const videoSprite = new PIXI.Sprite(videoTexture);

    videoSprite.x = rect.x * gridSize;
    videoSprite.y = rect.y * gridSize;
    videoSprite.width = rect.w * gridSize - imagePadding;
    videoSprite.height = rect.h * gridSize - imagePadding;
    videoSprite.texture.baseTexture.source.muted = true;

    videoSprite.interactive = true;
    videoSprite.texture.baseTexture.source.currentTime = 0;


    // Ajouter un événement pour réinitialiser la vidéo lorsqu'elle se termine
    videoSprite.texture.baseTexture.source.addEventListener('ended', () => {
        videoSprite.texture.baseTexture.source.currentTime = 0;
        videoSprite.texture.baseTexture.source.play();
    });
    container.addChild(videoSprite);
}


let initPosX;
let initPosY;


let isWithinLimits = true;
function initEvents() {
    app.stage.interactive = true
    app.stage
        .on('pointerdown', onPointerDown)
        .on('pointerup', onPointerUp)
        .on('pointerupoutside', onPointerUp)
        .on('pointermove', onPointerMove)

    view.addEventListener('wheel', onWheelScroll);


    app.ticker.add(() => {


            let speedMultiplier = 0.05;
            uniforms.uPointerDown += (pointerDownTarget - uniforms.uPointerDown) * 0.2 + 0.12
            uniforms.uPointerDiff.x += (diffX - uniforms.uPointerDiff.x) * speedMultiplier;
            uniforms.uPointerDiff.y += (diffY - uniforms.uPointerDiff.y) * speedMultiplier;
            uniforms.uTime += 1 * isDown;

            //
            // container.x = uniforms.uPointerDiff.x - centerX - uniforms.uTime;
            // container.y = uniforms.uPointerDiff.y - centerY

        // // Limits
        // if (container.x < -container.width) {
        //     isWithinLimits = false;
        //     console.log(container.x + " x " + -container.width)
        //     container.x = -centerX;
        //     uniforms.uPointerDiff.x = 0;
        //     diffX = 0;
        //     uniforms.uTime = 0;
        //     isWithinLimits = true;
        // }
        // if (container.x > container.width) {
        //     isWithinLimits = false;
        //     container.x = -centerX;
        //     uniforms.uPointerDiff.x = 0;
        //     diffX = 0;
        //     isWithinLimits = true;
        // }
        // if (container.y < -container.height) {
        //     isWithinLimits = false;
        //     container.y = -centerY
        //     uniforms.uPointerDiff.y = 0;
        //     diffY = 0;
        //     isWithinLimits = true;
        // }
        // if (container.y > container.height) {
        //     isWithinLimits = false;
        //     container.y = -centerY;
        //     uniforms.uPointerDiff.y = 0;
        //     diffY = 0;
        //     isWithinLimits = true;
        // }
    })
}

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

function init() {
    initDimensions();
    initUniforms();
    initGrid()
    initApp();
    initBackground();
    initContainer();
    initRectsAndImages();
    initEvents();
    initFBOs();
    applyInfinityFilter();
    applyDistortionFilter();
    renderFinalScene();
}

PIXI.Loader.shared.add([
    'shaders/infinityShader.glsl',
    'shaders/distortshader.glsl',
    'shaders/gridshader.glsl'
]).load(init);
