document.addEventListener("DOMContentLoaded", productionReady);
var prod;



function productionReady() {
  prod = new Production($('#production-mainview')[0]);
  prod.startAnimation()

  /*
  prod.init();
  prod.mapImage('/img/particle.png').then(function() {
    prod.start()
  });*/
};

var shader = 
'attribute float size;'+
  'attribute float alpha;'+

  'varying vec3 vColor;'+
  'varying float vAlpha;'+
  'void main() {'+
    'vColor = color;'+
    'vAlpha = alpha;'+
    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );'+
    'gl_PointSize = size;'+
    'gl_Position = projectionMatrix * mvPosition;'+
  '}';

var fragShader = 
'uniform sampler2D texture;'+
  'uniform float maxAlpha;'+

  'varying vec3 vColor;'+
  'varying float vAlpha;'+
  'void main() {'+
    'gl_FragColor = vec4( vColor, vAlpha * maxAlpha);'+
    'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );'+
  '}'

var vert = 
'precision highp float;'+

'attribute float pindex;'+
'attribute vec3 position;'+
'attribute vec3 offset;'+
'attribute vec2 uv;'+
'attribute float angle;'+

'uniform mat4 modelViewMatrix;'+
'uniform mat4 projectionMatrix;'+

'uniform float uTime;'+
'uniform float uRandom;'+
'uniform float uDepth;'+
'uniform float uSize;'+
'uniform vec2 uTextureSize;'+
'uniform sampler2D uTexture;'+
'uniform sampler2D uTouch;'+

'varying vec2 vPUv;'+
'varying vec2 vUv;'+

'vec3 mod289_1_0(vec3 x) {'+
  'return x - floor(x * (1.0 / 289.0)) * 289.0;'+
'}'+

'vec2 mod289_1_0(vec2 x) {'+
  'return x - floor(x * (1.0 / 289.0)) * 289.0;'+
'}'+

'vec3 permute_1_1(vec3 x) {'+
  'return mod289_1_0(((x*34.0)+1.0)*x);'+
'}'+

'float random(float n) {'+
  'return fract(sin(n) * 43758.5453123);'+
'}'+

'float snoise_1_2(vec2 v)'+
  '{'+
  'const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);'+
  'vec2 i  = floor(v + dot(v, C.yy) );'+
  'vec2 x0 = v -   i + dot(i, C.xx);'+

  'vec2 i1;'+
  'i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);'+
  'vec4 x12 = x0.xyxy + C.xxzz;'+
  'x12.xy -= i1;'+

  'i = mod289_1_0(i);'+
  'vec3 p = permute_1_1( permute_1_1( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));'+

 ' vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);'+
  'm = m*m ;'+
  'm = m*m ;'+

  'vec3 x = 2.0 * fract(p * C.www) - 1.0;'+
  'vec3 h = abs(x) - 0.5;'+
  'vec3 ox = floor(x + 0.5);'+
  'vec3 a0 = x - ox;'+

  'm *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );'+

  'vec3 g;'+
  'g.x  = a0.x  * x0.x  + h.x  * x0.y;'+
 ' g.yz = a0.yz * x12.xz + h.yz * x12.yw;'+
  'return 130.0 * dot(m, g);'+
'}'+

'void main() {'+
  'vUv = uv;'+

  'vec2 puv = offset.xy / uTextureSize;'+
  'vPUv = puv;'+

  'vec4 colA = texture2D(uTexture, puv);'+
  'float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;'+

  'vec3 displaced = offset;'+

  'displaced.xy += vec2(random(pindex) - 0.5, random(offset.x + pindex) - 0.5) * uRandom;'+
  'float rndz = (random(pindex) + snoise_1_2(vec2(pindex * 0.1, uTime * 0.1)));'+
  'displaced.z += rndz * (random(pindex) * 2.0 * uDepth);'+

  'displaced.xy -= uTextureSize * 0.5;'+

  'float t = texture2D(uTouch, puv).r;'+
  'displaced.z += t * 20.0 * rndz;'+
  'displaced.x += cos(angle) * t * 20.0 * rndz;'+
  'displaced.y += sin(angle) * t * 20.0 * rndz;'+

  'float psize = (snoise_1_2(vec2(uTime, pindex) * 0.5) + 2.0);'+
  'psize *= max(grey, 0.5);'+
  'psize *= uSize;'+

  'vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);'+
  'mvPosition.xyz += position * psize;'+
  'vec4 finalPosition = projectionMatrix * mvPosition;'+

  'gl_Position = finalPosition;'+
'}'

var frag =

