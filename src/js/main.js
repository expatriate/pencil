//var renderer, scene, camera, distance, raycaster, projector;
//var container = document.getElementById('main-container');
//var distance = 400;

document.addEventListener("DOMContentLoaded", ready);

function ready() {
  //console.log(window.innerWidth, window.innerHeight)

  //init();
  var birds = new Birds($('#main-container')[0]);
  birds.startAnimation();
  birds.setBirdNumber(768);
  //animate();
}





  var Birds = function (container, width) {
    var t = this;
    t.container = container;
    t.playing = false;

    // this is super hacky, but returning an object that has empty methods identical to the expected object
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
    t.BIRDS = t.WIDTH*t.WIDTH;

    // Custom Geometry - using 3 triangles each. No UVs, no normals currently.
    THREE.BirdGeometry = function () {

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

        // Body
        verts_push(
          0, -0, -20,
          0, 4, -20,
          0, 0, 30
        );

        // Left Wing
        verts_push(
          0, 0, -15,
          -wingsSpan, 0, 0,
          0, 0, 15
        );

        // Right Wing
        verts_push(
          0, 0, 15,
          wingsSpan, 0, 0,
          0, 0, -15
        );

      }

      for (var v = 0; v < triangles * 3; v++) {

        var i = ~~(v / 3);
        var x = (i % t.WIDTH) / t.WIDTH;
        var y = ~~(i / t.WIDTH) / t.WIDTH;

        var c = new THREE.Color(
          0x444444 +
          ~~(v / 9) / t.BIRDS * 0x666666
        );

        birdColors.array[v * 3 + 0] = c.r;
        birdColors.array[v * 3 + 1] = c.g;
        birdColors.array[v * 3 + 2] = c.b;

        references.array[v * 2] = x;
        references.array[v * 2 + 1] = y;

        birdVertex.array[v] = v % 9;

      }

      this.scale(0.2, 0.2, 0.2);
    };

    THREE.BirdGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);

    t.container;
    t.camera, t.scene, t.renderer, t.geometry;
    t.mouseX = 0, t.mouseY = 0;

    t.windowHalfX = window.innerWidth / 2;
    t.windowHalfY = window.innerHeight / 2;

    t.BOUNDS = 800;
    t.BOUNDS_HALF = t.BOUNDS / 2
    t.last = performance.now();

    t.gpuCompute;
    t.velocityVariable;
    t.positionVariable;
    t.positionUniforms;
    t.velocityUniforms;
    t.birdUniforms;

    t.init();
    // t.startAnimation();
  }

  Birds.prototype.setBirdNumber = function (n) {
    var n = ~~(n/3);

    this.BIRDS = n;
    this.container.innerHTML = '';
    this.init();

    if(n < 100) {
      $('#main-container canvas').css({
        filter: 'grayscale(0)',
      });
    }
    else {
      $('#main-container canvas').css({
        filter: 'grayscale(100%)',
      });
    }   
  }

  Birds.prototype.init = function () {

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    this.camera.position.z = 350;

    this.scene = new THREE.Scene();

    this.scene.fog = new THREE.Fog(0xFDFDFA, 100, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true , clearAlpha: 1});
    this.renderer.setClearColor(this.scene.fog.color);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.initComputeRenderer();

    var t = this;
    var onmove = function (e) {
      t.onDocumentMouseMove.call(t,e);
    }
    var onresize = function (e) {
      t.onWindowResize.call(t,e);
    }   

    document.addEventListener('mousemove', onmove, false);
    document.addEventListener('touchstart', onmove, false);
    document.addEventListener('touchmove', onmove, false);

    //

    window.addEventListener('resize', onresize, false);
    window.addEventListener('orientationchange', onresize, false);

    this.initBirds();

  }

  Birds.prototype.initComputeRenderer = function() {

    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);

    var dtPosition = this.gpuCompute.createTexture();
    var dtVelocity = this.gpuCompute.createTexture();
    this.fillPositionTexture(dtPosition);
    this.fillVelocityTexture(dtVelocity);

    this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", document.getElementById('fragmentShaderVelocity').textContent, dtVelocity);
    this.positionVariable = this.gpuCompute.addVariable("texturePosition", document.getElementById('fragmentShaderPosition').textContent, dtPosition);

    this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.velocityUniforms = this.velocityVariable.material.uniforms;

    this.positionUniforms.time = {value: 0.0};
    this.positionUniforms.delta = {value: 0.0};
    this.velocityUniforms.time = {value: 1.0};
    this.velocityUniforms.delta = {value: 0.0};
    this.velocityUniforms.testing = {value: 1.0};
    this.velocityUniforms.seperationDistance = {value: 1.0};
    this.velocityUniforms.alignmentDistance = {value: 1.0};
    this.velocityUniforms.cohesionDistance = {value: 1.0};
    this.velocityUniforms.freedomFactor = {value: 1.0};
    this.velocityUniforms.predator = {value: new THREE.Vector3()};
    this.velocityVariable.material.defines.BOUNDS = this.BOUNDS.toFixed(2);

    this.velocityVariable.wrapS = THREE.RepeatWrapping;
    this.velocityVariable.wrapT = THREE.RepeatWrapping;
    this.positionVariable.wrapS = THREE.RepeatWrapping;
    this.positionVariable.wrapT = THREE.RepeatWrapping;

    var error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }

  }

  Birds.prototype.initBirds = function() {

    this.geometry = new THREE.BirdGeometry();

    // For Vertex and Fragment
    this.birdUniforms = {
      color: {value: new THREE.Color(0xff2200)},
      texturePosition: {value: null},
      textureVelocity: {value: null},
      time: {value: 1.0},
      delta: {value: 0.0}
    };

    // ShaderMaterial
    var material = new THREE.ShaderMaterial({
      uniforms: this.birdUniforms,
      vertexShader: document.getElementById('birdVS').textContent,
      fragmentShader: document.getElementById('birdFS').textContent,
      side: THREE.DoubleSide
    });

    this.birdMesh = new THREE.Mesh(this.geometry, material);
    this.birdMesh.rotation.y = Math.PI / 2;
    this.birdMesh.matrixAutoUpdate = false;
    this.birdMesh.updateMatrix();
    this.scene.add(this.birdMesh);

  }

  Birds.prototype.fillPositionTexture = function (texture) {

    var theArray = texture.image.data;

    for (var k = 0, kl = theArray.length; k < kl; k += 4) {

      var x = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
      var y = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
      var z = Math.random() * this.BOUNDS - this.BOUNDS_HALF;

      theArray[k + 0] = x;
      theArray[k + 1] = y;
      theArray[k + 2] = z;
      theArray[k + 3] = 1;

    }

  }

  Birds.prototype.fillVelocityTexture = function (texture) {

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

  }


  Birds.prototype.onWindowResize = function () {

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

  }

  Birds.prototype.onDocumentMouseMove = function (event) {

    if (typeof event.touches === 'object'
    && event.touches.length === 1) {

      event.preventDefault();

      this.mouseX = event.touches[0].pageX - this.windowHalfX;
      this.mouseY = event.touches[0].pageY - this.windowHalfY;

    }
    else {
      this.mouseX = event.clientX - this.windowHalfX;
      this.mouseY = event.clientY - this.windowHalfY;
    }

  }

  //
  Birds.prototype.startAnimation = function () {
    if(this.playing === true)
      return;

    this.playing = true;

    console.log('START BIRDS');

    this.animate();
  }

  Birds.prototype.stopAnimation = function () {
    if(this.playing === false)
      return;

    this.playing = false;
  
    console.log('STOP BIRDS');
  }

  Birds.prototype.animate = function () {
    var t = this;

    if(this.playing === false)
      return;

    requestAnimationFrame(function () {
      t.animate.call(t);
    });

    this.render();
  }

  Birds.prototype.render = function () {

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

    this.velocityUniforms.predator.value.set(0.5 * this.mouseX / this.windowHalfX, -0.5 * this.mouseY / this.windowHalfY, 0);

    this.mouseX = 10000;
    this.mouseY = 10000;

    this.gpuCompute.compute();

    this.birdUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
    this.birdUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;

    this.renderer.render(this.scene, this.camera);

  }




















