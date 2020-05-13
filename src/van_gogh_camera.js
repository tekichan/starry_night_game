/**
 * Van Gogh Camera JS
 * @author  Teki Chan
 * @since   13 May 2020
 */
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as $ from 'jquery';
window.$ = $;

import image_portrait_01 from './images/van_gogh_portrait_01.jpg';
import image_portrait_02 from './images/van_gogh_portrait_02.jpg';
import image_portrait_03 from './images/van_gogh_portrait_03.jpg';

import image_home_button from './images/home_button.png';
import image_change_button from './images/change_button.png';
import image_camera_button from './images/camera_button.png';

import VanGoghFaceFilter from './VanGoghFaceFilter';
import './css/van_gogh_camera.css';

/**
 * Painting Options
 */
const PAINTING_OPTIONS = [
    {
        artPainting: image_portrait_01
        , detectState: false // { x: -0.05, y: 0.12, s: 0.25, ry: -0.04926 }
    }
    , {
        artPainting: image_portrait_02
        , detectState: false
    }
    , {
        artPainting: image_portrait_03
        , detectState: false
    }
]

/**
 * Face Filter Settings
 */
const SETTINGS = {
    // art painting settings:
    artPainting: image_portrait_01, // initial art painting

    //detect state in the initial art painting to avoid search step
    detectState: {x:-0.09803,y:0.44314,s:0.18782,ry:-0.04926},

    nDetectsArtPainting: 25, // number of positive detections to perfectly locate the face in the art painting
    detectArtPaintingThreshold: 0.6,
    artPaintingMaskScale: [1.3, 1.5],
    artPaintingMaskOffset: [0.01, 0.10], //relative. 1-> 100% scale mask width of the image (or height)
    artPaintingCropSmoothEdge: 0.25, //crop smooth edge
    artPaintingHeadForheadY: 0.7, //forhead start when Y>this value. Max: 1
    artPaintingHeadJawY: 0.5, //lower jaw start when Y<this value. Max: 1

    // user crop face and detection settings:
    videoDetectSizePx: 1024,
    faceRenderSizePx: 256,
    zoomFactor: 1.03, //1-> exactly the same zoom than for the art painting
    detectionThreshold: 0.65, //sensibility, between 0 and 1. Less -> more sensitive
    detectionHysteresis: 0.03,

    // mixed settings:
    hueTextureSizePx: 4,  //should be PoT

    // debug flags - should be set to false for standard running:
    debugArtpaintingCrop: false
};

/**
 * Painting Setting
 */
const ARTPAINTING = {
    baseTexture: false,
    potFaceCutTexture: null,
    potFaceCutTextureSizePx: 0,
    hueTexture: null,
    detectCounter: 0,
    image: new Image(),
    canvasMask: false,
    url: -1,
    positionFace: [0, 0],
    scaleFace: [1, 1],
    detectedState: false
};

/**
 * Face Filter declaration
 */
let vanGoghFaceFilter = null;

/**
 * Index of Painting Options
 */
let paintingOptionIdx = 0;

/**
 * Setup buttons in the screen
 */
function setupButtons() {
    document.getElementById('homeButtonImg').src = image_home_button;
    document.getElementById('changeButtonImg').src = image_change_button;
    document.getElementById('cameraButtonImg').src = image_camera_button;
    $('#changeButton').click(function(_event) {
        paintingOptionIdx++;
        paintingOptionIdx = paintingOptionIdx % PAINTING_OPTIONS.length;
        updatePaintingOption()     
    });    
    $('#cameraButton').click(function(_event) {
        vanGoghFaceFilter.saveImage(_event);
    });
}

/**
 * Build Painting with the current option index
 */
function buildPaintingOption() {
    let settings = SETTINGS;
    settings.artPainting = PAINTING_OPTIONS[paintingOptionIdx].artPainting;
    settings.detectState = PAINTING_OPTIONS[paintingOptionIdx].detectState;
    vanGoghFaceFilter = new VanGoghFaceFilter(
        settings
        , ARTPAINTING
        , document.getElementById('artpaintingContainer')
        , 'jeeFaceFilterCanvas'
    );    
}

/**
 * Update Painting with the current option index
 */
function updatePaintingOption() {
    console.log('paintingOptionIdx: ' + paintingOptionIdx);
    let settings = SETTINGS;
    settings.artPainting = PAINTING_OPTIONS[paintingOptionIdx].artPainting;
    settings.detectState = PAINTING_OPTIONS[paintingOptionIdx].detectState;
    vanGoghFaceFilter.change_artPainting(
        PAINTING_OPTIONS[paintingOptionIdx].artPainting
        , PAINTING_OPTIONS[paintingOptionIdx].detectState
    );
}

/**
 * Process when jQuery is ready
 */
$( document ).ready(function() {
    console.log('jQuery is ready');
    setupButtons();
    buildPaintingOption()
    vanGoghFaceFilter.main();
});
