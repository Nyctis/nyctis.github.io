/* The hero: a small simulation of the network, always running. Machines list on
   the chain, buyers take offers, pairs dial each other, sealed frames flow over
   the direct link and the job settles on chain. */
(function () {
  var canvas = document.getElementById('live');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INK = '#0B0D12', PAPER = '#F4F2EA', P2 = '#A6AAB0', P3 = '#7C8289', LINE = '#262B32', BRASS = '#B4A27A';
  var W = 0, H = 0, railY = 0, nodes = [], jobs = [], marks = [], blocks = [];
  var clock = 0, lastFrame = 0, nextBlock = 0, nextJob = 0, onScreen = true;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function layout() {
    var d = Math.min(devicePixelRatio || 1, 2), box = canvas.getBoundingClientRect();
    W = box.width; H = box.height;
    canvas.width = W * d; canvas.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    railY = H - 62;
    var stepX = W < 420 ? 84 : 118, stepY = W < 420 ? 74 : 92;
    nodes = []; jobs = []; marks = [];
    for (var y = 44; y < railY - 60; y += stepY) {
      for (var x = 40 + (Math.floor(y / stepY) % 2) * stepX / 2; x < W - 34; x += stepX) {
        var nx = x + rnd(-18, 18), ny = y + rnd(-14, 14);
        if (Math.random() < .2) continue;
        nodes.push({ x: nx, y: ny, kind: Math.random() < .55 ? 'server' : 'mac', busy: false, born: rnd(0, 1800), glow: 0, listed: false });
      }
    }
    blocks = [];
    for (var bx = 96; bx < W + 30; bx += 28) blocks.push({ x: bx, hit: -9999 });
    nodes.filter(function (n) { return n.kind === 'server'; }).forEach(function (n, i) {
      n.listed = true;
      if (!still) setTimeout(function () { fly(n.x, n.y + 14, n.x, railY, 'dot', 900); }, 500 + i * 160);
    });
    if (still) { for (var i = 0; i < 4; i++) startJob(true); }
  }

  function fly(x0, y0, x1, y1, shape, dur, done) {
    marks.push({ x0: x0, y0: y0, x1: x1, y1: y1, at: clock, dur: dur, shape: shape, done: done });
  }

  function curve(j, t) {
    var a = j.b, b = j.s, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var dx = b.x - a.x, dy = b.y - a.y, cx = mx - dy * .16, cy = my + dx * .16, u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: u * u * a.y + 2 * u * t * cy + t * t * b.y };
  }

  function startJob(settled) {
    var free = nodes.filter(function (n) { return !n.busy && clock > n.born; });
    var sellers = free.filter(function (n) { return n.kind === 'server'; }), buyers = free.filter(function (n) { return n.kind === 'mac'; });
    if (!sellers.length || !buyers.length) return;
    var b = pick(buyers), near = sellers.filter(function (n) { return Math.hypot(n.x - b.x, n.y - b.y) < 300; }).sort(function (p, q) {
      return Math.hypot(p.x - b.x, p.y - b.y) - Math.hypot(q.x - b.x, q.y - b.y);
    }).slice(0, 3);
    if (!near.length) return;
    var s = pick(near);
    b.busy = s.busy = true;
    var j = { b: b, s: s, at: clock, phase: 0, reach: settled ? 1 : 0, fade: 1, frames: [], until: clock + rnd(5000, 9500) };
    if (settled) { j.phase = 3; j.until = Infinity; }
    jobs.push(j);
  }

  function step(j) {
    var age = clock - j.at;
    if (j.phase === 0) {            // the buyer escrows, then both post sealed addresses
      j.phase = 1;
      fly(j.b.x, j.b.y + 14, j.b.x, railY, 'coin', 1000);
      j.s.glow = clock;
    } else if (j.phase === 1 && age > 1100) {
      j.phase = 2;
      fly(j.b.x, j.b.y + 14, j.b.x, railY, 'seal', 900);
      fly(j.s.x, j.s.y + 14, j.s.x, railY, 'seal', 900);
    } else if (j.phase === 2 && age > 2200) {      // both dial at once, from either end
      var f = Math.min(1, (age - 2200) / 900);
      j.reach = ease(f);
      if (f >= 1) {
        j.phase = 3;
        fly(j.b.x, j.b.y + 14, j.b.x, railY, 'key', 900);
      }
    } else if (j.phase === 3) {
      if (Math.random() < .09) j.frames.push({ t: 0, way: Math.random() < .55 ? 1 : -1 });
      if (clock > j.until) {
        j.phase = 4; j.closed = clock;
        fly(j.s.x, j.s.y + 14, j.s.x, railY, 'seal', 900, function () {
          fly(j.s.x, railY, j.s.x, j.s.y + 14, 'coin', 900);
        });
      }
    } else if (j.phase === 4) {
      j.fade = Math.max(0, 1 - (clock - j.closed) / 1800);
      if (j.fade <= 0) { j.b.busy = j.s.busy = false; j.done = true; }
    }
    j.frames.forEach(function (f) { f.t += .022; });
    j.frames = j.frames.filter(function (f) { return f.t < 1; });
  }

  function shape(kind, x, y, r) {
    if (kind === 'coin') { ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.3); ctx.fillStyle = INK; ctx.fill(); ctx.strokeStyle = BRASS; ctx.lineWidth = 1.6; ctx.stroke(); }
    else if (kind === 'key') { ctx.fillStyle = BRASS; ctx.fillRect(x - 4, y - 4, 8, 8); }
    else if (kind === 'seal') { ctx.fillStyle = INK; ctx.fillRect(x - 4, y - 4, 8, 8); ctx.strokeStyle = PAPER; ctx.lineWidth = 1.2; ctx.strokeRect(x - 4, y - 4, 8, 8); }
    else { ctx.beginPath(); ctx.arc(x, y, r || 2.5, 0, 6.3); ctx.fillStyle = P2; ctx.fill(); }
  }

  function drawNode(n) {
    var a = Math.min(1, Math.max(0, (clock - n.born) / 700));
    if (!a) return;
    ctx.globalAlpha = a;
    var hot = n.busy, stroke = hot ? PAPER : P3;
    ctx.lineWidth = 1; ctx.strokeStyle = stroke; ctx.fillStyle = hot ? '#1A1E24' : '#12151A';
    if (n.kind === 'server') {
      ctx.fillRect(n.x - 15, n.y - 10, 30, 20); ctx.strokeRect(n.x - 15, n.y - 10, 30, 20);
      ctx.beginPath(); ctx.moveTo(n.x - 9, n.y - 3); ctx.lineTo(n.x + 6, n.y - 3); ctx.moveTo(n.x - 9, n.y + 3); ctx.lineTo(n.x + 6, n.y + 3); ctx.stroke();
      ctx.fillStyle = hot ? BRASS : P3; ctx.fillRect(n.x + 9, n.y - 4, 2, 2);
    } else {
      ctx.fillRect(n.x - 12, n.y - 9, 24, 15); ctx.strokeRect(n.x - 12, n.y - 9, 24, 15);
      ctx.beginPath(); ctx.moveTo(n.x - 16, n.y + 9); ctx.lineTo(n.x + 16, n.y + 9); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawJob(j) {
    if (j.phase < 2) return;
    var steps = 26, reach = j.reach / 2;
    ctx.globalAlpha = j.fade; ctx.strokeStyle = j.phase === 3 ? BRASS : P3; ctx.lineWidth = 1.1;
    [[0, reach], [1 - reach, 1]].forEach(function (seg) {
      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var p = curve(j, seg[0] + (seg[1] - seg[0]) * i / steps);
        if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      }
      ctx.stroke();
    });
    j.frames.forEach(function (f) {
      var p = curve(j, f.way > 0 ? f.t : 1 - f.t);
      ctx.fillStyle = PAPER; ctx.fillRect(p.x - 3.5, p.y - 2, 7, 4);
    });
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    jobs.forEach(drawJob);
    nodes.forEach(drawNode);

    // the chain: blocks march left and light up when a transaction lands
    ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, railY - 14); ctx.lineTo(W, railY - 14); ctx.moveTo(0, railY + 26); ctx.lineTo(W, railY + 26); ctx.stroke();
    blocks.forEach(function (b) {
      var hit = Math.max(0, 1 - (clock - b.hit) / 1400);
      ctx.fillStyle = hit ? BRASS : '#12151A'; ctx.globalAlpha = hit ? .25 + hit * .75 : 1;
      ctx.fillRect(b.x, railY - 4, 18, 18);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = hit ? BRASS : LINE; ctx.strokeRect(b.x, railY - 4, 18, 18);
    });
    marks.forEach(function (m) {
      var p = Math.min(1, (clock - m.at) / m.dur), e = ease(p);
      shape(m.shape, m.x0 + (m.x1 - m.x0) * e, m.y0 + (m.y1 - m.y0) * e);
    });

    ctx.fillStyle = INK; ctx.fillRect(0, railY - 13, 88, 38);
    ctx.fillStyle = P2; ctx.font = '500 12px "IBM Plex Sans", sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Solana', 24, railY + 9);

    ctx.font = '400 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = P3; ctx.textAlign = 'right'; ctx.fillText('Illustration', W - 24, railY + 44);
  }

  function advance(dt) {
    clock += dt;
    blocks.forEach(function (b) { b.x -= dt * .012; });
    if (blocks.length && blocks[0].x < 70) { var first = blocks.shift(); first.x = blocks[blocks.length - 1].x + 28; first.hit = -9999; blocks.push(first); }
    var cap = Math.max(2, Math.floor(nodes.length / 7));
    if (clock > nextJob && jobs.length < cap) { startJob(); nextJob = clock + rnd(500, 1500); }
    jobs.forEach(step);
    jobs = jobs.filter(function (j) { return !j.done; });
    marks = marks.filter(function (m) {
      if (clock - m.at < m.dur) return true;
      if (m.y1 === railY) {
        var near = blocks.reduce(function (p, b) { return Math.abs(b.x + 9 - m.x1) < Math.abs(p.x + 9 - m.x1) ? b : p; }, blocks[0]);
        near.hit = clock;
      }
      if (m.done) m.done();
      return false;
    });
  }

  function tick(now) {
    if (onScreen && !document.hidden) {
      var dt = Math.min(64, now - lastFrame);
      if (dt >= 30) { advance(dt); draw(); lastFrame = now; }
    } else lastFrame = now;
    requestAnimationFrame(tick);
  }

  layout();
  if (still) { clock = 6000; draw(); } else {
    for (var i = 0; i < 90; i++) advance(40);   // start with the network already moving
    draw();
    requestAnimationFrame(function (t) { lastFrame = t; tick(t); });
  }
  var resizeTimer = 0;
  addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { layout(); draw(); }, 200); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (l) { onScreen = l[0].isIntersecting; }).observe(canvas);
})();