/*
var sphereVerticesArray = [];
var sphereVerticesNormArray = [];
var mouseX = 0, mouseY = 0, camera, webGLRenderer,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,
    raycaster, mesh, meshRed, scene, Rgeometry, Rmaterial, Redmaterial, intersects, projector, tgeometry;
var intersectionPt, mouse;

var tick = 1;
var resizeTimer;

var WIDTH = 16;
var BIRDS = WIDTH * WIDTH;
var BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;
var last = performance.now();
var gpuCompute;
var velocityVariable;
var positionVariable;
var positionUniforms;
var velocityUniforms;
var birdUniforms;


var raycaster1, mouse1;

THREE.BirdGeometry = function () {
  var triangles = BIRDS * 3;
  var points = triangles * 3;
  THREE.BufferGeometry.call( this );
  var vertices = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
  var birdColors = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
  var references = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );
  var birdVertex = new THREE.BufferAttribute( new Float32Array( points ), 1 );
  this.addAttribute( 'position', vertices );
  this.addAttribute( 'birdColor', birdColors );
  this.addAttribute( 'reference', references );
  this.addAttribute( 'birdVertex', birdVertex );
  // this.addAttribute( 'normal', new Float32Array( points * 3 ), 3 );
  var v = 0;
  function verts_push() {
    for (var i=0; i < arguments.length; i++) {
      vertices.array[v++] = arguments[i];
    }
  }
  var wingsSpan = 20;
  for (var f = 0; f<BIRDS; f++ ) {
    // Body
    verts_push(
      0, -0, -20,
      0, 4, -20,
      0, 0, 30
    );
    // Left Wing
    verts_push(
      0, 0, -15,
      -wingsSpan, 0, 0,
      0, 0, 15
    );
    // Right Wing
    verts_push(
      0, 0, 15,
      wingsSpan, 0, 0,
      0, 0, -15
    );
  }
  for( var v = 0; v < triangles * 3; v++ ) {
    var i = ~~(v / 3);
    var x = (i % WIDTH) / WIDTH;
    var y = ~~(i / WIDTH) / WIDTH;
    var c = new THREE.Color(
      0x444444 +
      ~~(v / 9) / BIRDS * 0x666666
    );
    birdColors.array[ v * 3 + 0 ] = c.r;
    birdColors.array[ v * 3 + 1 ] = c.g;
    birdColors.array[ v * 3 + 2 ] = c.b;
    references.array[ v * 2     ] = x;
    references.array[ v * 2 + 1 ] = y;
    birdVertex.array[ v         ] = v % 9;
  }
  this.scale( 0.2, 0.2, 0.2 );
};
THREE.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );

function initComputeRenderer() {
    gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );
    var dtPosition = gpuCompute.createTexture();
    var dtVelocity = gpuCompute.createTexture();
    fillPositionTexture( dtPosition );
    fillVelocityTexture( dtVelocity );
    velocityVariable = gpuCompute.addVariable( "textureVelocity", document.getElementById( 'fragmentShaderVelocity' ).textContent, dtVelocity );
    positionVariable = gpuCompute.addVariable( "texturePosition", document.getElementById( 'fragmentShaderPosition' ).textContent, dtPosition );
    gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
    gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );
    positionUniforms = positionVariable.material.uniforms;
    velocityUniforms = velocityVariable.material.uniforms;
    positionUniforms.time = { value: 0.0 };
    positionUniforms.delta = { value: 0.0 };
    velocityUniforms.time = { value: 1.0 };
    velocityUniforms.delta = { value: 0.0 };
    velocityUniforms.testing = { value: 1.0 };
    velocityUniforms.seperationDistance = { value: 1.0 };
    velocityUniforms.alignmentDistance = { value: 1.0 };
    velocityUniforms.cohesionDistance = { value: 1.0 };
    velocityUniforms.freedomFactor = { value: 1.0 };
    velocityUniforms.predator = { value: new THREE.Vector3() };
    velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );
    velocityVariable.wrapS = THREE.RepeatWrapping;
    velocityVariable.wrapT = THREE.RepeatWrapping;
    positionVariable.wrapS = THREE.RepeatWrapping;
    positionVariable.wrapT = THREE.RepeatWrapping;
    var error = gpuCompute.init();
    if ( error !== null ) {
        console.error( error );
    }
}
function fillPositionTexture( texture ) {
  var theArray = texture.image.data;
  for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
    var x = Math.random() * BOUNDS - BOUNDS_HALF;
    var y = Math.random() * BOUNDS - BOUNDS_HALF;
    var z = Math.random() * BOUNDS - BOUNDS_HALF;
    theArray[ k + 0 ] = x;
    theArray[ k + 1 ] = y;
    theArray[ k + 2 ] = z;
    theArray[ k + 3 ] = 1;
  }
}
function fillVelocityTexture( texture ) {
  var theArray = texture.image.data;
  for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
    var x = Math.random() - 0.5;
    var y = Math.random() - 0.5;
    var z = Math.random() - 0.5;
    theArray[ k + 0 ] = x * 10;
    theArray[ k + 1 ] = y * 10;
    theArray[ k + 2 ] = z * 10;
    theArray[ k + 3 ] = 1;
  }
}

function initBirds() {
  var geometry = new THREE.BirdGeometry();
  // For Vertex and Fragment
  birdUniforms = {
    color: { value: new THREE.Color( 0xff2200 ) },
    texturePosition: { value: null },
    textureVelocity: { value: null },
    time: { value: 1.0 },
    delta: { value: 0.0 }
  };
  // ShaderMaterial
  var material = new THREE.ShaderMaterial( {
    uniforms:       birdUniforms,
    vertexShader:   document.getElementById( 'birdVS' ).textContent,
    fragmentShader: document.getElementById( 'birdFS' ).textContent,
    side: THREE.DoubleSide
  });
  birdMesh = new THREE.Mesh( geometry, material );
  birdMesh.rotation.y = Math.PI / 2;
  birdMesh.matrixAutoUpdate = false;
  birdMesh.updateMatrix();
  scene.add(birdMesh);
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
    var now = performance.now();
    var delta = (now - last) / 1000;
    if (delta > 1) delta = 1; // safety cap on large deltas
    last = now;
    positionUniforms.time.value = now;
    positionUniforms.delta.value = delta;
    velocityUniforms.time.value = now;
    velocityUniforms.delta.value = delta;
    birdUniforms.time.value = now;
    birdUniforms.delta.value = delta;
    velocityUniforms.predator.value.set( 0.5 * mouseX / windowHalfX, - 0.5 * mouseY / windowHalfY, 0 );
    mouseX = 10000;
    mouseY = 10000;
    gpuCompute.compute();
    birdUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
    birdUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;
    renderer.render( scene, camera );
}

*/
/*function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  scene.fog = new THREE.Fog( 0xffffff, 100, 1000 );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = 350;
  // create a render and set the size
  renderer = new THREE.WebGLRenderer({ antialias: true , clearAlpha: 1});
  renderer.setClearColor( scene.fog.color );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio( window.devicePixelRatio );

  $("#main-container").append(renderer.domElement);
}*/






















