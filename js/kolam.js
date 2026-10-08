/* Kolam generator: a dot grid (pulli) with mirror-symmetric looping lines.
   Each cell between four dots holds two quarter-arcs that wrap around a pair of
   diagonal dots (a Truchet-style tile). Choices are made for one quadrant and
   mirrored, so the pattern is symmetric like a hand-drawn kolam. */
(function () {
  var svg = document.getElementById('kolam');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var N = 12;                       // cells per side (even, so a dot sits at the centre)
  var S = 40;                       // cell size in viewBox units
  var PAD = 24;
  var R = S / 2;
  var size = N * S + PAD * 2;
  svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dotsG = document.createElementNS(NS, 'g');
  var linesG = document.createElementNS(NS, 'g');
  linesG.setAttribute('class', 'kolam-lines');
  svg.appendChild(linesG);
  svg.appendChild(dotsG);

  var dots = [];
  for (var j = 0; j <= N; j++) {
    for (var i = 0; i <= N; i++) {
      var c = document.createElementNS(NS, 'circle');
      var x = PAD + i * S, y = PAD + j * S;
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 2.2);
      c.setAttribute('class', 'kolam-dot');
      dotsG.appendChild(c);
      dots.push({ el: c, x: x, y: y });
    }
  }

  function rng(seed) {              // mulberry32
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Arc around corner (cx,cy) from midpoint A to midpoint B, radius R
  function arc(cx, cy, a0, a1) {
    var x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    var x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    var sweep = a1 > a0 ? 1 : 0;
    return 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) + 'A' + R + ' ' + R + ' 0 0 ' + sweep + ' ' + x1.toFixed(2) + ' ' + y1.toFixed(2);
  }
  var H = Math.PI / 2;
  // corner index: 0 TL, 1 TR, 2 BR, 3 BL ; angles of the quarter that lies inside the cell
  var quarter = [[0, H], [H, 2 * H], [2 * H, 3 * H], [3 * H, 4 * H]];
  var cornerOff = [[0, 0], [1, 0], [1, 1], [0, 1]];

  var seed = 0, current = 0;
  function build(s) {
    current = s;
    var rand = rng(s);
    var half = N / 2;
    var tile = [];                   // tile[j][i]: 0 empty, 1 = TL+BR arcs, 2 = TR+BL arcs
    var q = [];
    var density = 0.78 + rand() * 0.18;
    var bias = 0.35 + rand() * 0.3;
    for (var j = 0; j < half; j++) {
      q[j] = [];
      for (var i = 0; i < half; i++) {
        var d = Math.hypot(i + 0.5 - half, j + 0.5 - half);
        if (d > half * 1.02 || rand() > density) q[j][i] = 0;
        else q[j][i] = rand() < bias ? 1 : 2;
      }
    }
    // mirror into four quadrants; each reflection swaps the diagonal type
    var flip = function (t) { return t === 0 ? 0 : 3 - t; };
    for (var y = 0; y < N; y++) {
      tile[y] = [];
      for (var x = 0; x < N; x++) {
        var qx = x < half ? x : N - 1 - x;
        var qy = y < half ? y : N - 1 - y;
        var t = q[qy][qx];
        if (x >= half) t = flip(t);
        if (y >= half) t = flip(t);
        tile[y][x] = t;
      }
    }

    while (linesG.firstChild) linesG.removeChild(linesG.firstChild);
    var mid = PAD + (N * S) / 2;
    for (var cy = 0; cy < N; cy++) {
      for (var cx = 0; cx < N; cx++) {
        var t2 = tile[cy][cx];
        if (!t2) continue;
        var corners = t2 === 1 ? [0, 2] : [1, 3];
        for (var k = 0; k < corners.length; k++) {
          var ci = corners[k];
          var px = PAD + (cx + cornerOff[ci][0]) * S;
          var py = PAD + (cy + cornerOff[ci][1]) * S;
          var p = document.createElementNS(NS, 'path');
          p.setAttribute('d', arc(px, py, quarter[ci][0], quarter[ci][1]));
          p.setAttribute('pathLength', '1');
          var dist = Math.hypot(px - mid, py - mid) / (N * S / 2);
          p.style.setProperty('--d', (dist * 1.1 + rand() * 0.25).toFixed(2) + 's');
          linesG.appendChild(p);
        }
      }
    }
    linesG.classList.remove('is-drawn', 'is-drawing');
    if (reduce) {
      linesG.classList.add('is-drawn');
    } else {
      void linesG.getBoundingClientRect();   // restart animation
      linesG.classList.add('is-drawing');
    }
  }

  function next() { build((Math.random() * 1e9) | 0); }
  build(20260 + 7); // fixed first seed so the first paint is the same for everyone

  var btn = document.getElementById('kolam-redraw');
  if (btn) btn.addEventListener('click', next);
  svg.parentNode.addEventListener('click', function (e) {
    if (e.target.closest('a,button')) return;
    next();
  });

  // Dots near the pointer brighten
  if (!reduce) {
    var raf = 0, pt = null;
    var stage = svg.parentNode;
    var apply = function () {
      raf = 0;
      var r = svg.getBoundingClientRect();
      var k = size / r.width;
      var mx = pt ? (pt.x - r.left) * k : -999, my = pt ? (pt.y - r.top) * k : -999;
      for (var i = 0; i < dots.length; i++) {
        var d = Math.hypot(dots[i].x - mx, dots[i].y - my);
        var w = Math.max(0, 1 - d / 90);
        dots[i].el.style.setProperty('--w', w.toFixed(2));
      }
    };
    var schedule = function () { if (!raf) raf = requestAnimationFrame(apply); };
    stage.addEventListener('pointermove', function (e) { pt = { x: e.clientX, y: e.clientY }; schedule(); });
    stage.addEventListener('pointerleave', function () { pt = null; schedule(); });
  }
})();
