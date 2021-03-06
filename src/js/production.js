document.addEventListener("DOMContentLoaded", productionReady);
var prod;

function easeInQuad(t, b, c, d) {
  t /= d;
  return c * t * t + b;
};

function easeOutQuad(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
};

function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c/2 * (t * (t - 2) - 1) + b;
};

function easeInOutQuart(t, b, c, d) {
  if ((t /= d / 2) < 1) {
    return c / 2 * t * t * t * t + b;
  } else {
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
  }
};

function easeInSine(t, b, c, d) {
  return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
};

function easeOutSine(t, b, c, d) {
  return c * Math.sin(t/d * (Math.PI/2)) + b;
};

function easeInOutSine(t, b, c, d) {
  return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
};

function browser() {
  var data = {
    mobile: false,
    desktop: true
  }
  if (window.innerWidth < 1024) {
    data.mobile = false;
    data.desktop = true
  }
  return data
}

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
  'displaced.z += rndz * (random(pindex) * 1.0 * uDepth);'+

  'displaced.xy -= uTextureSize * 0.5;'+

  'float t = texture2D(uTouch, puv).r;'+
  'displaced.z += t * 10.0 * rndz;'+
  'displaced.x += cos(angle) * t * 10.0 * rndz;'+
  'displaced.y += sin(angle) * t * 10.0 * rndz;'+

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