/*




function init () {

  var date = new Date();
  var pn = new Perlin('rnd' + date.getTime());
  var sphereGeom = new THREE.SphereGeometry(32, 50, 50);
  // save points for later calculation
  for (var i = 0; i < sphereGeom.vertices.length; i++) {
    var vertex = sphereGeom.vertices[i];
    var vec = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
    sphereVerticesArray.push(vec);
    var mag = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
    mag = Math.sqrt(mag);
    var norm = new THREE.Vector3(vertex.x / mag, vertex.y / mag, vertex.z / mag);
    sphereVerticesNormArray.push(norm);
  }

  var geometry = new THREE.Geometry();
  tgeometry = new THREE.Geometry();
  var lgeometry = new THREE.Geometry();
  var sgeometry = new THREE.Geometry();
  var ssgeometry = new THREE.Geometry();

  function createCircleTexture(color, size) {
    var matCanvas = document.createElement('canvas');
    matCanvas.width = matCanvas.height = size;
    var matContext = matCanvas.getContext('2d');
    // create texture object from canvas.
    var texture = new THREE.Texture(matCanvas);
    // Draw a circle
    var center = size / 2;
    matContext.beginPath();
    matContext.arc(center, center, size/2, 0, 2 * Math.PI, false);
    matContext.closePath();
    matContext.fillStyle = color;
    matContext.fill();
    // need to set needsUpdate
    texture.needsUpdate = true;
    // return a texture made from the canvas
    return texture;
  }

  var tmaterial = new THREE.PointsMaterial({
      size: 0.2,
      map: createCircleTexture('#cccccc', 64),
      transparent: true,
      depthWrite: false,
      alphaTest: 0.5,
      opacity: 0.65,
   });
  var lmaterial = new THREE.LineBasicMaterial({
      color: 0xdddddd,
      opacity: 0.5,
      transparent: true,
  });

  var sprite = new THREE.TextureLoader().load( 'img/disc.png' );
  sprite.anisotropy = webGLRenderer.capabilities.getMaxAnisotropy();
  smaterial = new THREE.PointsMaterial({
    size: 2.9,
    map: createCircleTexture('#a01d21', 64),
    transparent: true,
    depthWrite: false,
    alphaTest: 0.5
  });
  ssmaterial = new THREE.PointsMaterial({
    size: 1.8,
    map: createCircleTexture('#a01d21', 64),
    transparent: true,
    depthWrite: false,
    alphaTest: 0.5
  });

  //material and scene defined in question
  var pointCloud = new THREE.Points(tgeometry, tmaterial);

  var lineCloud = new THREE.Line(lgeometry, lmaterial);
  var randomCloud = new THREE.Points(sgeometry, smaterial);
  randomCloud.sortParticles = true;
  var randomMovingCloud = new THREE.Points(ssgeometry, ssmaterial);  

  for (var i = 0; i < 100; i++ ) {
    var svertex = new THREE.Vector3();
    svertex.x = (Math.random() * 2 - 1);
    svertex.y = (Math.random() * 2 - 1);
    svertex.z = (Math.random() * 2 - 1);
    svertex.normalize();
    svertex.multiplyScalar(Math.random() * 20 + 7);
    sgeometry.vertices.push(svertex);
  }

  for (var i = 0; i < 50; i++ ) {
    var svertex = new THREE.Vector3();
    svertex.x = (Math.random() * 2 - 1) * 2;
    svertex.y = (Math.random() * 2 - 1) * 1;
    svertex.z = (Math.random() * 2 - 1);
    svertex.normalize();
    svertex.multiplyScalar(16);
    ssgeometry.vertices.push(svertex);
    svertex.multiplyScalar( Math.random() * 0.2 + 1 );
    ssgeometry.vertices.push(svertex);
  }

  scene.add(randomCloud);
  scene.add(randomMovingCloud);

  // position and point the camera to the center of the scene
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 50;

  var clock = new THREE.Clock();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  projector = new THREE.Projector();

 // geometry
  
  // material
  Rmaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff, 
      transparent: true,
      opacity: 0,
  });

  // mesh
  mesh = new THREE.Mesh( sphereGeom, Rmaterial );
  scene.add( mesh );


  window.addEventListener('mousedown', onMouseDown, false );
  window.addEventListener('mousemove', onMouseMove, false );
  
  intersectionPt = new THREE.Geometry();
  intersectionPt.vertices.push(new THREE.Vector3( 0, 0, 0));
  var dotMaterial = new THREE.PointsMaterial( { size: 0, sizeAttenuation: false } );
  var dot = new THREE.Points( intersectionPt, dotMaterial );
  //scene.add( dot );

  // add the output of the renderer to the html element
  $("#main-container").append(webGLRenderer.domElement);

  var step = 0;
  var inverter = 1;
  var timeToRed = 0 , showRed = false, ticktonext = 0;

  //document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  //document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  //document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  window.addEventListener( 'resize', onWindowResize, false );


  render();

  function render() {
    step += 1;

    scene.rotation.y -= 0.004;

    if (step % 785 === 0 && showRed) {
      showRed = false;
    } else if (step % 785 === 0 && !showRed) {
      showRed = true;
    }


    var delta = clock.getDelta();
    var lastParams = [];

    webGLRenderer.clear();

    //scene.remove(sphere);
    scene.remove(pointCloud);
    scene.remove(lineCloud);

    tgeometry.vertices = [];
    lgeometry.vertices = [];


    if (intersects && intersects.length) {
      if (!showRed) {
        inverter = inverter > 40 ? 40 : inverter + 1;
      } else {
        inverter = inverter < 1 ? 1 : inverter - 1;
      }
      for (var i = 0; i < sphereGeom.vertices.length; i += 1) {
        var vertex = sphereGeom.vertices[i], value;
        if (showRed) {
          value = pn.noise((vertex.x + step)/ 30, vertex.y / 30, 100 + vertex.z / 10);
        } else {
          value = pn.noise((vertex.x + step)/ 20, vertex.y / 20, 50 + vertex.z / 10);
        }

        vertex.x = sphereVerticesArray[i].x + (sphereVerticesNormArray[i].x * value * (showRed ? (inverter / 10) : 5)) * inverter / 50;
        vertex.y = sphereVerticesArray[i].y + (sphereVerticesNormArray[i].y * value * (showRed ? (inverter / 10) : 5)) * inverter / 50;
        vertex.z = sphereVerticesArray[i].z + sphereVerticesNormArray[i].z * value * 1;

        tgeometry.vertices.push(new THREE.Vector3(
          vertex.x,
          vertex.y,
          vertex.z));

        if (i > 0) {
          lgeometry.vertices.push(lastParams, new THREE.Vector3(vertex.x, vertex.y, vertex.z))
        }
        lastParams = new THREE.Vector3(
          vertex.x,
          vertex.y,
          vertex.z)
      }
    } else {
      
      inverter = inverter < 1 ? 1 : inverter - 1;
      for (var i = 0; i < sphereGeom.vertices.length; i += 1) {
        var vertex = sphereGeom.vertices[i];

        var value = pn.noise((vertex.x + step)/ 20, vertex.y / 20, 50 + vertex.z / 10);

        vertex.x = sphereVerticesArray[i].x + (sphereVerticesNormArray[i].x * value * (inverter / 10)) * inverter / 50;
        vertex.y = sphereVerticesArray[i].y + (sphereVerticesNormArray[i].y * value * (inverter / 10)) * inverter / 50;
        vertex.z = sphereVerticesArray[i].z + sphereVerticesNormArray[i].z * value * 1;

        tgeometry.vertices.push(new THREE.Vector3(
          vertex.x,
          vertex.y,
          vertex.z));

        if (i > 0) {
          lgeometry.vertices.push(lastParams,new THREE.Vector3( vertex.x, vertex.y, vertex.z ));
        }
        lastParams = new THREE.Vector3(
          vertex.x,
          vertex.y,
          vertex.z);
      }
    }

    
    sphereGeom.computeFaceNormals();
    sphereGeom.computeVertexNormals();

    tgeometry.computeFaceNormals();
    tgeometry.computeVertexNormals();

    lgeometry.computeFaceNormals();
    lgeometry.computeVertexNormals();

    sgeometry.computeFaceNormals();
    sgeometry.computeVertexNormals();

    sphereGeom.verticesNeedUpdate = true;
    tgeometry.verticesNeedUpdate = true;
    lgeometry.verticesNeedUpdate = true;
    sgeometry.verticesNeedUpdate = true;


    var rotateX = randomMovingCloud.rotation.x - 0.003;
    var rotateY = randomMovingCloud.rotation.y - 0.001;
    var rotateZ = randomMovingCloud.rotation.z - 0.001;
    randomMovingCloud.rotation.set( rotateX, rotateY, rotateZ );

    scene.add(pointCloud);
    scene.add(lineCloud);

    requestAnimationFrame(render);
    webGLRenderer.render(scene, camera);
  }
}*/
/*function onMouseMove( event ) {
  mouse.x = ( ( event.clientX - webGLRenderer.domElement.offsetLeft ) / webGLRenderer.domElement.width ) * 2 - 1;
  mouse.y = - ( ( event.clientY - webGLRenderer.domElement.offsetTop ) / webGLRenderer.domElement.height ) * 2 + 1;
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vector.unproject(camera);

  raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
  intersects = raycaster.intersectObject( mesh );

  raycaster.setFromCamera( mouse, camera );
  if ( intersects.length > 0 ) {
    intersectionPt.vertices[0] = intersects[0].point;
    intersectionPt.verticesNeedUpdate = true;
    
  }
}

function onMouseDown( event ) {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   

}
function onWindowResize() {

  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(function() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    //camera.aspect = $('#main-container').width()/ $('#main-container').height();
    //camera.updateProjectionMatrix();

    var customHeight = $(window).height();
    var windowWidth = $(window).width();

    if (windowWidth < customHeight) {
      customHeight = windowWidth;
    }
    $('#main-container').css({width: customHeight, height: customHeight})
    webGLRenderer.setSize( customHeight, customHeight );
  }, 100);
}*/

