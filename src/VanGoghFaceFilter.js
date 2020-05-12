import JEEFACEFILTERAPI from './vendors/jeelizFaceFilter/dist/jeelizFaceFilterES6';
import NNC_JSON from './vendors/jeelizFaceFilter/dist/NNC.json';

export const STATES = { //possible states of the app. ENUM equivalent
    ERROR: -1,
    IDLE: 0,
    LOADING: 1,
    DETECTARTPAINTINGFACE: 2,
    DETECTUSERFACE: 3,
    BUSY: 4,
    ARTPAINTINGFACEDETECTPROVIDED: 5
};

// compile a shader:
const compile_shader = (GL, source, type, typeString) => {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
        console.log('Buggy shader source: \n', source);
        return false;
    }
    return shader;
};

// draw in search mode:
const draw_search = (GL, FFSPECS, SHPS, detectState) => {
    GL.useProgram(SHPS.search.program);
    GL.viewport(0, 0, FFSPECS.canvasElement.width, FFSPECS.canvasElement.height);
    GL.uniform4f(SHPS.search.uxysw, detectState.x, detectState.y,
        detectState.s, detectState.s * FFSPECS.canvasElement.width / FFSPECS.canvasElement.height);
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, FFSPECS.videoTexture);
    GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
}

// helper function to build the shader program:
const build_shaderProgram = (GL, shaderVertexSource, shaderFragmentSource, id) => {
    // compile both shader separately:
    const shaderVertex = compile_shader(GL, shaderVertexSource, GL.VERTEX_SHADER, "VERTEX " + id);
    const shaderFragment = compile_shader(GL, shaderFragmentSource, GL.FRAGMENT_SHADER, "FRAGMENT " + id);

    const shaderProgram = GL.createProgram();
    GL.attachShader(shaderProgram, shaderVertex);
    GL.attachShader(shaderProgram, shaderFragment);

    // start the linking stage:
    GL.linkProgram(shaderProgram);
    const aPos = GL.getAttribLocation(shaderProgram, "position");
    GL.enableVertexAttribArray(aPos);

    return shaderProgram;
}; //end build_shaderProgram()

export default class VanGoghFaceFilter {
    constructor(
        settings
        , artPainting
        , doMartPaintingContainer
        , faceCanvasId
    ) {
        this.SETTINGS = settings;
        this.ARTPAINTING = artPainting;

        this.USERCROP = {
            faceCutDims: [0, 0],
            potFaceCutTexture: null,
            hueTexture: null,
        };
        
        this.SHPS = { //shaderprograms
            cropUserFace: null,
            copy: null
        };
        
        this.DOMARTPAINTINGCONTAINER = doMartPaintingContainer;
        this.faceCanvasId = faceCanvasId;

         //WebGL global stuffs
        this.GL = null;
        this.GLDRAWTARGET = null;
        this.FBO = null;

        this.NLOADEDS = 0;
        this.FFSPECS = null;

        this.STATE = STATES.IDLE;
        this.ISUSERFACEDETECTED = false;
    }

    check_isLoaded(label) {
        console.log('INFO in check_isLoaded(): ', label, 'is loaded');
        if (++(this.NLOADEDS) === 2) {
            this.start();
        }
    }

    main() {
        let ARTPAINTING = this.ARTPAINTING;
        let SETTINGS = this.SETTINGS;
        let self = this;

        this.STATE = STATES.LOADING;
    
        ARTPAINTING.image.src = SETTINGS.artPainting;
        ARTPAINTING.image.onload = this.check_isLoaded.bind(this, 'ARTPAINTING.image');
    
        console.log(ARTPAINTING.image.src);
    
        JEEFACEFILTERAPI.init({
            canvasId: self.faceCanvasId,
            NNC: NNC_JSON,
            callbackReady: function (errCode, spec) {
                console.log('callbackReady is called');

                if (errCode) {
                    console.log('AN ERROR HAPPENS. ERROR CODE =', errCode);
                    STATE = STATES.ERROR;
                    return;
                }
    
                self.FFSPECS = spec;
                self.GL = spec.GL;
                self.FBO = self.GL.createFramebuffer();
                self.GLDRAWTARGET = (self.GL.DRAW_FRAMEBUFFER) ? self.GL.DRAW_FRAMEBUFFER : self.GL.FRAMEBUFFER;
    
                console.log('INFO: JEEFACEFILTERAPI IS READY: ' + self.STATE);
                self.check_isLoaded('JEEFACEFILTERAPI');
            }, //end callbackReady()
    
            //called at each render iteration (drawing loop)
            callbackTrack: function (detectState) {
                return self.callbackTrack(detectState);
            }
        }); //end JEEFACEFILTERAPI.init
    }
    
