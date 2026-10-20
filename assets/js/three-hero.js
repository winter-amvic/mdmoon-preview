/* ==========================================================================
   three.js hero — slow drifting particle field + soft depth haze
   Loads three r150 UMD; silently degrades to the CSS gradient if unavailable.
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.THREE) return;

  var THREE = window.THREE;
  var parent = canvas.parentElement;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
  } catch (e) {
    return; // no WebGL -> keep CSS gradient
  }

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06121a, 0.055);

  var camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  camera.position.set(0, 0, 16);

  /* ---- particles ------------------------------------------------------- */
  var COUNT = window.innerWidth < 760 ? 900 : 2000;
  var positions = new Float32Array(COUNT * 3);
  var colors = new Float32Array(COUNT * 3);
  var seeds = new Float32Array(COUNT);
  var gold = new THREE.Color(0xd3b168);
  var ivory = new THREE.Color(0xe8e2d4);
  var teal = new THREE.Color(0x2f6f86);

  for (var i = 0; i < COUNT; i++) {
    var r = 6 + Math.random() * 22;
    var theta = Math.random() * Math.PI * 2;
    var y = (Math.random() - 0.5) * 26;
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r * 0.55 - 6;

    var pick = Math.random();
    var c = pick > 0.82 ? gold : pick > 0.55 ? ivory : teal;
    var k = 0.5 + Math.random() * 0.5;
    colors[i * 3] = c.r * k;
    colors[i * 3 + 1] = c.g * k;
    colors[i * 3 + 2] = c.b * k;

    seeds[i] = Math.random() * Math.PI * 2;
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  var mat = new THREE.PointsMaterial({
    size: 0.075,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  var points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ---- thin light rings for depth -------------------------------------- */
  var rings = [];
  for (var r2 = 0; r2 < 3; r2++) {
    var ringGeo = new THREE.RingGeometry(7 + r2 * 4.4, 7.06 + r2 * 4.4, 128);
    var ringMat = new THREE.MeshBasicMaterial({
      color: r2 === 1 ? 0xa9822c : 0x3d7c92,
      transparent: true,
      opacity: 0.14 - r2 * 0.03,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.42 + r2 * 0.12;
    ring.rotation.z = r2 * 0.6;
    ring.position.z = -3 - r2 * 2;
    scene.add(ring);
    rings.push(ring);
  }

  /* ---- interaction ----------------------------------------------------- */
  var pointer = { x: 0, y: 0 };
  var eased = { x: 0, y: 0 };

  parent.addEventListener("pointermove", function (e) {
    var rect = parent.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
    pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
  });

  parent.addEventListener("pointerleave", function () {
    pointer.x = 0;
    pointer.y = 0;
  });

  /* ---- resize ---------------------------------------------------------- */
  function resize() {
    var w = parent.clientWidth;
    var h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(parent);
  } else {
    window.addEventListener("resize", resize);
  }

  /* ---- loop ------------------------------------------------------------ */
  var clock = new THREE.Clock();
  var running = true;

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(parent);
  }

  function frame() {
    requestAnimationFrame(frame);
    if (!running) return;

    var t = clock.getElapsedTime();

    eased.x += (pointer.x - eased.x) * 0.045;
    eased.y += (pointer.y - eased.y) * 0.045;

    points.rotation.y = t * 0.026 + eased.x * 0.42;
    points.rotation.x = Math.sin(t * 0.16) * 0.05 + eased.y * 0.22;

    var pos = geo.attributes.position.array;
    for (var i = 0; i < COUNT; i++) {
      var s = seeds[i];
      pos[i * 3 + 1] += Math.sin(t * 0.35 + s) * 0.0016;
    }
    geo.attributes.position.needsUpdate = true;

    rings.forEach(function (ring, idx) {
      ring.rotation.z += 0.0009 * (idx + 1);
      ring.position.y = Math.sin(t * 0.2 + idx) * 0.5;
    });

    camera.position.x = eased.x * 1.5;
    camera.position.y = -eased.y * 1.1;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  frame();
})();
