var vertexShaderJS =

      'attribute vec2 reference;'+
      'attribute float birdVertex;'+
      'attribute vec3 birdColor;'+

      'uniform sampler2D texturePosition;'+
      'uniform sampler2D textureVelocity;'+

      'varying vec4 vColor;'+
      'varying float z;'+

      'uniform float time;'+

      'void main() {'+

        'vec4 tmpPos = texture2D( texturePosition, reference );'+
        'vec3 pos = tmpPos.xyz;'+
        'vec3 velocity = normalize(texture2D( textureVelocity, reference ).xyz);'+

        'vec3 newPosition = position;'+

        'newPosition = mat3( modelMatrix ) * newPosition;'+


        'velocity.z *= -1.;'+
        'float xz = length( velocity.xz );'+
        'float xyz = 1.;'+
        'float x = sqrt( 1. - velocity.y * velocity.y );'+

        'float cosry = velocity.x / xz;'+
        'float sinry = velocity.z / xz;'+

        'float cosrz = x / xyz;'+
        'float sinrz = velocity.y / xyz;'+

        'float scale = 0.5;'+

        'mat3 matScale = mat3('+
          'scale, 0, 0,'+
          '0, scale, 0,'+
          '0, 0, scale'+
        ');'+

        'mat3 maty =  mat3('+
          'cosry, 0, -sinry,'+
          '0    , 1, 0     ,'+
          'sinry, 0, cosry'+
        ');'+

        'mat3 matz =  mat3('+
          'cosrz , sinrz, 0,'+
          '-sinrz, cosrz, 0,'+
          '0     , 0    , 1'+
        ');'+

        'newPosition =  matScale * maty * matz * newPosition;'+
        'newPosition += pos;'+

        'z = newPosition.z;'+

        'vColor = vec4( birdColor, 0.5 );'+
        'gl_Position = projectionMatrix *  viewMatrix  * vec4( newPosition, 1.0 );'+
      '}';

var fragmentShaderJS =
  'varying vec4 vColor;'+
  'varying float z;'+

  'uniform vec3 color;'+

  'void main() {'+
    'float z2 = 0.1 + ( 1000. - z ) / 1000. * vColor.x;'+
    'gl_FragColor = vec4( z2, z2, z2, 0.2 );'+
  '}';

var texturePositionJS =
 'uniform float time;'+
      'uniform float delta;'+

      'void main() {'+

        'vec2 uv = gl_FragCoord.xy / resolution.xy;'+
        'vec4 tmpPos = texture2D( texturePosition, uv );'+
        'vec3 position = tmpPos.xyz;'+
        'vec3 velocity = texture2D( textureVelocity, uv ).xyz;'+

        'float phase = tmpPos.w;'+

        'phase = mod( ( phase + delta +'+
          'length( velocity.xz ) * delta * 3. +'+
          'max( velocity.y, 0.0 ) * delta * 6. ), 62.83 );'+

        'gl_FragColor = vec4( position + velocity * delta * 15. , phase );'+

      '}';