    start() {
        console.log('INFO: start()');
    
        this.create_textures();
        this.build_shps();
    
        // set the canvas to the artpainting size:
        this.update_artPainting(this.SETTINGS.detectState);
    } //end start()

    update_artPainting(detectState) { //called both at start (start()) and when user change the art painting
        let FFSPECS = this.FFSPECS;
        let ARTPAINTING = this.ARTPAINTING;
        let GL = this.GL;

        FFSPECS.canvasElement.width = ARTPAINTING.image.width;
        FFSPECS.canvasElement.height = ARTPAINTING.image.height;
        JEEFACEFILTERAPI.resize();
    
        // create or update the artpainting webgl texture:
        if (!ARTPAINTING.baseTexture) {
            ARTPAINTING.baseTexture = GL.createTexture();
        }
        GL.bindTexture(GL.TEXTURE_2D, ARTPAINTING.baseTexture);
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, ARTPAINTING.image);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    
        JEEFACEFILTERAPI.set_inputTexture(ARTPAINTING.baseTexture, ARTPAINTING.image.width, ARTPAINTING.image.height);
    
        ARTPAINTING.detectCounter = 0;
        FFSPECS.canvasElement.classList.remove('canvasDetected');
        FFSPECS.canvasElement.classList.remove('canvasNotDetected');
        FFSPECS.canvasElement.classList.add('artPainting');
    
        FFSPECS.canvasElement.style.top = '';
        FFSPECS.canvasElement.style.left = '';
        FFSPECS.canvasElement.style.width = '';
    