'precision highp float;'+
'uniform sampler2D uTexture;'+
'varying vec2 vPUv;'+
'varying vec2 vUv;'+
'void main() {'+
  'vec4 color = vec4(0.0);'+
  'vec2 uv = vUv;'+
  'vec2 puv = vPUv;'+
  'vec4 colA = texture2D(uTexture, puv);'+

  'float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;'+
  'vec4 colB = vec4(grey, grey, grey, 1.0);'+

  'float border = 0.3;'+
  'float radius = 0.5;'+
  'float dist = radius - distance(uv, vec2(0.5));'+
  'float t = smoothstep(0.0, border, dist);'+

  'color = colB;'+
  'color.a = t;'+
  'gl_FragColor = color;'+
'}';


var TouchTexture = function(parent) {

  this.parent = parent;
  this.size = 64;
  this.maxAge = 120;
  this.radius = 0.15;
  this.trail = [];

  TouchTexture.prototype.initTexture = function() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = this.size;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.texture = new THREE.Texture(this.canvas);

    this.canvas.id = 'touchTexture';
    this.canvas.style.width = this.canvas.style.height = `${this.canvas.width}px`;
  }

  TouchTexture.prototype.update = function(delta) {
    this.clear();

    // age points
    this.trail.forEach((point, i) => {
      point.age++;
      // remove old
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      }
    });

    this.trail.forEach((point, i) => {
      this.drawTouch(point);
    });

    this.texture.needsUpdate = true;
  }

  TouchTexture.prototype.clear = function() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  TouchTexture.prototype.addTouch = function(point) {
    let force = 0;
    const last = this.trail[this.trail.length - 1];
    if (last) {
      const dx = last.x - point.x;
      const dy = last.y - point.y;
      const dd = dx * dx + dy * dy;
      force = Math.min(dd * 10000, 1);
    }
    this.trail.push({ x: point.x, y: point.y, age: 0, force });
  }

  TouchTexture.prototype.drawTouch = function(point) {
    const pos = {
      x: point.x * this.size,
      y: (1 - point.y) * this.size
    };

    let intensity = 1;
    if (point.age < this.maxAge * 0.3) {
      intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1);
    } else {
      intensity = easeOutSine(1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7), 0, 1, 1);
    }

    intensity *= point.force;

    const radius = this.size  * this.radius * intensity;
    const grd = this.ctx.createRadialGradient(pos.x, pos.y, radius * 0.25, pos.x, pos.y, radius);
    grd.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
    grd.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    this.ctx.beginPath();
    this.ctx.fillStyle = grd;
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }


  this.initTexture();
}


