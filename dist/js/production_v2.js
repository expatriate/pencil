document.addEventListener("DOMContentLoaded", productionReady);
var prod;

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
  '}';

var App = function() {

  App.prototype.init = function() {
    this.initWebGL();
    this.addListeners();
    this.animate();
    this.resize();
  }

  App.prototype.initWebGL = function() {
    this.webgl = new ProductionView();
    document.getElementById('production-mainview').appendChild(this.webgl.renderer.domElement);
  }

  App.prototype.addListeners = function() {
    this.handlerAnimate = this.animate.bind(this);

    window.addEventListener('resize', this.resize.bind(this));
  }

  App.prototype.animate = function() {
    this.update();
    this.draw();

    this.raf = requestAnimationFrame(this.handlerAnimate);
  }

  App.prototype.update = function() {

    if (this.webgl) this.webgl.update();
  }

  App.prototype.draw = function() {

    if (this.webgl) this.webgl.draw();
  }

  App.prototype.resize = function() {

    if (this.webgl) this.webgl.resize();
  }

}

function productionReady() {
  window.app = new App();
  window.app.init();
};

function randDefault() {
  if (Math.random() > .5)
    return 1
  else
    return -1
}

var ParticlesProd = function(webgl) {
  
  this.webgl = webgl;
  this.container = new THREE.Object3D();
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
  this.newMaxAlphaProgress = 1;
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
  this.autoStart = 1;
  this.raycaster = new THREE.Raycaster();
  this.raycaster.params.Points.threshold = this.RAYTHRESHOLD;
  this.updatingRaycaster = !1;
  this.isRunning = !1;
  this.updatingParticles = !1;
  this.imageLoader = new THREE.ImageLoader();
  this.last = 0;
  this.mouseCoords = {
      x: -9999,
      y: 0
  };
  this.Colors = {
    'midGrey': 'rgb(155, 155, 155)',
  };
  //this.cameraViewProjectionMatrix = this.camera.projectionMatrix;
  ParticlesProd.prototype.createParticleSystem = function() {
    console.log('createParticleSystem')
    var threeGeom = new THREE.Geometry;
    
    for (var i = 0; i < this.PARTICLE_COUNT_X; i++) {
      for (var j = 0; j < this.PARTICLE_COUNT_Y; j++) {
        var p = this.createParticle();
        this.particles.push(p);
        threeGeom.vertices.push(p.position);
      }
    }
    console.log(this.particles)
    //console.log(this.particles)
    this.verticies = threeGeom.vertices;
    /** @type {!Float32Array} */
    var colors = new Float32Array(3 * this.verticies.length);
    /** @type {!Float32Array} */
    var buffer = new Float32Array(3 * this.verticies.length);
    /** @type {!Float32Array} */
    var array = new Float32Array(this.verticies.length);
    /** @type {!Float32Array} */
    var sizes = new Float32Array(this.verticies.length);
    this.particles.forEach(function(obj, i) {
      obj.position.toArray(colors, 3 * i);
      obj.color.toArray(buffer, 3 * i);
      array[i] = obj.alpha;
      sizes[i] = obj.size;
    });
    this.particleGeometry = new THREE.BufferGeometry;
    var na = (new THREE.BufferAttribute(colors, 3)).setDynamic(true);
    var attribute = new THREE.BufferAttribute(buffer, 3);
    /** @type {boolean} */
    attribute.normalized = true;
    this.particleGeometry.addAttribute("position", na);
    this.particleGeometry.addAttribute("color", attribute);
    this.particleGeometry.addAttribute("alpha", (new THREE.BufferAttribute(array, 1)).setDynamic(true));
    this.particleGeometry.addAttribute("size", (new THREE.BufferAttribute(sizes, 1)).setDynamic(true));
    var command_module_id = (new THREE.TextureLoader).load(this.TEXTURE);

    var pMaterial = new THREE.ShaderMaterial({
      uniforms : {
        texture : {
          value : command_module_id
        },
        maxAlpha : {
          value : this.maxAlpha
        }
      },
      vertexShader : shader,
      fragmentShader : fragShader,
      depthTest : true,
      depthWrite : false,
      transparent : true,
      vertexColors : true,
      flatShading : true
    });
    //return new THREE.Mesh(this.particleGeometry, pMaterial);
    return new THREE.Points(this.particleGeometry, pMaterial);
  };

  ParticlesProd.prototype.createParticle = function() {
    var t = Math.random() * this.PARTICLE_SPACING
      , e = Math.random() * this.PARTICLE_SPACING
      , n = Math.random() * this.PARTICLE_Z_SPACING
      , i = 2 * Math.random()
      , a = Math.random() + 3
      , s = new THREE.Color(this.Colors.midGrey)
      , c = Math.random() * (this.MAX_PARTICLE_SIZE * (window.devicePixelRatio || 1) - 2) + 2;

    return new Particle(new THREE.Vector3(t,e,n),i,a,s,c)
  }

  ParticlesProd.prototype.mapImage = function(t) {

    function test(texture) {
      var img = texture;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      canvas.width = texture.width;
      canvas.height = texture.height;
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0, texture.width, texture.height * -1);

      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    var scope = this;
    return this.isImage = true, new Promise(function(onstep) {

      scope.imageLoader.load(t, function(ringNum) {
        var r = test(ringNum);
        scope.loadedImages.push(t);
        //scope.imageCache.push(r);
        scope.particleImageData = r;
        scope._convertImageToParticles();
        onstep();
      });
    });
  }

  ParticlesProd.prototype.start = function(t) {
    if (false === this.isRunning) {
      this._animate();
      this.isRunning = true;
    }
  }

  ParticlesProd.prototype.init = function(src) {
    var loader = new THREE.TextureLoader();
    var t = this;
    //this._canvasState = this.webgl.scene;

    loader.load(src, function(texture) {
      //t.texture = texture;
      //t.texture.minFilter = THREE.LinearFilter;
      //t.texture.magFilter = THREE.LinearFilter;
      //t.texture.format = THREE.RGBFormat;

      //t.width = texture.image.width;
      //t.height = texture.image.height;

      //t.initPoints(true);
      //t.initHitArea();
      //t.initTouch();
      //t.resize();
      //t.show();

      t.particles = [];
      t.verticies = [];
      t.particleSystem = t.createParticleSystem();
      //t.maxAlpha = 0.5;
      t.TEXTURE = "img/particle.png";

      t.mapImage(src).then(function() {
        t.start();
      });
      t.container.add(t.particleSystem);
    });


  }

  ParticlesProd.prototype.getDelta = function() {
    return this.webgl.clock.getDelta();
  }

  ParticlesProd.prototype.getMouseCoords = function() {
    return this.mouseCoords;
  }

  ParticlesProd.prototype._animate = function() {
    var t = this;
    var item = this.getDelta();
    var mouse = this.getMouseCoords();
    var tx = true === this.CAN_DRAG ? _UiIcon2.default.appState.getTimelineOffset() : 0;
    var normals = this.particleGeometry.attributes.position.array;
    var array = this.particleGeometry.attributes.alpha.array;
    var positions = this.particleGeometry.attributes.size.array;
    if (false === this.updatingRaycaster) {
      if (this.updatingRaycaster = true, true === this.CAN_INTERSECT && true === _UiIcon2.default.appState.getHasInteraction() && (false === _UiIcon2.default.appState.getIsTouch() || true === _UiIcon2.default.appState.getIsTouch() && true === _UiIcon2.default.appState.getIsTouching())) {
        this.raycaster.setFromCamera(mouse, this.camera);
        var c = this.raycaster.intersectObject(this.particleSystem);
        if (null !== c && c.length > 0) {
          /** @type {number} */
          var i = 0;
          for (; i < c.length; i++) {
            var that = c[i];
            var p = this.particles[that.index];
            /** @type {number} */
            var trueAnomalyX = p.position.x - tx - that.point.x;
            /** @type {number} */
            var trueAnomalyY = p.position.y - that.point.y;
            var malakh = that.distanceToRay;
            /** @type {number} */
            var interactRatio1 = this.RAYTHRESHOLD - malakh;
            /** @type {number} */
            var trueAnomaly = Math.atan2(trueAnomalyY, trueAnomalyX);
            p.offsetPosition.x += interactRatio1 * Math.cos(trueAnomaly);
            p.offsetPosition.y += interactRatio1 * Math.sin(trueAnomaly);
            /** @type {boolean} */
            p.isIntersecting = true;
          }
        }
      }
      setTimeout(function() {
        /** @type {boolean} */
        t.updatingRaycaster = false;
      }, 1E3 / 60);
    }
    if (false === this.updatingParticles) {
      console.log('false')
      /** @type {boolean} */
      this.updatingParticles = true;
      /** @type {number} */
      var i = 0;
      var length = this.particles.length;
      for (; i < length; i++) {
        var p = this.particles[i];
        /** @type {number} */
        var offset = 3 * i;
        p.update(item);
        if (false === p.particleHidden) {
          if (true === this.CAN_DRAG) {
            /** @type {number} */
            normals[offset] = p.position.x - tx;
          } else {
            normals[offset] = p.position.x;
          }
          normals[offset + 1] = p.position.y;
          normals[offset + 2] = p.position.z;
          array[i] = p.alpha;
          if (positions[i] !== p.size) {
            positions[i] = p.size;
          }
        } else {
          if (0 !== array[i]) {
            /** @type {number} */
            array[i] = p.alpha = 0;
          }
        }
        if (i === length - 1) {
          /** @type {boolean} */
          this.updatingParticles = false;
        }
      }
      /** @type {boolean} */
      this.particleGeometry.attributes.position.needsUpdate = true;
      /** @type {boolean} */
      this.particleGeometry.attributes.alpha.needsUpdate = true;
      /** @type {boolean} */
      this.particleGeometry.attributes.size.needsUpdate = true;
    }
    if (true === this.changingMaxAlpha) {
      this.newMaxAlphaProgress = this.newMaxAlphaProgress < 1 ? this.newMaxAlphaProgress += item : 1;
      this.maxAlpha = THREE.Math.lerp(this.startingMaxAlpha, this.newMaxAlpha, this.newMaxAlphaProgress);
      this.particleSystem.material.uniforms.maxAlpha.value = this.maxAlpha;
      if (this.newMaxAlphaProgress >= 1) {
        /** @type {boolean} */
        this.changingMaxAlpha = false;
      }
    }
    this.particleGeometry.computeBoundingSphere();
  }

  ParticlesProd.prototype._convertImageToParticles = function() {
    console.log('_convertImageToParticles')
    var o = 0;
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
              var b = u * (r / h) + (-.1, .1) - r / 2
                , _ = r / c * (c - s) + (-.1, .1) - r / 2
                , E = .2126 * g + .7152 * y + .0722 * x
                , M = 1 * E / 255 - .5;
              (b += t),
              f.animDur = 2,
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

  this.init('img/sample-bg.jpg');
}

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
  this.alpha = 1,
  this.startingAlpha = 1,
  this.newAlphaProgress = 0,
  this.shouldFade = false,
  this.delay = Math.random() * (this.originalLife / 2),
  this.hasStarted = !1,
  this.changingPosition = !1,
  this.changingColor = !1,
  this.newColorProgress = 0,
  this.newPosProgress = 0,
  this.hideParticle = false,
  this.particleHidden = false,
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
      this.size = THREE.Math.lerp(this.prevSize, this.nextSize, Easing.easeInOutQuad(this.sizeAnimProgress / this.sizeAnimDur))) : (this.size = this.nextSize,
      this.isUpdatingSize = !1)),
      !0 === this.changingPosition ? (this.newPosProgress = this.newPosProgress < 1 ? this.newPosProgress += t / 2 : 1,
      this.position.lerpVectors(this.startingPosition, this.newPosition, Easing.easeInOutCubic(this.newPosProgress)),
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
    this.velocity.set(t * Math.cos(THREE.Math.degToRad(this.angle)), -t * Math.sin(THREE.Math.degToRad(this.angle)), t / 2 * Math.sin(THREE.Math.degToRad(this.angle)))
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
      var n = r.Math.lerp(this.startingColor[t], this.newColor[t], Easing.easeInOutQuad(e));
      n !== this.color[t] && (this.color[t] = n)
    }
  }

  Particle.prototype._springEase = function(t) {
    return -7 * Math.pow(Math.E, -7 * t) * Math.sin(Math.sqrt(71) * t) / Math.sqrt(71) - Math.pow(Math.E, -7 * t) * Math.cos(Math.sqrt(71) * t) + 1
  }
}

