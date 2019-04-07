"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var Birds_moving = function Birds_moving(container, width) {
  var t = this;
  t.container = container;
  t.playing = false; // this is super hacky, but returning an object that has empty methods identical to the expected object
  // is the fastest way to disable birds without causing errors elsewhere.

  /*return new (function () {
    let t = this;
    let f = function () {};
      t.setBirdNumber = f;
    t.init = f;
    t.initComputeRenderer = f;
    t.initBirds = f;
    t.fillPositionTexture = f;
    t.fillVelocityTexture = f;
    t.onWindowResize = f;
    t.onDocumentMouseMove = f;
    t.startAnimation = f;
    t.stopAnimation = f;
    t.animate = f;
    t.render = f;
  });*/

  /* TEXTURE t.WIDTH FOR SIMULATION */

  t.WIDTH = width || 32;
  t.BIRDS = t.WIDTH * t.WIDTH; // Custom Geometry - using 3 triangles each. No UVs, no normals currently.

  THREE.BirdGeometry_moving = function () {
    var triangles = t.BIRDS * 3;
    var points = triangles * 3;
    THREE.BufferGeometry.call(this);
    var vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    var birdColors = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    var references = new THREE.BufferAttribute(new Float32Array(points * 2), 2);
    var birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1);
    this.addAttribute('position', vertices);
    this.addAttribute('birdColor', birdColors);
    this.addAttribute('reference', references);
    this.addAttribute('birdVertex', birdVertex);
    var v = 0;

    function verts_push() {
      for (var i = 0; i < arguments.length; i++) {
        vertices.array[v++] = arguments[i];
      }
    }

    var wingsSpan = 20;

    for (var f = 0; f < t.BIRDS; f++) {
      /*// Body
      verts_push(
        0, -0, -20,
        0, 4, -20,
        0, 0, 30
      );*/
      // Left Wing
      verts_push(0, 0, -15, -wingsSpan, 0, 0, 0, 0, 15); // Right Wing

      verts_push(0, 0, 15, wingsSpan, 0, 0, 0, 0, -15);
    }

    for (var v = 0; v < triangles * 3; v++) {
      var i = ~~(v / 3);
      var x = i % t.WIDTH / t.WIDTH;
      var y = ~~(i / t.WIDTH) / t.WIDTH;
      var c = new THREE.Color(0x00ffff);
      birdColors.array[v * 3 + 0] = c.r;
      birdColors.array[v * 3 + 1] = c.g;
      birdColors.array[v * 3 + 2] = c.b;
      references.array[v * 2] = x;
      references.array[v * 2 + 1] = y;
      birdVertex.array[v] = v % 9;
    }

    this.scale(0.3, 0.3, 0.3);
  };

  THREE.BirdGeometry_moving.prototype = Object.create(THREE.BufferGeometry.prototype);
  t.container;
  t.camera, t.scene, t.renderer, t.geometry;
  t.mouseX = 0, t.mouseY = 0;
  t.windowHalfX = window.innerWidth / 2;
  t.windowHalfY = window.innerHeight / 2;
  t.BOUNDS = 10;
  t.BOUNDS_HALF = t.BOUNDS / 2;
  t.last = performance.now();
  t.lastDelta = 1;
  t.SCROLLBOUNDS = window.window.pageYOffset;
  t.gpuCompute;
  t.velocityVariable;
  t.positionVariable;
  t.positionUniforms;
  t.velocityUniforms;
  t.birdUniforms;
  t.init(); // t.startAnimation();
};

Birds_moving.prototype.setBirdNumber = function (n) {
  var n = ~~(n / 3);
  this.BIRDS = n;
  this.container.innerHTML = '';
  this.init();
  /*if(n < 100) {
    $('#particles-mainview canvas').css({
      filter: 'grayscale(0)',
    });
  }
  else {
    $('#particles-mainview canvas').css({
      filter: 'grayscale(100%)',
    });
  }   */
};