var textureVelocityJS =
  'uniform float time;'+
  'uniform float testing;'+
  'uniform float delta;'+
  'uniform float seperationDistance;'+
  'uniform float alignmentDistance;'+
  'uniform float cohesionDistance;'+
  'uniform float freedomFactor;'+
  'uniform vec3 predator;'+

  'uniform float scrolltop;'+

  'const float width = resolution.x;'+
  'const float height = resolution.y;'+

  'const float PI = 3.141592653589793;'+
  'const float PI_2 = PI * 2.0;'+

  'float zoneRadius = 40.0;'+
  'float zoneRadiusSquared = 1600.0;'+

  'float separationThresh = 0.45;'+
  'float alignmentThresh = 0.65;'+

  'const float UPPER_BOUNDS = BOUNDS;'+
  'const float LOWER_BOUNDS = -UPPER_BOUNDS;'+

  'const float SPEED_LIMIT = 9.0;'+

  'float rand(vec2 co){'+
    'return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);'+
  '}'+

  'void main() {'+

    'zoneRadius = seperationDistance + alignmentDistance + cohesionDistance;'+
    'separationThresh = seperationDistance / zoneRadius;'+
    'alignmentThresh = ( seperationDistance + alignmentDistance ) / zoneRadius;'+
    'zoneRadiusSquared = zoneRadius * zoneRadius;'+


    'vec2 uv = gl_FragCoord.xy / resolution.xy;'+
    'vec3 birdPosition, birdVelocity;'+

    'vec3 selfPosition = texture2D( texturePosition, uv ).xyz;'+
    'vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;'+

    'float dist;'+
    'vec3 dir;'+
    'float distSquared;'+

    'float seperationSquared = seperationDistance * seperationDistance;'+
    'float cohesionSquared = cohesionDistance * cohesionDistance;'+

    'float f;'+
    'float percent;'+

    'vec3 velocity = selfVelocity;'+

    'float limit = SPEED_LIMIT;'+

    'dir = predator * UPPER_BOUNDS - selfPosition;'+
    'dir.z = 0.;'+
    'dist = length( dir );'+
    'distSquared = dist * dist;'+

    'float preyRadius = 250.0;'+
    'float preyRadiusSq = preyRadius * preyRadius;'+

    'if (dist < preyRadius) {'+

      'f = ( distSquared / preyRadiusSq - 1.0 ) * delta * 100.;'+
      'velocity += normalize( dir ) * f;'+
      'limit += 5.0;'+
    '}'+

    'vec3 central = vec3( 0., -scrolltop * 0.25, 0. );'+
    'dir = selfPosition - central;'+
    'dist = length( dir );'+

    'dir.y *= 2.5;'+
    'velocity -= normalize( dir ) * delta * 5.;'+

    'for (float y=0.0;y<height;y++) {'+
      'for (float x=0.0;x<width;x++) {'+

        'vec2 ref = vec2(  0.5, 0.5 ) / resolution.xy;'+
        'birdPosition = texture2D( texturePosition, ref ).xyz;'+

        'dir = birdPosition - selfPosition;'+
        'dist = length(dir);'+

        'if (dist < 0.0001) continue;'+

        'distSquared = dist * dist;'+

        'if (distSquared > zoneRadiusSquared ) continue;'+

        'percent = distSquared / zoneRadiusSquared;'+

        'if ( percent < separationThresh ) {'+

          'f = (separationThresh / percent - 1.0) * delta;'+
          'velocity -= normalize(dir) * f;'+

        '}  else if ( percent < alignmentThresh ) {'+

          'float threshDelta = alignmentThresh - separationThresh;'+
          'float adjustedPercent = ( percent - separationThresh ) / threshDelta;'+

          'birdVelocity = texture2D( textureVelocity, ref ).xyz;'+

          'f = ( 0.5 - cos( adjustedPercent * PI_2 ) * 0.5 + 0.5 ) * delta;'+
          'velocity += normalize(birdVelocity) * f;'+

        '} else {'+

          'float threshDelta = 1.0 - alignmentThresh;'+
          'float adjustedPercent = ( percent - alignmentThresh ) / threshDelta;'+

          'f = ( 0.5 - ( cos( adjustedPercent * PI_2 ) * -0.5 + 0.5 ) ) * delta;'+

          'velocity += normalize(dir) * f;'+

        '}'+

      '}'+

    '}'+

    'if ( length( velocity ) > limit ) {'+
      'velocity = normalize( velocity ) * limit;'+
    '}'+

    'gl_FragColor = vec4( velocity, 1.0 );'+

  '}';

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
    t.WIDTH = width || 64;
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

        /*// Body
        verts_push(
          0, -0, -20,
          0, 4, -20,
          0, 0, 30
        );*/

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
          0xCCCCCC +
          ~~(v / 9) / t.BIRDS * 0xAAAAAA
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

    t.BOUNDS = 180; // радиус изаначльного значения
    t.BOUNDS_HALF = t.BOUNDS / 2
    t.last = performance.now();

    //t.SCROLLBOUNDS = window.window.pageYOffset;

    t.gpuCompute;
    t.velocityVariable;
    t.positionVariable;
    t.positionUniforms;
    t.velocityUniforms;
    t.birdUniforms;
    t.prev = 0;
    t.pevcounter = 0;

    t.init();
    // t.startAnimation();
  }

  Birds.prototype.setBirdNumber = function (n) {
    var n = ~~(n/3);

    this.BIRDS = n;
    this.container.innerHTML = '';
    this.init();

    if(n < 100) {
      $('#particles-mainview canvas').css({
        filter: 'grayscale(0)',
      });
    }
    else {
      $('#particles-mainview canvas').css({
        filter: 'grayscale(100%)',
      });
    }   
  }

  Birds.prototype.init = function () {

    this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 3000);
    this.camera.position.z = 250;

    this.scene = new THREE.Scene();
    window.scene = this.scene;

    this.scene.fog = new THREE.Fog(0xFFFFFF, 100, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true , clearAlpha: 1});
    this.renderer.setClearColor(this.scene.fog.color);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.setSize($('#particles-mainview').width(), window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.initComputeRenderer();

    var t = this;
    /*var onmove = function (e) {
      
      t.onDocumentMouseMove.call(t,e);
    }*/
    var onresize = function (e) {
      t.onWindowResize.call(t,e);
    }   

    /*document.addEventListener('mousemove', onmove, false);
    document.addEventListener('touchstart', onmove, false);
    document.addEventListener('touchmove', onmove, false);*/

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

    this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", textureVelocityJS, dtVelocity);
    this.positionVariable = this.gpuCompute.addVariable("texturePosition", texturePositionJS, dtPosition);

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

    this.velocityUniforms.scrolltop = {value: window.innerHeight/2};//{value: window.window.pageYOffset};

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
      vertexShader: vertexShaderJS,
      fragmentShader: fragmentShaderJS,
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

      theArray[k + 0] = x * 5;
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

    this.renderer.setSize($('#particles-mainview').width(), window.innerHeight);

  }

  /*Birds.prototype.onDocumentMouseMove = function (event) {
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

  }*/

  //
  Birds.prototype.startAnimation = function () {
    if(this.playing === true)
      return;

    this.playing = true;


    this.animate();
  }

  Birds.prototype.stopAnimation = function () {
    if(this.playing === false)
      return;

    this.playing = false;
  
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

    this.velocityUniforms.scrolltop.value = 0// window.window.pageYOffset;
    if (parseInt(this.last/1000) > this.prev || this.prevcounter != 0) {
      
      if (parseInt(this.last/1000) > this.prev) {
        this.prev += 20;
      }
      if (this.prevcounter < 30) {
        this.prevcounter += 1;
      }
      else {
        this.prevcounter = 0;
      }

      this.mouseX = 0;
      this.mouseY = 0;
    } else {

    this.mouseX = 10000;
    this.mouseY = 10000;
    }



    



    this.gpuCompute.compute();

    this.birdUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
    this.birdUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;

    this.renderer.render(this.scene, this.camera);

    
  }