var App = function() {

  App.prototype.init = function() {
    this.initWebGL();
    this.initGUI();
    this.addListeners();
    this.animate();
    this.resize();
  }

  App.prototype.initWebGL = function() {
    this.webgl = new ProductionView(this);
    document.getElementById('production-mainview').appendChild(this.webgl.renderer.domElement);
  }

  App.prototype.initGUI = function() {
    //this.gui = new GUIView(this);
  }

  App.prototype.addListeners = function() {
    this.handlerAnimate = this.animate.bind(this);

    window.addEventListener('resize', this.resize.bind(this));

    var el = this.webgl.renderer.domElement;
    el.addEventListener('click', this.click.bind(this));
  }

  App.prototype.animate = function() {
    this.update();
    this.draw();

    this.raf = requestAnimationFrame(this.handlerAnimate);
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  App.prototype.update = function() {
    if (this.webgl) this.webgl.update();
  }

  App.prototype.draw = function() {
    if (this.webgl) this.webgl.draw();
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  App.prototype.resize = function() {
    if (this.webgl) this.webgl.resize();
  }

  App.prototype.keyup = function(e) {
  }

  App.prototype.click = function(e) {
    this.webgl.next();
  }
}

function productionReady() {
  if (document.getElementById('production-mainview')) {
    window.app = new App();
    window.app.init();
  }
};


var InteractiveControls = function(camera, el) {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;

  // Backwards-compat with node 0.10.x
  InteractiveControls.InteractiveControls = InteractiveControls;

  InteractiveControls.prototype._events = undefined;
  InteractiveControls.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  InteractiveControls.defaultMaxListeners = 10;

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  InteractiveControls.prototype.setMaxListeners = function(n) {
    if (!isNumber(n) || n < 0 || isNaN(n))
      throw TypeError('n must be a positive number');
    this._maxListeners = n;
    return this;
  };

  InteractiveControls.prototype.emit = function(type) {
    var er, handler, len, args, i, listeners;

    if (!this._events)
      this._events = {};

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events.error ||
          (isObject(this._events.error) && !this._events.error.length)) {
        er = arguments[1];
        if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          // At least give some kind of context to the user
          var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          err.context = er;
          throw err;
        }
      }
    }

    handler = this._events[type];

    if (isUndefined(handler))
      return false;

    if (isFunction(handler)) {
      switch (arguments.length) {
        // fast cases
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
      }
    } else if (isObject(handler)) {
      args = Array.prototype.slice.call(arguments, 1);
      listeners = handler.slice();
      len = listeners.length;
      for (i = 0; i < len; i++)
        listeners[i].apply(this, args);
    }

    return true;
  };

  InteractiveControls.prototype.addListener = function(type, listener) {
    var m;

    if (!isFunction(listener))
      throw TypeError('listener must be a function');

    if (!this._events)
      this._events = {};

    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (this._events.newListener)
      this.emit('newListener', type,
                isFunction(listener.listener) ?
                listener.listener : listener);

    if (!this._events[type])
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    else if (isObject(this._events[type]))
      // If we've already got an array, just append.
      this._events[type].push(listener);
    else
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];

    // Check for listener leak
    if (isObject(this._events[type]) && !this._events[type].warned) {
      if (!isUndefined(this._maxListeners)) {
        m = this._maxListeners;
      } else {
        m = InteractiveControls.defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        if (typeof console.trace === 'function') {
          // not supported in IE 10
          console.trace();
        }
      }
    }

    return this;
  };

  InteractiveControls.prototype.on = InteractiveControls.prototype.addListener;

  InteractiveControls.prototype.once = function(type, listener) {
    if (!isFunction(listener))
      throw TypeError('listener must be a function');

    var fired = false;

    function g() {
      this.removeListener(type, g);

      if (!fired) {
        fired = true;
        listener.apply(this, arguments);
      }
    }

    g.listener = listener;
    this.on(type, g);

    return this;
  };

  // emits a 'removeListener' event iff the listener was removed
  InteractiveControls.prototype.removeListener = function(type, listener) {
    var list, position, length, i;

    if (!isFunction(listener))
      throw TypeError('listener must be a function');

    if (!this._events || !this._events[type])
      return this;

    list = this._events[type];
    length = list.length;
    position = -1;

    if (list === listener ||
        (isFunction(list.listener) && list.listener === listener)) {
      delete this._events[type];
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);

    } else if (isObject(list)) {
      for (i = length; i-- > 0;) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener)) {
          position = i;
          break;
        }
      }

      if (position < 0)
        return this;

      if (list.length === 1) {
        list.length = 0;
        delete this._events[type];
      } else {
        list.splice(position, 1);
      }

      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    }

    return this;
  };

  InteractiveControls.prototype.removeAllListeners = function(type) {
    var key, listeners;

    if (!this._events)
      return this;

    // not listening for removeListener, no need to emit
    if (!this._events.removeListener) {
      if (arguments.length === 0)
        this._events = {};
      else if (this._events[type])
        delete this._events[type];
      return this;
    }

    // emit removeListener for all listeners on all events
    if (arguments.length === 0) {
      for (key in this._events) {
        if (key === 'removeListener') continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = {};
      return this;
    }

    listeners = this._events[type];

    if (isFunction(listeners)) {
      this.removeListener(type, listeners);
    } else if (listeners) {
      // LIFO order
      while (listeners.length)
        this.removeListener(type, listeners[listeners.length - 1]);
    }
    delete this._events[type];

    return this;
  };

  InteractiveControls.prototype.listeners = function(type) {
    var ret;
    if (!this._events || !this._events[type])
      ret = [];
    else if (isFunction(this._events[type]))
      ret = [this._events[type]];
    else
      ret = this._events[type].slice();
    return ret;
  };

  InteractiveControls.prototype.listenerCount = function(type) {
    if (this._events) {
      var evlistener = this._events[type];

      if (isFunction(evlistener))
        return 1;
      else if (evlistener)
        return evlistener.length;
    }
    return 0;
  };

  InteractiveControls.listenerCount = function(emitter, type) {
    return emitter.listenerCount(type);
  };

  function isFunction(arg) {
    return typeof arg === 'function';
  }

  function isNumber(arg) {
    return typeof arg === 'number';
  }

  function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
  }

  function isUndefined(arg) {
    return arg === void 0;
  }

  InteractiveControls.prototype.enabled = function() {
    return  this._enabled;
  }

  this.camera = camera;
  this.el = el || window;

  this.plane = new THREE.Plane();
  this.raycaster = new THREE.Raycaster();

  this.mouse = new THREE.Vector2();
  this.offset = new THREE.Vector3();
  this.intersection = new THREE.Vector3();
  
  this.objects = [];
  this.hovered = null;
  this.selected = null;

  this.isDown = false;

  this.browser = browser();

  InteractiveControls.prototype.enable = function() {
    if (this.enabled()) return;
    this.addListeners();
    this._enabled = true;
  }

  InteractiveControls.prototype.disable = function() {
    if (!this.enabled()) return;
    this.removeListeners();
    this._enabled = false;
  }

  InteractiveControls.prototype.addListeners = function() {
    this.handlerDown = this.onDown.bind(this);
    this.handlerMove = this.onMove.bind(this);
    this.handlerUp = this.onUp.bind(this);
    this.handlerLeave = this.onLeave.bind(this);

    if (this.browser.mobile) {
      this.el.addEventListener('touchstart', this.handlerDown, passiveEvent);
      this.el.addEventListener('touchmove', this.handlerMove, passiveEvent);
      this.el.addEventListener('touchend', this.handlerUp, passiveEvent);
    }
    else {
      this.el.addEventListener('mousedown', this.handlerDown);
      this.el.addEventListener('mousemove', this.handlerMove);
      this.el.addEventListener('mouseup', this.handlerUp);
      this.el.addEventListener('mouseleave', this.handlerLeave);
    }
  }

  InteractiveControls.prototype.removeListeners = function() {
    if (this.browser.mobile) {
      this.el.removeEventListener('touchstart', this.handlerDown);
      this.el.removeEventListener('touchmove', this.handlerMove);
      this.el.removeEventListener('touchend', this.handlerUp);
    }
    else {
      this.el.removeEventListener('mousedown', this.handlerDown);
      this.el.removeEventListener('mousemove', this.handlerMove);
      this.el.removeEventListener('mouseup', this.handlerUp);
      this.el.removeEventListener('mouseleave', this.handlerLeave);
    }
  }

  InteractiveControls.prototype.resize = function(x, y, width, height) {
    if (x || y || width || height) {
      this.rect = { x, y, width, height };
    }
    else if (this.el === window) {
      this.rect = { x: 0, y: 0, width: window.innerWidth, height: document.getElementById('production-mainview').clientHeight };
    }
    else {
      this.rect = this.el.getBoundingClientRect();
    }
  }

  InteractiveControls.prototype.onMove = function(e) {
    var t = (e.touches) ? e.touches[0] : e;
    var touch = { x: t.clientX, y: t.clientY };

    this.mouse.x = ((touch.x + this.rect.x) / this.rect.width) * 2 - 1;
    this.mouse.y = -((touch.y + this.rect.y) / this.rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    /*
    // is dragging
    if (this.selected && this.isDown) {
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.emit('interactive-drag', { object: this.selected, position: this.intersection.sub(this.offset) });
      }
      return;
    }
    */

    var intersects = this.raycaster.intersectObjects(this.objects);

    if (intersects.length > 0) {
      var object = intersects[0].object;
      this.intersectionData = intersects[0];

      this.plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.plane.normal), object.position);

      if (this.hovered !== object) {
        this.emit('interactive-out', { object: this.hovered });
        this.emit('interactive-over', { object });
        this.hovered = object;
      }
      else {
        this.emit('interactive-move', { object, intersectionData: this.intersectionData });
      }
    }
    else {
      this.intersectionData = null;

      if (this.hovered !== null) {
        this.emit('interactive-out', { object: this.hovered });
        this.hovered = null;
      }
    }
  }

  InteractiveControls.prototype.onDown = function(e) {
    this.isDown = true;
    this.onMove(e);

    this.emit('interactive-down', { object: this.hovered, previous: this.selected, intersectionData: this.intersectionData });
    this.selected = this.hovered;

    if (this.selected) {
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.offset.copy(this.intersection).sub(this.selected.position);
      }
    }
  }

  InteractiveControls.prototype.onUp = function(e) {
    this.isDown = false;

    this.emit('interactive-up', { object: this.hovered });
  }

  InteractiveControls.prototype.onLeave = function(e) {
    this.onUp(e);
    
    this.emit('interactive-out', { object: this.hovered });
    this.hovered = null;
  }


  this.enable();
}