Birds_moving.prototype.init = function () {
  this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 3000);
  this.camera.position.z = 250;
  this.camera.setCenter;
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.Fog(0xFFFFFF, 100, 1000);
  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    clearAlpha: 1
  });
  this.renderer.setClearColor(this.scene.fog.color);
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setSize($('#particles-subview').width(), $('#particles-subview').height());
  this.container.appendChild(this.renderer.domElement);
  this.initComputeRenderer();
  var t = this;

  var onmove = function onmove(e) {
    t.onDocumentMouseMove.call(t, e);
  };

  var onresize = function onresize(e) {
    t.onWindowResize.call(t, e);
  };

  document.addEventListener('mousemove', onmove, false);
  document.addEventListener('touchstart', onmove, false);
  document.addEventListener('touchmove', onmove, false); //

  window.addEventListener('resize', onresize, false);
  window.addEventListener('orientationchange', onresize, false);
  this.initBirds();
};

Birds_moving.prototype.initComputeRenderer = function () {
  this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);
  var dtPosition = this.gpuCompute.createTexture();
  var dtVelocity = this.gpuCompute.createTexture();
  this.fillPositionTexture(dtPosition);
  this.fillVelocityTexture(dtVelocity);
  this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", document.getElementById('fragmentShaderVelocity_moving').textContent, dtVelocity);
  this.positionVariable = this.gpuCompute.addVariable("texturePosition", document.getElementById('fragmentShaderPosition_moving').textContent, dtPosition);
  this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);
  this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);
  this.positionUniforms = this.positionVariable.material.uniforms;
  this.velocityUniforms = this.velocityVariable.material.uniforms;
  this.positionUniforms.time = {
    value: 0.0
  };
  this.positionUniforms.delta = {
    value: 0.0
  };
  this.velocityUniforms.time = {
    value: 1.0
  };
  this.velocityUniforms.delta = {
    value: 0.0
  };
  this.velocityUniforms.testing = {
    value: 1.0
  };
  this.velocityUniforms.seperationDistance = {
    value: 1.0
  };
  this.velocityUniforms.alignmentDistance = {
    value: 1.0
  };
  this.velocityUniforms.cohesionDistance = {
    value: 1.0
  };
  this.velocityUniforms.freedomFactor = {
    value: 1.0
  }; //this.velocityUniforms.predator = {value: new THREE.Vector3()};

  this.velocityVariable.material.defines.BOUNDS = this.BOUNDS.toFixed(2);
  this.velocityUniforms.scrolltopy = {
    value: -400.0
  };
  this.velocityUniforms.scrolltopx = {
    value: -400.0
  };
  this.velocityVariable.wrapS = THREE.RepeatWrapping;
  this.velocityVariable.wrapT = THREE.RepeatWrapping;
  this.positionVariable.wrapS = THREE.RepeatWrapping;
  this.positionVariable.wrapT = THREE.RepeatWrapping;
  var error = this.gpuCompute.init();

  if (error !== null) {
    console.error(error);
  }
};

Birds_moving.prototype.initBirds = function () {
  this.geometry = new THREE.BirdGeometry_moving(); // For Vertex and Fragment

  this.birdUniforms = {
    color: {
      value: new THREE.Color(0x000000)
    },
    texturePosition: {
      value: null
    },
    textureVelocity: {
      value: null
    },
    time: {
      value: 1.0
    },
    delta: {
      value: 0.0
    }
  }; // ShaderMaterial

  var material = new THREE.ShaderMaterial({
    uniforms: this.birdUniforms,
    vertexShader: document.getElementById('birdVS').textContent,
    fragmentShader: document.getElementById('birdFS').textContent,
    side: THREE.DoubleSide
  });
  this.birdMesh = new THREE.Mesh(this.geometry, material);
  this.birdMesh.rotation.y = Math.PI / 2;
  this.birdMesh.matrixAutoUpdate = false;
  this.birdMesh.updateMatrix(); //this.birdMesh.position.set(-500, -500, 0);

  this.scene.add(this.birdMesh);
};