var Easing = {
  linear : function(p) {
    return p;
  },
  easeInQuad : function(value) {
    return value * value;
  },
  easeOutQuad : function(value) {
    return value * (2 - value);
  },
  easeInOutQuad : function(t) {
    return t < .5 ? 2 * t * t : (4 - 2 * t) * t - 1;
  },
  easeInCubic : function(t) {
    return t * t * t;
  },
  easeOutCubic : function(t) {
    return --t * t * t + 1;
  },
  easeInOutCubic : function(x) {
    return x < .5 ? 4 * x * x * x : (x - 1) * (2 * x - 2) * (2 * x - 2) + 1;
  },
  easeInQuart : function(t) {
    return t * t * t * t;
  },
  easeOutQuart : function(t) {
    return 1 - --t * t * t * t;
  },
  easeInOutQuart : function(t) {
    return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  easeInQuint : function(t) {
    return t * t * t * t * t;
  },
  easeOutQuint : function(t) {
    return 1 + --t * t * t * t * t;
  },
  easeInOutQuint : function(t) {
    return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  }
};

var ProductionView = function () {

  // scene
  this.scene = new THREE.Scene();

  // camera
  this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  this.camera.position.z = 300;

  // renderer
  this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  // clock
  this.clock = new THREE.Clock(true);

  this.particlesProd = new ParticlesProd(this);
  this.particles = this.particlesProd.particles;


  var light = new THREE.PointLight( 0xff0000, 1, 100 );
  light.position.set( 50, 50, 50 );


  this.scene.add(this.particlesProd.container);
  this.scene.add(light);


  ProductionView.prototype.update = function() {
    var delta = this.clock.getDelta();
    if (this.particles.length) this.particles.update(delta);
  }

  ProductionView.prototype.draw = function() {
    this.renderer.render(this.scene, this.camera);
  }

  ProductionView.prototype.resize = function() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.fovHeight = 2 * Math.tan((this.camera.fov * Math.PI) / 180 / 2) * this.camera.position.z;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    //if (this.interactive) this.interactive.resize();
    if (this.particles.length) this.particles.resize();
  }
}