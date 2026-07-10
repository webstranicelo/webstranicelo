/**

 * webstranicelo — Scroll-driven 3D web studio

 * Three.js (browser frames, neon ring, tunnel) + GSAP + parallax bg

 */

(function () {

  "use strict";



  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = function () { return window.innerWidth < 768; };



  var SCENES = ["Početak", "O meni", "Usluge", "Proces", "Radovi", "Kontakt"];



  var CAM_KEYFRAMES = [

    { p: 0.00, x: 0,    y: 1.5,  z: 18,   lookX: 0,   lookY: 0,   lookZ: -4,  fov: 50, roll: 0 },

    { p: 0.15, x: -4,   y: 1,    z: 12,   lookX: -1,  lookY: 0,   lookZ: -8,  fov: 55, roll: 0.08 },

    { p: 0.30, x: 3,    y: 0.5,  z: 6,    lookX: 1,   lookY: 0.2, lookZ: -14, fov: 60, roll: -0.06 },

    { p: 0.50, x: 0,    y: 0,    z: 0,    lookX: 0,   lookY: 0,   lookZ: -20, fov: 65, roll: 0 },

    { p: 0.70, x: -2,   y: 0.8,  z: -8,   lookX: 0,   lookY: 0.5, lookZ: -28, fov: 62, roll: 0.1 },

    { p: 0.85, x: 2,    y: 1.2,  z: -14,  lookX: 0,   lookY: 0,   lookZ: -36, fov: 58, roll: -0.08 },

    { p: 1.00, x: 0,    y: 1.8,  z: -22,  lookX: 0,   lookY: 0,   lookZ: -45, fov: 52, roll: 0 },

  ];



  var s3d = { progress: 0, camX: 0, camY: 1.5, camZ: 18, lookX: 0, lookY: 0, lookZ: -4, fov: 50, roll: 0 };
  var smoothCam = { x: 0, y: 1.5, z: 18, lx: 0, ly: 0, lz: -4, fov: 50, roll: 0 };

  var mouse = { x: 0, y: 0, tx: 0, ty: 0, cx: innerWidth / 2, cy: innerHeight / 2 };



  var els = {

    nav: document.querySelector(".nav"),

    navToggle: document.querySelector(".nav__toggle"),

    navMenu: document.getElementById("navMenu"),

    scrollFill: document.getElementById("scrollFill"),

    scrollTopFill: document.getElementById("scrollTopFill"),

    sceneLabel: document.getElementById("sceneLabel"),

    scrollWorld: document.getElementById("scrollWorld"),

    bgWebTrack: document.getElementById("bgWebTrack"),
    bgWebTrackFront: document.getElementById("bgWebTrackFront"),
    bgAurora: document.getElementById("bgAurora"),
    canvas: document.getElementById("webgl-canvas"),

    loader: document.getElementById("loader"),

    cursorGlow: document.querySelector(".cursor-glow"),

    sections: Array.prototype.slice.call(document.querySelectorAll(".section")),

    sectionInners: Array.prototype.slice.call(document.querySelectorAll(".section__inner")),

    heroCenter: document.querySelector(".hero-center"),

  };



  var webgl = null;



  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function lerp(a, b, t) { return a + (b - a) * t; }



  function maxScroll() {

    return Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);

  }



  function getProgress() {

    return clamp(window.scrollY / maxScroll(), 0, 1);

  }



  function sampleCam(p) {

    var k = CAM_KEYFRAMES;

    for (var i = 0; i < k.length - 1; i++) {

      if (p >= k[i].p && p <= k[i + 1].p) {

        var t = (p - k[i].p) / (k[i + 1].p - k[i].p);

        var a = k[i], b = k[i + 1];

        s3d.camX = lerp(a.x, b.x, t);

        s3d.camY = lerp(a.y, b.y, t);

        s3d.camZ = lerp(a.z, b.z, t);

        s3d.lookX = lerp(a.lookX, b.lookX, t);

        s3d.lookY = lerp(a.lookY, b.lookY, t);

        s3d.lookZ = lerp(a.lookZ, b.lookZ, t);

        s3d.fov = lerp(a.fov, b.fov, t);

        s3d.roll = lerp(a.roll, b.roll, t);

        return;

      }

    }

  }



  function getSceneIndex(p) {

    return clamp(Math.floor(p * (SCENES.length - 1) + 0.001), 0, SCENES.length - 1);

  }



  function initNav() {

    if (els.navToggle && els.navMenu) {

      els.navToggle.addEventListener("click", function () {

        var open = els.navToggle.getAttribute("aria-expanded") === "true";

        els.navToggle.setAttribute("aria-expanded", open ? "false" : "true");

        els.navMenu.classList.toggle("is-open", !open);

      });

    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {

      a.addEventListener("click", function (e) {

        var id = (a.getAttribute("href") || "").slice(1);

        var el = id && document.getElementById(id);

        if (!el) return;

        e.preventDefault();

        var nh = els.nav ? els.nav.offsetHeight : 0;

        window.scrollTo({ top: el.offsetTop - nh, behavior: reduced ? "auto" : "smooth" });

        if (els.navMenu) els.navMenu.classList.remove("is-open");

      });

    });

  }



  function initTilt() {

    if (reduced || isMobile()) return;

    document.querySelectorAll(".glass-card, .service-card, .work-card, .reveal-card").forEach(function (card) {

      card.addEventListener("mousemove", function (e) {

        var r = card.getBoundingClientRect();

        var px = (e.clientX - r.left) / r.width - 0.5;

        var py = (e.clientY - r.top) / r.height - 0.5;

        card.style.transform = "perspective(800px) rotateY(" + (px * 12).toFixed(1) + "deg) rotateX(" + (-py * 12).toFixed(1) + "deg) translateZ(12px)";

      });

      card.addEventListener("mouseleave", function () {

        card.style.transform = "";

      });

    });

  }



  function updateUI(p) {

    document.documentElement.style.setProperty("--scroll", String(p));

    if (els.scrollFill) els.scrollFill.style.transform = "scaleY(" + p + ")";

    if (els.scrollTopFill) els.scrollTopFill.style.transform = "scaleX(" + p + ")";

    if (els.sceneLabel) els.sceneLabel.textContent = SCENES[getSceneIndex(p)];

    if (els.nav) els.nav.classList.toggle("is-scrolled", scrollY > 40);

  }



  function updateBackground(p) {
    if (reduced || !els.bgWebTrack) return;
    var mx = mouse.x * 8;
    var my = mouse.y * 5;
    var tx = (p - 0.5) * -38 + mx;
    var ty = p * -28 + my * 0.6;
    var sc = 1 + p * 0.75;
    var rx = p * 10 + my * 2.5;
    var ry = (p - 0.5) * 28 + mx * 2.5;
    var tz = p * 280;

    els.bgWebTrack.style.transform =
      "translate3d(" + tx.toFixed(1) + "vw, " + ty.toFixed(1) + "vh, " + tz.toFixed(0) + "px) " +
      "scale(" + sc.toFixed(3) + ") rotateX(" + rx.toFixed(1) + "deg) rotateY(" + ry.toFixed(1) + "deg)";

    if (els.bgWebTrackFront) {
      els.bgWebTrackFront.style.transform =
        "translate3d(" + (tx * 0.6).toFixed(1) + "vw, " + (ty * 0.5).toFixed(1) + "vh, " + (tz * 0.5).toFixed(0) + "px) " +
        "scale(" + (sc * 1.05).toFixed(3) + ") rotateX(" + (rx * 0.5).toFixed(1) + "deg) rotateY(" + (ry * 0.5).toFixed(1) + "deg)";
    }

    if (els.bgAurora) {
      els.bgAurora.style.transform =
        "translate3d(" + (mx * 2).toFixed(1) + "vw, " + (my * 1.5).toFixed(1) + "vh, 0) scale(" + (1 + p * 0.15).toFixed(3) + ")";
      els.bgAurora.style.opacity = String(0.55 + p * 0.25);
    }
  }



  function updateSections3D() {

    if (reduced) return;

    var vh = innerHeight;



    els.sections.forEach(function (sec) {

      var rect = sec.getBoundingClientRect();

      var center = rect.top + rect.height * 0.5;

      var dist = (center - vh * 0.5) / vh;

      var focus = clamp(1 - Math.abs(dist) * 1.2, 0, 1);

      var inner = sec.querySelector(".section__inner") || sec.querySelector(".hero-center");



      if (sec.classList.contains("section--hero")) {

        if (els.heroCenter) {

          var hp = s3d.progress;

          els.heroCenter.style.transform =

            "perspective(1200px) translateZ(" + (50 - hp * 100).toFixed(0) + "px) " +

            "rotateX(" + (mouse.y * 3).toFixed(1) + "deg) rotateY(" + (mouse.x * 3).toFixed(1) + "deg) " +

            "scale(" + lerp(0.92, 1, focus).toFixed(3) + ")";

          els.heroCenter.style.opacity = String(lerp(0.4, 1, focus));

        }

        return;

      }



      if (!inner) return;

      var rotX = dist * 35;

      var transZ = focus * 80 - 40;

      var scale = lerp(0.75, 1, focus);

      var opacity = lerp(0.15, 1, focus);

      inner.style.transform =

        "perspective(1400px) translateZ(" + transZ.toFixed(0) + "px) " +

        "translateY(" + (dist * 50).toFixed(0) + "px) " +

        "rotateX(" + rotX.toFixed(1) + "deg) " +

        "rotateY(" + (mouse.x * 2).toFixed(1) + "deg) " +

        "scale(" + scale.toFixed(3) + ")";

      inner.style.opacity = String(opacity);

    });



    if (els.scrollWorld) {

      els.scrollWorld.style.transform =

        "translate3d(" + (mouse.x * 8).toFixed(1) + "px, " + (s3d.progress * -40).toFixed(0) + "px, " + (s3d.progress * -120).toFixed(0) + "px) " +

        "rotateX(" + (mouse.y * 2).toFixed(1) + "deg) rotateY(" + (mouse.x * 2).toFixed(1) + "deg)";

    }

  }



  function onScroll() {

    var p = getProgress();

    s3d.progress = p;

    sampleCam(p);

    updateUI(p);

    updateBackground(p);

    updateSections3D();

  }



  /* ─── Draw mini website on canvas texture ─── */

  function makeBrowserTexture(title, accent) {

    var c = document.createElement("canvas");

    c.width = 512;

    c.height = 320;

    var ctx = c.getContext("2d");



    ctx.fillStyle = "#0f0f18";

    ctx.fillRect(0, 0, 512, 320);



    ctx.fillStyle = "#1a1a28";

    ctx.fillRect(0, 0, 512, 36);

    [["#ff5f57", 16], ["#febc2e", 36], ["#28c840", 56]].forEach(function (d) {

      ctx.beginPath();

      ctx.arc(d[1], 18, 6, 0, Math.PI * 2);

      ctx.fillStyle = d[0];

      ctx.fill();

    });

    ctx.fillStyle = "#0a0a12";

    roundRect(ctx, 80, 10, 200, 16, 4);

    ctx.fill();



    var g = ctx.createLinearGradient(0, 50, 512, 120);

    g.addColorStop(0, accent);

    g.addColorStop(1, "#a855f7");

    ctx.fillStyle = g;

    ctx.globalAlpha = 0.5;

    roundRect(ctx, 16, 50, 480, 70, 6);

    ctx.fill();

    ctx.globalAlpha = 1;



    ctx.fillStyle = "rgba(255,255,255,0.7)";

    ctx.font = "bold 22px Inter, sans-serif";

    ctx.fillText(title, 28, 88);



    ctx.fillStyle = "rgba(255,255,255,0.25)";

    ctx.font = "13px Inter, sans-serif";

    ctx.fillText("Hero sekcija • CTA • Responsive layout", 28, 140);

    ctx.fillText("Custom dizajn • Brzo učitavanje • 3D efekti", 28, 162);



    ctx.fillStyle = accent;

    roundRect(ctx, 28, 190, 110, 36, 8);

    ctx.fill();

    ctx.fillStyle = "#fff";

    ctx.font = "bold 13px Inter, sans-serif";

    ctx.fillText("Pogledaj", 48, 213);



    [[28, 250, 140, 50], [180, 250, 140, 50], [332, 250, 140, 50]].forEach(function (b) {

      ctx.fillStyle = "rgba(255,255,255,0.06)";

      roundRect(ctx, b[0], b[1], b[2], b[3], 6);

      ctx.fill();

    });



    var tex = new THREE.CanvasTexture(c);

    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;

    return tex;

  }



  function roundRect(ctx, x, y, w, h, r) {

    ctx.beginPath();

    ctx.moveTo(x + r, y);

    ctx.lineTo(x + w - r, y);

    ctx.quadraticCurveTo(x + w, y, x + w, y + r);

    ctx.lineTo(x + w, y + h - r);

    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

    ctx.lineTo(x + r, y + h);

    ctx.quadraticCurveTo(x, y + h, x, y + h - r);

    ctx.lineTo(x, y + r);

    ctx.quadraticCurveTo(x, y, x + r, y);

    ctx.closePath();

  }



  function createBrowser(w, h, tex, accent) {

    var group = new THREE.Group();

    var frame = new THREE.Mesh(

      new THREE.BoxGeometry(w, h, 0.12),

      new THREE.MeshStandardMaterial({ color: 0x14141f, metalness: 0.85, roughness: 0.15, emissive: accent, emissiveIntensity: 0.05 })

    );

    group.add(frame);



    var screen = new THREE.Mesh(

      new THREE.PlaneGeometry(w * 0.94, h * 0.88),

      new THREE.MeshBasicMaterial({ map: tex })

    );

    screen.position.z = 0.07;

    group.add(screen);



    var edge = new THREE.Mesh(

      new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.04),

      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending })

    );

    edge.position.z = -0.02;

    group.add(edge);



    return group;

  }



  /* ─── THREE.JS ─── */
  function createRenderer(canvas) {
    var tries = [
      { antialias: false, alpha: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false },
      { antialias: false, alpha: true, powerPreference: "default", failIfMajorPerformanceCaveat: false },
      { antialias: false, alpha: false, powerPreference: "default", failIfMajorPerformanceCaveat: false },
    ];
    for (var i = 0; i < tries.length; i++) {
      try {
        var r = new THREE.WebGLRenderer(Object.assign({ canvas: canvas }, tries[i]));
        if (r.getContext && r.getContext()) return r;
        r.dispose();
      } catch (err) {
        console.warn("WebGL pokušaj " + (i + 1) + " nije uspeo.", err);
      }
    }
    return null;
  }

  function initThree() {
    if (!els.canvas || typeof THREE === "undefined" || reduced) {
      if (reduced) console.info("3D isključen — uključen je prefers-reduced-motion u sistemu.");
      return null;
    }

    var renderer = createRenderer(els.canvas);
    if (!renderer) {
      console.warn("WebGL renderer nije mogao da se pokrene na ovom uređaju.");
      document.body.classList.add("no-webgl");
      return null;
    }

    document.body.classList.add("has-webgl");

    var dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;



    var scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.014);



    var camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 300);



    scene.add(new THREE.AmbientLight(0x6060a0, 0.5));

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);

    dirLight.position.set(5, 12, 10);

    scene.add(dirLight);



    var pLight = new THREE.PointLight(0x6366f1, 4, 50);

    pLight.position.set(-5, 4, 5);

    scene.add(pLight);

    var vLight = new THREE.PointLight(0xa855f7, 3, 45);

    vLight.position.set(5, 3, -5);

    scene.add(vLight);



    /* Floor */

    var floor = new THREE.Mesh(

      new THREE.PlaneGeometry(100, 100),

      new THREE.MeshStandardMaterial({ color: 0x0c0c14, metalness: 0.9, roughness: 0.2 })

    );

    floor.rotation.x = -Math.PI / 2;

    floor.position.y = -3;

    scene.add(floor);



    var grid = new THREE.GridHelper(100, 80, 0x6366f1, 0x181828);

    grid.position.y = -2.99;

    var gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];

    gridMats.forEach(function (m) { m.transparent = true; m.opacity = 0.4; });

    scene.add(grid);



    /* Neon ring */

    var ringGroup = new THREE.Group();

    scene.add(ringGroup);

    var torus = new THREE.Mesh(

      new THREE.TorusGeometry(4, 0.14, 32, 128),

      new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 2.5, metalness: 0.9, roughness: 0.08 })

    );

    ringGroup.add(torus);

    ringGroup.add(new THREE.Mesh(

      new THREE.TorusGeometry(4, 0.4, 16, 64),

      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false })

    ));

    var innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.05, 16, 80),
      new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x818cf8, emissiveIntensity: 2, metalness: 0.9, roughness: 0.1 })
    );
    ringGroup.add(innerRing);

    var orbs = [];
    [[-8, 3, -8, 0.5, 0x6366f1], [9, 2, -14, 0.4, 0xa855f7], [0, 5, -20, 0.6, 0x818cf8], [-6, 1, -25, 0.35, 0x6366f1]].forEach(function (o) {
      var orb = new THREE.Mesh(
        new THREE.SphereGeometry(o[3], 24, 24),
        new THREE.MeshStandardMaterial({ color: o[4], emissive: o[4], emissiveIntensity: 1.2, transparent: true, opacity: 0.7 })
      );
      orb.position.set(o[0], o[1], o[2]);
      scene.add(orb);
      orbs.push({ mesh: orb, bx: o[0], by: o[1], bz: o[2] });
    });


    /* 3D Browser windows — website themed */

    var browsers = [];

    var browserDefs = [

      { title: "Landing Page", accent: "#6366f1", pos: [-6, 1, -2],   rot: 0.3,  w: 3.2, h: 2 },

      { title: "Portfolio Site", accent: "#a855f7", pos: [6, 0.5, -6],  rot: -0.4, w: 2.8, h: 1.75 },

      { title: "Biznis Sajt", accent: "#818cf8", pos: [-4, 2, -12],  rot: 0.5,  w: 2.6, h: 1.6 },

      { title: "E-commerce", accent: "#6366f1", pos: [5, 1.5, -16], rot: -0.3, w: 2.4, h: 1.5 },

      { title: "Web Studio", accent: "#a855f7", pos: [0, 3, -22],    rot: 0,    w: 3,   h: 1.85 },

      { title: "Mobile App", accent: "#818cf8", pos: [-7, 0, -28],   rot: 0.6,  w: 2.2, h: 1.4 },

    ];

    browserDefs.forEach(function (d) {

      var tex = makeBrowserTexture(d.title, d.accent);

      var col = parseInt(d.accent.replace("#", "0x"));

      var b = createBrowser(d.w, d.h, tex, col);

      b.position.set(d.pos[0], d.pos[1], d.pos[2]);

      b.rotation.y = d.rot;

      scene.add(b);

      browsers.push({ mesh: b, base: d, accent: col });

    });



    /* Code brackets floating */

    var brackets = [];

    ["< / >", "{ }", "HTML"].forEach(function (txt, i) {

      var c = document.createElement("canvas");

      c.width = 256; c.height = 128;

      var ctx = c.getContext("2d");

      ctx.fillStyle = "rgba(99,102,241,0.15)";

      ctx.font = "bold 48px monospace";

      ctx.fillText(txt, 20, 80);

      var tex = new THREE.CanvasTexture(c);

      var plane = new THREE.Mesh(

        new THREE.PlaneGeometry(2, 1),

        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })

      );

      plane.position.set((i - 1) * 8, 4 + i, -10 - i * 6);

      scene.add(plane);

      brackets.push(plane);

    });



    /* Tunnel */

    var tunnelGrids = [];

    for (var g = 0; g < 10; g++) {

      var tg = new THREE.GridHelper(70, 35, 0x6366f1, 0x151525);

      tg.rotation.x = Math.PI / 2;

      tg.position.z = -g * 10 - 8;

      var tm = Array.isArray(tg.material) ? tg.material : [tg.material];

      tm.forEach(function (m) { m.transparent = true; m.opacity = 0.2; });

      scene.add(tg);

      tunnelGrids.push(tg);

    }



    /* Particles */

    var pN = isMobile() ? 800 : 1200;

    var pPos = new Float32Array(pN * 3);

    for (var i = 0; i < pN * 3; i++) pPos[i] = (Math.random() - 0.5) * 70;

    var particles = new THREE.Points(

      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pPos, 3)),

      new THREE.PointsMaterial({ color: 0x818cf8, size: 0.07, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })

    );

    scene.add(particles);

    /* Star layer */
    var sN = isMobile() ? 400 : 600;
    var sPos = new Float32Array(sN * 3);
    for (var si = 0; si < sN * 3; si++) sPos[si] = (Math.random() - 0.5) * 90;
    var stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(sPos, 3)),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    scene.add(stars);



    var look = new THREE.Vector3();

    var t0 = performance.now();



    function resize() {

      camera.aspect = innerWidth / innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(innerWidth, innerHeight);

    }

    window.addEventListener("resize", resize, { passive: true });

    els.canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      console.warn("WebGL kontekst izgubljen — osveži stranicu (F5).");
    }, false);

    function render() {

      var time = (performance.now() - t0) * 0.001;

      var p = s3d.progress;

      var mx = mouse.x, my = mouse.y;



      camera.fov = smoothCam.fov;
      camera.updateProjectionMatrix();
      camera.position.set(smoothCam.x + mx * 1.2, smoothCam.y - my * 0.8, smoothCam.z);
      look.set(smoothCam.lx + mx * 0.4, smoothCam.ly - my * 0.3, smoothCam.lz);
      camera.lookAt(look);
      camera.rotation.z = smoothCam.roll + mx * 0.03;

      ringGroup.position.set(0, 0.8 + Math.sin(time * 0.5) * 0.25, -3 - p * 10);
      ringGroup.rotation.x = Math.sin(time * 0.3) * 0.18 + p * 1.4;
      ringGroup.rotation.y = time * 0.25 + p * Math.PI * 3.5;
      ringGroup.scale.setScalar(1 + p * 0.6);
      innerRing.rotation.z = -time * 0.4;
      torus.material.emissiveIntensity = 2 + Math.sin(time * 1.8) * 0.6;

      orbs.forEach(function (o, i) {
        o.mesh.position.y = o.by + Math.sin(time * 0.5 + i) * 0.4;
        o.mesh.position.z = o.bz - p * (10 + i * 4);
        o.mesh.scale.setScalar(0.8 + Math.sin(time + i) * 0.15);
      });



      browsers.forEach(function (b, idx) {

        var m = b.mesh;

        var base = b.base;

        m.position.y = base.pos[1] + Math.sin(time * 0.4 + idx) * 0.25;

        m.position.z = base.pos[2] - p * (12 + idx * 3);

        m.rotation.y = base.rot + Math.sin(time * 0.3 + idx) * 0.15 + p * 0.5;

        m.rotation.x = Math.sin(time * 0.2 + idx) * 0.08;

        var dist = Math.abs(m.position.z - s3d.camZ);

        m.scale.setScalar(clamp(1.2 - dist * 0.02, 0.4, 1.3));

      });



      brackets.forEach(function (b, i) {

        b.position.z = -10 - i * 6 - p * 20;

        b.rotation.y = time * 0.1 + i;

        b.material.opacity = 0.2 + Math.sin(time + i) * 0.1;

      });



      tunnelGrids.forEach(function (tg, idx) {

        tg.position.z = ((p * 50 + time * 3 + idx * 10) % 90) - 60;

      });



      particles.rotation.y = time * 0.03 + p * 0.8;
      particles.position.z = -p * 25;
      stars.rotation.y = -time * 0.02;
      stars.position.z = -p * 18;
      stars.material.opacity = 0.35 + p * 0.25;



      pLight.position.z = 5 - p * 15;

      vLight.position.z = -5 - p * 20;



      scene.fog.density = 0.01 + p * 0.015;

      gridMats.forEach(function (m) { m.opacity = 0.3 + p * 0.2; });



      renderer.render(scene, camera);

      requestAnimationFrame(render);

    }



    render();

    return { resize: resize };

  }



  function initGSAP() {

    if (reduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);



    gsap.utils.toArray(".reveal-card").forEach(function (el, i) {

      gsap.fromTo(el,

        { y: 80, opacity: 0, rotateX: 15, z: -100 },

        {

          y: 0, opacity: 1, rotateX: 0, z: 0,

          duration: 1,

          ease: "power3.out",

          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },

          delay: (i % 4) * 0.1,

        }

      );

    });



    ScrollTrigger.refresh();

  }



  function boot() {

    if (els.loader) els.loader.classList.add("is-hidden");

    document.body.classList.add("is-ready");

    var year = document.getElementById("year");

    if (year) year.textContent = new Date().getFullYear();



    initNav();

    initTilt();

    webgl = initThree();

    initGSAP();



    (function loop() {

      mouse.x += (mouse.tx - mouse.x) * 0.08;

      mouse.y += (mouse.ty - mouse.y) * 0.08;

      var p = getProgress();
      s3d.progress = p;
      sampleCam(p);

      var ce = 0.1;
      smoothCam.x += (s3d.camX - smoothCam.x) * ce;
      smoothCam.y += (s3d.camY - smoothCam.y) * ce;
      smoothCam.z += (s3d.camZ - smoothCam.z) * ce;
      smoothCam.lx += (s3d.lookX - smoothCam.lx) * ce;
      smoothCam.ly += (s3d.lookY - smoothCam.ly) * ce;
      smoothCam.lz += (s3d.lookZ - smoothCam.lz) * ce;
      smoothCam.fov += (s3d.fov - smoothCam.fov) * ce;
      smoothCam.roll += (s3d.roll - smoothCam.roll) * ce;

      updateUI(p);

      updateBackground(p);

      updateSections3D();



      if (els.cursorGlow) {

        els.cursorGlow.style.left = mouse.cx + "px";

        els.cursorGlow.style.top = mouse.cy + "px";

      }

      requestAnimationFrame(loop);

    })();



    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("resize", function () {
      if (webgl) webgl.resize();
      onScroll();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    }, { passive: true });

    if (!webgl && !reduced) {
      setTimeout(function () {
        if (!webgl) webgl = initThree();
      }, 500);
    }

    window.addEventListener("mousemove", function (e) {

      mouse.tx = (e.clientX / innerWidth - 0.5) * 2;

      mouse.ty = (e.clientY / innerHeight - 0.5) * 2;

      mouse.cx = e.clientX;

      mouse.cy = e.clientY;

    }, { passive: true });



    onScroll();

  }



  if (document.readyState === "complete") boot();

  else window.addEventListener("load", boot);

})();


