import {gsap} from "gsap";
import {Loader} from "@pixi/loaders";
import * as PIXI from 'pixi.js';

class MasonryGrid {
    constructor(gridSize, gridColumns, gridRows, gridMin) {
        this.gridSize = gridSize
        this.gridColumns = gridColumns
        this.gridRows = gridRows
        this.gridMin = gridMin
        this.rects = []
        this.currentRects = [{x: 0, y: 0, w: this.gridColumns, h: this.gridRows}]
    }

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

const view = document.querySelector('.gallery-view');
let resources;

let pointerDownTarget = 0;
let isDown = 1;
let pointerStart = new PIXI.Point()
let pointerDiffStart = new PIXI.Point()
let width, height, app, background, uniforms, diffX, diffY;

const gridSize = 60
const gridMin = 2
const imagePadding = 15
let gridColumnsCount, gridRowsCount, gridColumns, gridRows, grid
let widthRest, heightRest, centerX, centerY
let rects;
let container;


let allImages = [];
let images01 = [`/01/jpg/hor01.png`, `/01/jpg/hor02.png`, `/01/jpg/ver01.png`, `/01/jpg/ver02.png`, `/01/jpg/square.png`];
let images02 = [`/02/jpg/hor01.png`, `/02/jpg/hor02.png`, `/02/jpg/ver01.png`, `/02/jpg/ver02.png`, `/02/jpg/square.png`];
allImages.push(images01, images02);

let allVideos = [];
let videos01 = [`/01/mp4/hor01.mp4`, `/01/mp4/hor02.mp4`, `/01/mp4/ver01.mp4`, `/01/mp4/ver02.mp4`, `/01/mp4/square.mp4`];
let videos02 = [`/02/mp4/hor01.mp4`, `/02/mp4/hor02.mp4`, `/02/mp4/ver01.mp4`, `/02/mp4/ver02.mp4`, `/02/mp4/square.mp4`];
allVideos.push(videos01, videos02);


const title = document.querySelector(".splashscreen-title")
let currentMedia = 0;
title.textContent = "The Small Things";

function initDimensions() {
    width = window.innerWidth;
    height = window.innerHeight;
    diffX = 0
    diffY = 0
}

function initApp() {
    app = new PIXI.Application({view});
    app.renderer.resize(width, height);
}

function initBackground() {
    background = new PIXI.Sprite();
    background.width = width;
    background.height = height;
    const backgroundFragmentShader = resources['/shaders/gridshader.glsl'].data;
    const backgroundFilter = new PIXI.Filter(undefined, backgroundFragmentShader, uniforms);
    background.filters = [backgroundFilter];
    app.stage.addChild(background);
}

function initInfinityFilter() {
    const infinityFragmentShader = resources['/shaders/infinityShader.glsl'].data;
    const infinityFilter = new PIXI.Filter(undefined, infinityFragmentShader, uniforms);
    app.stage.filters.push(infinityFilter);
}

function initScrollFilter() {
    const scrollFragmentShader = resources['/shaders/scrollShader.glsl'].data;
    const scrollFilter = new PIXI.Filter(undefined, scrollFragmentShader, uniforms);
    app.stage.filters.push(scrollFilter);
}


function initGrid() {
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

    const totalGridWidth = gridColumnsCount * gridSize;
    const totalGridHeight = gridRowsCount * gridSize;

    const centerX = (width - totalGridWidth) / 2 - imagePadding * 1.6;
    const centerY = (height - totalGridHeight) / 2 - imagePadding;

    container.position.set(centerX, centerY);
}

function initRectsAndImages(index) {
    container.removeChildren();
    for (const rect of rects) {
        if (randomInRange(0, 3) < 2) drawMp4(rect, allVideos, index);
        else drawImage(rect, allImages, index);
    }
}

function drawImage(rect, images, index) {
    let imageUrl;

    if (rect.w > rect.h) {
        if (rect.w / 2 >= rect.h) {
            imageUrl = images[index][1]
        } else {
            imageUrl = images[index][0]
        }
    } else if (rect.h > rect.w) {
        if (rect.h / 2 >= rect.w) {
            imageUrl = images[index][3];
        } else {
            imageUrl = images[index][2];
        }
    } else {
        imageUrl = images[index][4];
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
function drawMp4(rect, videos, index) {
    let videoUrl;

    if (rect.w > rect.h) {
        if (rect.w / 2 === rect.h) {
            videoUrl = videos[index][1];
        } else {
            videoUrl = videos[index][0]
        }
    } else if (rect.h > rect.w) {
        if (rect.h / 2 >= rect.w) {
            videoUrl = videos[index][3];
        } else {
            videoUrl = videos[index][2];
        }
    } else {
        videoUrl = videos[index][4];
    }

    const videoTexture = PIXI.Texture.from(videoUrl);
    const videoSprite = new PIXI.Sprite(videoTexture);


    videoSprite.x = rect.x * gridSize;
    videoSprite.y = rect.y * gridSize;
    videoSprite.width = rect.w * gridSize - imagePadding;
    videoSprite.height = rect.h * gridSize - imagePadding;
    videoSprite.texture.baseTexture.resource.source.muted = true;
    videoSprite.interactive = true;
    videoSprite.texture.baseTexture.resource.source.addEventListener('ended', () => {
        videoSprite.texture.baseTexture.resource.source.play();
    });
    container.addChild(videoSprite);
}


function initDistortionFilter() {
    const distortionFragmentShaderCode = resources['/shaders/distortshader.glsl'].data;
    const distortionFilter = new PIXI.Filter(undefined, distortionFragmentShaderCode, uniforms);
    app.stage.filters.push(distortionFilter);
}

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

        uniforms.uTime += isDown;
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
    const {x, y} = e.data.global
    pointerDownTarget = 1
    isDown = 0;
    pointerStart.set(x, y)
    pointerDiffStart = uniforms.uPointerDiff.clone()
}

function onPointerUp() {
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

let deltaWheel = 0;
let isTimerRunning = false;
let delayTime = 600;
let scrolling = false;

function onWheelScroll(e) {
    if (isTimerRunning) {
        return;
    }
    scrolling = true;
    deltaWheel = e.deltaY;

    if (e.deltaY >= 150) {
        currentMedia++;
        if (currentMedia >= allImages.length || currentMedia >= allVideos.length) {
            currentMedia = 0;
        }
        gsap.to(title, {opacity:0, onComplete:changeTitle, duration:1})

        initRectsAndImages(currentMedia);

        isTimerRunning = true;
        setTimeout(() => {
            isTimerRunning = false;
        }, delayTime);
    }
}

function changeTitle(){
    switch (currentMedia) {
        case 0:
            title.textContent = "The Small Things";
            break;
        case 1:
            title.textContent = "Your Project now";
    }
    gsap.to(title, {opacity:1, duration:1})
}



function init() {
    initDimensions();
    initUniforms();
    initGrid();
    initApp();

    console.log(Loader)
    Loader.shared.add([
        '/shaders/infinityShader.glsl',
        '/shaders/distortshader.glsl',
        '/shaders/gridshader.glsl',
        '/shaders/scrollShader.glsl'
    ]).load(() => {
        // Once the resources are loaded, initialize the rest of your app
        resources = Loader.shared.resources;
        initBackground();
        initContainer();
        initRectsAndImages(0);
        initEvents();
        app.stage.filters = [];
        initInfinityFilter();
        initDistortionFilter();
        initScrollFilter();
    });
}

init();