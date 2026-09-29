/* Mocha Reign Natural Hair Studio & Boutique
   Site behaviour + "the brushstroke" signature motion.
   Website concept by Couture House Co. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = reduceMQ.matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var lenis = null;

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function focusables(el) {
    return $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])', el)
      .filter(function (n) { return n.offsetParent !== null || n === doc.activeElement; });
  }
  function trapTab(e, el) {
    if (e.key !== 'Tab') return;
    var f = focusables(el);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function lockScroll(on) {
    root.style.overflow = on ? 'hidden' : '';
    if (lenis) { on ? lenis.stop() : lenis.start(); }
  }

  /* ---------------- Header state ---------------- */
  var header = $('.site-header');
  function onScrollHeader() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------- Mobile menu ---------------- */
  var toggle = $('.menu-toggle');
  var panel = $('#mobile-nav');
  if (toggle && panel) {
    var closeBtn = $('.close', panel);
    var openMenu = function () {
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('is-open'); });
      toggle.setAttribute('aria-expanded', 'true');
      lockScroll(true);
      setTimeout(function () { closeBtn && closeBtn.focus(); }, 30);
    };
    var closeMenu = function (returnFocus) {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      lockScroll(false);
      setTimeout(function () { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 360);
      if (returnFocus !== false) toggle.focus();
    };
    toggle.addEventListener('click', function () {
      toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });
    closeBtn && closeBtn.addEventListener('click', function () { closeMenu(); });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
      trapTab(e, panel);
    });
    $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { closeMenu(false); }); });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 960 && toggle.getAttribute('aria-expanded') === 'true') closeMenu(false);
    });
  }

  /* ---------------- Today's hours (studio time zone) ---------------- */
  try {
    var wd = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' }).format(new Date());
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    $$('.hours tr[data-day="' + map[wd] + '"]').forEach(function (tr) {
      tr.classList.add('is-today');
      var th = tr.querySelector('th');
      if (th) th.insertAdjacentHTML('beforeend', ' <span class="sr-only">(today)</span>');
    });
  } catch (err) { /* older browsers: no highlight */ }

  /* ---------------- Service category chips ---------------- */
  var chips = $$('.chips a');
  if (chips.length && 'IntersectionObserver' in window) {
    var chipBar = $('.chips');
    var setActive = function (id) {
      chips.forEach(function (c) {
        var on = c.getAttribute('href') === '#' + id;
        c.classList.toggle('is-active', on);
        if (on) {
          c.setAttribute('aria-current', 'true');
          var left = c.offsetLeft - chipBar.clientWidth / 2 + c.clientWidth / 2;
          chipBar.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' });
        } else { c.removeAttribute('aria-current'); }
      });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.menu-group').forEach(function (g) { io.observe(g); });
  }

  /* ---------------- Gallery: filters + lightbox ---------------- */
  var filterBtns = $$('.filters button');
  var tiles = $$('.masonry .tile');
  var countEl = $('[data-count]');
  function visibleTiles() { return tiles.filter(function (t) { return !t.hidden; }); }
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      filterBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      tiles.forEach(function (t) {
        var cats = (t.getAttribute('data-cats') || '').split(' ');
        t.hidden = !(f === 'all' || cats.indexOf(f) > -1);
      });
      var n = visibleTiles().length;
      if (countEl) countEl.textContent = f === 'all' ? 'Showing all ' + n + ' photos' : 'Showing ' + n + ' photo' + (n === 1 ? '' : 's') + ': ' + b.textContent;
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  var lb = $('#lightbox');
  if (lb && tiles.length) {
    var lbImg = $('[data-lb-img]', lb), lbCap = $('[data-lb-caption]', lb), lbCount = $('[data-lb-count]', lb);
    var current = 0, opener = null, list = [];
    var show = function (i) {
      list = visibleTiles();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      var btn = $('button', list[current]);
      var thumb = $('img', btn);
      lbImg.src = btn.getAttribute('data-full');
      lbImg.width = +btn.getAttribute('data-w');
      lbImg.height = +btn.getAttribute('data-h');
      lbImg.alt = thumb ? thumb.alt : '';
      lbCap.textContent = btn.getAttribute('data-caption') + '. ' + (thumb ? thumb.alt : '') + '.';
      lbCount.textContent = (current + 1) + ' / ' + list.length;
    };
    var openLb = function (i, from) {
      opener = from;
      lb.hidden = false;
      show(i);
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      lockScroll(true);
      setTimeout(function () { $('[data-lb-close]', lb).focus(); }, 30);
    };
    var closeLb = function () {
      lb.classList.remove('is-open');
      lockScroll(false);
      setTimeout(function () { if (!lb.classList.contains('is-open')) lb.hidden = true; }, 320);
      if (opener) opener.focus();
    };
    tiles.forEach(function (t) {
      var b = $('button', t);
      b.addEventListener('click', function () { openLb(visibleTiles().indexOf(t), b); });
    });
    $('[data-lb-close]', lb).addEventListener('click', closeLb);
    $('[data-lb-prev]', lb).addEventListener('click', function () { show(current - 1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
      trapTab(e, lb);
    });
    lb.addEventListener('click', function (e) { if (e.target.classList.contains('lightbox__stage')) closeLb(); });
    var sx = 0, sy = 0;
    var stage = $('.lightbox__stage', lb);
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------------- Forms (Netlify) ---------------- */
  $$('form[data-local-form]').forEach(function (form) {
    var status = $('.form-status', form);
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) return;
      e.preventDefault();
      var local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(location.hostname);
      var say = function (msg) { if (status) { status.hidden = false; status.textContent = msg; } };
      if (local) {
        say('Thank you. This is a local preview, so nothing was sent. Once the site is live on Netlify, this form goes straight to the studio.');
        return;
      }
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          say(form.getAttribute('name') === 'event-inquiry'
            ? 'Thank you. Your inquiry is in, and the studio will follow up soon. For a single appointment, book your free consultation on Booksy.'
            : 'You are on the list. We will let you know as soon as MochaReign hair care launches.');
        })
        .catch(function () { say('Something went wrong sending the form. Please call the studio at (850) 666-0791.'); });
    });
  });

  /* ================================================================
     Motion: Lenis + GSAP. Everything below is skipped for reduced motion
     or if the libraries fail to load; content is visible by default.
     ================================================================ */
  if (reduce || !hasGSAP) return;
  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  if (window.DrawSVGPlugin) gsap.registerPlugin(window.DrawSVGPlugin);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);
  var ST = window.ScrollTrigger;

  /* Lenis smooth scroll, driven by the GSAP ticker */
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -130 } });
    if (ST) lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  /* 1. Hero headline: letters rise, after first paint */
  var heroH = $('.hero h1');
  if (heroH && window.SplitText) {
    var runHero = function () {
      var split = window.SplitText.create(heroH, { type: 'lines,chars', mask: 'lines', charsClass: 'char' });
      gsap.from(split.chars, {
        yPercent: 118, duration: 1.15, ease: 'expo.out', stagger: 0.028, delay: 0.05,
        onComplete: function () { split.revert(); }
      });
      gsap.from('.hero-caption', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power3.out', delay: 0.7, stagger: 0.12 });
    };
    var started = false;
    var go = function () { if (!started) { started = true; requestAnimationFrame(runHero); } };
    if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(go); setTimeout(go, 900); } else { go(); }
  }

  if (!ST) return;

  /* 2. The brushstroke: organic paint-brush wipe via clip-path polygon.
        Leading edge is a ragged, slanted stroke that sweeps left to right. */
  function makeEdge(seed) {
    var pts = [], n = 14, s = seed;
    for (var i = 0; i <= n; i++) {
      s = (s * 9301 + 49297) % 233280;
      var rnd = s / 233280;
      pts.push({ y: (i / n) * 100, j: (rnd - 0.5) * 16 + Math.sin(i * 1.3) * 4, slant: (i / n) * -18 });
    }
    return pts;
  }
  function brushPoly(p, edge) {
    var base = p * 150 - 25;
    var out = ['0% 0%'];
    for (var i = 0; i < edge.length; i++) {
      var x = base + edge[i].j + edge[i].slant;
      out.push(x.toFixed(2) + '% ' + edge[i].y.toFixed(2) + '%');
    }
    out.push('0% 100%');
    return 'polygon(' + out.join(',') + ')';
  }
  $$('[data-brush]').forEach(function (el, idx) {
    if (inView(el)) return; /* never hide anything already on screen at load (protects LCP) */
    var edge = makeEdge(idx * 7919 + 17);
    var state = { p: 0 };
    el.style.clipPath = brushPoly(0, edge);
    var isHeading = /^H[1-6]$/.test(el.tagName);
    ST.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: function () {
        gsap.to(state, {
          p: 1, duration: isHeading ? 1.05 : 1.35, ease: 'power2.inOut',
          onUpdate: function () { el.style.clipPath = brushPoly(state.p, edge); },
          onComplete: function () { el.style.clipPath = ''; }
        });
      }
    });
  });

  /* 3. Brush underlines draw under emphasised words */
  if (window.DrawSVGPlugin) {
    $$('[data-draw]').forEach(function (path) {
      var host = path.closest('.stroke');
      if (inView(host)) {
        gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', delay: 0.9 });
        return;
      }
      gsap.set(path, { drawSVG: '0%' });
      ST.create({
        trigger: host, start: 'top 85%', once: true,
        onEnter: function () { gsap.to(path, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', delay: 0.35 }); }
      });
    });

    /* 4. The loc strand: a twisted rope that draws itself as you scroll the story */
    $$('.story').forEach(function (sec) {
      var strands = $$('[data-strand]', sec);
      if (!strands.length) return;
      gsap.set(strands, { drawSVG: '0%' });
      gsap.to(strands, {
        drawSVG: '100%', ease: 'none', stagger: 0.04,
        scrollTrigger: { trigger: sec, start: 'top 75%', end: 'bottom 55%', scrub: 0.8 }
      });
    });
  }

  window.addEventListener('load', function () { ST.refresh(); });
})();