        if (detectState) {
            this.STATE = STATES.ARTPAINTINGFACEDETECTPROVIDED;
            ARTPAINTING.detectedState = detectState;
        } else {
            this.STATE = STATES.DETECTARTPAINTINGFACE;
        }
    } //end update_artPainting()

    create_textures() {
        let GL = this.GL;
        let SETTINGS = this.SETTINGS;
        let ARTPAINTING = this.ARTPAINTING;
        let USERCROP = this.USERCROP;

        const create_emptyTexture = function (w, h) {
            const tex = GL.createTexture();
            GL.bindTexture(GL.TEXTURE_2D, tex);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, w, h, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
            return tex;
        };
    
        const create_emptyLinearTexture = function (w, h) {
            const tex = create_emptyTexture(w, h);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
            return tex;
        };
    
        // create the artpainting and userCrop hue textures:
        const create_hueTexture = function () {
            return create_emptyLinearTexture(SETTINGS.hueTextureSizePx, SETTINGS.hueTextureSizePx);
        };
        ARTPAINTING.hueTexture = create_hueTexture();
        USERCROP.hueTexture = create_hueTexture();
    
        // create the userCrop textures:
        const faceAspectRatio = SETTINGS.artPaintingMaskScale[1] / SETTINGS.artPaintingMaskScale[0];
        USERCROP.faceCutDims[0] = SETTINGS.faceRenderSizePx;
        USERCROP.faceCutDims[1] = Math.round(SETTINGS.faceRenderSizePx * faceAspectRatio);
    
        USERCROP.potFaceCutTexture = create_emptyTexture(SETTINGS.faceRenderSizePx, SETTINGS.faceRenderSizePx);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
    } //end create_textures()
    
    build_artPaintingMask(detectState, callback) {
        let GL = this.GL;
        let SETTINGS = this.SETTINGS;
        let ARTPAINTING = this.ARTPAINTING;
        let FFSPECS = this.FFSPECS;
        let SHPS = this.SHPS;
        let GLDRAWTARGET = this.GLDRAWTARGET;
        let FBO = this.FBO;

        // cut the face with webgl and put a fading:
        console.log('INFO: build_artPaintingMask()');
    
        const x = detectState.x, y = detectState.y, s = detectState.s, ry = detectState.ry;
    
        // compute normalized frame cut params:
        const xn = x * 0.5 + 0.5 + s * SETTINGS.artPaintingMaskOffset[0] * Math.sin(ry); // normalized x position
        const yn = y * 0.5 + 0.5 + s * SETTINGS.artPaintingMaskOffset[1];
        const sxn = s * SETTINGS.artPaintingMaskScale[0];
        const syn = s * SETTINGS.artPaintingMaskScale[1] * ARTPAINTING.image.width / ARTPAINTING.image.height;
    
        ARTPAINTING.positionFace[0] = xn;
        ARTPAINTING.positionFace[1] = yn;
        ARTPAINTING.scaleFace[0] = sxn;
        ARTPAINTING.scaleFace[1] = syn;
    
        // build the mask (the artPainting with the hole cut)
        GL.useProgram(SHPS.buildMask.program);
        GL.uniform2f(SHPS.buildMask.offset, xn, yn);
        GL.uniform2f(SHPS.buildMask.scale, sxn, syn);
    
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, ARTPAINTING.baseTexture);
    
        // FILL VIEWPORT
        GL.enable(GL.BLEND);
        GL.blendFunc(GL.SRC_ALPHA, GL.ZERO);
        GL.clearColor(0., 0., 0., 0.);
        GL.clear(GL.COLOR_BUFFER_BIT);
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
        GL.disable(GL.BLEND);
    
        // copy the face cuted to a dumb canvas2D which will be displayed in the DOM:
        const artPaintingMask = document.createElement('canvas');
        artPaintingMask.width = ARTPAINTING.image.width;
        artPaintingMask.height = ARTPAINTING.image.height;
        const ctx = artPaintingMask.getContext('2d');
        ctx.drawImage(FFSPECS.canvasElement, 0, 0);
    
        artPaintingMask.classList.add('artPainting');
        FFSPECS.canvasElement.classList.remove('artPainting');
        FFSPECS.canvasElement.classList.add('canvasNotDetected');
        this.ISUSERFACEDETECTED = false;
        ARTPAINTING.canvasMask = artPaintingMask;
        this.DOMARTPAINTINGCONTAINER.appendChild(artPaintingMask);
    
        // initialize the face cut pot texture:
        const faceWidthPx = Math.round(ARTPAINTING.image.width * sxn);
        const faceHeightPx = Math.round(ARTPAINTING.image.height * syn);
        const maxDimPx = Math.max(faceWidthPx, faceHeightPx);
        ARTPAINTING.potFaceCutTextureSizePx = Math.pow(2, Math.ceil(Math.log(maxDimPx) / Math.log(2)));
        ARTPAINTING.potFaceCutTexture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, ARTPAINTING.potFaceCutTexture);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, ARTPAINTING.potFaceCutTextureSizePx, ARTPAINTING.potFaceCutTextureSizePx, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
    
        // compute the face cut pot texture by doing render to texture:
        GL.useProgram(SHPS.cropUserFace.program);
        GL.uniform2f(SHPS.cropUserFace.offset, xn, yn);
        GL.uniform2f(SHPS.cropUserFace.scale, sxn, syn);
    
        GL.bindFramebuffer(GLDRAWTARGET, FBO);
        GL.bindTexture(GL.TEXTURE_2D, ARTPAINTING.baseTexture);
        GL.viewport(0, 0, ARTPAINTING.potFaceCutTextureSizePx, ARTPAINTING.potFaceCutTextureSizePx);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, ARTPAINTING.potFaceCutTexture, 0);
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0); //FILL VIEWPORT
    
        // copy the ARTPAINTING.potFaceCutTexture to ARTPAINTING.hueTexture:
        GL.useProgram(SHPS.copyInvX.program);
        GL.viewport(0, 0, SETTINGS.hueTextureSizePx, SETTINGS.hueTextureSizePx);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, ARTPAINTING.hueTexture, 0);
        GL.bindTexture(GL.TEXTURE_2D, ARTPAINTING.potFaceCutTexture);
        GL.generateMipmap(GL.TEXTURE_2D);
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0); //FILL VIEWPORT
    
        GL.bindFramebuffer(GLDRAWTARGET, null);
        callback();
    } //end build_artPaintingMask()
    
    build_shps() {
        let GL = this.GL;
        let SETTINGS = this.SETTINGS;
        let SHPS = this.SHPS;     

        const copyVertexShaderSource = "attribute vec2 position;\n\
        varying vec2 vUV;\n\
        void main(void){\n\
          gl_Position=vec4(position, 0., 1.);\n\
          vUV=0.5+0.5*position;\n\
        }";
    
        const copyFragmentShaderSource = "precision lowp float;\n\
        uniform sampler2D samplerImage;\n\
        varying vec2 vUV;\n\
        \n\
        void main(void){\n\
          gl_FragColor=texture2D(samplerImage, vUV);\n\
        }";
    
        // build the search SHP:
        const shpSearch = build_shaderProgram(GL, copyVertexShaderSource,
            "precision lowp float;\n\
          varying vec2 vUV;\n\
          uniform sampler2D samplerVideo;\n\
          uniform vec4 uxysw;\n\
          \n\
          void main(void) {\n\
            vec3 colorVideo=texture2D(samplerVideo, vUV).rgb;\n\
            vec2 pos=vUV*2.-vec2(1.,1.);\n\
            vec2 isInside=step(uxysw.xy-uxysw.zw, pos);\n\
            isInside*=step(pos, uxysw.xy+uxysw.zw);\n\
            vec2 blendCenterFactor=abs(pos-uxysw.xy)/uxysw.zw;\n\
            float alpha=isInside.x*isInside.y*pow(max(blendCenterFactor.x, blendCenterFactor.y), 3.);\n\
            vec3 color=mix(colorVideo, vec3(0.,0.6,1.), alpha);\n\
            gl_FragColor=vec4(color,1.);\n\
          }",
            "SEARCH FACE"
        );
        SHPS.search = {
            program: shpSearch,
            samplerVideo: GL.getUniformLocation(shpSearch, 'samplerVideo'),
            uxysw: GL.getUniformLocation(shpSearch, 'uxysw')
        };
        GL.useProgram(shpSearch);
        GL.uniform1i(SHPS.search.samplerVideo, 0);
    
        // ARTPAINTING SHPS:
        const set_apShp = function (shp) {
            const uSamplerImage = GL.getUniformLocation(shp, 'samplerImage');
            const uScale = GL.getUniformLocation(shp, 'scale');
            const uOffset = GL.getUniformLocation(shp, 'offset');
    
            GL.useProgram(shp);
            GL.uniform1i(uSamplerImage, 0);
    
            return {
                scale: uScale,
                offset: uOffset,
                program: shp
            };
        };
    
        let alphaShaderChunk = "float alpha=0.;\n\
          vec2 uv=(vUV-offset+s2)/(2.*s2); //uv normalized in the face\n\
          if (uv.y>UPPERHEADY){ // upper head: circle arc\n\
            vec2 uvc=(uv-vec2(0.5,UPPERHEADY))*vec2(1., 0.5/(1.-UPPERHEADY));\n\
            float alphaBorder=smoothstep(0.5-SMOOTHEDGE, 0.5, length(uvc));\n\
            float alphaCenter=smoothstep(UPPERHEADY, 1., uv.y);\n\
            alpha=mix(alphaCenter, alphaBorder, smoothstep(0.3, 0.4, abs(uv.x-0.5)));\n\
          } else if (uv.y<LOWERHEADY){ // lower head: circle arc \n\
            vec2 uvc=(uv-vec2(0.5, LOWERHEADY))*vec2(1., 0.5/LOWERHEADY);\n\
            alpha=smoothstep(0.5-SMOOTHEDGE, 0.5, length(uvc));\n\
          } else { // middle head: straight\n\
            vec2 uvc=vec2(uv.x-0.5, 0.);\n\
            alpha=smoothstep(0.5-SMOOTHEDGE, 0.5,length(uvc));\n\
          }\n";
        alphaShaderChunk += "float grayScale=dot(color, vec3(0.33,0.33,0.33));\n\
                 if (alpha>0.01){\n\
                alpha=mix(pow(alpha, 0.5), pow(alpha, 1.5), smoothstep(0.1,0.5,grayScale));\n\
                 }";
    
        const shpBuildMask = build_shaderProgram(GL, copyVertexShaderSource,
    
            "precision highp float;\n\
         uniform vec2 offset, scale;\n\
         uniform sampler2D samplerImage;\n\
         varying vec2 vUV;\n\
         \n\
         const float UPPERHEADY=" + SETTINGS.artPaintingHeadForheadY.toFixed(2) + ";\n\
         const float LOWERHEADY=" + SETTINGS.artPaintingHeadJawY.toFixed(2) + ";\n\
         const float SMOOTHEDGE=" + SETTINGS.artPaintingCropSmoothEdge.toFixed(2) + ";\n\
         \n\
         \n\
         void main(void){\n\
           vec2 s2=0.5*scale;\n\
           vec2 isFace=step(vUV, offset+s2)*step(offset-s2, vUV);\n\
           float isNotFace=1.-isFace.x*isFace.y;\n\
           if (isNotFace>0.01){\n\
             gl_FragColor=texture2D(samplerImage, vUV); return;\n\
           }\n\
           vec3 color=texture2D(samplerImage, vUV).rgb;\n\
           "+ alphaShaderChunk + "\
           gl_FragColor=vec4(color, alpha);\n\
           "+ ((SETTINGS.debugArtpaintingCrop) ? "gl_FragColor=vec4(1.,0.,0.,1.);" : "") + "\n\
         }",
    
            'BUILD ARTPAINTING MASK');
        SHPS.buildMask = set_apShp(shpBuildMask);
    
        // this SHP is only used to crop the face to compute the hueTexture:
        const shpCutFace = build_shaderProgram(GL, "attribute vec2 position;\n\
         uniform vec2 offset, scale;\n\
         varying vec2 vUV;\n\
         void main(void){\n\
          gl_Position=vec4(position, 0., 1.);\n\
          vUV=offset+0.5*position*scale;\n\
         }",
            "precision lowp float;\n\
         uniform sampler2D samplerImage;\n\
         varying vec2 vUV;\n\
         const float BORDER=0.2;\n\
         \n\
         void main(void){\n\
           vec2 uvCentered=2.0*vUV-vec2(1.,1.);\n\
           float ruv=length(uvCentered);\n\
           vec2 uvn=uvCentered/ruv;\n\
           vec2 uvBorder=uvn*(1.-BORDER);\n\
           float isOutside=step(1.-BORDER, ruv);\n\
           uvCentered=mix(uvCentered, uvBorder, isOutside);\n\
           gl_FragColor=texture2D(samplerImage, uvCentered*0.5+vec2(0.5,0.5));\n\
         }",
            'CUT ARTPAINTING FACE');
        SHPS.cropUserFace = set_apShp(shpCutFace);
    
        // build the copy shader program:
        const shpCopy = build_shaderProgram(GL, copyVertexShaderSource, copyFragmentShaderSource, 'COPY');
        SHPS.copy = {
            program: shpCopy
        };
        let uSamplerImage = GL.getUniformLocation(shpCopy, 'samplerImage');
        GL.useProgram(shpCopy);
        GL.uniform1i(uSamplerImage, 0);
    
        // build the copyInvX shader program:
        const shpCopyInvX = build_shaderProgram(GL, copyVertexShaderSource.replace('vUV=0.5+0.5*position', 'vUV=0.5+vec2(-0.5,0.5)*position'),
            copyFragmentShaderSource, 'COPYINVX');
        SHPS.copyInvX = {
            program: shpCopyInvX
        };
        uSamplerImage = GL.getUniformLocation(shpCopyInvX, 'samplerImage');
        GL.useProgram(shpCopyInvX);
        GL.uniform1i(uSamplerImage, 0);
    
        // final render shp:
        const shpRender = build_shaderProgram(GL, copyVertexShaderSource,
            "precision highp float;\n\
         uniform sampler2D samplerImage, samplerHueSrc, samplerHueDst;\n\
         uniform vec2 offset, scale;\n\
         varying vec2 vUV;\n\
         const vec2 EPSILON2=vec2(0.001, 0.001);\n\
         \n\
         vec3 rgb2hsv(vec3 c) { //from http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl\n\
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n\
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n\
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\
          float d = q.x - min(q.w, q.y);\n\
          float e = 1.0e-10;\n\
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n\
         }\n\
         \n\
         vec3 hsv2rgb(vec3 c) { //from https://github.com/hughsk/glsl-hsv2rgb \n\
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); \n\
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); \n\
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); \n\
          //return c.z * normalize(mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y));\n\
         } \n\
         \n\
         void main(void){\n\
           // flip left-right:\n\
           vec2 uv=vec2(1.-vUV.x, vUV.y);\n\
           // get color in HSV format:\n\
           vec2 uvCut=uv*scale+offset-scale/2.;\n\
           vec3 colorRGB=texture2D(samplerImage, uvCut).rgb;\n\
           vec3 colorHSV=rgb2hsv(colorRGB);\n\
           // compute color transform:\n\
           vec3 srcRGB=texture2D(samplerHueSrc, uv).rgb;\n\
           vec3 dstRGB=texture2D(samplerHueDst, uv).rgb;\n\
           vec3 srcHSV=rgb2hsv(srcRGB);\n\
           vec3 dstHSV=rgb2hsv(dstRGB);\n\
           // apply the transform:\n\
           vec2 factorSV=vec2(1.,0.8)*dstHSV.yz/(srcHSV.yz+EPSILON2);\n\
           factorSV=clamp(factorSV, vec2(0.3,0.3), vec2(3,3.));\n\
           //factorSV.x=mix(0., factorSV.x, smoothstep(0.02, 0.3, colorHSV.z) );\n\
           float dHue=dstHSV.x-srcHSV.x;\n\
           vec3 colorHSVout=vec3(mod(1.0+colorHSV.x+dHue, 1.0), colorHSV.yz*factorSV);\n\
           colorHSVout=clamp(colorHSVout, vec3(0.,0.,0.), vec3(1.,1.,1));\n\
           //vec3 colorHSVout2=vec3(dstHSV.xy, colorHSVout.z);\n\
           //colorHSVout=mix(colorHSVout2, colorHSVout, smoothstep(0.2,0.4,colorHSV.y)); //0.6->0.8\n\
           //colorHSVout=mix(colorHSVout, colorHSVout2, smoothstep(0.5,1.,colorHSV.z)); //0.6->0.8\n\
           // reconvert to RGB and output the color:\n\
           colorRGB=hsv2rgb(colorHSVout);\n\
           gl_FragColor=vec4(colorRGB, 1.);\n\
         }",
            'FINAL RENDER FACE'
        );
        SHPS.render = {
            program: shpRender,
            scale: GL.getUniformLocation(shpRender, 'scale'),
            offset: GL.getUniformLocation(shpRender, 'offset')
        };
        uSamplerImage = GL.getUniformLocation(shpRender, 'samplerImage');
        const uSamplerHueSrc = GL.getUniformLocation(shpRender, 'samplerHueSrc');
        const uSamplerHueDst = GL.getUniformLocation(shpRender, 'samplerHueDst');
        GL.useProgram(shpRender);
        GL.uniform1i(uSamplerImage, 0);
        GL.uniform1i(uSamplerHueSrc, 2);
        GL.uniform1i(uSamplerHueDst, 1);
    } //end build_shps()

    reset_toVideo() {
        console.log('reset_toVideo is ready: ' + this.STATE);

        let FFSPECS = this.FFSPECS;
        let SETTINGS = this.SETTINGS;

        this.position_userCropCanvas();
        window.addEventListener('resize', this.position_userCropCanvas, false);
    
        FFSPECS.canvasElement.width = SETTINGS.videoDetectSizePx;
        FFSPECS.canvasElement.height = SETTINGS.videoDetectSizePx;
        JEEFACEFILTERAPI.resize();
    
        JEEFACEFILTERAPI.reset_inputTexture();
        this.STATE = STATES.DETECTUSERFACE;
    }
    
    position_userCropCanvas() {
        let FFSPECS = this.FFSPECS;
        let ARTPAINTING = this.ARTPAINTING;
        let SETTINGS = this.SETTINGS;

        console.log('INFO: position_userCropCanvas()');
        const restoredPosition = FFSPECS.canvasElement.style.position;
        FFSPECS.canvasElement.style.position = 'absolute';
    
        // compute topPx an leftPx in the artpainting canvas image ref:
        let topPx = ARTPAINTING.image.height * ARTPAINTING.positionFace[1];
        let leftPx = ARTPAINTING.image.width * ARTPAINTING.positionFace[0];
        let widthFacePx = ARTPAINTING.image.width * ARTPAINTING.scaleFace[0];
        let heightFacePx = ARTPAINTING.image.height * ARTPAINTING.scaleFace[1];
        let widthPx = widthFacePx * SETTINGS.videoDetectSizePx / SETTINGS.faceRenderSizePx; //the whole canvas is bigger than the user face rendering
        topPx = ARTPAINTING.image.height - topPx; //Y axis is inverted between WebGL viewport and CSS
    
        //t ake account of the CSS scale factor of the art painting:
        const domRect = this.DOMARTPAINTINGCONTAINER.getBoundingClientRect();
        const cssScaleFactor = domRect.width / ARTPAINTING.image.width;
        topPx *= cssScaleFactor;
        leftPx *= cssScaleFactor;
        widthPx *= cssScaleFactor;
        widthFacePx *= cssScaleFactor;
        heightFacePx *= cssScaleFactor;
    
        // position corner of the userFace instead of center:
        topPx -= heightFacePx / 2;
        leftPx -= widthFacePx / 2;
    
        FFSPECS.canvasElement.style.top = Math.round(topPx).toString() + 'px';
        FFSPECS.canvasElement.style.left = Math.round(leftPx).toString() + 'px';
        FFSPECS.canvasElement.style.width = Math.round(widthPx).toString() + 'px';
    
        FFSPECS.canvasElement.style.position = restoredPosition;
    } //end position_userCropCanvas()
    

    // draw final render:
    draw_render(detectState) {
        let GL = this.GL;
        let FFSPECS = this.FFSPECS;
        let GLDRAWTARGET = this.GLDRAWTARGET;
        let SETTINGS = this.SETTINGS;
        let ARTPAINTING = this.ARTPAINTING;
        let SHPS = this.SHPS;
        let USERCROP = this.USERCROP;

        // do RTT:
        GL.bindFramebuffer(this.GLDRAWTARGET, this.FBO);

        // crop the user's face and put the result to USERCROP.potFaceCutTexture:
        const s = detectState.s / SETTINGS.zoomFactor;
        const xn = detectState.x * 0.5 + 0.5 + s * SETTINGS.artPaintingMaskOffset[0] * Math.sin(detectState.ry); //normalized x position
        const yn = detectState.y * 0.5 + 0.5 + s * SETTINGS.artPaintingMaskOffset[1];
        const sxn = s * SETTINGS.artPaintingMaskScale[0];
        const syn = s * SETTINGS.artPaintingMaskScale[1];

        GL.useProgram(SHPS.cropUserFace.program);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, USERCROP.potFaceCutTexture, 0);
        GL.uniform2f(SHPS.cropUserFace.offset, xn, yn);
        GL.uniform2f(SHPS.cropUserFace.scale, sxn, syn);
        GL.viewport(0, 0, SETTINGS.faceRenderSizePx, SETTINGS.faceRenderSizePx);
        GL.bindTexture(GL.TEXTURE_2D, FFSPECS.videoTexture);
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);


        // shrink the userface to a SETTINGS.hueTextureSizePx texture:
        GL.useProgram(SHPS.copy.program);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, USERCROP.hueTexture, 0);
        GL.viewport(0, 0, SETTINGS.hueTextureSizePx, SETTINGS.hueTextureSizePx);
        GL.bindTexture(GL.TEXTURE_2D, USERCROP.potFaceCutTexture);
        GL.generateMipmap(GL.TEXTURE_2D);
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);


        // final rendering including light correction:
        GL.bindFramebuffer(GLDRAWTARGET, null);
        GL.useProgram(SHPS.render.program);
        GL.uniform2f(SHPS.render.offset, xn, yn);
        GL.uniform2f(SHPS.render.scale, sxn, syn);
        GL.bindTexture(GL.TEXTURE_2D, FFSPECS.videoTexture);
        GL.activeTexture(GL.TEXTURE1);
        GL.bindTexture(GL.TEXTURE_2D, ARTPAINTING.hueTexture);
        //GL.bindTexture(GL.TEXTURE_2D, ARTPAINTING.potFaceCutTexture); //KILL

        GL.activeTexture(GL.TEXTURE2);
        GL.bindTexture(GL.TEXTURE_2D, USERCROP.hueTexture);
        GL.activeTexture(GL.TEXTURE0);
        GL.viewport(0, SETTINGS.videoDetectSizePx - USERCROP.faceCutDims[1], USERCROP.faceCutDims[0], USERCROP.faceCutDims[1]);
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
    }//end draw_render()

    callbackTrack(detectState) {
        console.log('callbackTrack is called: ' + this.STATE);

        let SETTINGS = this.SETTINGS;
        let ARTPAINTING = this.ARTPAINTING;
        let GL = this.GL;
        let FFSPECS = this.FFSPECS;
        let SHPS = this.SHPS;
        let ISUSERFACEDETECTED = this.ISUSERFACEDETECTED;
        let self = this;
        
        switch (this.STATE) {
            case STATES.DETECTARTPAINTINGFACE:
                if (detectState.detected > SETTINGS.detectArtPaintingThreshold) {
                    if (++ARTPAINTING.detectCounter > SETTINGS.nDetectsArtPainting) {
                        const round = function (n) { return Math.round(n * 1e5) / 1e5; }
                        console.log('FACE DETECTED IN THE BASE PICTURE. detectState = ' + JSON.stringify({
                            x: round(detectState.x),
                            y: round(detectState.y),
                            s: round(detectState.s),
                            ry: round(detectState.ry)
                        }).replace(/"/g, ''));
                        this.STATE = STATES.BUSY;
                        this.build_artPaintingMask(
                            detectState
                            , function() {
                                self.reset_toVideo();
                            }
                        );
                        return;
                    }
                }
                draw_search(GL, FFSPECS, SHPS, detectState);
                break;

            case STATES.ARTPAINTINGFACEDETECTPROVIDED:
                this.STATE = STATES.BUSY;
                this.build_artPaintingMask(
                    ARTPAINTING.detectedState
                    , function() {
                        self.reset_toVideo();
                    }
                );
                break;

            case STATES.DETECTUSERFACE:
                if (ISUSERFACEDETECTED && detectState.detected < SETTINGS.detectionThreshold - SETTINGS.detectionHysteresis) {
                    // DETECTION LOST
                    ISUSERFACEDETECTED = false;
                    FFSPECS.canvasElement.classList.remove('canvasDetected');
                    FFSPECS.canvasElement.classList.add('canvasNotDetected');
                } else if (!ISUSERFACEDETECTED && detectState.detected > SETTINGS.detectionThreshold + SETTINGS.detectionHysteresis) {
                    // FACE DETECTED
                    ISUSERFACEDETECTED = true;
                    FFSPECS.canvasElement.classList.remove('canvasNotDetected');
                    FFSPECS.canvasElement.classList.add('canvasDetected');
                }

                if (ISUSERFACEDETECTED) {
                    this.draw_render(detectState);
                } else {
                    draw_search(GL, FFSPECS, SHPS, detectState);
                }

                break;
        } //end switch(STATE)
    } //end callbackTrack

    saveImage(_event) {
        let ARTPAINTING = this.ARTPAINTING;
        let SETTINGS = this.SETTINGS;

        // compute topPx an leftPx in the artpainting canvas image ref:
        let topPx = ARTPAINTING.image.height * ARTPAINTING.positionFace[1];
        let leftPx = ARTPAINTING.image.width * ARTPAINTING.positionFace[0];
        let widthFacePx = ARTPAINTING.image.width * ARTPAINTING.scaleFace[0];
        let heightFacePx = ARTPAINTING.image.height * ARTPAINTING.scaleFace[1];
        topPx = ARTPAINTING.image.height - topPx; //Y axis is inverted between WebGL viewport and CSS
        topPx -= heightFacePx / 2;
        leftPx -= widthFacePx / 2;
        
        let final_canvas = document.createElement("canvas");
        final_canvas.width = 1300;
        final_canvas.height = 1600;
        let ctx = final_canvas.getContext("2d");
        ctx.drawImage(
            document.getElementById(this.faceCanvasId)
            , leftPx
            , topPx
            , widthFacePx * 3.85
            , heightFacePx * 3.3
        );
        ctx.drawImage(document.getElementsByClassName('artPainting')[0], 0, 0);
        
        final_canvas.toBlob((blob) => {
            let URLObj = window.URL || window.webkitURL;
            let a = document.createElement("a");  
            a.href = URLObj.createObjectURL(blob);
            a.download = "van_gogh_camera.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
       });    
    }    
}