var Production = function (container) {
  var t = this;
  this.container = container;
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.Fog(0x282828, 100, 1000);

  //window.scene = this.scene

  this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  this.camera.position.z = 300;

  this.renderer = new THREE.WebGLRenderer({ antialias: true, clearAlpha: 1});
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setClearColor(this.scene.fog.color);
  this.renderer.setSize(window.innerWidth, window.innerHeight);

  this.container.appendChild(this.renderer.domElement);
  this.loader = new THREE.TextureLoader();

  this.clock = new THREE.Clock(true);

  this.isRunning = false;

  //
  this.container3d = new THREE.Object3D();


  var light = new THREE.PointLight( 0xffffff, 1, 0 );
  light.position.set(1, 1, 100 );
  this.scene.add(light);

  Production.prototype.init = function(src) {
    this.loader.load(src, (texture) => {
      this.texture = texture;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.format = THREE.RGBFormat;

      this.width = texture.image.width;
      this.height = texture.image.height;

      this.initPoints(true);
      this.initHitArea();
      this.initTouch();
     // this.resize();
      this.show();
    });
  }

  Production.prototype.addListeners = function() {
    this.handlerInteractiveMove = this.onInteractiveMove.bind(this);

    this.webgl.interactive.addListener('interactive-move', this.handlerInteractiveMove);
    this.webgl.interactive.objects.push(this.hitArea);
    this.webgl.interactive.enable();
  }

  Production.prototype.resize = function() {
    if (!this.object3D) return;

    const scale = window.innerWidth / window.innerHeight;
    this.object3D.scale.set(scale, scale, 1);
    this.hitArea.scale.set(scale, scale, 1);
  }

  Production.prototype.show = function() {
    this.object3D.material.uniforms.uSize.value = 0.5
  }

  Production.prototype.initTouch = function() {
    // create only once
    if (!this.touch) 
      this.touch = new TouchTexture(this);
    this.object3D.material.uniforms.uTouch.value = this.touch.texture;
  }

  Production.prototype.initHitArea = function() {
    var geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, depthTest: false });
    material.visible = false;
    this.hitArea = new THREE.Mesh(geometry, material);
    this.container3d.add(this.hitArea);
  }

  Production.prototype.initPoints = function(discard) {
    var t = this;
    this.numPoints = this.width * this.height;

    var numVisible = this.numPoints;
    var threshold = 0;
    var originalColors;

    if (discard) {
      // discard pixels darker than threshold #22
      numVisible = 0;
      threshold = 34;

      var img = this.texture.image;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      canvas.width = this.width;
      canvas.height = this.height;
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0, this.width, this.height * -1);

      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      originalColors = Float32Array.from(imgData.data);

      for (var i = 0; i < this.numPoints; i++) {
        if (originalColors[i * 4 + 0] > threshold) numVisible++;
      }
    }

    var uniforms = {
      uTime: { value: 0 },
      uRandom: { value: 1.0 },
      uDepth: { value: 2.0 },
      uSize: { value: 0.0 },
      uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
      uTexture: { value: this.texture },
      uTouch: { value: null },
    };

    var material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      depthTest: false,
      transparent: true,
      //blending: THREE.AdditiveBlending
    });

    var geometry = new THREE.InstancedBufferGeometry();

    // positions
    var positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5,  0.5,  0.0);
    positions.setXYZ(1,  0.5,  0.5,  0.0);
    positions.setXYZ(2, -0.5, -0.5,  0.0);
    positions.setXYZ(3,  0.5, -0.5,  0.0);
    geometry.addAttribute('position', positions);

    // uvs
    var uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXYZ(0,  0.0,  0.0);
    uvs.setXYZ(1,  1.0,  0.0);
    uvs.setXYZ(2,  0.0,  1.0);
    uvs.setXYZ(3,  1.0,  1.0);
    geometry.addAttribute('uv', uvs);

    // index
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));

    var indices = new Uint16Array(numVisible);
    var offsets = new Float32Array(numVisible * 3);
    var angles = new Float32Array(numVisible);

    for (var i = 0, j = 0; i < this.numPoints; i++) {
      if (discard && originalColors[i * 4 + 0] <= threshold) continue;

      offsets[j * 3 + 0] = i % this.width;
      offsets[j * 3 + 1] = Math.floor(i / this.width);

      indices[j] = i;

      angles[j] = Math.random() * Math.PI;

      j++;
    }

    geometry.addAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
    geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
    geometry.addAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));

    this.object3D = new THREE.Mesh(geometry, material);

    this.container3d.add(this.object3D);
    this.scene.add(this.container3d);
  }

  Production.prototype.startAnimation = function() {
    if(this.isRunning === true)
      return;
    this.isRunning = true;
    this.animate();
  }
  Production.prototype.stopAnimation = function() {
    if(this.isRunning === false)
      return;
    this.isRunning = false;
  }
  Production.prototype.render = function() {
    var delta = this.clock.getDelta();
    if (this.touch) this.touch.update();
    this.renderer.render(this.scene, this.camera);
  }
  Production.prototype.animate = function () {
    var t = this;

    if(t.isRunning === false)
      return;

    requestAnimationFrame(function () {
      t.animate.call(t);
    });

    this.render();
  }

  this.init('/img/sample-bg.jpg');
}







