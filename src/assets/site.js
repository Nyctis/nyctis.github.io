(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // A small mark flying between two points. `s` picks the shape.
  function flyer(fx, shape) {
    var el;
    if (shape === 'frame') {
      el = document.createElementNS(NS, 'rect');
      el.setAttribute('width', 12); el.setAttribute('height', 7); el.setAttribute('x', -6); el.setAttribute('y', -3.5);
    } else if (shape === 'seal' || shape === 'key') {
      el = document.createElementNS(NS, 'rect');
      el.setAttribute('width', 11); el.setAttribute('height', 11); el.setAttribute('x', -5.5); el.setAttribute('y', -5.5);
    } else {
      el = document.createElementNS(NS, 'circle');
      el.setAttribute('r', shape === 'coin' ? 6 : 4);
    }
    el.setAttribute('class', 'fly ' + (shape || 'dot'));
    fx.appendChild(el);
    return el;
  }

  function Player(host, def) {
    var tabs = def.tabs || [{ steps: def.steps }];
    var tab = 0, step = -1, timer = 0, playing = !still, visible = false, runs = [];

    host.innerHTML =
      (def.tabs ? '<div class="sc-tabs" role="tablist"></div>' : '') +
      '<svg class="sc" viewBox="0 0 ' + def.box[0] + ' ' + def.box[1] + '" role="img" aria-label="' + def.label + '">' +
      def.svg + '<g class="fx"></g></svg>' +
      '<div class="sc-bar"><button type="button" class="sc-play" aria-label="Pause"></button><ol class="sc-ticks"></ol></div>' +
      '<p class="sc-say"></p>';

    var svg = host.querySelector('svg'), fx = host.querySelector('.fx');
    var say = host.querySelector('.sc-say'), ticks = host.querySelector('.sc-ticks'), play = host.querySelector('.sc-play');
    var keyed = svg.querySelectorAll('[data-k]');
    var texts = svg.querySelectorAll('[data-t]');
    var first = {};
    texts.forEach(function (t) { first[t.dataset.t] = t.textContent; });

    function keyEl(k) { return svg.querySelectorAll('[data-k="' + k + '"]'); }
    function textEl(k) { return svg.querySelectorAll('[data-t="' + k + '"]'); }

    function paint(i) {
      var steps = tabs[tab].steps;
      keyed.forEach(function (e) { e.classList.remove('on', 'hot'); });
      texts.forEach(function (t) { t.textContent = first[t.dataset.t]; });
      for (var j = 0; j <= i; j++) {
        var s = steps[j];
        (s.on || []).forEach(function (k) { keyEl(k).forEach(function (e) { e.classList.add('on'); }); });
        (s.off || []).forEach(function (k) { keyEl(k).forEach(function (e) { e.classList.remove('on', 'hot'); }); });
        (s.hot || []).forEach(function (k) { keyEl(k).forEach(function (e) { e.classList.add('hot'); }); });
        (s.cool || []).forEach(function (k) { keyEl(k).forEach(function (e) { e.classList.remove('hot'); }); });
        for (var t in (s.text || {})) textEl(t).forEach(function (e) { e.textContent = s.text[t]; });
      }
    }

    function clearFlies() {
      runs.forEach(function (r) { r.dead = true; if (r.el) r.el.remove(); });
      runs = [];
    }

    function launch(i) {
      if (still) return;
      (tabs[tab].steps[i].fly || []).forEach(function (f) {
        var o = f[2] || {}, n = o.n || 1, a = def.p[f[0]], b = def.p[f[1]];
        for (var c = 0; c < n; c++) (function (c) {
          var r = { dead: false, el: null };
          runs.push(r);
          setTimeout(function () {
            if (r.dead) return;
            r.el = flyer(fx, o.s);
            var t0 = performance.now(), dur = o.t || (n > 1 ? 900 : 1100), trace = null;
            if (n === 1 && o.s !== 'frame' && o.s !== 'pale') {
              trace = document.createElementNS(NS, 'line');
              trace.setAttribute('class', 'trace');
              trace.setAttribute('x1', a[0]); trace.setAttribute('y1', a[1]); trace.setAttribute('x2', a[0]); trace.setAttribute('y2', a[1]);
              fx.insertBefore(trace, fx.firstChild);
              runs.push({ el: trace, dead: false });
            }
            (function frame(now) {
              if (r.dead) return;
              var p = Math.min(1, (now - t0) / dur), e = n > 1 ? p : ease(p);
              var px = a[0] + (b[0] - a[0]) * e, py = a[1] + (b[1] - a[1]) * e;
              r.el.setAttribute('transform', 'translate(' + px + ' ' + py + ')');
              if (trace) { trace.setAttribute('x2', px); trace.setAttribute('y2', py); }
              r.el.style.opacity = p > .92 ? (1 - p) / .08 : 1;
              if (p < 1) return requestAnimationFrame(frame);
              r.el.remove(); r.dead = true;
              if (trace) ripple(b);
            })(t0);
          }, (o.d || 0) + c * 340);
        })(c);
      });
    }

    // A ring opens where a mark lands.
    function ripple(at) {
      var ring = document.createElementNS(NS, 'circle'), r = { el: ring, dead: false }, t0 = performance.now();
      ring.setAttribute('class', 'ring'); ring.setAttribute('cx', at[0]); ring.setAttribute('cy', at[1]);
      fx.appendChild(ring); runs.push(r);
      (function frame(now) {
        if (r.dead) return;
        var p = Math.min(1, (now - t0) / 650);
        ring.setAttribute('r', 5 + p * 22); ring.style.opacity = 1 - p;
        if (p < 1) requestAnimationFrame(frame); else { ring.remove(); r.dead = true; }
      })(t0);
    }

    function drawTicks() {
      var steps = tabs[tab].steps;
      ticks.innerHTML = steps.map(function (s, i) {
        return '<li><button type="button" aria-label="Step ' + (i + 1) + '"></button></li>';
      }).join('');
      ticks.querySelectorAll('button').forEach(function (b, i) {
        b.addEventListener('click', function () { setPlaying(false); show(i); });
      });
    }

    function show(i) {
      clearTimeout(timer);
      clearFlies();
      step = i;
      paint(i);
      launch(i);
      var steps = tabs[tab].steps;
      say.textContent = steps[i].say;
      ticks.querySelectorAll('li').forEach(function (l, n) { l.classList.toggle('on', n <= i); l.classList.toggle('now', n === i); });
      if (playing && visible) timer = setTimeout(next, steps[i].ms || 2600);
    }

    function next() {
      var steps = tabs[tab].steps;
      if (step < steps.length - 1) return show(step + 1);
      setPlaying(false);
    }

    function setTab(t) {
      tab = t;
      host.querySelectorAll('.sc-tabs button').forEach(function (b, n) { b.setAttribute('aria-selected', n === t ? 'true' : 'false'); });
      drawTicks();
      show(still ? tabs[t].steps.length - 1 : 0);
    }

    function setPlaying(on) {
      playing = on;
      play.classList.toggle('paused', !on);
      play.setAttribute('aria-label', on ? 'Pause' : 'Play');
      clearTimeout(timer);
      if (on && visible) timer = setTimeout(next, 600);
    }

    play.addEventListener('click', function () {
      var atEnd = step === tabs[tab].steps.length - 1;
      setPlaying(!playing);
      if (playing && atEnd) show(0);
    });

    if (def.tabs) {
      var bar = host.querySelector('.sc-tabs');
      bar.innerHTML = tabs.map(function (t) { return '<button type="button" role="tab">' + t.name + '</button>'; }).join('');
      bar.querySelectorAll('button').forEach(function (b, i) {
        b.addEventListener('click', function () { setPlaying(!still); setTab(i); });
      });
    }

    setPlaying(playing);
    setTab(0);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (list) {
        var was = visible;
        visible = list[0].isIntersecting;
        if (visible && !was) { if (playing) show(0); }
        if (!visible) { clearTimeout(timer); clearFlies(); }
      }, { threshold: .35 }).observe(host);
    } else { visible = true; show(0); }
  }

  document.querySelectorAll('.scene[data-scene]').forEach(function (el) {
    Player(el, SCENES[el.dataset.scene]);
  });

  // Side index: brass marks the section being read.
  var links = document.querySelectorAll('.toc a');
  if (links.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (list) {
      list.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-15% 0px -75% 0px' });
    links.forEach(function (a) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) spy.observe(t);
    });
  }
})();