var ParticlesProd = function(webgl) {
  
  this.webgl = webgl;
  this.container = new THREE.Object3D();

  ParticlesProd.prototype.init = function(src) {
    var loader = new THREE.TextureLoader();
    var t = this;

    loader.load(src, function(texture) {
      t.texture = texture;
      t.texture.minFilter = THREE.LinearFilter;
      t.texture.magFilter = THREE.LinearFilter;
      t.texture.format = THREE.RGBFormat;

      t.width = texture.image.width;
      t.height = texture.image.height;

      t.initPoints(true);
      t.initHitArea();
      t.initTouch();
      t.resize();
      t.show();
    });
  }

  ParticlesProd.prototype.initPoints = function(discard) {
    this.numPoints = this.width * this.height;

    var numVisible = this.numPoints;
    var threshold = 0;
    var originalColors;

    if (discard) {
      // discard pixels darker than threshold #22
      numVisible = 0;
      threshold = 72;

      var img = this.texture.image;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      canvas.width = this.width;
      canvas.height = this.height;
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0, this.width, this.height * -1);

      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      originalColors = Float32Array.from(imgData.data);
      console.log(originalColors)
      for (var i = 0; i < this.numPoints; i++) {
        if (originalColors[i * 4 + 0] > threshold) numVisible++;
      }

      // console.log('numVisible', numVisible, this.numPoints);
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
      // blending: THREE.AdditiveBlending
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

    for (let i = 0, j = 0; i < this.numPoints; i++) {
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
    this.container.add(this.object3D);
  }

  ParticlesProd.prototype.initTouch = function() {
    // create only once
    if (!this.touch) this.touch = new TouchTextureProd(this);
    this.object3D.material.uniforms.uTouch.value = this.touch.texture;
  }

  ParticlesProd.prototype.initHitArea = function() {
    var geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, depthTest: false });
    material.visible = false;
    this.hitArea = new THREE.Mesh(geometry, material);
    this.container.add(this.hitArea);
  }

  ParticlesProd.prototype.addListeners = function() {
    this.handlerInteractiveMove = this.onInteractiveMove.bind(this);

    this.webgl.interactive.addListener('interactive-move', this.handlerInteractiveMove);
    this.webgl.interactive.objects.push(this.hitArea);
    this.webgl.interactive.enable();
  }

  ParticlesProd.prototype.removeListeners = function() {
    this.webgl.interactive.removeListener('interactive-move', this.handlerInteractiveMove);
    
    var index = this.webgl.interactive.objects.findIndex(obj => obj === this.hitArea);
    this.webgl.interactive.objects.splice(index, 1);
    this.webgl.interactive.disable();
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  ParticlesProd.prototype.update = function(delta) {
    if (!this.object3D) return;
    if (this.touch) this.touch.update();

    this.object3D.material.uniforms.uTime.value += delta;
  }

  ParticlesProd.prototype.show = function(time) {
    if (!time)
      time = 1.0
    // reset
    TweenLite.fromTo(this.object3D.material.uniforms.uSize, time, { value: 0.2 }, { value: 1 });
    TweenLite.to(this.object3D.material.uniforms.uRandom, time, { value: 2.0 });
    TweenLite.fromTo(this.object3D.material.uniforms.uDepth, time * 1.5, { value: 80.0 }, { value: 4.0 });

    this.addListeners();
  }

  ParticlesProd.prototype.hide = function(_destroy, time) {
    if(!time)
      time = 0.8
    return new Promise((resolve, reject) => {
      TweenLite.to(this.object3D.material.uniforms.uRandom, time, { value: 5.0, onComplete: () => {
        if (_destroy) this.destroy();
        resolve();
      } });
      TweenLite.to(this.object3D.material.uniforms.uDepth, time, { value: -20.0, ease: Quad.easeIn });
      TweenLite.to(this.object3D.material.uniforms.uSize, time * 0.8, { value: 0.0 });

      this.removeListeners();
    });
  }

  ParticlesProd.prototype.destroy = function() {
    if (!this.object3D) return;

    this.object3D.parent.remove(this.object3D);
    this.object3D.geometry.dispose();
    this.object3D.material.dispose();
    this.object3D = null;

    if (!this.hitArea) return;

    this.hitArea.parent.remove(this.hitArea);
    this.hitArea.geometry.dispose();
    this.hitArea.material.dispose();
    this.hitArea = null;
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  ParticlesProd.prototype.resize = function() {
    if (!this.object3D) return;

    var scale = this.webgl.fovHeight / this.height;
    this.object3D.scale.set(scale, scale, 1);
    this.hitArea.scale.set(scale, scale, 1);
  }

  ParticlesProd.prototype.onInteractiveMove = function(e) {
    var uv = e.intersectionData.uv;
    if (this.touch) this.touch.addTouch(uv);
  }
}

var TouchTextureProd = function(parent) {

  this.parent = parent;
  this.size = 60;
  this.maxAge = 120; //120
  this.radius = 0.3;
  this.trail = [];

  TouchTextureProd.prototype.initTexture = function() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = this.size;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.texture = new THREE.Texture(this.canvas);

    this.canvas.id = 'touchTexture';
    this.canvas.style.width = this.canvas.style.height = `${this.canvas.width}px`;
  }

  TouchTextureProd.prototype.update = function(delta) {
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

  TouchTextureProd.prototype.clear = function() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  TouchTextureProd.prototype.addTouch = function(point) {
    var force = 0;
    var last = this.trail[this.trail.length - 1];
    if (last) {
      var dx = last.x - point.x;
      var dy = last.y - point.y;
      var dd = dx * dx + dy * dy;
      force = Math.min(dd * 25000, 1); //10000
    }
    this.trail.push({ x: point.x, y: point.y, age: 0, force });
  }

  /*easeInQuad
easeOutQuad 
easeInOutQuad
easeInOutQuart
easeInSine
easeOutSine
easeInOutSine*/

  TouchTextureProd.prototype.drawTouch = function(point) {
    var pos = {
      x: point.x * this.size,
      y: (1 - point.y) * this.size
    };

    var intensity = 1;
    if (point.age < this.maxAge * 0.3) {
      intensity = easeInQuad(point.age / (this.maxAge * 0.3), 0, 1, 1);
    } else {
      intensity = easeInQuad(1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7), 0, 1, 1);
    }

    intensity *= point.force;

    var radius = this.size  * this.radius * intensity;
    var grd = this.ctx.createRadialGradient(pos.x, pos.y, radius * 0.05, pos.x, pos.y, radius);
    grd.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
    grd.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    this.ctx.beginPath();
    this.ctx.fillStyle = grd;
    this.ctx.arc(pos.x, pos.y, radius, -1, Math.PI * 2);
    this.ctx.fill();

  }


  this.initTexture();
}