/*





function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default : obj
  };
}

var Production = function (container) {

  this.container = container;

  Production.prototype.init = function() {
    var t = this;
    //this.playing = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 40);
    this.camera.position.set(0, 0, 50);
    this.width = window.innerWidth;
    this.TEXTURE = "/img/particle.png",
    this.renderer = new THREE.WebGLRenderer({ antialias: true , clearAlpha: 1});
    this.renderer.setClearColor(0xFFFFFF);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize($('#production-mainview').width(), window.innerHeight);
    this.MAX_PARTICLE_SIZE = 5;
    this.PARTICLE_SPACING = 40;
    this.PARTICLE_Z_SPACING = 20;
    this.PARTICLE_COUNT_X = 150;
    this.PARTICLE_COUNT_Y = 150;
    this.RAYTHRESHOLD = 1;
    this.CAN_DRAG = !1;
    this.CAN_INTERSECT = !1;
    this.isTimeline = !1;
    this.isImage = !1;
    this.changingMaxAlpha = !1;
    this.newMaxAlphaProgress = 0;
    this.maxAlpha = .5;
    this.sceneWidth = window.innerWidth;
    this.sceneHeight = window.innerHeight;
    this.newMaxAlpha = this.maxAlpha;
    this.startingMaxAlpha = this.maxAlpha;
    this.particles = [];
    this.verticies;
    this.origVertices;
    this.toVertices;
    this.fromVertices;
    this.loadedImages = [];
    this.imageCache = [];
    this.particleImageData = null;
    this.autoStart = 0;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = this.RAYTHRESHOLD;
    this.updatingRaycaster = !1;
    this.isRunning = !1;
    this.updatingParticles = !1;
    this.imageLoader = new THREE.ImageLoader();
    this.cameraViewProjectionMatrix = this.camera.projectionMatrix;

    this.last = 0;
    this.mouseCoords = {
        x: -9999,
        y: 0
    };
    this.Colors = {
      'midGrey': 'rgb(155, 155, 155)',
    };
    //this.resizeEvent = this.resizeEvent.bind(this);
    //u.default.add(this.resizeEvent);
    this.particleSystem = this.createParticleSystem();
    this.scene.add(this.particleSystem);
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    var onresize = function (e) {
      t.onWindowResize.call(t,e);
    } 

    window.addEventListener('resize', onresize, false);
    window.addEventListener('orientationchange', onresize, false);
    
    this._animate = this._animate.bind(this);
    this.start();
  }

  Production.prototype.start = function() {
    if (this.isRunning === !1) {
      this._animate();
      this.isRunning = !0;
    }
  }

  Production.prototype.stop = function() {
    if (this.isRunning === !0) {
      this.isRunning = !1;
    }
  }

  Production.prototype.resizeEvent = function() {
    this.width != window.innerWidth && (!0 === this.isRunning && c.default.remove(this._animate),
    this.width = l.default.appState.getWindowWidth(),
    this.sceneWidth = Math.floor(this._visibleWidthAtZDepth(0, this.camera)),
    this.sceneHeight = Math.floor(this._visibleHeightAtZDepth(0, this.camera)),
    l.default.appState.setCanvasPixelRatio(this.sceneHeight),
    !0 === this.isImage && this._convertImageToParticles(),
    !0 === this.isTimeline && this.createTimeLine(),
    !0 === this.isRunning && c.default.add(this._animate))
  }

  Production.prototype.createParticleSystem = function() {
    for (var t = new THREE.Geometry, e = 0; e < this.PARTICLE_COUNT_X; e++)
        for (var n = 0; n < this.PARTICLE_COUNT_Y; n++) {
            var i = this.createParticle();
            this.particles.push(i),
            t.vertices.push(i.position)
        }
    this.verticies = t.vertices;
    var o = new Float32Array(3 * this.verticies.length)
      , a = new Float32Array(3 * this.verticies.length)
      , s = new Float32Array(this.verticies.length)
      , c = new Float32Array(this.verticies.length);
    this.particles.forEach(function(t, e) {
        t.position.toArray(o, 3 * e),
        t.color.toArray(a, 3 * e),
        s[e] = t.alpha,
        c[e] = t.size
    }),
    this.particleGeometry = new THREE.BufferGeometry;
    var u = new THREE.BufferAttribute(o,3).setDynamic(!0)
      , l = new THREE.BufferAttribute(a,3);
    l.normalized = !0,
    this.particleGeometry.addAttribute("position", u),
    this.particleGeometry.addAttribute("color", l),
    this.particleGeometry.addAttribute("alpha", new THREE.BufferAttribute(s,1).setDynamic(!0)),
    this.particleGeometry.addAttribute("size", new THREE.BufferAttribute(c,1).setDynamic(!0));
    var h = (new THREE.TextureLoader).load(this.TEXTURE)
      , d = new THREE.ShaderMaterial({
        uniforms: {
            texture: {
                value: h
            },
            maxAlpha: {
                value: this.maxAlpha
            }
        },
        vertexShader: shader,
        fragmentShader: fragShader,
        depthTest: !0,
        depthWrite: !1,
        transparent: !0,
        vertexColors: !0,
        flatShading: !0
    });
    return new THREE.Points(this.particleGeometry,d)
  }

  Production.prototype.createParticle = function() {

    var t = Math.random() * this.PARTICLE_SPACING
      , e = Math.random() * this.PARTICLE_SPACING
      , n = Math.random() * this.PARTICLE_Z_SPACING
      , i = 2 * Math.random()
      , a = Math.random() + 3
      , s = new THREE.Color(this.Colors.midGrey)
      , c = Math.random() * (this.MAX_PARTICLE_SIZE * (window.devicePixelRatio || 1) - 2) + 2;

    return new Particle(new THREE.Vector3(t,e,n),i,a,s,c)
  }

  Production.prototype.clearImage = function(t) {
    this.isTimeline = !1,
    this.isImage = !1,
    this.particleImageData = null;
    for (var e = .6 * this.sceneWidth, n = .6 * this.sceneHeight, i = !0 === this.CAN_DRAG ? l.default.appState.getTimelineOffset() : 0, r = 0, o = 0, s = this.PARTICLE_COUNT_Y; o < s; o++)
        for (var c = 0, u = this.PARTICLE_COUNT_X; c < u; c++) {
            var h, p = this.particles[r], f = c;
            f = (0,
            a.default)(-e, e),
            h = (0,
            a.default)(-n, n),
            !0 === this._pointInEllipse([f, h], [0, 0], .8 * e, .8 * n) ? p.hide() : (p.show(),
            p.setShouldFade(!0)),
            !0 === this.CAN_DRAG && (f += i),
            p.changePosition(f, h, 0),
            p.animDur = d.Timings.particleImageOut,
            p.setSpeed(1.5),
            r++
        }
  }

  Production.prototype.createTimeLine = function() {
    var t = this;
    return this.isTimeline = !0,
    this.isImage = !1,
    new Promise(function(e) {
        var n = Math.round(100 * (l.default.appState.getTimelineWidth() + 10) / 100)
          , i = t.sceneWidth / t.width
          , o = .15 * t.sceneHeight
          , s = t.particles.length / n;
        t.particles.forEach(function(e, n) {
            var c = n / s
              , u = c
              , l = Math.sin(r.Math.degToRad(c / i / 2)) * (Math.sin(c / i * .001) * o) + .07 * t.sceneHeight;
            e.animDur = d.Timings.particleImageOut,
            e.changePosition(u + (0,
            a.default)(-.1, .1), l + (0,
            a.default)(-.1, .1), (0,
            a.default)(-.3, .3)),
            e.setSpeed((0,
            a.default)(.01, (0,
            a.default)(.011, .7))),
            e.setShouldFade(!0),
            e.show()
        }),
        e()
    }
    )
  }

  Production.prototype.mapImage = function(t) {

    var _noframeworkWaypoints2 = _interopRequireDefault(require(107));
    var scope = this;
    return this.isImage = true, this.isTimeline = false, new Promise(function(onstep) {
      if (scope.loadedImages.includes(t)) {
        var i = scope.loadedImages.indexOf(t);
        var r = scope.imageCache[i];
        if (void 0 !== r) {
          scope.particleImageData = r;
          scope._convertImageToParticles();
          onstep();
        } else {
          console.warn("No image found in cache for", t);
        }
      } else {
        scope.imageLoader.load(t, function(ringNum) {
          var r = (0, _noframeworkWaypoints2.default)(ringNum);
          scope.loadedImages.push(t);
          scope.imageCache.push(r);
          scope.particleImageData = r;
          scope._convertImageToParticles();
          onstep();
        });
      }
    });
  }

  Production.prototype.changeMaxAlpha = function(t) {
    this.newMaxAlpha = t,
    this.startingMaxAlpha = this.maxAlpha,
    this.newMaxAlphaProgress = 0,
    this.changingMaxAlpha = !0
  }

  Production.prototype._convertImageToParticles = function() {
    if (null !== this.particleImageData)
      for (var t = !0 === this.CAN_DRAG ? l.default.appState.getTimelineOffset() : 0, e = this.particleImageData.data, n = this.particleImageData.width / this.PARTICLE_COUNT_X, i = this.particleImageData.height / this.PARTICLE_COUNT_Y, r = Math.min(this.sceneWidth, this.sceneHeight), o = 0, s = 0, c = this.PARTICLE_COUNT_Y; s < c; s++)
        for (var u = 0, h = this.PARTICLE_COUNT_X; u < h; u++) {
          var f = this.particles[o]
            , m = Math.floor(u * n)
            , v = Math.floor(s * i) * (4 * this.particleImageData.width) + 4 * m
            , g = e[v]
            , y = e[v + 1]
            , x = e[v + 2]
            , w = e[v + 3];
            if (.2126 * g + .7152 * y + .0722 * x < 230 && w >= 254) {
              var b = u * (r / h) + (0,
              a.default)(-.1, .1) - r / 2
                , _ = r / c * (c - s) + (0,
              a.default)(-.1, .1) - r / 2
                , E = .2126 * g + .7152 * y + .0722 * x
                , M = 1 * E / 255 - .5;
              !0 === this.CAN_DRAG && (b += t),
              f.animDur = d.Timings.particleImageOut,
              f.updateSize(.1 + this.MAX_PARTICLE_SIZE * (window.devicePixelRatio || 1) * (1 - E / 255)),
              f.changePosition(b, _, M),
              f.setSpeed(0),
              f.setShouldFade(!1),
              f.show()
            } else
                f.hide();
          o++
        }
  }

  Production.prototype.getDelta = function() {
    var now = performance.now();
    var delta = (now - this.last) / 1000;
    this.last = now;
    if (delta > 1) delta = 1;
    return delta;
  };

  Production.prototype.setMouseCoords = function(t) {
    this.mouseCoords = t;
  };

  Production.prototype._animate = function() {
    var t = this
      , e = this.getDelta()
      , n = this.mouseCoords
      , i = 0
      , o = this.particleGeometry.attributes.position.array
      , a = this.particleGeometry.attributes.alpha.array
      , s = this.particleGeometry.attributes.size.array;
    if (!1 === this.updatingRaycaster) {
        if (this.updatingRaycaster = !0,
        !0 === this.CAN_INTERSECT && !0 === l.default.appState.getHasInteraction() && (!1 === l.default.appState.getIsTouch() || !0 === l.default.appState.getIsTouch() && !0 === l.default.appState.getIsTouching())) {
            this.raycaster.setFromCamera(n, this.camera);
            var c = this.raycaster.intersectObject(this.particleSystem);
            if (null !== c && c.length > 0)
                for (var u = 0; u < c.length; u++) {
                    var h = c[u]
                      , d = this.particles[h.index]
                      , p = d.position.x - i - h.point.x
                      , f = d.position.y - h.point.y
                      , m = h.distanceToRay
                      , v = this.RAYTHRESHOLD - m
                      , g = Math.atan2(f, p);
                    d.offsetPosition.x += v * Math.cos(g),
                    d.offsetPosition.y += v * Math.sin(g),
                    d.isIntersecting = !0
                }
        }
        setTimeout(function() {
            t.updatingRaycaster = !1
        }, 1e3 / 60)
    }
    if (!1 === this.updatingParticles) {
        this.updatingParticles = !0;
        for (var y = 0, x = this.particles.length; y < x; y++) {
            var w = this.particles[y]
              , b = 3 * y;
            w.update(e),
            !1 === w.particleHidden ? (!0 === this.CAN_DRAG ? o[b] = w.position.x - i : o[b] = w.position.x,
            o[b + 1] = w.position.y,
            o[b + 2] = w.position.z,
            a[y] = w.alpha,
            s[y] !== w.size && (s[y] = w.size)) : 0 !== a[y] && (a[y] = w.alpha = 0),
            y === x - 1 && (this.updatingParticles = !1)
        }
        this.particleGeometry.attributes.position.needsUpdate = !0,
        this.particleGeometry.attributes.alpha.needsUpdate = !0,
        this.particleGeometry.attributes.size.needsUpdate = !0
    }
    !0 === this.changingMaxAlpha && (this.newMaxAlphaProgress = this.newMaxAlphaProgress < 1 ? this.newMaxAlphaProgress += e : 1,
    this.maxAlpha = r.Math.lerp(this.startingMaxAlpha, this.newMaxAlpha, this.newMaxAlphaProgress),
    this.particleSystem.material.uniforms.maxAlpha.value = this.maxAlpha,
    this.newMaxAlphaProgress >= 1 && (this.changingMaxAlpha = !1)),
    this.particleGeometry.computeBoundingSphere()
  }

  Production.prototype._pointInEllipse = function(t, e, n, i, r) {
    r = r || 0;
    var o = Math.cos(r)
      , a = Math.sin(r)
      , s = t[0] - e[0]
      , c = t[1] - e[1]
      , u = o * s + a * c
      , l = a * s - o * c;
    return u * u / (n * n) + l * l / (i * i) <= 1
  }

  Production.prototype._visibleWidthAtZDepth = function(t, e) {
    return this._visibleHeightAtZDepth(t, e) * e.aspect
  }

  Production.prototype._visibleHeightAtZDepth = function(t, e) {
    var n = e.position.z;
    t < n ? t -= n : t += n;
    var i = e.fov * Math.PI / 180;
    return 2 * Math.tan(i / 2) * Math.abs(t)
  }

  Production.prototype.onWindowResize = function () {

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize($('#production-mainview').width(), window.innerHeight);

  }
}


function randDefault() {
  if (Math.random() > .5)
    return 1
  else
    return -1
}

var shader = 
'attribute float size;'+
  'attribute float alpha;'+

  'varying vec3 vColor;'+
  'varying float vAlpha;'+
  'void main() {'+
    'vColor = color;'+
    'vAlpha = alpha;'+
    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );'+
    'gl_PointSize = size;'+
    'gl_Position = projectionMatrix * mvPosition;'+
  '}';

var fragShader = 
'uniform sampler2D texture;'+
  'uniform float maxAlpha;'+

  'varying vec3 vColor;'+
  'varying float vAlpha;'+
  'void main() {'+
    'gl_FragColor = vec4( vColor, vAlpha * maxAlpha);'+
    'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );'+
  '}'


var Particle = function(e, n, i, a, s) {
  this.position = e,
  this.origPosition = e.clone(),
  this.startingPosition = e.clone(),
  this.newPosition = e.clone(),
  this.offsetPosition = new THREE.Vector3,
  this.color = a,
  this.angle = 90 + 180 * Math.random() * randDefault(),
  this.speed = this.imageSpeed = this.origSpeed = n,
  this.velocity = new THREE.Vector3(this.speed * Math.cos(THREE.Math.degToRad(this.angle)),-this.speed * Math.sin(THREE.Math.degToRad(this.angle)),this.speed / 2 * Math.sin(THREE.Math.degToRad(this.angle))),
  this.life = this.originalLife = i,
  this.size = this.nextSize = this.prevSize = s,
  this.isUpdatingSize = !1,
  this.sizeAnimDur = .3,
  this.sizeAnimProgress = 0,
  this.alpha = 0,
  this.startingAlpha = 0,
  this.newAlphaProgress = 0,
  this.shouldFade = !0,
  this.delay = Math.random() * (this.originalLife / 2),
  this.hasStarted = !1,
  this.changingPosition = !1,
  this.changingColor = !1,
  this.newColorProgress = 0,
  this.newPosProgress = 0,
  this.hideParticle = !1,
  this.particleHidden = !1,
  this.animDur = 1,
  this.isIntersecting = !1

  Particle.prototype.update = function(t) {
    if (!(!1 === this.hasStarted && (this.delay -= t) > 0) && (this.hasStarted = !0,
    !0 !== this.particleHidden)) {
      this.life -= t;
      var e = this.life / this.originalLife;
      !0 === this.hideParticle && (this.newAlphaProgress = this.newAlphaProgress < 1 ? this.newAlphaProgress += t / this.animDur : 1,
      this.alpha = r.Math.lerp(this.startingAlpha, 0, this.newAlphaProgress),
      this.newAlphaProgress >= 1 && (this.alpha = 0,
      this.particleHidden = !0)),
      !1 === this.particleHidden && !1 === this.hideParticle && (!0 === this.shouldFade ? this.alpha = Math.sin(2 * Math.PI * (1 - (e + .25))) / 2 + .5 : this.alpha < 1 ? this.alpha += t : 1 !== this.alpha && (this.alpha = 1)),
      !0 === this.isUpdatingSize && (this.sizeAnimProgress < this.sizeAnimDur ? (this.sizeAnimProgress += t,
      this.size = r.Math.lerp(this.prevSize, this.nextSize, a.Easing.easeInOutQuad(this.sizeAnimProgress / this.sizeAnimDur))) : (this.size = this.nextSize,
      this.isUpdatingSize = !1)),
      !0 === this.changingPosition ? (this.newPosProgress = this.newPosProgress < 1 ? this.newPosProgress += t / s.Timings.particleImageOut : 1,
      this.position.lerpVectors(this.startingPosition, this.newPosition, a.Easing.easeInOutCubic(this.newPosProgress)),
      this.newPosProgress >= 1 && (this.changingPosition = !1,
      this.position.set(this.newPosition.x, this.newPosition.y, this.newPosition.z),
      this.startingPosition.set(this.newPosition.x, this.newPosition.y, this.newPosition.z),
      this.offsetPosition.set(0, 0, 0))) : this.life > 0 ? (this.position.x += this.velocity.x * t,
      this.position.y += this.velocity.y * t,
      this.position.z += this.velocity.z * t) : (this.life = this.originalLife,
      this.position.x = this.startingPosition.x,
      this.position.y = this.startingPosition.y,
      this.position.z = this.startingPosition.z,
      this.angle = 90 + 180 * Math.random() * randDefault()),
      1 == this.isIntersecting && (this.position.x += (this.offsetPosition.x *= .95) + .19 * (this.startingPosition.x - this.position.x),
      this.position.y += (this.offsetPosition.y *= .95) + .19 * (this.startingPosition.y - this.position.y),
      Math.abs(this.startingPosition.x - this.position.x) < .001 && Math.abs(this.startingPosition.y - this.position.y) < .001 && (this.isIntersecting = !1))
    }
  };

  Particle.prototype.changePosition = function(t, e, n) {
    this.newPosProgress = 0,
    this.startingPosition.set(this.position.x, this.position.y, this.position.z),
    this.newPosition.set(t, e, n),
    this.offsetPosition.set(0, 0, 0),
    this.changingPosition = !0
  };

  Particle.prototype.resetPosition = function(t, e, n) {
    this.newPosProgress = 0,
    this.offsetPosition.set(0, 0, 0),
    this.startingPosition.set(this.position.x, this.position.y, this.position.z),
    this.newPosition.set(this.origPosition.x, this.origPosition.y, this.origPosition.z),
    this.changingPosition = !0
  }

  Particle.prototype.setSpeed = function(t) {
    this.velocity.set(t * Math.cos(r.Math.degToRad(this.angle)), -t * Math.sin(r.Math.degToRad(this.angle)), t / 2 * Math.sin(r.Math.degToRad(this.angle)))
  }

  Particle.prototype.hide = function() {
    if (!1 === this.hasStarted) {
      this.alpha = 0;
      this.particleHidden = !0
    } else {
      this.newAlphaProgress = 0;
      this.startingAlpha = this.alpha;
      this.hideParticle = !0
    }
  }

  Particle.prototype.show = function() {
    if (!0 === this.particleHidden) {
      this.hasStarted = !1;
      this.delay = Math.random() * (this.originalLife / 2);
      this.life = this.originalLife;
      this.newAlphaProgress = 0;
      this.startingAlpha = this.alpha;
      this.hideParticle = !1;
      this.alpha = 0;
      this.particleHidden = !1
    }
  }

  Particle.prototype.setShouldFade = function(t) {
    this.shouldFade !== t && (this.shouldFade = t)
  }

  Particle.prototype.updateSize = function(t) {
    if (t === this.size)
      return !1;
    this.sizeAnimDur = .3,
    this.nextSize = t,
    this.prevSize = this.size,
    this.sizeAnimProgress = 0,
    this.isUpdatingSize = !0
  }

  Particle.prototype._updateColor = function(t) {
    if (t < 1) {
      this._updateColorVal("r", t);
      this._updateColorVal("b", t);
      this._updateColorVal("g", t);
    } else {
      this.color.setRGB(this.newColor.r, this.newColor.g, this.newColor.b)
    }
  }

  Particle.prototype._updateColorVal = function(t, e) {
    if (this.color[t] !== this.newColor[t]) {
      var n = r.Math.lerp(this.startingColor[t], this.newColor[t], a.Easing.easeInOutQuad(e));
      n !== this.color[t] && (this.color[t] = n)
    }
  }

  Particle.prototype._springEase = function(t) {
    return -7 * Math.pow(Math.E, -7 * t) * Math.sin(Math.sqrt(71) * t) / Math.sqrt(71) - Math.pow(Math.E, -7 * t) * Math.cos(Math.sqrt(71) * t) + 1
  }
}


var RoundParticle = function(e, n, i, r, a, s) {

  if (n) {
    this.x = e,
    this.y = n,
    this.oX = e,
    this.oY = n,
    this.radius = i,
    this.bgColor = new o.Color(r),
    this.newColor = new o.Color(r),
    this.bgColorAlpha = a,
    this.newBgColorAlpha = a,
    this.strokeColor = new o.Color(s),
    this.scale = c,
    this.dragging = !1
  }


  RoundParticle.prototype.render = function(t) {
    if (void 0 !== t) {
      var e = this.radius * this.scale;
      e > 0 && (t.save(),
      t.beginPath(),
      t.arc(this.x, this.y, e, 0, 2 * Math.PI),
      t.fillStyle = "rgba(" + Math.round(255 * this.bgColor.r) + ", " + Math.round(255 * this.bgColor.g) + ", " + Math.round(255 * this.bgColor.b) + ", " + this.bgColorAlpha + ")",
      t.fill(),
      t.strokeStyle = this.strokeColor.getStyle(),
      t.stroke(),
      t.closePath(),
      t.restore())
    } else
      console.error("No canvas context pass into DotBg render method.")
  }

  RoundParticle.prototype.setBgColor = function(t, e) {
    this.newColor.setStyle(t);
    if (e) {
      this.newBgColorAlpha = e
    }
  }
  RoundParticle.prototype.updateScale = function(t) {
    this.scale = t
  }
  RoundParticle.prototype.updateXY = function(t, e) {
    this.x = t;
    this.y = e
  }
  RoundParticle.prototype.updateBgColor = function(t) {
    this.newColor.getHex() !== this.bgColor.getHex() && this.bgColor.lerp(this.newColor, t),
    this.newBgColorAlpha !== this.bgColorAlpha && (this.bgColorAlpha = o.Math.lerp(this.bgColorAlpha, this.newBgColorAlpha, t))
  }
}*/