/*
function init() {
  //init render
    renderer = new THREE.WebGLRenderer({antialias: true});
    //render window size
    renderer.setSize(window.innerWidth, window.innerHeight);
    //background color
    renderer.setClearColor(0x140b33, 1);
    //append render to the <DIV> container
    container.appendChild(renderer.domElement);

  //init scene, camera and camera position
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.2, 25000);
    camera.position.set(100, -400, 2000);
    //adding camera to the scene
    scene.add(camera);

  //LIGHTNING
    //first point light
    light = new THREE.PointLight(0xffffff, 1, 4000);
    light.position.set(50, 0, 0);
    //the second one
    light_two = new THREE.PointLight(0xffffff, 1, 4000);
    light_two.position.set(-100, 800, 800);
    //And another global lightning some sort of cripple GL
    lightAmbient = new THREE.AmbientLight(0x404040);
    scene.add(light, light_two, lightAmbient);


  //OBJECTS
    createSpace();

    //adding scene and camera to the render
    renderer.render(scene, camera);
};

var sphereVerticesArray = [];
var sphereVerticesNormArray = [];
var mouseX = 0, mouseY = 0, camera, webGLRenderer,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,
    raycaster, mesh, meshRed, scene, Rgeometry, Rmaterial, Redmaterial, intersects, projector, tgeometry;
var intersectionPt, mouse;

var tick = 1;



var raycaster1, mouse1;*/

