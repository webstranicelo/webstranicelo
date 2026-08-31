/**

 * webstranicelo — Scroll-driven 3D web studio

 * Three.js worlds per section + GSAP + scroll-driven mock backgrounds

 */

(function () {

  "use strict";



  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = function () { return window.innerWidth < 768; };



  var SCENES = ["Početak", "O meni", "Usluge", "Proces", "Radovi", "Kontakt"];

  function syncScenes() {
    if (window.I18N && typeof window.I18N.scenes === "function") {
      SCENES = window.I18N.scenes();
    }
    if (els.sceneLabel) els.sceneLabel.textContent = SCENES[getSceneIndex()];
  }



  var SCENE_ORDER = ["top", "about", "services", "process", "work", "contact"];

  var SCENE_CAM = {
    top:      { x: 0,    y: 1.8, z: 14,   lookX: 0,    lookY: 0.4, lookZ: -4,   fov: 52, roll: 0 },
    about:    { x: -4.2, y: 1.5, z: -10,  lookX: 0.6,  lookY: 0.4, lookZ: -28,  fov: 58, roll: 0.07 },
    services: { x: 4.0,  y: 1.1, z: -34,  lookX: -0.6, lookY: 0.3, lookZ: -52,  fov: 60, roll: -0.06 },
    process:  { x: 0,    y: 1.7, z: -58,  lookX: 0,    lookY: 0.5, lookZ: -76,  fov: 56, roll: 0 },
    work:     { x: -3.2, y: 1.3, z: -82,  lookX: 1.0,  lookY: 0.3, lookZ: -100, fov: 58, roll: 0.08 },
    contact:  { x: 0,    y: 2.0, z: -106, lookX: 0,    lookY: 0.2, lookZ: -124, fov: 50, roll: 0 },
  };

  var SCENE_LIGHT = {
    top:      { a: 0x00c0f0, b: 0xb622f0 },
    about:    { a: 0x4d8cff, b: 0x00c0f0 },
    services: { a: 0xb622f0, b: 0x00c0f0 },
    process:  { a: 0x00c0f0, b: 0x4d8cff },
    work:     { a: 0xb622f0, b: 0x4d8cff },
    contact:  { a: 0xb622f0, b: 0xffffff },
  };



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

    bgAurora: document.getElementById("bgAurora"),
    scrollItems: Array.prototype.slice.call(document.querySelectorAll("[data-slot]")),
    sceneSections: Array.prototype.slice.call(document.querySelectorAll(".section[id]")),
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



  function applySectionCam(id, local) {
    var idx = SCENE_ORDER.indexOf(id);
    if (idx < 0) idx = 0;
    var a = SCENE_CAM[SCENE_ORDER[idx]];
    var b = SCENE_CAM[SCENE_ORDER[Math.min(idx + 1, SCENE_ORDER.length - 1)]];
    var t = clamp((local - 0.48) / 0.52, 0, 1);
    t = t * t * (3 - 2 * t);
    s3d.camX = lerp(a.x, b.x, t);
    s3d.camY = lerp(a.y, b.y, t);
    s3d.camZ = lerp(a.z, b.z, t);
    s3d.lookX = lerp(a.lookX, b.lookX, t);
    s3d.lookY = lerp(a.lookY, b.lookY, t);
    s3d.lookZ = lerp(a.lookZ, b.lookZ, t);
    s3d.fov = lerp(a.fov, b.fov, t);
    s3d.roll = lerp(a.roll, b.roll, t);
  }

  function getSceneIndex() {
    var id = activeScene || "top";
    var idx = SCENE_ORDER.indexOf(id);
    return idx < 0 ? 0 : idx;
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

    if (els.sceneLabel) els.sceneLabel.textContent = SCENES[getSceneIndex()];

    if (els.nav) els.nav.classList.toggle("is-scrolled", scrollY > 40);

  }



  /* Motion profile per position slot: travel, drift, tilt and depth. */
  var SLOTS = {
    c:  { sy: -22, sx:  1.5, rot: -4, rots:  3, dz:  -75 },
    a:  { sy: -24, sx:  2, rot: -7, rots:  4, dz:  -70 },
    b:  { sy: -30, sx: -2, rot:  6, rots: -5, dz: -110 },
    e:  { sy: -28, sx:  1, rot:  5, rots: -4, dz:  -90 },
    f:  { sy: -26, sx: -1, rot: -6, rots:  5, dz:  -80 },
    g1: { sy: -20, sx:  1, rot:  0, rots:  0, dz:  -40 },
    g2: { sy: -32, sx: -1, rot:  0, rots:  0, dz: -100 },
  };

  var activeScene = "";
  var sceneLocal = 0.5;

  function sceneInView() {
    var mid = innerHeight * 0.5;
    var best = null;
    var bestDist = Infinity;
    els.sceneSections.forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      var dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = sec; }
    });
    return best;
  }

  function updateBackground() {
    if (reduced) return;

    var sec = sceneInView();
    if (!sec) return;

    if (sec.id !== activeScene) {
      activeScene = sec.id;
      document.body.setAttribute("data-bg", activeScene);
      els.scrollItems.forEach(function (el) {
        el.classList.toggle("is-active", el.getAttribute("data-for") === activeScene);
      });
    }

    if (els.bgAurora) {
      els.bgAurora.style.transform =
        "translate3d(" + (mouse.x * 1.4).toFixed(1) + "vw, " + (mouse.y * 1.1).toFixed(1) + "vh, 0)";
    }
  }

  function updateSections3D() {
    if (reduced) return;
    var vh = innerHeight;

    els.sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      var dist = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
      var focus = clamp(1 - Math.abs(dist) * 0.85, 0, 1);
      var inner = sec.querySelector(".section__inner") || sec.querySelector(".hero-center");
      if (!inner) return;
      inner.style.transform = "translate3d(0, " + (dist * 14).toFixed(1) + "px, 0)";
      inner.style.opacity = String(lerp(0.72, 1, focus));
    });
  }



  function onScroll() {

    var p = getProgress();

    s3d.progress = p;

    updateUI(p);

    updateBackground(p);

    updateSections3D();

  }



  /* ─── Draw mini website on canvas texture ─── */

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
    if (els.canvas) els.canvas.style.display = "none";
    return null;
  }

  function initGSAP() {

    if (reduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);



    gsap.utils.toArray(".reveal-card").forEach(function (el, i) {
      gsap.fromTo(el,
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
          delay: (i % 4) * 0.08,
        }
      );
    });



    ScrollTrigger.refresh();

  }



  function boot() {
    syncScenes();
    if (window.I18N && typeof window.I18N.onChange === "function") {
      window.I18N.onChange(syncScenes);
    }

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



  function start() {
    var started = false;
    function go() {
      if (started) return;
      started = true;
      boot();
    }
    if (els.loader) els.loader.classList.add("is-hidden");
    if (window.I18N && window.I18N.ready) {
      window.I18N.ready.then(go);
      setTimeout(go, 2500);
    } else {
      go();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();


