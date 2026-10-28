/* =========================================================
   HOOP × TOUCHDOWN — two viewing modes, one set of content
   - Website mode (default): native vertical scrolling, scroll-triggered reveals
   - Presentation mode: full-screen slide deck (wipes, keys, swipe, progress)
   No dependencies.
   ========================================================= */
(function () {
  'use strict';

  var A = window.DGM_ASSETS || {};
  var root = document.documentElement, body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer:fine)').matches;
  var deck = document.getElementById('deck');
  var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
  var N = slides.length;
  var T_SLIDE = reduce ? 30 : 1050;

  var mode = 'site';        // 'site' | 'present'
  var cur = -1;             // current section in presentation mode
  var siteCur = -1;         // current section in website mode
  var busy = false, navTimer = 0;
  var entry = { idx: 0, y: 0 };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function $(id) { return document.getElementById(id); }
  function nameOf(n) { return slides[n].dataset.name; }
  function isPresent() { return mode === 'present'; }

  /* ---------------- Images: local first (if fetched) → official CDN → designed fallback ---------------- */
  function ext(src) { return /\.png$/i.test(src) ? 'png' : 'jpg'; }
  function remote(a, w) { return a.src + '?format=' + (w || 1500) + 'w'; }
  function loadImg(img) {
    if (img.dataset.state) return;
    var k = img.dataset.k, a = A[k];
    var holder = img.closest('.media') || img;
    if (!a) { holder.classList.add('fail'); img.classList.add('fail'); return; }
    img.dataset.state = 'loading';
    if (!img.getAttribute('alt') && img.closest('.media')) img.setAttribute('alt', a.alt || '');
    img.decoding = 'async';
    var tries = [];
    if (window.DGM_LOCAL) tries.push((window.DGM_BASE || '') + 'assets/img/' + k + '.' + ext(a.src));
    tries.push(remote(a, img.dataset.w));
    var i = 0;
    img.onload = function () { img.classList.add('ok'); img.dataset.state = 'ok'; };
    img.onerror = function () {
      i++;
      if (i < tries.length) { img.src = tries[i]; return; }
      img.dataset.state = 'fail'; img.classList.add('fail'); holder.classList.add('fail');
    };
    img.src = tries[0];
  }
  function loadSlide(n) { if (n >= 0 && n < N) slides[n].querySelectorAll('img[data-k]').forEach(loadImg); }
  function loadAll(from) {
    var q = [];
    for (var d = 0; d < N; d++) { if (from + d < N) q.push(from + d); if (d && from - d >= 0) q.push(from - d); }
    (function next() { if (!q.length) return; loadSlide(q.shift()); setTimeout(next, 220); })();
  }

  /* ---------------- Chrome: progress + index (shared by both modes) ---------------- */
  var progress = $('progress'), indexList = $('indexList');
  slides.forEach(function (s, n) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', pad(n + 1) + ' ' + nameOf(n));
    b.title = pad(n + 1) + ' — ' + nameOf(n);
    b.addEventListener('click', function () { goSection(n); });
    progress.appendChild(b);
    var li = document.createElement('li'), ib = document.createElement('button');
    ib.innerHTML = '<i>' + pad(n + 1) + '</i>' + nameOf(n);
    ib.addEventListener('click', function () { closeIndex(); goSection(n); });
    li.appendChild(ib); indexList.appendChild(li);
  });
  var pBtns = progress.children, iBtns = indexList.querySelectorAll('button');

  function updateChrome(n, animateGhost) {
    for (var i = 0; i < N; i++) {
      pBtns[i].classList.toggle('done', i < n);
      pBtns[i].classList.toggle('on', i === n);
      if (i === n) pBtns[i].setAttribute('aria-current', 'step'); else pBtns[i].removeAttribute('aria-current');
      iBtns[i].classList.toggle('on', i === n);
    }
    $('curNum').textContent = pad(n + 1);
    $('curName').textContent = nameOf(n);
    $('prevBtn').disabled = n === 0;
    $('nextBtn').disabled = n === N - 1;
    body.dataset.theme = slides[n].dataset.theme || 'dark';
    var g = document.querySelector('.ghost-num');
    if (animateGhost && !reduce) {
      g.classList.add('swap');
      setTimeout(function () { $('ghostNum').textContent = pad(n + 1); g.classList.remove('swap'); }, 450);
    } else $('ghostNum').textContent = pad(n + 1);
    try { history.replaceState(null, '', '#' + (n + 1)); } catch (e) {}
  }

  /* Route section jumps to the active mode */
  function goSection(n) {
    n = Math.max(0, Math.min(N - 1, n));
    if (isPresent()) go(n);
    else scrollToSection(n, true);
  }

  /* ================= WEBSITE MODE ================= */
  function scrollToSection(n, smooth) {
    loadSlide(n);
    var top = slides[n].getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: top, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }

  // reveal: slide-level (media, behaviours) and element-level (type + blocks)
  var slideIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || !isSite()) return;
      e.target.classList.add('active');
    });
  }, { threshold: 0.06 });
  var elIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); elIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  var loadIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) loadSlide(slides.indexOf(e.target)); });
  }, { rootMargin: '120% 0px' });
  function isSite() { return mode === 'site'; }
  function observeSite() {
    slides.forEach(function (s) { slideIO.observe(s); loadIO.observe(s); });
    deck.querySelectorAll('.rv, .ln').forEach(function (el) { if (!el.classList.contains('in')) elIO.observe(el); });
  }
  function unobserveSite() { slideIO.disconnect(); loadIO.disconnect(); elIO.disconnect(); }

  // current-section tracking + scroll parallax (rAF throttled, read-only: never intercepts scrolling)
  var ticking = false;
  function onScroll() {
    if (!isSite() || ticking) return;
    ticking = true;
    requestAnimationFrame(trackSite);
  }
  function trackSite() {
    ticking = false;
    if (!isSite()) return;
    var vh = window.innerHeight, probe = vh * 0.42, found = siteCur < 0 ? 0 : siteCur;
    for (var i = 0; i < N; i++) {
      var r = slides[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) found = i;
      if (!reduce && r.bottom > -vh * .5 && r.top < vh * 1.5) {
        var p = ((r.top + r.height / 2) - vh / 2) / vh;
        slides[i].style.setProperty('--sy', Math.max(-1.2, Math.min(1.2, p)).toFixed(3));
      }
    }
    if (found !== siteCur) {
      var prev = siteCur;
      siteCur = found;
      if (prev >= 0) onLeave(prev);
      onEnter(found);
      updateChrome(found, false);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ================= PRESENTATION MODE ================= */
  var TRANSIENT = ['active', 'leaving', 'to-next', 'to-prev', 'animating', 'enter-next', 'enter-prev', 'dir-next', 'dir-prev'];
  function resetSlideClasses() { slides.forEach(function (s) { TRANSIENT.forEach(function (c) { s.classList.remove(c); }); }); }

  function go(n, opts) {
    n = Math.max(0, Math.min(N - 1, n));
    if (!isPresent() || n === cur || busy) return;
    var prev = cur, dir = n > prev ? 'next' : 'prev';
    var inS = slides[n], outS = prev >= 0 ? slides[prev] : null;
    loadSlide(n); loadSlide(n + 1); loadSlide(n - 1);
    cur = n;

    if (!outS || (opts && opts.instant)) {
      inS.classList.add('active'); inS.scrollTop = 0;
      updateChrome(n, true); onEnter(n); return;
    }
    busy = true;
    outS.classList.remove('active', 'animating', 'dir-next', 'dir-prev');
    outS.classList.add('leaving', 'to-' + dir);
    onLeave(prev);
    inS.scrollTop = 0;
    inS.classList.add('enter-' + dir, 'dir-' + dir, 'active');
    void inS.offsetWidth;
    inS.classList.add('animating');
    requestAnimationFrame(function () { inS.classList.remove('enter-' + dir); });
    updateChrome(n, true); onEnter(n);
    navTimer = setTimeout(function () {
      outS.classList.remove('leaving', 'to-next', 'to-prev');
      inS.classList.remove('animating', 'dir-next', 'dir-prev');
      busy = false;
    }, T_SLIDE + 40);
  }
  function next() { go(cur + 1); }
  function prev() { go(cur - 1); }
  $('nextBtn').addEventListener('click', next);
  $('prevBtn').addEventListener('click', prev);

  /* ---------------- Fullscreen (graceful: immersive fixed layout when unsupported) ---------------- */
  var fsOurs = false;
  function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsSupported() { return !!(root.requestFullscreen || root.webkitRequestFullscreen); }
  function fsEnter() {
    if (!fsSupported() || fsEl()) return;
    try {
      var p = root.requestFullscreen ? root.requestFullscreen({ navigationUI: 'hide' }) : root.webkitRequestFullscreen();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  function fsExit() {
    if (!fsEl()) return;
    fsOurs = true;
    try {
      var p = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
    setTimeout(function () { fsOurs = false; }, 600);
  }
  function onFsChange() {
    // Browser consumed Esc to leave fullscreen: treat as "exit presentation"
    if (!fsEl() && isPresent() && !fsOurs) exitPresent();
    fsOurs = false;
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  $('fsBtn').addEventListener('click', function () { fsEl() ? fsExit() : fsEnter(); });
  if (!fsSupported()) $('fsBtn').hidden = true;

  /* ---------------- Mode switching (no reload, same content) ---------------- */
  function enterPresent() {
    if (isPresent()) return;
    closeIndex();
    entry.idx = siteCur < 0 ? 0 : siteCur;
    entry.y = window.pageYOffset;
    onLeave(entry.idx);
    unobserveSite();
    mode = 'present';
    root.classList.remove('site'); root.classList.add('present');
    resetSlideClasses();
    slides.forEach(function (s) { s.scrollTop = 0; s.style.removeProperty('--sy'); });
    cur = -1; busy = false;
    void deck.offsetWidth;            // commit hidden state so reveals replay
    go(entry.idx, { instant: true });
    fsEnter();
    setHint();
    $('exitBtn').focus({ preventScroll: true });
  }

  function exitPresent() {
    if (!isPresent()) return;
    closeIndex();
    clearTimeout(navTimer); busy = false;
    onLeave(cur);
    var at = cur;
    mode = 'site';
    resetSlideClasses();
    // keep everything already seen revealed, so returning never flashes empty sections
    slides.forEach(function (s, i) {
      s.scrollTop = 0;
      if (i <= at) { s.classList.add('active'); s.querySelectorAll('.rv, .ln').forEach(function (el) { el.classList.add('in'); }); }
    });
    root.classList.remove('present'); root.classList.add('site', 'switched');
    setTimeout(function () { root.classList.remove('switched'); }, 600);
    var y = at === entry.idx ? entry.y : null;
    if (y === null) { var r = slides[at].getBoundingClientRect(); y = r.top + window.pageYOffset; }
    window.scrollTo({ top: y, behavior: 'auto' });
    siteCur = -1;
    observeSite();
    trackSite();
    fsExit();
    setHint();
    $('presentBtn').focus({ preventScroll: true });
  }
  $('presentBtn').addEventListener('click', enterPresent);
  $('exitBtn').addEventListener('click', exitPresent);
  document.querySelectorAll('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); goSection(+el.dataset.go); });
  });

  /* ---------------- Index overlay ---------------- */
  var panel = $('indexPanel'), indexBtn = $('indexBtn');
  function setHint() {
    $('indexHint').textContent = isPresent()
      ? '← → to move · I for index · F for full screen · Esc to exit presentation'
      : 'Choose a section to jump to it · Esc to close';
  }
  function openIndex() { panel.hidden = false; indexBtn.setAttribute('aria-expanded', 'true'); var b = indexList.querySelector('button.on') || indexList.querySelector('button'); b && b.focus(); }
  function closeIndex() { if (panel.hidden) return; panel.hidden = true; indexBtn.setAttribute('aria-expanded', 'false'); }
  indexBtn.addEventListener('click', function () { panel.hidden ? openIndex() : closeIndex(); });
  panel.addEventListener('click', function (e) { if (e.target === panel || e.target.classList.contains('index-inner')) closeIndex(); });

  /* ---------------- Keyboard ---------------- */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (!panel.hidden) { if (k === 'Escape') { closeIndex(); indexBtn.focus(); } return; }
    if (!isPresent()) {
      // Website mode: native scrolling owns arrows/space/page keys. Only P is reserved.
      if ((k === 'p' || k === 'P') && !e.target.closest('input,textarea,[contenteditable]')) enterPresent();
      return;
    }
    if (k === 'Escape') { e.preventDefault(); exitPresent(); }
    else if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.target.closest('button'))) { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(N - 1); }
    else if (k === 'f' || k === 'F') { fsEl() ? fsExit() : fsEnter(); }
    else if (k === 'i' || k === 'I') openIndex();
    else if (/^[1-9]$/.test(k)) go(+k - 1);
    else if (k === '0') go(9);
  });

  /* ---------------- Wheel / swipe: presentation mode only ---------------- */
  var wheelLock = 0;
  window.addEventListener('wheel', function (e) {
    if (!isPresent() || window.innerWidth <= 860 || !panel.hidden) return;
    var s = slides[cur];
    if (s.scrollHeight > s.clientHeight + 4) {
      var atTop = s.scrollTop <= 0, atBot = s.scrollTop + s.clientHeight >= s.scrollHeight - 2;
      if ((e.deltaY > 0 && !atBot) || (e.deltaY < 0 && !atTop)) return;
    }
    var d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 24) return;
    var now = Date.now();
    if (now < wheelLock) return;
    wheelLock = now + 1300;
    d > 0 ? next() : prev();
  }, { passive: true });

  var tx = 0, ty = 0, tt = 0;
  deck.addEventListener('touchstart', function (e) { var t = e.touches[0]; tx = t.clientX; ty = t.clientY; tt = Date.now(); }, { passive: true });
  deck.addEventListener('touchend', function (e) {
    if (!isPresent()) return;
    var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - tt < 800) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* ---------------- Pointer parallax (both modes, fine pointers only) ---------------- */
  if (!reduce && finePointer) {
    var raf = 0, mx = 0, my = 0;
    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - .5) * 2;
      my = (e.clientY / window.innerHeight - .5) * 2;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        root.style.setProperty('--mx', mx.toFixed(3));
        root.style.setProperty('--my', my.toFixed(3));
      });
    }, { passive: true });
  }
  document.querySelectorAll('.px').forEach(function (el) { el.style.setProperty('--depth', el.dataset.depth || 0); });

  /* ================= Per-section behaviours (shared) ================= */
  var timers = {};
  function clear(name) { if (timers[name]) { clearInterval(timers[name]); clearTimeout(timers[name]); timers[name] = 0; } }

  // 02 — market ticker (cities published on hooptrailer.com / touchdowntrailer.com, Oct 2026)
  (function buildMarquee() {
    var hoop = ['San Diego','Miami','Dallas','Nebraska','Phoenix','Austin','Louisville','Salt Lake City','Knoxville','Boston','Sacramento','Calgary','Seattle','Columbus','Honolulu','Savannah','Chicago','Las Vegas','Atlanta','Los Angeles','Nashville','New York','Denver','Toronto','Houston','Tampa Bay','Portland','Philadelphia','Orlando','Washington DC','Milwaukee','Vancouver'];
    var td = ['San Diego','Charlotte','Atlanta','Miami','Phoenix','Tampa','Indianapolis','Bay Area','Boise','Waco','New Jersey','Oakland MI'];
    var items = [], j = 0;
    hoop.forEach(function (c, i) {
      items.push('<span>Hoop ' + c + '</span>');
      if (i % 3 === 1) { items.push('<span class="td">Touchdown ' + td[j % td.length] + '</span>'); j++; }
    });
    var html = items.join('');
    $('cityRun').innerHTML = html + html;
  })();

  // 03 — pillars
  var pillars = Array.prototype.slice.call(document.querySelectorAll('.pillar'));
  var pIdx = 0, pUserLock = false;
  function setPillar(i, user) {
    pIdx = i;
    pillars.forEach(function (p, k) { p.classList.toggle('is-on', k === i); p.classList.remove('timing'); p.setAttribute('aria-pressed', k === i); });
    if (!user && !reduce) { void pillars[i].offsetWidth; pillars[i].classList.add('timing'); }
  }
  pillars.forEach(function (p, i) {
    p.addEventListener('click', function () { pUserLock = true; clear('pillars'); setPillar(i, true); });
    p.addEventListener('mouseenter', function () { if (finePointer) { pUserLock = true; clear('pillars'); setPillar(i, true); } });
  });

  // 04 — shot clock + scoreboard concept loop
  function startComp() {
    clear('comp');
    var clock = 24, a = 0, b = 0;
    var sc = $('shotclock'), sbc = $('sbClock'), A1 = $('scoreA'), B1 = $('scoreB');
    sc.textContent = sbc.textContent = '24'; A1.textContent = B1.textContent = '00';
    if (reduce) return;
    timers.comp = setInterval(function () {
      clock = clock <= 0 ? 24 : clock - 1;
      if (clock === 24) { a = 0; b = 0; A1.textContent = B1.textContent = '00'; }
      sc.textContent = pad(clock); sbc.textContent = pad(clock);
      if (clock % 3 === 0 && clock !== 24) {
        var el = Math.random() > .5 ? A1 : B1, pts = Math.random() > .6 ? 3 : 2;
        if (el === A1) { a += pts; el.textContent = pad(a); } else { b += pts; el.textContent = pad(b); }
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      }
    }, 1000);
  }

  // 07 — engine nodes
  var ENGINE = [
    ['Professional Production', 'Flagship content capture, interviews, product photography, and campaign assets.'],
    ['Distributed Content', 'Footage submitted by operators and locations across the network, turned into usable brand content.'],
    ['Creative Development', 'Editing, motion graphics, branded templates, and platform-specific content.'],
    ['Social Management', 'Content calendars, publishing, audience engagement, and performance monitoring.'],
    ['Continuous Optimization', 'Refining creative based on audience response and business objectives. Then the loop runs again.']
  ];
  var nodes = Array.prototype.slice.call(document.querySelectorAll('.node'));
  var eIdx = 0;
  function setNode(i) {
    eIdx = i;
    nodes.forEach(function (n, k) { n.classList.toggle('on', k === i); n.setAttribute('aria-pressed', k === i); });
    var d = $('engineDetail');
    $('edNum').textContent = pad(i + 1) + ' / 05';
    $('edTitle').textContent = ENGINE[i][0];
    $('edBody').textContent = ENGINE[i][1];
    $('edNum').style.color = i % 2 ? 'var(--td)' : 'var(--hoop)';
    d.classList.remove('swap'); void d.offsetWidth; d.classList.add('swap');
  }
  nodes.forEach(function (n, i) {
    n.addEventListener('click', function () { clear('engine'); setNode(i); });
    n.addEventListener('mouseenter', function () { if (finePointer) { clear('engine'); setNode(i); } });
  });

  // 08 — tier tabs (small screens)
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tier-tabs button'));
  var tiers = Array.prototype.slice.call(document.querySelectorAll('.tier'));
  function setTier(i) {
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i); });
    tiers.forEach(function (t, k) { t.classList.toggle('show', k === i); });
  }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { setTier(i); }); });
  setTier(1);

  function onEnter(n) {
    var s = slides[n];
    if (s.classList.contains('s-approach')) {
      clear('pillars'); pUserLock = false; setPillar(0);
      if (!reduce) timers.pillars = setInterval(function () { if (!pUserLock) setPillar((pIdx + 1) % 3); }, 3500);
    }
    if (s.classList.contains('s-comp')) startComp();
    if (s.classList.contains('s-engine')) {
      clear('engine'); setNode(0);
      if (!reduce) timers.engine = setInterval(function () { setNode((eIdx + 1) % 5); }, 3800);
    }
  }
  function onLeave(n) {
    if (n < 0) return;
    var s = slides[n];
    if (s.classList.contains('s-approach')) clear('pillars');
    if (s.classList.contains('s-comp')) clear('comp');
    if (s.classList.contains('s-engine')) clear('engine');
  }

  /* ================= Boot (website mode) ================= */
  setHint();
  var start = parseInt((location.hash || '').replace('#', ''), 10);
  start = isNaN(start) ? 0 : Math.max(0, Math.min(N - 1, start - 1));
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    loadSlide(start);
    if (start > 0) scrollToSection(start, false); else window.scrollTo(0, 0);
    observeSite();
    trackSite();
    setTimeout(function () { loadAll(start); }, 600);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
    setTimeout(boot, 1200);
  } else boot();

  window.addEventListener('hashchange', function () {
    var h = parseInt(location.hash.replace('#', ''), 10);
    if (isNaN(h)) return;
    if (isPresent() && h - 1 !== cur) go(h - 1);
    else if (!isPresent() && h - 1 !== siteCur) scrollToSection(h - 1, true);
  });
})();