/*


function createSpace() {

    dots = new THREE.Object3D();

    for (var i = 0; i < 420; i++) {
        var circleGeometry = new THREE.SphereGeometry(2, Math.random() * 5, Math.random() * 5);
        //change meterial
        var material = new THREE.MeshBasicMaterial({
            color: Math.random() * 0xff00000 - 0xff00000,
            shading: THREE.FlatShading,
        })
        var circle = new THREE.Mesh(circleGeometry, material);
        material.side = THREE.DoubleSide;

        circle.position.x = Math.random() * -distance * 60;
        circle.position.y = Math.random() * -distance * 6;
        circle.position.z = Math.random() * distance * 3;
        circle.rotation.y = Math.random() * 2 * Math.PI;
        circle.scale.x = circle.scale.y = circle.scale.z = Math.random() * 6 + 5;
        dots.add(circle);
    }

    dots.position.x = 7000;
    dots.position.y = 900;
    dots.position.z = -2000;
    dots.rotation.y = Math.PI * 600;
    dots.rotation.z = Math.PI * 500;

    scene.add(dots);
};

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
};
document.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
    camera.position.x += (mouseX - camera.position.x) * 0.005;
    camera.position.y += (mouseY - camera.position.y) * 0.005;
    //set up camera position
    camera.lookAt(scene.position);
};*/