Birds_moving.prototype.fillPositionTexture = function (texture) {
  var theArray = texture.image.data;

  for (var k = 0, kl = theArray.length; k < kl; k += 4) {
    var x = 450; //Math.random() * this.BOUNDS - this.BOUNDS_HALF;

    var y = 450; //Math.random() * this.BOUNDS - this.BOUNDS_HALF;

    var z = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
    theArray[k + 0] = x;
    theArray[k + 1] = y;
    theArray[k + 2] = z;
    theArray[k + 3] = 1;
  }
};

Birds_moving.prototype.fillVelocityTexture = function (texture) {
  var theArray = texture.image.data;

  for (var k = 0, kl = theArray.length; k < kl; k += 4) {
    var x = Math.random() - 0.5;
    var y = Math.random() - 0.5;
    var z = Math.random() - 0.5;
    theArray[k + 0] = x * 10;
    theArray[k + 1] = y * 10;
    theArray[k + 2] = z * 10;
    theArray[k + 3] = 1;
  }
};

Birds_moving.prototype.onWindowResize = function () {
  this.windowHalfX = window.innerWidth / 10;
  this.windowHalfY = window.innerHeight / 10;
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
};

Birds_moving.prototype.onDocumentMouseMove = function (event) {
  if (_typeof(event.touches) === 'object' && event.touches.length === 1) {
    event.preventDefault();
    this.mouseX = event.touches[0].pageX - this.windowHalfX;
    this.mouseY = event.touches[0].pageY - this.windowHalfY;
  } else {
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
  }
};

Birds_moving.prototype.startfading = function () {
  this.fading = true;
}; //


Birds_moving.prototype.startAnimation = function () {
  if (this.playing === true) return;
  this.playing = true;
  console.log('START BIRDS');
  this.animate();
};

Birds_moving.prototype.stopAnimation = function () {
  if (this.playing === false) return;
  this.playing = false;
  console.log('STOP BIRDS');
};

Birds_moving.prototype.animate = function () {
  var t = this;
  if (this.playing === false) return;
  requestAnimationFrame(function () {
    t.animate.call(t);
  });
  this.render();
};

Birds_moving.prototype.render = function () {
  var now = performance.now();
  var delta = (now - this.last) / 1000;
  if (delta > 1) delta = 1; // safety cap on large deltas

  this.last = now;
  this.positionUniforms.time.value = now;
  this.positionUniforms.delta.value = delta;
  this.velocityUniforms.time.value = now;
  this.velocityUniforms.delta.value = delta;
  this.birdUniforms.time.value = now;
  this.birdUniforms.delta.value = delta;

  if (this.lastDelta < this.last) {
    if (this.velocityUniforms.scrolltopy.value < 0) {
      this.velocityUniforms.scrolltopy.value = this.velocityUniforms.scrolltopy.value + 50;
      this.velocityUniforms.scrolltopx.value = this.velocityUniforms.scrolltopx.value + 70;
      this.lastDelta = this.last + 500;
    }

    if (this.velocityUniforms.scrolltopy.value == 0) {
      this.velocityUniforms.scrolltopy.value += 1;
      $('#particles-subview').delay(800).animate({
        'opacity': 0.0
      }, 1000);
      $('.light-box').delay(1200).animate({
        'opacity': 1
      }, 1000);
    }

    if (this.velocityUniforms.scrolltopy.value == 50) {} //this.stopAnimation();
    //this.velocityUniforms.scrolltopx.value = this.velocityUniforms.scrolltopx.value * -1;
    //$('#particles-subview').animate({'opacity': 1}, 800);

    /*if(this.velocityUniforms.scrolltopy.value > 0) {
      this.velocityUniforms.scrolltopx.value = this.velocityUniforms.scrolltopx.value - 50;
    }*/

  }

  this.gpuCompute.compute();
  this.birdUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
  this.birdUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;
  this.renderer.render(this.scene, this.camera);
};