var ProductionView = function (container) {

  this.samples = [
    'img/sample-bg13.jpg',
  ];

  var rnd = ~~(Math.random() * this.samples.length);

  ProductionView.prototype.initThree = function() {
    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 300;

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // clock
    this.clock = new THREE.Clock(true);
  }

  ProductionView.prototype.initControls = function() {
    this.interactive = new InteractiveControls(this.camera, this.renderer.domElement);
  }

  ProductionView.prototype.initParticles = function() {
    this.particles = new ParticlesProd(this);
    this.scene.add(this.particles.container);
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  ProductionView.prototype.update = function() {
    var delta = this.clock.getDelta();

    if (this.particles) this.particles.update(delta);
  }

  ProductionView.prototype.draw = function() {
    this.renderer.render(this.scene, this.camera);
  }

  ProductionView.prototype.goto = function(index) {
    // init next
    if (this.currSample == null) this.particles.init(this.samples[index]);
    // hide curr then init next
    else {
      this.particles.hide(true).then(() => {
        this.particles.init(this.samples[index]);
      });
    }

    this.currSample = index;
  }

  ProductionView.prototype.next = function() {
    if (this.currSample < this.samples.length - 1) this.goto(this.currSample + 1);
    else this.goto(0);
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  ProductionView.prototype.resize = function() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.fovHeight = 2 * Math.tan((this.camera.fov * Math.PI) / 180 / 2) * this.camera.position.z;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.interactive) this.interactive.resize();
    if (this.particles) this.particles.resize();
  }

  this.initThree();
  this.initParticles();
  this.initControls();
  this.goto(rnd);
}