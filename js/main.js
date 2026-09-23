/* ============================================================
   BHANU PRAKASH JEWELERS — scroll engine & interactions
   Vanilla JS, no dependencies. Drives CSS custom-property
   based animation so all scenes degrade gracefully.
   ============================================================ */
(function () {
  'use strict';

  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = window.innerHeight || 1;
  var vw = window.innerWidth || 1;
  var resizeToken = null;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function clamp01(v) { return clamp(v, 0, 1); }
  function lerp(a, b, f) { return a + (b - a) * f; }

  /* ---------- keyframe sampler ---------- */
  function sample(track, p) {
    if (!track || track.length === 0) return 0;
    if (track.length === 1) return track[0][1];
    var first = track[0];
    var last = track[track.length - 1];
    if (p <= first[0]) return first[1];
    if (p >= last[0]) return last[1];
    for (var i = 0; i < track.length - 1; i++) {
      if (p >= track[i][0] && p <= track[i + 1][0]) {
        var f = (p - track[i][0]) / (track[i + 1][0] - track[i][0]);
        return lerp(track[i][1], track[i + 1][1], f);
      }
    }
    return last[1];
  }

  /* ============================================================
     SCENE ANIMATION CONFIG
     ax / ay : offsets in vw / vh from each element's own anchor
     as / ar : scale + rotation (deg)
     ao / ab : opacity + blur (px)
     ============================================================ */
  var SCENES = {
    jewellery: {
      nodes: [
        {
          sel: '.showcase-intro',
          t: {
            ax: [[0, 0], [1, 0]],
            ay: [[0, 34], [0.14, 0], [0.72, 0], [0.9, -56], [1, -84]],
            ao: [[0, 0], [0.08, 0], [0.16, 1], [0.7, 1], [0.82, 0.85], [1, 0]]
          }
        },
        {
          sel: '.shot-necklace',
          t: {
            ax: [[0, -15], [0.16, -8], [0.34, 0], [0.52, 0], [0.7, 4], [0.88, 12], [1, 18]],
            ay: [[0, 6], [0.16, 0], [1, 0]],
            as: [[0, 0.5], [0.16, 0.62], [0.34, 1], [0.52, 1.1], [0.7, 1], [0.88, 0.72], [1, 0.42]],
            ar: [[0, 0], [0.2, -3], [0.4, 1], [0.6, 3], [0.8, 2], [1, 0]],
            ab: [[0, 6], [0.16, 5], [0.3, 0], [0.8, 0], [0.9, 5], [1, 9]],
            ao: [[0, 0], [0.14, 0], [0.2, 1], [0.66, 1], [0.84, 0.85], [1, 0]]
          }
        },
        {
          sel: '.shot-bangles',
          t: {
            ax: [[0, 16], [0.5, 9], [0.64, 0], [0.8, 0], [0.94, -5], [1, -8]],
            ay: [[0, 8], [0.5, 2], [0.7, 0], [1, -2]],
            as: [[0, 0.5], [0.5, 0.62], [0.64, 1], [0.8, 1.1], [0.94, 0.85], [1, 0.55]],
            ar: [[0, 0], [0.5, 3], [0.64, -2], [0.8, -4], [0.94, -1], [1, 0]],
            ab: [[0, 7], [0.5, 5], [0.62, 0], [0.92, 0], [1, 6]],
            ao: [[0, 0], [0.5, 0], [0.56, 1], [0.78, 1], [0.92, 0.8], [1, 0]]
          }
        },
        {
          sel: '.shot-bracelet',
          t: {
            ax: [[0, 20], [0.8, 10], [0.9, 0], [1, -4]],
            ay: [[0, 10], [0.8, 2], [1, 8]],
            as: [[0, 0.55], [0.8, 0.7], [0.9, 1], [1, 1.04]],
            ar: [[0, 0], [0.8, 3], [0.9, 0], [1, -2]],
            ab: [[0, 8], [0.8, 5], [0.88, 0], [1, 0]],
            ao: [[0, 0], [0.78, 0], [0.84, 1], [1, 1]]
          }
        },
        {
          sel: '.showcase-caption',
          t: {
            ay: [[0, 26], [0.82, 26], [0.94, 0], [1, 0]],
            ao: [[0, 0], [0.8, 0], [0.9, 1], [1, 1]]
          }
        }
      ]
    },

    craft: {
      nodes: [
        {
          sel: '.craft-bg img',
          t: {
            as: [[0, 1.24], [1, 1.02]],
            ay: [[0, 6], [1, -2]]
          }
        },
        {
          sel: '.craft-copy',
          t: {
            ay: [[0, 40], [0.2, 0], [0.78, 0], [1, -46]],
            ao: [[0, 0], [0.16, 0], [0.24, 1], [0.86, 1], [1, 0.65]]
          }
        }
      ]
    },

    'gold-silver': {
      nodes: [
        {
          sel: '.metals-copy',
          t: {
            ay: [[0, 34], [0.16, 0], [0.8, 0], [1, -46]],
            ao: [[0, 0], [0.12, 0], [0.2, 1], [0.86, 1], [1, 0.5]]
          }
        },
        {
          sel: '.metal-gold',
          t: {
            ax: [[0, -7], [0.4, -4], [0.55, 0], [0.78, 1.5], [1, 0]],
            as: [[0, 0.62], [0.42, 0.7], [0.55, 1], [0.78, 1.1], [1, 0.92]],
            ar: [[0, -2.5], [0.45, -2], [0.6, 0], [0.8, 1], [1, 0]],
            ao: [[0, 0], [0.42, 0], [0.5, 1], [1, 1]]
          }
        },
        {
          sel: '.metal-silver',
          t: {
            ax: [[0, 7], [0.4, 4], [0.55, 0], [0.78, -1.5], [1, 0]],
            as: [[0, 0.62], [0.42, 0.7], [0.55, 1], [0.78, 1.1], [1, 0.92]],
            ar: [[0, 2.5], [0.45, 2], [0.6, 0], [0.8, -1], [1, 0]],
            ao: [[0, 0], [0.42, 0], [0.5, 1], [1, 1]]
          }
        },
        {
          sel: '.gold-glow',
          t: {
            as: [[0, 0.7], [0.5, 1], [1, 1.25]],
            ao: [[0, 0], [0.46, 0], [0.54, 1], [0.9, 0.9], [1, 0.6]]
          }
        },
        {
          sel: '.silver-glow',
          t: {
            as: [[0, 0.7], [0.5, 1], [1, 1.25]],
            ao: [[0, 0], [0.48, 0], [0.56, 1], [0.9, 0.85], [1, 0.55]]
          }
        }
      ]
    },

    visit: {
      nodes: [
        {
          sel: '.visit-copy',
          t: {
            ay: [[0, 40], [0.18, 0], [0.8, 0], [1, -30]],
            ao: [[0, 0], [0.14, 0], [0.22, 1], [0.9, 1], [1, 0.9]]
          }
        },
        {
          sel: '.visit-photo',
          t: {
            ay: [[0, 10], [0.2, 0], [0.85, 0], [1, 6]],
            as: [[0, 1.12], [0.22, 1], [0.85, 1], [1, 1.05]],
            ao: [[0, 0], [0.2, 0], [0.28, 1], [1, 1]]
          }
        },
        {
          sel: '.visit-map-bg',
          t: {
            as: [[0, 1.08], [0.4, 1], [1, 1.12]],
            ay: [[0, 4], [1, -6]]
          }
        }
      ]
    }
  };

  /* cached geometry + node element refs */
  var sceneCache = {};
  var parallaxEls = [];

  function cacheScenes() {
    sceneCache = {};
    Object.keys(SCENES).forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      var nodes = SCENES[id].nodes.map(function (n) {
        return { t: n.t, el: section.querySelector(n.sel) };
      });
      sceneCache[id] = {
        section: section,
        start: section.offsetTop,
        range: Math.max(section.offsetHeight - vh, 1),
        nodes: nodes
      };
    });
  }

  function cacheParallax() {
    parallaxEls = Array.prototype.map.call(document.querySelectorAll('[data-parallax]'), function (el) {
      return { el: el, speed: parseFloat(el.getAttribute('data-parallax')) || 0.1 };
    });
  }

  /* ---------- per-node application ---------- */
  function applyNode(node, p) {
    var el = node.el;
    if (!el) return;
    var t = node.t;
    var hasTransform = false;
    var tx = sample(t.ax, p);
    var ty = sample(t.ay, p);
    var ts = sample(t.as, p);
    var tr = sample(t.ar, p);
    var tb = sample(t.ab, p);

    if (t.ax || t.ay || t.as || t.ar) {
      el.style.setProperty('--ax', tx.toFixed(3));
      el.style.setProperty('--ay', ty.toFixed(3));
      el.style.setProperty('--as', ts.toFixed(3));
      el.style.setProperty('--ar', tr.toFixed(3));
      hasTransform = true;
    }
    if (t.ab) el.style.setProperty('--ab', tb.toFixed(1));
    if (t.ao) el.style.opacity = clamp01(sample(t.ao, p)).toFixed(3);
    return hasTransform;
  }

  /* ---------- scroll frame ---------- */
  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateFrame);
      ticking = true;
    }
  }

  function updateFrame() {
    ticking = false;
    if (!motionOK) return;

    var y = window.scrollY || window.pageYOffset || 0;

    /* progress bar */
    var doc = document.documentElement;
    var total = doc.scrollHeight - vh;
    var bar = document.querySelector('.progress-fill');
    if (bar) bar.style.transform = 'scaleX(' + clamp01(total > 0 ? y / total : 0).toFixed(4) + ')';

    /* hero */
    var hero = document.getElementById('welcome');
    if (hero) {
      var hp = clamp(y / vh, 0, 1.1);
      hero.style.setProperty('--heroP', hp.toFixed(3));
      hero.style.setProperty('--heroWarm', (0.16 + clamp01(hp) * 0.62).toFixed(3));
    }

    /* pinned scenes */
    Object.keys(sceneCache).forEach(function (id) {
      var sc = sceneCache[id];
      var p = clamp((y - sc.start) / sc.range, 0, 1);
      for (var i = 0; i < sc.nodes.length; i++) applyNode(sc.nodes[i], p);
    });

    /* parallax */
    var vc = vh / 2;
    for (var k = 0; k < parallaxEls.length; k++) {
      var item = parallaxEls[k];
      var rect = item.el.getBoundingClientRect();
      if (rect.top > vh * 2 || rect.bottom < -vh) continue;
      var dy = (rect.top + rect.height / 2 - vc) * item.speed;
      item.el.style.transform = 'translate3d(0,' + dy.toFixed(1) + 'px,0)';
    }
  }

  /* static first paint for reduced motion or before any scroll */
  function paintStatic() {
    var y = window.scrollY || 0;
    Object.keys(sceneCache).forEach(function (id) {
      var sc = sceneCache[id];
      var p = clamp((y - sc.start) / sc.range, 0, 1);
      for (var i = 0; i < sc.nodes.length; i++) applyNode(sc.nodes[i], p);
    });
  }

  /* ============================================================
     PARTICLES — drifting gold dust
     ============================================================ */
  function particles(canvas, opts) {
    if (!canvas || !motionOK) return null;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [];
    var colors = ['#c9a24b', '#e8c87c', '#f5e0a4', '#b8913d'];
    var running = false;
    var rafId = null;
    var last = 0;

    function size() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(Math.round(clamp(w * h / opts.grain, opts.min, opts.max)));
    }

    function seed(n) {
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: 0.6 + Math.random() * 1.8,
          sp: 0.012 + Math.random() * 0.05,
          drift: (Math.random() - 0.5) * 0.12,
          ph: Math.random() * Math.PI * 2,
          tw: 0.4 + Math.random() * 0.6,
          c: colors[(Math.random() * colors.length) | 0],
          a: 0.25 + Math.random() * 0.5
        });
      }
    }

    function draw(t) {
      var dt = Math.min((t - last) / 1000 || 0, 0.05);
      last = t;
      var w = canvas.clientWidth || 1;
      var h = canvas.clientHeight || 1;
      var rect = canvas.getBoundingClientRect();
      var inView = rect.bottom > -40 && rect.top < window.innerHeight + 40;

      if (inView) {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < stars.length; i++) {
          var s = stars[i];
          s.y -= s.sp * dt * 6;
          if (s.y < -0.02) { s.y = 1.02; s.x = Math.random(); }
          s.x += Math.sin(s.ph + t / 900) * 0.0004;
          var flicker = 0.6 + 0.4 * Math.sin(s.ph + t / (1300 / (s.tw + 0.4)));
          ctx.globalAlpha = clamp01(s.a * flicker * 0.85);
          ctx.fillStyle = s.c;
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (running) rafId = requestAnimationFrame(draw);
    }

    function start() {
      if (!running) { running = true; rafId = requestAnimationFrame(draw); }
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    size();
    start();
    window.addEventListener('resize', function () { if (resizeToken) clearTimeout(resizeToken); resizeToken = setTimeout(size, 160); });
    return { stop: stop };
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */
  function initNav() {
    var nav = document.getElementById('siteNav');
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobileMenu');

    function onScrollNav() {
      if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 12);
    }
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        toggle.classList.toggle('is-open', !open);
        menu.setAttribute('aria-hidden', String(open));
        menu.classList.toggle('open', !open);
        document.body.style.overflow = !open ? 'hidden' : '';
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.classList.remove('is-open');
          menu.setAttribute('aria-hidden', 'true');
          menu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    /* scrollspy */
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    if ('IntersectionObserver' in window && links.length) {
      var ids = links.map(function (a) { return a.getAttribute('href').slice(1); });
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var active = '#' + en.target.id;
          links.forEach(function (l) {
            var on = l.getAttribute('href') === active;
            l.classList.toggle('active', on);
            if (on) l.setAttribute('aria-current', 'page');
            else l.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -48% 0px' });
      ids.forEach(function (id) {
        var sec = document.getElementById(id);
        if (sec) obs.observe(sec);
      });
    }
  }

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ============================================================
     HORIZONTAL RAIL — drag / swipe / buttons / keyboard / filter
     ============================================================ */
  function initRail() {
    var rail = document.getElementById('jewelRail');
    if (!rail) return;

    var cardW = function () {
      var first = rail.querySelector('.rail-card');
      var gap = 24;
      if (!first) return 320;
      var cs = getComputedStyle(rail);
      try { gap = parseFloat(cs.columnGap) || 24; } catch (e) { /* noop */ }
      return first.getBoundingClientRect().width + gap;
    };

    var prev = document.querySelector('[data-rail-prev]');
    var next = document.querySelector('[data-rail-next]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));

    /* keyboard */
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { rail.scrollBy({ left: cardW(), behavior: 'smooth' }); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { rail.scrollBy({ left: -cardW(), behavior: 'smooth' }); e.preventDefault(); }
    });

    /* buttons */
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -cardW() * 1.5, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: cardW() * 1.5, behavior: 'smooth' }); });

    /* mouse drag */
    var dragging = false;
    var startX = 0;
    var startScroll = 0;
    var moved = 0;

    rail.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
      rail.classList.add('grabbing');
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = startX - e.clientX;
      moved += Math.abs(dx);
      rail.scrollLeft = startScroll + dx;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove('grabbing');
      if (moved > 8) rail.classList.remove('is-attn');
    }
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);

    /* filter chips */
    function applyFilter(filter) {
      var cards = Array.prototype.slice.call(rail.querySelectorAll('.rail-card'));
      cards.forEach(function (c) {
        c.style.display = (filter === 'all' || c.getAttribute('data-cat') === filter) ? '' : 'none';
      });
      chips.forEach(function (ch) {
        ch.classList.toggle('is-active', ch.getAttribute('data-filter') === filter);
      });
      rail.scrollTo({ left: 0 });
      var firstVisible = cards.find(function (c) { return c.style.display !== 'none'; });
      if (firstVisible) {
        firstVisible.classList.add('is-attn');
        setTimeout(function () {
          firstVisible.classList.remove('is-attn');
        }, 2000);
      }
    }

    chips.forEach(function (ch) {
      ch.addEventListener('click', function () { applyFilter(ch.getAttribute('data-filter')); });
    });

    /* work cards jump into the filtered collection */
    var workCards = Array.prototype.slice.call(document.querySelectorAll('.work-card'));
    workCards.forEach(function (card, i) {
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', function () { gotoWork(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gotoWork(card); }
      });
    });

    function gotoWork(card) {
      var f = card.getAttribute('data-filter');
      if (f) {
        var chip = document.querySelector('.chip[data-filter="' + f + '"]');
        if (chip) chip.click();
      }
      document.getElementById('collection').scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' });
    }

    return { applyFilter: applyFilter };
  }

  /* ============================================================
     VISIT / CONTACT MODAL — location popup on "Visit Us"
     ============================================================ */
  function initVisitModal() {
    var modal = document.getElementById('visitModal');
    if (!modal) return;

    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-visit-pop]'));
    var closes = Array.prototype.slice.call(modal.querySelectorAll('[data-visit-close]'));
    var closeBtn = modal.querySelector('.visit-modal-close');
    var menu = document.getElementById('mobileMenu');
    var toggle = document.querySelector('.nav-toggle');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.classList.remove('is-open');
        }
      }
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    triggers.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });

    closes.forEach(function (c) {
      c.addEventListener('click', function (e) {
        if (c.classList.contains('visit-modal-backdrop') && e.target !== c) return;
        close();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  }

  /* ============================================================
     CINE — ultra-smooth scrubbed film background
     3D cursor parallax + cursor-tracking spotlight + scroll scrub
     ============================================================ */
  function initCine() {
    var cine = document.getElementById('cine');
    var video = document.getElementById('cineVideo');
    var glow = document.getElementById('cine-glow');
    if (!cine || !video || !glow) return;

    var currentRef = 0;      /* smoothed video time (seconds) */
    var targetRef = 0;       /* desired video time (seconds) */
    var lastApplied = -1;    /* last currentTime actually written */
    var readyRef = false;
    var durationRef = 0;
    var engaged = false;     /* media pipeline engaged once for reliable paused seeking */
    var cursorBlend = 0.6;   /* how far cursor X can nudge the timeline (±0.6 * duration) */

    var parX = 0, parY = 0;  /* smoothed tilt amounts (-1..1) */
    var ptrX = 0, ptrY = 0;  /* raw pointer position (-1..1) */

    /* frame-strip fallback: pre-extracted stills, used when the browser
       refuses real video seeks (some builds clamp currentTime to 0). */
    var frameImg = document.getElementById('cineFrame');
    var frameIdx = -1;
    var frameMode = false;
    var seekOK = false;
    var selfTested = false;
    var selfTesting = false;
    var preloadedFrames = [];
    var FRAMES = [];
    (function () {
      for (var i = 1; i <= 60; i++) {
        var n = i < 10 ? '00' + i : i < 100 ? '0' + i : String(i);
        FRAMES.push('assets/frames/f-' + n + '.jpg');
      }
    }());

    function onMediaReady() {
      readyRef = true;
      durationRef = video.duration || 0;
      try { video.pause(); } catch (e) {}
      try { video.currentTime = 0; } catch (e) {}
      if (!cine.classList.contains('is-live')) cine.classList.add('is-live');
      selfTestSeek();
    }

    /* Probe once whether the browser honours a paused seek. If it does we
       scrub the video; if not, we scrub the extracted frame strip instead
       (guaranteed frame-advance on every machine). */
    function selfTestSeek() {
      if (selfTested || !readyRef || durationRef <= 0) return;
      selfTested = true;
      selfTesting = true;
      var probe = Math.min(0.5, Math.max(0.05, durationRef * 0.1));
      try { video.currentTime = probe; } catch (e) {}
      setTimeout(function () {
        var ok = false;
        try { ok = (video.currentTime || 0) > 0.04; } catch (e) {}
        selfTesting = false;
        if (ok) {
          seekOK = true;
          cine.classList.add('video-mode');
        } else {
          frameMode = true;
          cine.classList.add('frame-mode');
          if (frameImg) {
            frameImg.src = FRAMES[0];
            frameIdx = 0;
          }
        }
      }, 500);
    }

    /* Chromium only reliably honours currentTime seeks on a paused element
       once the decode pipeline has run at least once. Play then immediately
       pause (muted, no autoplay attribute) — this also pulls the full file
       into the buffer so far-away seeks render instantly. */
    function engagePipeline() {
      if (engaged) return;
      engaged = true;
      try {
        var p = video.play();
        if (p && typeof p.then === 'function') {
          p.then(function () { try { video.pause(); } catch (e) {} }).catch(function () {});
        } else if (typeof video.play === 'function') {
          video.pause();
        }
      } catch (e) {
        try { video.pause(); } catch (e2) {}
      }
    }

    video.addEventListener('loadedmetadata', onMediaReady);
    video.addEventListener('loadeddata', onMediaReady);
    video.addEventListener('canplay', function () { onMediaReady(); engagePipeline(); });
    if (video.readyState >= 1) { onMediaReady(); engagePipeline(); }
    video.addEventListener('error', function () { readyRef = false; });

    window.addEventListener('mousemove', function (e) {
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      ptrX = (e.clientX / w - 0.5) * 2;
      ptrY = (e.clientY / h - 0.5) * 2;
      glow.style.background =
        'radial-gradient(at ' + ((e.clientX / w) * 100).toFixed(2) + '% ' +
        ((e.clientY / h) * 100).toFixed(2) + '%, rgba(196, 0, 36, 0.18), transparent 64%)';
    }, { passive: true });

    if (!motionOK) return;

    function frame() {
      var y = window.scrollY || window.pageYOffset || 0;
      var doc = document.documentElement;
      var total = Math.max(doc.scrollHeight - vh, 1);
      var scrollP = clamp01(y / total);
      /* cursor X scrubs around the scroll position like a timeline: left/right
         nudges the film forward/backward relative to the page position */
      var cursorP = (ptrX + 1) / 2;   /* 0..1 */

      if (readyRef && durationRef > 0) {
        targetRef = clamp01(scrollP + (cursorP - 0.5) * cursorBlend) * durationRef;
        currentRef += (targetRef - currentRef) * 0.10;

        if (frameMode && frameImg) {
          var idx = Math.round((currentRef / durationRef) * (FRAMES.length - 1));
          if (idx > FRAMES.length - 1) idx = FRAMES.length - 1;
          if (idx < 0) idx = 0;
          if (idx !== frameIdx) {
            frameIdx = idx;
            frameImg.src = FRAMES[idx];
            var nxt = idx + 1;
            if (nxt < FRAMES.length && !preloadedFrames[nxt]) {
              preloadedFrames[nxt] = true;
              var im = new Image();
              im.src = FRAMES[nxt];
            }
          }
        } else if (seekOK && !selfTesting && Math.abs(currentRef - lastApplied) > 0.001) {
          try {
            if (typeof video.fastSeek === 'function' && isFinite(currentRef)) video.fastSeek(currentRef);
            else video.currentTime = currentRef;
            lastApplied = currentRef;
          } catch (e) {}
        }
      }

      parX += (ptrX - parX) * 0.06;
      parY += (ptrY - parY) * 0.06;
      cine.style.transform =
        'scale(1.06) ' +
        'translate3d(' + (-parX * 15).toFixed(2) + 'px,' + (-parY * 15).toFixed(2) + 'px,0) ' +
        'rotateX(' + (-parY * 2).toFixed(2) + 'deg) rotateY(' + (parX * 2).toFixed(2) + 'deg)';

      if (motionOK) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function ready() {
    document.getElementById('year').textContent = String(new Date().getFullYear());

    cacheScenes();
    cacheParallax();
    initNav();
    initReveal();
    initRail();
    initVisitModal();
    initCine();


    particles(document.getElementById('particlesHero'), { grain: 15000, min: 26, max: 78 });
    particles(document.querySelector('.particles-rail'), { grain: 30000, min: 6, max: 32 });

    if (motionOK) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', function () {
        if (resizeToken) clearTimeout(resizeToken);
        resizeToken = setTimeout(function () {
          vh = window.innerHeight;
          vw = window.innerWidth;
          cacheScenes();
          cacheParallax();
        }, 160);
      });
      updateFrame();
    } else {
      paintStatic();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();