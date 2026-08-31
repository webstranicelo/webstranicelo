/**
 * webstranicelo — language: Serbian for Serbian-speaking Balkans,
 * English elsewhere. Manual toggle is remembered.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "webstranicelo-lang";
  var SERBIAN_COUNTRIES = { RS: 1, BA: 1, ME: 1, XK: 1, KV: 1 };
  var currentLang = "sr";
  var listeners = [];
  var readyResolve;
  var ready = new Promise(function (resolve) {
    readyResolve = resolve;
  });

  var T = {
    sr: {
      "meta.title": "webstranicelo — Creative Web Studio | 3D animacije",
      "meta.desc": "webstranicelo — izrada premium web sajtova sa 3D animacijama, WebGL pozadinom i scroll efektima.",
      "skip": "Preskoči na sadržaj",
      "nav.menu": "Meni",
      "nav.about": "O meni",
      "nav.services": "Usluge",
      "nav.work": "Radovi",
      "nav.contact": "Kontakt",
      "lang.label": "Jezik",
      "hero.eyebrow": "Web developer • 3D animacije",
      "hero.desc": "Pravim premium sajtove sa scroll-driven 3D animacijama — landing stranice, biznis sajtovi i portfolio koji se pamti.",
      "hero.cta": "Zatraži sajt",
      "hero.work": "Pogledaj radove",
      "hero.scroll": "Skroluj",
      "about.tag": "O meni",
      "about.heading": "webstranicelo — tvoj 3D developer",
      "about.lead": "Svaki projekat dobija custom dizajn, čist kod i WebGL animacije koje privlače pažnju.",
      "about.allServices": "Sve usluge",
      "about.frontend": "Frontend",
      "about.frontendDesc": "HTML, CSS, JavaScript — brz i čitljiv kod.",
      "about.webgl": "3D & WebGL",
      "about.webglDesc": "Three.js scene, scroll animacije, parallax.",
      "about.idea": "Od ideje do live",
      "about.ideaDesc": "Jasan proces, bez komplikacija.",
      "services.tag": "Usluge",
      "services.heading": "Šta mogu da izgradim",
      "services.lead": "Od landing stranica do kompletnih sajtova sa 3D efektima.",
      "services.landing": "Landing stranice",
      "services.landingDesc": "Jedna stranica, jedan cilj — prodaja, prijava ili kontakt.",
      "services.learnMore": "Saznaj više",
      "services.anim": "3D animacije",
      "services.animDesc": "WebGL pozadine, scroll scene, interaktivni detalji.",
      "services.business": "Biznis sajtovi",
      "services.businessDesc": "Profesionalan izgled za firmu ili lični brend.",
      "services.responsive": "Responsive",
      "services.responsiveDesc": "Savršen prikaz na telefonu, tabletu i desktopu.",
      "process.tag": "Proces",
      "process.heading": "Kako radimo zajedno",
      "process.1title": "Razgovor & brief",
      "process.1desc": "Kažeš šta ti treba i pošalješ referencu sajta koji ti se sviđa.",
      "process.2title": "Dizajn & struktura",
      "process.3title": "Razvoj & 3D",
      "process.2desc": "Dogovorimo sekcije, boje i 3D animacije.",
      "process.3desc": "Gradim sajt — HTML, CSS, JS, WebGL. Testiram i optimizujem.",
      "process.4title": "Lansiranje",
      "process.4desc": "Sajt ide online. Ostajem dostupan za izmene.",
      "work.tag": "Portfolio",
      "work.heading": "Sajtovi koje sam radio",
      "work.lead": "Primeri projekata — landing, biznis i brand prezentacije.",
      "work.restaurant": "Restoran",
      "work.restaurantDesc": "Hero, meni, rezervacija — topli identitet",
      "work.fitness": "Fitness studio",
      "work.fitnessDesc": "Dynamic hero, paketi, energičan dark dizajn",
      "work.agency": "Poslovna agencija",
      "work.agencyDesc": "Usluge, tim, kontakt — corporate layout",
      "work.restaurantAlt": "Restoran landing sajt",
      "work.fitnessAlt": "Fitness studio sajt",
      "work.agencyAlt": "Agencija poslovni sajt",
      "contact.tag": "Kontakt",
      "contact.heading": "Spreman za novi projekat?",
      "contact.lead": "Pošalji poruku na Instagram — napiši šta ti treba i pošalji referencu. Odgovaram brzo.",
      "contact.free": "Besplatan razgovor",
      "contact.quote": "Prilagođena ponuda",
      "contact.anim": "3D animacije po želji",
      "scene.start": "Početak",
      "scene.about": "O meni",
      "scene.services": "Usluge",
      "scene.process": "Proces",
      "scene.work": "Radovi",
      "scene.contact": "Kontakt",
      "canvas.line1": "Hero sekcija • CTA • Responsive layout",
      "canvas.line2": "Custom dizajn • Brzo učitavanje • 3D efekti",
      "canvas.cta": "Pogledaj",
      "canvas.business": "Biznis Sajt",
    },
    en: {
      "meta.title": "webstranicelo — Creative Web Studio | 3D animation",
      "meta.desc": "webstranicelo — premium websites with 3D animation, WebGL backgrounds, and scroll effects.",
      "skip": "Skip to content",
      "nav.menu": "Menu",
      "nav.about": "About",
      "nav.services": "Services",
      "nav.work": "Work",
      "nav.contact": "Contact",
      "lang.label": "Language",
      "hero.eyebrow": "Web developer • 3D animation",
      "hero.desc": "I build premium sites with scroll-driven 3D animation — landing pages, business websites, and portfolios that stick.",
      "hero.cta": "Request a site",
      "hero.work": "View work",
      "hero.scroll": "Scroll",
      "about.tag": "About",
      "about.heading": "webstranicelo — your 3D developer",
      "about.lead": "Every project gets custom design, clean code, and WebGL animation that grabs attention.",
      "about.allServices": "All services",
      "about.frontend": "Frontend",
      "about.frontendDesc": "HTML, CSS, JavaScript — fast, readable code.",
      "about.webgl": "3D & WebGL",
      "about.webglDesc": "Three.js scenes, scroll animation, parallax.",
      "about.idea": "From idea to live",
      "about.ideaDesc": "A clear process, no hassle.",
      "services.tag": "Services",
      "services.heading": "What I can build",
      "services.lead": "From landing pages to full websites with 3D effects.",
      "services.landing": "Landing pages",
      "services.landingDesc": "One page, one goal — sales, sign-ups, or contact.",
      "services.learnMore": "Learn more",
      "services.anim": "3D animation",
      "services.animDesc": "WebGL backgrounds, scroll scenes, interactive details.",
      "services.business": "Business websites",
      "services.businessDesc": "A professional look for your company or personal brand.",
      "services.responsive": "Responsive",
      "services.responsiveDesc": "Perfect on phone, tablet, and desktop.",
      "process.tag": "Process",
      "process.heading": "How we work together",
      "process.1title": "Talk & brief",
      "process.1desc": "Tell me what you need and send a reference site you like.",
      "process.2title": "Design & structure",
      "process.2desc": "We agree on sections, colors, and 3D animation.",
      "process.3title": "Development & 3D",
      "process.3desc": "I build the site — HTML, CSS, JS, WebGL. Tested and optimized.",
      "process.4title": "Launch",
      "process.4desc": "The site goes live. I stay available for changes.",
      "work.tag": "Portfolio",
      "work.heading": "Sites I've built",
      "work.lead": "Project examples — landing, business, and brand presentations.",
      "work.restaurant": "Restaurant",
      "work.restaurantDesc": "Hero, menu, reservations — a warm identity",
      "work.fitness": "Fitness studio",
      "work.fitnessDesc": "Dynamic hero, packages, energetic dark design",
      "work.agency": "Business agency",
      "work.agencyDesc": "Services, team, contact — corporate layout",
      "work.restaurantAlt": "Restaurant landing site",
      "work.fitnessAlt": "Fitness studio website",
      "work.agencyAlt": "Agency business website",
      "contact.tag": "Contact",
      "contact.heading": "Ready for a new project?",
      "contact.lead": "Send a message on Instagram — tell me what you need and share a reference. I reply fast.",
      "contact.free": "Free intro call",
      "contact.quote": "Custom quote",
      "contact.anim": "3D animation on request",
      "scene.start": "Start",
      "scene.about": "About",
      "scene.services": "Services",
      "scene.process": "Process",
      "scene.work": "Work",
      "scene.contact": "Contact",
      "canvas.line1": "Hero section • CTA • Responsive layout",
      "canvas.line2": "Custom design • Fast loading • 3D effects",
      "canvas.cta": "View",
      "canvas.business": "Business Site",
    },
  };

  function t(key) {
    return (T[currentLang] && T[currentLang][key]) || (T.sr && T.sr[key]) || key;
  }

  function scenes() {
    return [
      t("scene.start"),
      t("scene.about"),
      t("scene.services"),
      t("scene.process"),
      t("scene.work"),
      t("scene.contact"),
    ];
  }

  function urlLang() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "sr" || q === "en") return q;
    } catch (e) {}
    return "";
  }

  function savedLang() {
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s === "sr" || s === "en") return s;
    } catch (e) {}
    return "";
  }

  function browserSuggestsSerbian() {
    var langs = [];
    if (navigator.languages && navigator.languages.length) {
      langs = Array.prototype.slice.call(navigator.languages);
    } else if (navigator.language) {
      langs = [navigator.language];
    }
    return langs.some(function (l) {
      return /^(sr|bs|hr|cnr)([-_]|$)/i.test(l || "");
    });
  }

  function fetchWithTimeout(url, ms) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, ms);
    return fetch(url, { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error("geo");
        return r.json();
      })
      .catch(function (err) {
        clearTimeout(timer);
        throw err;
      });
  }

  function detectCountry() {
    return fetchWithTimeout("https://get.geojs.io/v1/ip/country.json", 1600)
      .then(function (d) {
        return d && d.country ? String(d.country).toUpperCase() : "";
      })
      .catch(function () {
        return fetchWithTimeout("https://ipwho.is/?fields=country_code,success", 1200).then(function (d) {
          return d && d.success && d.country_code ? String(d.country_code).toUpperCase() : "";
        });
      })
      .catch(function () {
        return "";
      });
  }

  function applyLang(lang, persist) {
    if (lang !== "sr" && lang !== "en") lang = "en";
    currentLang = lang;
    document.documentElement.lang = lang === "sr" ? "sr" : "en";
    document.documentElement.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(key);
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (key) el.setAttribute("alt", t(key));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", t(key));
    });

    document.title = t("meta.title");
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.desc"));

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {}
      try {
        var url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      } catch (e) {}
    }

    listeners.forEach(function (fn) {
      try {
        fn(lang);
      } catch (e) {}
    });
  }

  function setLang(lang) {
    applyLang(lang, true);
  }

  function bindSwitcher() {
    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        if (lang === "sr" || lang === "en") setLang(lang);
      });
    });
  }

  function resolveLang() {
    var fromUrl = urlLang();
    if (fromUrl) {
      try {
        localStorage.setItem(STORAGE_KEY, fromUrl);
      } catch (e) {}
      return Promise.resolve(fromUrl);
    }

    var saved = savedLang();
    if (saved) return Promise.resolve(saved);

    return detectCountry().then(function (code) {
      if (code) return SERBIAN_COUNTRIES[code] ? "sr" : "en";
      return browserSuggestsSerbian() ? "sr" : "en";
    });
  }

  function init() {
    bindSwitcher();
    resolveLang()
      .then(function (lang) {
        applyLang(lang, false);
        readyResolve(lang);
      })
      .catch(function () {
        applyLang(browserSuggestsSerbian() ? "sr" : "en", false);
        readyResolve(currentLang);
      });
  }

  window.I18N = {
    ready: ready,
    t: t,
    scenes: scenes,
    getLang: function () {
      return currentLang;
    },
    setLang: setLang,
    onChange: function (fn) {
      listeners.push(fn);
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
