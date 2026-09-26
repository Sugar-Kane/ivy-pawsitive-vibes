/*
 * THE BEGINNING — a procedural 2.39:1 short about the first age of Greek myth.
 *
 * Every frame is a pure function of time: FILM.render(ctx, t). Nothing reads
 * the clock or Math.random while drawing, so the player and the offline
 * frame-capture produce identical pictures. Picture is cut against the
 * narration cues in build/narration_cues.json.
 */
(function () {
  'use strict';

  const W = 1920, H = 804;
  const PICTURE_END = 63.4;   // cut to black; thunder rings on under black
  const DURATION = 65.0;

  // ---------------------------------------------------------------- palette
  const C = {
    obsidian: '#050507', aegean: '#123a5c', indigo: '#141a3a', midnight: '#0a0f24',
    violet: '#2a1a44', marble: '#e8dfcc', ivory: '#f2ead8', terracotta: '#b4532a',
    clay: '#8e3d1f', bronze: '#a8733a', gold: '#d4a64a', paleGold: '#f3d9a0',
    blood: '#7a1612', crimson: '#9e2418', amber: '#ffb45a', ochre: '#b98a3e',
    olive: '#5d6130', stone: '#a79c86', limestone: '#cfc3a6', lightning: '#dfeaff',
  };

  // ------------------------------------------------------------------ math
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const smooth = (x) => x * x * (3 - 2 * x);
  const ss = (t, a, b) => smooth(seg(t, a, b));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeIn = (x) => x * x * x;
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const TAU = Math.PI * 2;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Stateless hash for per-frame flicker.
  function hash(a, b = 0) {
    let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  // Smooth 1D value noise.
  function noise1(x, seed = 0) {
    const i = Math.floor(x), f = x - i;
    const a = hash(i, seed), b = hash(i + 1, seed);
    return lerp(a, b, smooth(f));
  }
  function fbm1(x, seed = 0, oct = 5) {
    let v = 0, amp = 0.5, f = 1;
    for (let o = 0; o < oct; o++) { v += amp * noise1(x * f, seed + o * 17); amp *= 0.5; f *= 2.03; }
    return v;
  }
  // Periodic 2D value noise for tileable textures.
  function makeNoise2(seed) {
    const r = mulberry32(seed);
    const N = 256, tab = new Float32Array(N * N);
    for (let i = 0; i < tab.length; i++) tab[i] = r();
    return function (x, y, period) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const fx = smooth(x - xi), fy = smooth(y - yi);
      const p = period || N;
      const x0 = ((xi % p) + p) % p, x1 = (x0 + 1) % p;
      const y0 = ((yi % p) + p) % p, y1 = (y0 + 1) % p;
      const a = tab[y0 * N + x0], b = tab[y0 * N + x1];
      const c = tab[y1 * N + x0], d = tab[y1 * N + x1];
      return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
    };
  }

  // ----------------------------------------------------------- color utils
  function hexRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(h, a) {
    const [r, g, b] = hexRgb(h);
    return `rgba(${r},${g},${b},${a})`;
  }
  function mix(h1, h2, t) {
    const a = hexRgb(h1), b = hexRgb(h2);
    const c = a.map((v, i) => Math.round(lerp(v, b[i], clamp(t))));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  // ------------------------------------------------------ canvas utilities
  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    return c;
  }
  // A small pool so per-frame sprites don't churn the allocator.
  const pool = [];
  function borrow(w, h) {
    let c = pool.pop() || canvas(w, h);
    if (c.width !== Math.ceil(w) || c.height !== Math.ceil(h)) { c.width = Math.ceil(w); c.height = Math.ceil(h); }
    else c.getContext('2d').clearRect(0, 0, c.width, c.height);
    const g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    return c;
  }
  function giveBack(c) { if (pool.length < 24) pool.push(c); }

  function glow(g, x, y, r, color, a = 1) {
    if (r <= 0 || a <= 0) return;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgba(color, a));
    gr.addColorStop(0.35, rgba(color, a * 0.45));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function vgrad(g, y0, y1, stops) {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    return gr;
  }
  function fillAll(g, style, a = 1) {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.fillStyle = style;
    g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  }
  function catmull(pts, n = 8) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
        ]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function poly(g, pts, close) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    if (close) g.closePath();
  }

  // --------------------------------------------------------------- textures
  const TX = {};
  function buildTextures() {
    const n1 = makeNoise2(11), n2 = makeNoise2(29);

    // Soft cloud puffs (alpha only). Several variants for variety.
    TX.puffs = [];
    for (let v = 0; v < 5; v++) {
      const S = 256, c = canvas(S, S), g = c.getContext('2d');
      const img = g.createImageData(S, S), d = img.data, nz = makeNoise2(100 + v);
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const dx = x / S - 0.5, dy = y / S - 0.5;
        const r = Math.sqrt(dx * dx + dy * dy) * 2;
        let f = 0, amp = 0.55, fr = 4;
        for (let o = 0; o < 5; o++) { f += amp * nz(x / S * fr, y / S * fr, fr); amp *= 0.5; fr *= 2; }
        const edge = clamp(1 - r * r * (1.1 + 0.4 * f));
        const a = clamp((f - 0.28) * 1.9) * edge;
        const i = (y * S + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = a * 255;
      }
      g.putImageData(img, 0, 0);
      TX.puffs.push(c);
    }

    // Tileable grain frames.
    TX.grain = [];
    for (let v = 0; v < 6; v++) {
      const S = 256, c = canvas(S, S), g = c.getContext('2d');
      const img = g.createImageData(S, S), d = img.data, r = mulberry32(900 + v);
      for (let i = 0; i < S * S; i++) {
        const k = (r() + r() + r()) / 3 * 255;
        d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = k; d[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      TX.grain.push(c);
    }

    // Stone: tileable fbm with pits and strata, grayscale.
    {
      const S = 512, c = canvas(S, S), g = c.getContext('2d');
      const img = g.createImageData(S, S), d = img.data;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        let f = 0, amp = 0.5, fr = 8;
        for (let o = 0; o < 6; o++) { f += amp * n1(x / S * fr, y / S * fr, fr); amp *= 0.52; fr *= 2; }
        const strata = 0.5 + 0.5 * Math.sin((y / S) * 38 + f * 6);
        const pit = n2(x / S * 64, y / S * 64, 64) > 0.86 ? -0.25 : 0;
        const v = clamp(0.35 + f * 0.6 + strata * 0.08 + pit) * 255;
        const i = (y * S + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      TX.stone = c;
    }

    // Skin: fine pores + soft mottling.
    {
      const S = 512, c = canvas(S, S), g = c.getContext('2d');
      const img = g.createImageData(S, S), d = img.data;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const m = n1(x / S * 6, y / S * 6, 6) * 0.6 + n1(x / S * 24, y / S * 24, 24) * 0.25;
        const pore = n2(x / S * 180, y / S * 180, 180);
        const v = clamp(0.62 + (m - 0.42) * 0.5 - (pore > 0.8 ? 0.1 : 0)) * 255;
        const i = (y * S + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      TX.skin = c;
    }
  }

  const tintCache = new Map();
  function tinted(src, color) {
    const key = src.__id + color;
    if (tintCache.has(key)) return tintCache.get(key);
    const c = canvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
    tintCache.set(key, c);
    return c;
  }
  let texId = 0;
  function tagTextures() {
    TX.puffs.forEach((p) => (p.__id = 'p' + texId++));
  }
  function puff(g, i, color, x, y, w, h, a, rot = 0) {
    if (a <= 0.002) return;
    const s = tinted(TX.puffs[i % TX.puffs.length], color);
    g.save();
    g.globalAlpha = clamp(a);
    g.translate(x, y); if (rot) g.rotate(rot);
    g.drawImage(s, -w / 2, -h / 2, w, h);
    g.restore();
  }
  function textureFill(g, tex, alpha, op, scale = 1, ox = 0, oy = 0) {
    g.save();
    g.globalAlpha = alpha; g.globalCompositeOperation = op;
    const pat = g.createPattern(tex, 'repeat');
    pat.setTransform(new DOMMatrix().translate(ox, oy).scale(scale));
    g.fillStyle = pat;
    g.fillRect(0, 0, W, H);
    g.restore();
  }

  // ------------------------------------------------------------- motifs
  // Greek key (meander) band. u = module size.
  function meander(g, x0, y0, w, u, color, lw) {
    g.save();
    g.strokeStyle = color; g.lineWidth = lw || u * 0.32; g.lineJoin = 'miter'; g.lineCap = 'square';
    const step = u * 4;
    g.beginPath();
    for (let x = x0; x < x0 + w; x += step) {
      const p = [[0, 4], [0, 0], [3, 0], [3, 3], [1, 3], [1, 1], [2, 1], [2, 2]];
      g.moveTo(x + p[0][0] * u, y0 + p[0][1] * u);
      for (let i = 1; i < p.length; i++) g.lineTo(x + p[i][0] * u, y0 + p[i][1] * u);
      g.moveTo(x, y0 + 4 * u); g.lineTo(x + step, y0 + 4 * u);
    }
    g.moveTo(x0, y0 - u * 0.6); g.lineTo(x0 + w, y0 - u * 0.6);
    g.moveTo(x0, y0 + u * 4.6); g.lineTo(x0 + w, y0 + u * 4.6);
    g.stroke();
    g.restore();
  }
  // Tongue / egg pattern band used on pottery.
  function tongues(g, x0, y0, w, u, color) {
    g.save(); g.fillStyle = color;
    for (let x = x0; x < x0 + w; x += u * 1.6) {
      g.beginPath();
      g.moveTo(x, y0); g.lineTo(x + u * 1.2, y0);
      g.quadraticCurveTo(x + u * 1.2, y0 + u * 1.9, x + u * 0.6, y0 + u * 2.1);
      g.quadraticCurveTo(x, y0 + u * 1.9, x, y0);
      g.fill();
    }
    g.restore();
  }

  // --------------------------------------------------------------- figures
  // Draws a classical draped figure as a white mask in local units: height
  // ~100, feet at y=0, up is -y, facing +x when pose.face = 1.
  function figureMask(g, p) {
    const face = p.face || 1;
    const wind = p.wind || 0;
    const bulk = p.bulk || 1;
    const pts = {};
    g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    g.lineCap = 'round'; g.lineJoin = 'round';

    const sh = 11 * bulk, wa = 7.6 * bulk, hem = (13 + (p.flare || 0)) * bulk;
    const seatY = p.seated ? -42 : 0;

    // Robe / body.
    g.beginPath();
    g.moveTo(-sh, -81);
    g.quadraticCurveTo(-sh - 1.5, -70, -wa, -58);
    if (p.seated) {
      // Seated: lap forward, shins down.
      g.quadraticCurveTo(-wa - 2, -46, -wa, seatY);
      g.lineTo(18 * face + (face > 0 ? 0 : -2), seatY - 3);
      g.lineTo(20 * face, seatY);
      g.lineTo(20 * face, -2);
      g.lineTo(26 * face, 0);
      g.lineTo(12 * face, 0);
      g.lineTo(12 * face, seatY + 6);
      g.lineTo(wa, seatY + 4);
    } else {
      const sway = wind * 4;
      g.quadraticCurveTo(-wa - 3 + sway, -30, -hem + sway * 1.5, 0);
      // Hem with folds.
      const n = 7;
      for (let i = 1; i <= n; i++) {
        const x = lerp(-hem + sway * 1.5, hem + sway * 2, i / n);
        g.lineTo(x - 1.2, (i % 2 ? 1.4 : -0.6) + Math.sin(i * 1.7 + wind * 6) * wind * 1.5);
      }
      g.quadraticCurveTo(wa + 3 + sway, -30, wa, -58);
    }
    g.quadraticCurveTo(sh + 1.5, -70, sh, -81);
    g.quadraticCurveTo(0, -84, -sh, -81);
    g.fill();

    // Cloak edge streaming behind in wind.
    if (p.cloak) {
      const back = -face;
      g.beginPath();
      g.moveTo(back * 9, -80);
      g.bezierCurveTo(back * (17 + wind * 4), -70 + Math.sin(wind * 3) * 3, back * (18 + wind * 7), -35, back * (15 + wind * 8), -3);
      g.lineTo(back * 9, -2);
      g.lineTo(back * 8, -60);
      g.fill();
    }

    // Neck + head.
    const hx = (p.headDx || 0) * face, hy = -91 + (p.headDy || 0);
    g.fillRect(-2.4, -88, 4.8, 8);
    g.save();
    g.translate(hx, hy); g.rotate((p.headTilt || 0) * face);
    g.beginPath(); g.ellipse(0, 0, 5.3, 6.5, 0, 0, TAU); g.fill();
    // Profile nose & chin so silhouettes read as faces, not balls.
    g.beginPath();
    g.moveTo(3.8 * face, -3); g.lineTo(6.6 * face, 1.2); g.lineTo(4.4 * face, 2.2); g.lineTo(4.6 * face, 4.8); g.lineTo(2 * face, 6.4);
    g.lineTo(0, 3); g.fill();
    if (p.beard) {
      g.beginPath(); g.ellipse(2.2 * face, 6.2, 3.6, 4.6, 0.3 * face, 0, TAU); g.fill();
    }
    if (p.hair) {
      const L = p.hair; // hair length
      g.beginPath();
      g.moveTo(-1 * face, -6.8);
      g.bezierCurveTo(-7 * face, -6, -7.5 * face - wind * 3 * face, 4, -6 * face - wind * 5 * face, L);
      g.lineTo(-1.5 * face, L - 2);
      g.lineTo(1 * face, 0);
      g.fill();
    }
    if (p.veil) {
      g.beginPath();
      g.moveTo(3 * face, -7.5);
      g.bezierCurveTo(-4 * face, -10, -9 * face, -2, -12 * face, 14);
      g.lineTo(-2 * face, 10); g.fill();
    }
    g.restore();
    pts.head = [hx, hy];

    // Arms. Angles from hanging straight down; positive swings forward/up.
    const arm = (side, a, e, key) => {
      const sx = side * face * 10, sy = -80;
      const d1 = [Math.sin(a) * face, Math.cos(a)];
      const ex = sx + d1[0] * 16, ey = sy + d1[1] * 16;
      const a2 = a + e;
      const d2 = [Math.sin(a2) * face, Math.cos(a2)];
      const hxx = ex + d2[0] * 15, hyy = ey + d2[1] * 15;
      g.lineWidth = 8.4 * bulk; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
      g.lineWidth = 6.8 * bulk; g.beginPath(); g.moveTo(ex, ey); g.lineTo((ex + hxx) / 2, (ey + hyy) / 2); g.stroke();
      g.lineWidth = 5.4 * bulk; g.beginPath(); g.moveTo((ex + hxx) / 2, (ey + hyy) / 2); g.lineTo(hxx, hyy); g.stroke();
      g.beginPath(); g.arc(hxx + d2[0] * 1.6, hyy + d2[1] * 1.6, 2.9 * bulk, 0, TAU); g.fill();
      pts[key] = [hxx + d2[0] * 2.5, hyy + d2[1] * 2.5];
      pts[key + 'Band'] = [(sx + ex) / 2, (sy + ey) / 2];
      pts[key + 'Dir'] = d2;
    };
    arm(1, p.aF ?? 0.15, p.eF ?? 0.1, 'handF');
    arm(-1, p.aB ?? -0.1, p.eB ?? 0.05, 'handB');
    // Extra arms (the Hundred-Handed).
    if (p.many) {
      p.many.forEach(([a, e, side], i) => {
        const sx = side * 9, sy = -78 + (i % 4) * 3;
        const d1 = [Math.sin(a) * side, Math.cos(a)];
        const ex = sx + d1[0] * 17, ey = sy + d1[1] * 17;
        const d2 = [Math.sin(a + e) * side, Math.cos(a + e)];
        g.lineWidth = 5.4; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(ex + d2[0] * 15, ey + d2[1] * 15); g.stroke();
        g.beginPath(); g.arc(ex + d2[0] * 16.5, ey + d2[1] * 16.5, 2.6, 0, TAU); g.fill();
      });
    }
    // Sickle in the forward hand.
    if (p.sickle) {
      const [x, y] = pts.handF, d = pts.handFDir;
      const ang = Math.atan2(d[1], d[0]);
      g.save(); g.translate(x, y); g.rotate(ang);
      g.fillRect(0, -1.2, 11, 2.4);
      g.beginPath();
      g.arc(16, (p.sickle > 0 ? -8 : 8) * face, 10, 0, TAU * 0.5, face < 0);
      g.arc(17, (p.sickle > 0 ? -9.5 : 9.5) * face, 7.5, TAU * 0.5, 0, face > 0);
      g.fill();
      g.restore();
    }
    return pts;
  }

  /*
   * Render a figure at (x, y) = feet position, `h` px tall.
   * o: { fill, rim, rimDir:[dx,dy], rimW, rimA, alpha, blur, glowRim }
   */
  function drawFigure(g, pose, x, y, h, o = {}) {
    const s = h / 100;
    const padL = 70, padR = 70, padT = 150, padB = 12;
    const cw = (padL + padR) * s, ch = (padT + padB) * s;
    const m = borrow(cw, ch), mg = m.getContext('2d');
    mg.setTransform(s, 0, 0, s, padL * s, padT * s);
    const pts = figureMask(mg, pose);
    const col = borrow(cw, ch), cg = col.getContext('2d');
    cg.drawImage(m, 0, 0);
    cg.globalCompositeOperation = 'source-in';
    cg.fillStyle = o.fill || '#000'; cg.fillRect(0, 0, cw, ch);
    if (o.shade) {
      // Soft body shading from the rim side.
      cg.globalCompositeOperation = 'source-atop';
      const [dx, dy] = o.rimDir || [1, -1];
      const gr = cg.createLinearGradient(cw / 2 - dx * cw / 2, ch / 2 - dy * ch / 2, cw / 2 + dx * cw / 2, ch / 2 + dy * ch / 2);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, o.shade);
      cg.fillStyle = gr; cg.fillRect(0, 0, cw, ch);
    }
    g.save();
    g.globalAlpha = o.alpha ?? 1;
    if (o.blur) g.filter = `blur(${o.blur}px)`;
    const X = x - padL * s, Y = y - padT * s;
    g.drawImage(col, X, Y);
    g.filter = 'none';
    if (o.rim) {
      const r = borrow(cw, ch), rg = r.getContext('2d');
      rg.drawImage(m, 0, 0);
      rg.globalCompositeOperation = 'source-in';
      rg.fillStyle = o.rim; rg.fillRect(0, 0, cw, ch);
      rg.globalCompositeOperation = 'destination-out';
      const [dx, dy] = o.rimDir || [1, -1];
      const w = (o.rimW || 1.2) * s;
      rg.drawImage(m, -dx * w, -dy * w);
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = (o.alpha ?? 1) * (o.rimA ?? 1);
      if (o.glowRim) { g.filter = `blur(${o.glowRim}px)`; g.drawImage(r, X, Y); g.filter = 'none'; }
      g.drawImage(r, X, Y);
      giveBack(r);
    }
    g.restore();
    giveBack(m); giveBack(col);
    const out = {};
    for (const k in pts) if (Array.isArray(pts[k]) && k.indexOf('Dir') < 0) out[k] = [x + pts[k][0] * s, y + pts[k][1] * s];
    return out;
  }

  // ---------------------------------------------------------- faces
  // Classical profile, facing +x, y down; roughly 120 units tall.
  const PROFILE = [
    [-30, -66], [-12, -64], [0, -58], [6, -46], [8.5, -32], [10.5, -22], [9.6, -16],
    [12.6, -6], [16.4, 5], [20.4, 14.5], [19.4, 17.6], [12.2, 20.2], [11, 22.5],
    [14.2, 27.5], [13.6, 29.8], [11.2, 31.2], [13, 34.2], [11.2, 38.2], [7.8, 41.2],
    [11, 47], [9.6, 52.5], [3.5, 56.5], [-7, 58.5], [-10, 66], [-12, 84],
  ];
  const PROFILE_S = catmull(PROFILE, 6);
  // Back of the skull for closed face shapes.
  const SKULL = catmull([[-12, 84], [-26, 80], [-40, 62], [-52, 30], [-56, -10], [-50, -44], [-30, -66]], 6);

  function profileShape(g) { poly(g, PROFILE_S.concat(SKULL), true); }
  // Expression lines: e = { lid 0..1 open, brow (-1 sorrow .. +1 anger), mouth 0..1 }
  function profileFeatures(g, e, color, lw) {
    g.save(); g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round';
    const brow = e.brow || 0;
    // Brow: sorrow lifts the inner end, anger drives it down toward the nose.
    g.beginPath();
    g.moveTo(8.2, -22 + brow * 3.2);
    g.quadraticCurveTo(-1, -27 - brow * 1.5 + (brow < 0 ? -2 : 0), -12, -24 - brow * 0.5);
    g.stroke();
    // Eye.
    const open = e.lid ?? 0;
    g.beginPath();
    g.moveTo(5.5, -12.5);
    g.quadraticCurveTo(0, -14 - open * 4.2, -5, -12.8);
    g.stroke();
    if (open > 0.05) {
      g.beginPath(); g.moveTo(5, -12); g.quadraticCurveTo(0, -9.8, -4.5, -12); g.stroke();
    }
    // Mouth.
    g.beginPath(); g.moveTo(11.4, 31.2); g.quadraticCurveTo(7, 31.5 + (e.mouth || 0) * 2 - brow * 0.8, 4, 31.2 + brow * 1.2); g.stroke();
    // Nostril.
    g.beginPath(); g.moveTo(15, 16.5); g.quadraticCurveTo(12, 15, 11.5, 18); g.stroke();
    g.restore();
  }

  // Frontal eye used for the Cyclops and the infant Zeus.
  function drawEye(g, cx, cy, w, e) {
    const open = clamp(e.open);
    const hu = w * (e.openH || 0.22) * open, hd = w * 0.13 * Math.max(open, 0.04);
    const L = [cx - w / 2, cy + w * 0.02], R = [cx + w / 2, cy - w * 0.03];
    const eyePath = () => {
      g.beginPath();
      g.moveTo(L[0], L[1]);
      g.bezierCurveTo(cx - w * 0.28, cy - hu * 1.35, cx + w * 0.22, cy - hu * 1.4, R[0], R[1]);
      g.bezierCurveTo(cx + w * 0.25, cy + hd * 1.3, cx - w * 0.25, cy + hd * 1.35, L[0], L[1]);
      g.closePath();
    };
    // Skin.
    g.save();
    g.fillStyle = e.skin; g.fillRect(0, 0, W, H);
    textureFill(g, TX.skin, e.skinTex ?? 0.5, 'multiply', e.texScale || 2.2, cx * 0.3, cy * 0.2);
    // Socket shading.
    const sg = g.createRadialGradient(cx, cy, w * 0.2, cx, cy, w * 1.1);
    sg.addColorStop(0, rgba('#000000', 0.35)); sg.addColorStop(1, rgba('#000000', 0));
    g.fillStyle = sg; g.fillRect(0, 0, W, H);
    // Lid crease + wrinkles.
    g.strokeStyle = rgba('#000000', 0.28); g.lineWidth = w * 0.012;
    g.beginPath(); g.moveTo(cx - w * 0.46, cy - w * 0.08);
    g.bezierCurveTo(cx - w * 0.2, cy - w * 0.32 - hu * 0.3, cx + w * 0.25, cy - w * 0.34 - hu * 0.3, cx + w * 0.5, cy - w * 0.12);
    g.stroke();
    if (e.wrinkles) {
      g.strokeStyle = rgba('#000000', 0.16); g.lineWidth = w * 0.006;
      for (let i = 0; i < e.wrinkles; i++) {
        const k = i / e.wrinkles;
        g.beginPath();
        g.moveTo(cx - w * 0.52 - k * w * 0.1, cy + w * (0.06 + k * 0.22));
        g.quadraticCurveTo(cx, cy + w * (0.2 + k * 0.28), cx + w * 0.55, cy + w * (0.02 + k * 0.2));
        g.stroke();
      }
    }
    // Eyeball.
    if (open > 0.01) {
      g.save(); eyePath(); g.clip();
      const sc = g.createRadialGradient(cx, cy, 0, cx, cy, w * 0.55);
      sc.addColorStop(0, e.sclera); sc.addColorStop(1, mix(e.sclera, '#2a1a14', 0.7));
      g.fillStyle = sc; g.fillRect(cx - w, cy - w, w * 2, w * 2);
      const ir = w * (e.irisR || 0.2), ix = cx + (e.look || 0) * w * 0.1, iy = cy - w * 0.01;
      const ig = g.createRadialGradient(ix, iy, ir * 0.3, ix, iy, ir);
      ig.addColorStop(0, e.iris[0]); ig.addColorStop(0.7, e.iris[1]); ig.addColorStop(1, e.iris[2]);
      g.fillStyle = ig; g.beginPath(); g.arc(ix, iy, ir, 0, TAU); g.fill();
      // Iris fibres.
      const rr = mulberry32(e.seed || 5);
      g.lineWidth = w * 0.003;
      for (let i = 0; i < 140; i++) {
        const a = rr() * TAU, r0 = ir * (0.42 + rr() * 0.1), r1 = ir * (0.75 + rr() * 0.25);
        g.strokeStyle = rgba(rr() > 0.5 ? e.iris[0] : '#000000', 0.25);
        g.beginPath(); g.moveTo(ix + Math.cos(a) * r0, iy + Math.sin(a) * r0);
        g.lineTo(ix + Math.cos(a + 0.05) * r1, iy + Math.sin(a + 0.05) * r1); g.stroke();
      }
      g.fillStyle = '#030303'; g.beginPath(); g.arc(ix, iy, ir * (e.pupil || 0.42), 0, TAU); g.fill();
      if (e.reflect) e.reflect(g, ix, iy, ir);
      // Specular: a soft window of light, and a wet sheen.
      g.globalCompositeOperation = 'lighter';
      glow(g, ix - ir * 0.35, iy - ir * 0.38, ir * 0.35, e.spec || '#ffffff', 0.55);
      g.fillStyle = rgba('#ffffff', 0.7);
      g.beginPath(); g.ellipse(ix - ir * 0.36, iy - ir * 0.4, ir * 0.1, ir * 0.07, -0.5, 0, TAU); g.fill();
      g.globalCompositeOperation = 'source-over';
      // Upper-lid shadow on the eyeball.
      const ls = g.createLinearGradient(0, cy - hu * 1.1, 0, cy + hu * 0.2);
      ls.addColorStop(0, rgba('#000000', 0.75)); ls.addColorStop(1, rgba('#000000', 0));
      g.fillStyle = ls; g.fillRect(cx - w, cy - w, w * 2, w * 2);
      g.restore();
    }
    // Lid margin + lashes.
    g.strokeStyle = rgba('#1a0d08', 0.85); g.lineWidth = w * 0.012 + open * w * 0.006;
    g.beginPath(); g.moveTo(L[0], L[1]);
    g.bezierCurveTo(cx - w * 0.28, cy - hu * 1.35, cx + w * 0.22, cy - hu * 1.4, R[0], R[1]); g.stroke();
    g.lineWidth = w * 0.006; g.strokeStyle = rgba('#1a0d08', 0.5);
    g.beginPath(); g.moveTo(L[0], L[1]);
    g.bezierCurveTo(cx - w * 0.25, cy + hd * 1.35, cx + w * 0.25, cy + hd * 1.3, R[0], R[1]); g.stroke();
    if (e.lashes) {
      g.strokeStyle = rgba('#140a06', 0.85); g.lineWidth = w * e.lashes;
      for (let i = 1; i < 22; i++) {
        const t = i / 22;
        // Point on the upper lid bezier.
        const mt = 1 - t;
        const x = mt * mt * mt * L[0] + 3 * mt * mt * t * (cx - w * 0.28) + 3 * mt * t * t * (cx + w * 0.22) + t * t * t * R[0];
        const y = mt * mt * mt * L[1] + 3 * mt * mt * t * (cy - hu * 1.35) + 3 * mt * t * t * (cy - hu * 1.4) + t * t * t * R[1];
        const len = (w * 0.07 * Math.sin(t * Math.PI) + w * 0.02) * (open < 0.15 ? 0.45 : 1);
        g.beginPath(); g.moveTo(x, y);
        const dir = open < 0.15 ? -0.8 : 1;
        g.quadraticCurveTo(x + (t - 0.4) * len * 0.8, y - dir * len * (0.5 + open * 0.4), x + (t - 0.3) * len * 1.3, y - dir * len * (0.6 + open * 0.5));
        g.stroke();
      }
    }
    g.restore();
  }

  // --------------------------------------------------------------- lightning
  function bolt(seed, x0, y0, x1, y1, detail = 7, spread = 0.22, depth = 0) {
    const r = mulberry32(seed);
    let pts = [[x0, y0], [x1, y1]];
    let off = Math.hypot(x1 - x0, y1 - y0) * spread;
    for (let d = 0; d < detail; d++) {
      const np = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const nx = -(by - ay), ny = bx - ax, nl = Math.hypot(nx, ny) || 1;
        const k = (r() - 0.5) * off;
        np.push([mx + (nx / nl) * k, my + (ny / nl) * k], pts[i + 1]);
      }
      pts = np; off *= 0.52;
    }
    const branches = [];
    for (let b = 0; b < (depth ? 0 : 5); b++) {
      const i = Math.floor(pts.length * (0.15 + r() * 0.6));
      const [bx, by] = pts[i];
      const ang = Math.atan2(y1 - y0, x1 - x0) + (r() - 0.5) * 1.6;
      const len = Math.hypot(x1 - x0, y1 - y0) * (0.12 + r() * 0.25);
      branches.push(bolt(seed + 97 * (b + 1), bx, by, bx + Math.cos(ang) * len, by + Math.sin(ang) * len, detail - 2, 0.3, depth + 1).main);
    }
    return { main: pts, branches };
  }
  function drawBolt(g, b, a, width) {
    if (a <= 0) return;
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.lineJoin = 'round'; g.lineCap = 'round';
    const pass = (pts, w, color, alpha, blur) => {
      g.filter = blur ? `blur(${blur}px)` : 'none';
      g.strokeStyle = rgba(color, alpha * a); g.lineWidth = w;
      poly(g, pts); g.stroke();
    };
    pass(b.main, width * 14, '#6f8fff', 0.35, width * 10);
    b.branches.forEach((p) => pass(p, width * 5, '#7f9cff', 0.3, width * 5));
    pass(b.main, width * 3.5, '#bcd0ff', 0.9, width * 1.5);
    b.branches.forEach((p) => pass(p, width * 1.2, '#cfdcff', 0.75, 0));
    pass(b.main, width * 1.1, '#ffffff', 1, 0);
    g.restore();
  }

  // ------------------------------------------------------------ precompute
  const R0 = mulberry32(1234);
  const DUST = Array.from({ length: 900 }, () => ({
    x: (R0() - 0.5) * 3000, y: (R0() - 0.5) * 1800, z: R0() * 3000, s: 0.6 + R0() * 1.8, gold: R0() < 0.05, ph: R0() * TAU,
  }));
  const NEB = Array.from({ length: 70 }, (_, i) => ({
    x: (R0() - 0.5) * 3400, y: (R0() - 0.5) * 2000, z: 200 + R0() * 3600, s: 900 + R0() * 1700,
    c: [C.indigo, C.violet, C.midnight, '#1d2b5a', '#0d1f3f'][i % 5], v: i % 5, rot: R0() * TAU, spin: (R0() - 0.5) * 0.08,
  }));
  const STARS = Array.from({ length: 1600 }, () => {
    const x = R0() * W, y = R0() * H * 1.6 - H * 0.6;
    const b = Math.pow(R0(), 3);
    return { x, y, b, tw: R0() * TAU, hue: R0() };
  });
  // Stars light in a sweep from the horizon upward.
  STARS.forEach((s) => (s.ign = clamp((H - s.y) / (H * 1.5)) * 0.85 + hash(s.x | 0, s.y | 0) * 0.15));

  function ridge(seed, x, amp, freq, oct = 5) { return fbm1(x * freq, seed, oct) * amp; }

  // Uranus as a body of sky: skeleton strokes that we fill with light.
  const URANUS = (() => {
    const body = [];
    const add = (pts, r) => { const s = catmull(pts, 10); s.forEach((p, i) => body.push([p[0], p[1], r * (1 - 0.35 * i / s.length)])); };
    // Arched over the world: head near top center, arms spread to the horizons.
    // Stretched across the heavens: head over the eastern horizon, body
    // arching the width of the sky, legs sinking toward the western edge.
    add([[1560, 250], [1500, 230], [1440, 240]], 80);                         // head+neck
    add([[1420, 250], [1250, 200], [1020, 180], [820, 200]], 120);            // torso
    add([[820, 200], [600, 250], [380, 340], [180, 470], [20, 620]], 80);     // legs
    add([[1400, 270], [1560, 380], [1680, 520], [1780, 680]], 50);            // arm reaching down to Earth
    add([[1380, 280], [1450, 420], [1500, 560], [1540, 700]], 44);            // other arm
    const r = mulberry32(77);
    const stars = [];
    body.forEach(([x, y, rr]) => { for (let k = 0; k < 3; k++) stars.push([x + (r() - 0.5) * rr * 1.6, y + (r() - 0.5) * rr * 1.2, r()]); });
    return { body, stars };
  })();

  // Crack network for Gaia's stone face.
  const CRACKS = (() => {
    const r = mulberry32(404), out = [];
    for (let i = 0; i < 14; i++) {
      let x = 960 + (r() - 0.5) * 900, y = 402 + (r() - 0.5) * 600, a = r() * TAU;
      const pts = [[x, y]];
      for (let k = 0; k < 26; k++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * 26; y += Math.sin(a) * 26; pts.push([x, y]); }
      out.push({ pts, t0: r() });
    }
    return out;
  })();

  const EMBERS = Array.from({ length: 160 }, () => ({ x: R0() * W, y: R0() * H, v: 20 + R0() * 60, s: 0.8 + R0() * 2.4, ph: R0() * TAU }));
  const RAIN = Array.from({ length: 420 }, () => ({ x: R0(), y: R0(), v: 0.8 + R0() * 0.8, l: 12 + R0() * 26 }));
  const SCATTER = Array.from({ length: 700 }, () => ({ a: R0() * TAU, d: 30 + R0() * 500, v: 400 + R0() * 1600, b: R0() }));

  // ==================================================================
  // SCENES — each draws a full frame for local time tl (seconds since
  // scene start) and absolute time t.
  // ==================================================================

  // Camera helpers.
  function shake(g, amt, t, seed = 0) {
    if (amt <= 0) return;
    const f = 24;
    const k = Math.floor(t * f);
    g.translate((noise1(t * 18, 5 + seed) - 0.5) * amt * 2, (noise1(t * 18, 9 + seed) - 0.5) * amt * 2);
    void k;
  }

  // ------------------------------------------------------------- CHAOS/VOID
  function sceneVoid(g, t) {
    fillAll(g, C.obsidian);
    // Camera: impossibly slow push forward; roll begins in the void.
    const camZ = t * 70 + Math.max(0, t - 7) * 150 + Math.max(0, t - 11) * 180;
    const roll = ss(t, 6.5, 14) * 0.18 + Math.max(0, t - 8) * 0.012;
    const chaosIn = ss(t, 5.9, 9.0); // clouds start swirling on "Chaos"
    g.save();
    g.translate(W / 2, H / 2); g.rotate(roll);

    // Nebular clouds (not space — there are no stars yet).
    g.globalCompositeOperation = 'lighter';
    const order = NEB.map((n, i) => i).sort((a, b) => NEB[b].z - NEB[a].z);
    for (const i of order) {
      const n = NEB[i];
      let z = n.z - camZ + 400;
      z = ((z % 3800) + 3800) % 3800 + 60;
      const p = 700 / z;
      const swirl = (t - 5.9) * n.spin * chaosIn + Math.sin(t * 0.3 + i) * 0.05;
      const sx = n.x * p, sy = n.y * p;
      const near = clamp((z - 60) / 500); // fade as we pass through
      const far = clamp(1 - (z - 2600) / 1200);
      const a = chaosIn * 0.26 * near * far * (0.6 + 0.4 * Math.sin(i * 3.1 + t * 0.4));
      puff(g, n.v, n.c, sx, sy, n.s * p, n.s * p * 0.7, a, n.rot + swirl);
    }
    // Deep violet heart of the churning mass.
    glow(g, Math.sin(t * 0.21) * 220, Math.cos(t * 0.17) * 90, 900, '#1b1240', 0.35 * chaosIn);
    g.globalCompositeOperation = 'source-over';

    // Primordial dust.
    const dustIn = ss(t, 0.8, 4.5);
    for (let i = 0; i < DUST.length; i++) {
      const d = DUST[i];
      let z = d.z - camZ * 0.9;
      z = ((z % 3000) + 3000) % 3000 + 20;
      const p = 600 / z;
      const x = d.x * p, y = d.y * p;
      if (Math.abs(x) > W * 0.75 || Math.abs(y) > H * 0.9) continue;
      const depthA = clamp(1 - z / 3000) * clamp(z / 120);
      if (d.gold) {
        // Golden sparks appear and vanish in the void.
        const flick = Math.max(0, Math.sin(t * 0.9 + d.ph * 5)) ** 6 * ss(t, 7, 9);
        if (flick > 0.02) glow(g, x, y, 3 + d.s * p * 5, C.gold, flick * 0.9 * depthA);
        continue;
      }
      const r = Math.max(0.5, d.s * p * 1.4);
      const bokeh = z < 220; // near particles fall out of focus
      g.fillStyle = rgba(bokeh ? '#4a4f66' : '#6f7488', dustIn * depthA * (bokeh ? 0.1 : 0.32));
      g.beginPath(); g.arc(x, y, bokeh ? r * 3 : r, 0, TAU); g.fill();
    }
    g.restore();

    // Gaia's first light rising under the darkness at the end of the void.
    const warm = ss(t, 12.8, 14.3);
    if (warm > 0) {
      g.globalCompositeOperation = 'lighter';
      glow(g, W / 2, H * 0.92 - warm * H * 0.12, 30 + warm * 220, C.amber, 0.5 * warm);
      glow(g, W / 2, H * 0.92 - warm * H * 0.12, 4 + warm * 20, '#fff1c8', 0.9 * warm);
      g.globalCompositeOperation = 'source-over';
    }
  }

  // ------------------------------------------------------------------ GAIA
  // Mountain skyline that contains Gaia's reclining profile.
  // Face-up profile: upright profile (x front, y down) maps to screen as
  // x = OX - y*GS, y = OY - (x + 12)*GH.
  const GX = 820, GY = 560, GS = 5.0, GH = 7.0;
  const gaiaMap = (x, y, form = 1) => [GX - y * GS, GY - (x + 12) * GH * form];
  function gaiaSkyline(form) {
    const face = PROFILE_S.filter(([, y]) => y > -64).map(([x, y]) => gaiaMap(x, y, form)).reverse();
    const [fx0, fy0] = face[0], [fx1, fy1] = face[face.length - 1];
    const left = [], right = [];
    for (let x = -40; x < fx0; x += 16) {
      const k = (x + 40) / (fx0 + 40);
      const y = lerp(GY + 30, fy0, smooth(k)) - ridge(3, x, 70, 0.006) * form * Math.sin(k * Math.PI);
      left.push([x, y]);
    }
    for (let x = fx1 + 16; x <= W + 60; x += 16) {
      const k = clamp((x - fx1) / 520);
      // Her hair falls away into the range.
      const y = lerp(fy1, GY - 40 * form, smooth(k)) - ridge(5, x, 110, 0.005) * form * smooth(k);
      right.push([x, y]);
    }
    return left.concat(face, right);
  }

  function drawLandscape(g, t, grow, sun, camY) {
    // Sky.
    const dawn = sun;
    g.fillStyle = vgrad(g, -H + camY, H * 0.7 + camY, [
      [0, mix('#05060d', '#0b1830', dawn)], [0.55, mix('#070a18', '#2c3f5c', dawn)],
      [0.82, mix('#0a0c18', '#c98a44', dawn)], [1, mix('#120c08', '#f2c77a', dawn)],
    ]);
    g.fillRect(0, 0, W, H);

    g.save(); g.translate(0, camY);
    // Sun at the horizon + atmospheric bloom.
    if (sun > 0) {
      g.globalCompositeOperation = 'lighter';
      glow(g, 1500, 470, 900 * sun, '#ffb65c', 0.45 * sun);
      glow(g, 1500, 470, 260 * sun, '#ffe2a8', 0.7 * sun);
      glow(g, 1500, 470, 40, '#fff7e2', sun);
      g.globalCompositeOperation = 'source-over';
    }

    // Sea.
    const seaA = ss(grow, 0.15, 0.6);
    if (seaA > 0) {
      g.globalAlpha = seaA;
      g.fillStyle = vgrad(g, 480, H, [[0, mix('#0a1830', '#3b6d8a', sun)], [1, mix('#030712', '#123a5c', sun)]]);
      g.fillRect(0, 480, W, H);
      // Sun path on the water.
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 70; i++) {
        const y = 490 + i * i * 0.07;
        const w = 20 + i * 5 + Math.sin(t * 2 + i) * 10;
        g.fillStyle = rgba('#ffcf85', 0.18 * sun * (1 - i / 70));
        g.fillRect(1500 - w / 2 + Math.sin(i * 1.7 + t) * 12, y, w, 1.6);
      }
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
    }

    // Distant ranges (aerial perspective).
    const ranges = [
      { seed: 21, base: 492, amp: 120, fq: 0.0028, col: mix('#0c0f18', '#7d8aa0', sun), d: 0.0 },
      { seed: 22, base: 520, amp: 150, fq: 0.0036, col: mix('#0b0d12', '#8f8466', sun), d: 0.12 },
    ];
    ranges.forEach((r, k) => {
      const f = easeOut(ss(grow, r.d, r.d + 0.45));
      if (f <= 0) return;
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 12) g.lineTo(x, r.base - ridge(r.seed, x, r.amp, r.fq) * f + (k ? 0 : 20));
      g.lineTo(W, H); g.closePath();
      g.fillStyle = r.col; g.fill();
      // Forming seams: a gold glow along new ridges.
      const seam = ss(grow, r.d + 0.1, r.d + 0.35) * (1 - ss(grow, r.d + 0.45, r.d + 0.8));
      if (seam > 0) { g.strokeStyle = rgba(C.amber, 0.5 * seam); g.lineWidth = 2; g.stroke(); }
    });

    // Gaia's massif.
    const f = easeOut(ss(grow, 0.2, 0.75));
    if (f > 0) {
      const sky = gaiaSkyline(f);
      g.beginPath(); g.moveTo(-40, H + 10);
      sky.forEach(([x, y]) => g.lineTo(x, y + (1 - f) * 200));
      g.lineTo(W + 60, H + 10); g.closePath();
      const lit = g.createLinearGradient(0, 300, 0, H);
      lit.addColorStop(0, mix('#15110c', '#8a6a3a', sun)); lit.addColorStop(0.35, mix('#100d09', '#5a5228', sun));
      lit.addColorStop(1, mix('#080706', '#26240f', sun));
      g.fillStyle = lit; g.fill();
      g.save(); g.clip();
      textureFill(g, TX.stone, 0.35, 'multiply', 1.4);
      // Olive slopes and limestone scree.
      g.globalCompositeOperation = 'source-atop';
      for (let i = 0; i < 26; i++) {
        const x = (i * 97) % W, y = 560 + ((i * 53) % 200);
        puff(g, i, i % 3 ? C.olive : C.limestone, x, y, 420, 120, 0.25 * sun, 0);
      }
      // Sunlight catches the profile from the right.
      g.globalCompositeOperation = 'lighter';
      const sg = g.createLinearGradient(1500, 300, 700, 500);
      sg.addColorStop(0, rgba('#ffcf8a', 0.35 * sun)); sg.addColorStop(1, rgba('#ffcf8a', 0));
      g.fillStyle = sg; g.fillRect(0, 0, W, H);
      g.restore();
      // Rim of light along the skyline.
      g.save();
      g.globalCompositeOperation = 'lighter';
      poly(g, sky.map(([x, y]) => [x, y + (1 - f) * 200]));
      g.strokeStyle = rgba('#ffd89a', 0.55 * sun + 0.35 * (1 - ss(grow, 0.5, 0.9)) * f);
      g.lineWidth = 2.2; g.stroke();
      g.restore();
    }

    // River of light winding down to the sea.
    const riv = ss(grow, 0.55, 0.95);
    if (riv > 0) {
      g.save(); g.globalCompositeOperation = 'lighter';
      g.filter = 'blur(1.5px)';
      g.strokeStyle = rgba('#ffe0a0', 0.35 * riv * sun); g.lineWidth = 2;
      g.beginPath(); g.moveTo(1230, 640);
      g.bezierCurveTo(1200, 680, 1300, 700, 1250, 740);
      g.bezierCurveTo(1220, 770, 1290, 790, 1270, 820);
      g.setLineDash([900 * riv, 2000]); g.stroke();
      g.restore();
    }
    // Coast: surf line.
    if (seaA > 0) {
      g.save(); g.globalCompositeOperation = 'lighter';
      g.strokeStyle = rgba('#e8f0f0', 0.25 * seaA * (0.6 + 0.4 * Math.sin(t * 1.3)));
      g.lineWidth = 1.5; g.beginPath();
      for (let x = 1150; x < W; x += 10) g.lineTo(x, 610 + ridge(8, x, 50, 0.01) + Math.sin(t + x * 0.02) * 2);
      g.stroke(); g.restore();
    }

    // Her eye opening: a golden almond that wakes on the mountain.
  }

  function sceneGaia(g, t, tl) {
    // Camera descends toward the light; world forms around it.
    const grow = ss(tl, 0.3, 3.4);
    const sun = ss(tl, 2.6, 4.4);
    const camY = (1 - easeOut(ss(tl, 0, 2.6))) * 220;
    const push = 1 + tl * 0.012;
    g.save();
    g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
    drawLandscape(g, t, grow, sun, camY);
    // Her eye.
    const eyeOpen = ss(tl, 2.55, 3.4);
    const [ex, ey] = gaiaMap(3, -12.5);
    g.save();
    g.translate(ex, ey + camY);
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = rgba('#ffd98a', 0.25 + 0.7 * eyeOpen);
    g.beginPath(); g.moveTo(-24, 0); g.quadraticCurveTo(0, -2 - 7 * eyeOpen, 24, 0); g.quadraticCurveTo(0, 2 + 5 * eyeOpen, -24, 0); g.fill();
    glow(g, 0, 0, 30 + 110 * eyeOpen, '#ffc062', 0.5 * eyeOpen);
    g.restore();
    // The seed of light the camera followed down.
    const seed = 1 - ss(tl, 1.4, 2.6);
    if (seed > 0) {
      g.globalCompositeOperation = 'lighter';
      glow(g, W / 2, H * 0.8 - (1 - seed) * 60 + camY * 0.3, 220 * seed + 40, C.amber, 0.55 * seed);
      g.globalCompositeOperation = 'source-over';
    }
    g.restore();

    // God rays once the sun breaks.
    godRays(g, 1500, 470 + camY, sun * 0.5, t, '#ffcf8a');
    // Warm haze.
    fillAll(g, rgba('#ffb35a', 0.06 * sun));
  }

  function godRays(g, x, y, a, t, color) {
    if (a <= 0) return;
    g.save(); g.globalCompositeOperation = 'lighter'; g.filter = 'blur(28px)';
    for (let i = 0; i < 14; i++) {
      const ang = Math.PI + 0.25 + i * 0.12 + Math.sin(t * 0.2 + i) * 0.02;
      const w = 0.03 + hash(i, 3) * 0.05;
      const len = 1800;
      const gr = g.createLinearGradient(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      gr.addColorStop(0, rgba(color, 0.16 * a)); gr.addColorStop(1, rgba(color, 0));
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(x, y);
      g.lineTo(x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len);
      g.lineTo(x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len);
      g.closePath(); g.fill();
    }
    g.restore();
  }

  // ---------------------------------------------------------------- URANUS
  function drawStars(g, t, ignT, a, oy = 0, scatter = 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < STARS.length; i++) {
      const s = STARS[i];
      const on = clamp((ignT - s.ign) * 8);
      if (on <= 0) continue;
      const flare = Math.max(0, 1 - (ignT - s.ign) * 6); // ignition burst
      let x = s.x, y = s.y + oy;
      if (scatter > 0) {
        const dx = x - W / 2, dy = y - H * 0.35, d = Math.hypot(dx, dy) + 1;
        x += (dx / d) * scatter * (300 + s.b * 1400); y += (dy / d) * scatter * (300 + s.b * 1400);
      }
      if (y < -20 || y > H + 20) continue;
      const tw = 0.7 + 0.3 * Math.sin(t * (1.5 + s.hue * 3) + s.tw);
      const br = (0.25 + s.b * 0.75) * on * tw * a;
      const col = s.hue < 0.2 ? '#ffe7c2' : s.hue > 0.85 ? '#cfe0ff' : '#f4f1ea';
      g.fillStyle = rgba(col, br);
      const r = 0.6 + s.b * 1.8;
      if (scatter > 0.02) {
        // Motion streaks as the heavens are torn apart.
        g.strokeStyle = rgba(col, br * 0.8); g.lineWidth = r;
        const dx = x - W / 2, dy = y - H * 0.35, d = Math.hypot(dx, dy) + 1;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - (dx / d) * 60 * scatter * (1 + s.b * 3), y - (dy / d) * 60 * scatter * (1 + s.b * 3)); g.stroke();
      } else g.fillRect(x - r / 2, y - r / 2, r, r);
      if (s.b > 0.6 || flare > 0) {
        glow(g, x, y, 5 + s.b * 12 + flare * 8, col, 0.3 * br + flare * 0.35 * a);
        if (s.b > 0.95) { // diffraction glint
          g.fillStyle = rgba(col, 0.35 * br);
          g.fillRect(x - 14 * s.b, y - 0.5, 28 * s.b, 1); g.fillRect(x - 0.5, y - 14 * s.b, 1, 28 * s.b);
        }
      }
    }
    g.restore();
  }

  function drawUranusBody(g, t, a, oy = 0, fear = 0, scale = 1) {
    if (a <= 0) return;
    g.save();
    if (scale > 1.2) {
      // Close on his face, which fills the upper frame.
      g.translate(W * 0.55, oy + H * 0.12); g.scale(scale, scale); g.translate(-1500, -250);
    } else {
      g.translate(W / 2, oy); g.scale(scale, scale); g.translate(-W / 2, 0);
    }
    g.globalCompositeOperation = 'lighter';
    // Atmospheric body.
    URANUS.body.forEach(([x, y, r], i) => {
      if (i % 2) return;
      const breathe = 1 + 0.04 * Math.sin(t * 0.8 + i * 0.3);
      glow(g, x, y, r * 1.5 * breathe, '#2f5fa8', 0.16 * a);
    });
    URANUS.body.forEach(([x, y, r], i) => { if (i % 3 === 0) glow(g, x, y, r * 0.6, '#9cc0ff', 0.09 * a); });
    // Stars that make his skin.
    URANUS.stars.forEach(([x, y, b], i) => {
      const tw = 0.6 + 0.4 * Math.sin(t * 2.2 + i);
      g.fillStyle = rgba('#e6efff', (0.35 + b * 0.65) * tw * a);
      const r = 0.8 + b * 1.8;
      g.fillRect(x - r / 2, y - r / 2, r, r);
      if (b > 0.93) glow(g, x, y, 10, '#cfe0ff', 0.5 * a * tw);
    });
    // Constellation lines tracing the limbs.
    g.strokeStyle = rgba('#9fc0ff', 0.14 * a); g.lineWidth = 1;
    g.beginPath();
    for (let i = 0; i < URANUS.body.length - 12; i += 12) {
      const [x0, y0] = URANUS.body[i], [x1, y1] = URANUS.body[i + 12];
      if (Math.hypot(x1 - x0, y1 - y0) < 160) { g.moveTo(x0, y0); g.lineTo(x1, y1); }
    }
    g.stroke();
    // Face: two points of light for eyes that widen with fear.
    // His face turned down toward the Earth: one eye, widening with fear.
    const ex = 1548, ey = 262;
    glow(g, ex, ey, 16 + fear * 14, '#dfeaff', (0.25 + fear * 0.35) * a);
    g.fillStyle = rgba('#ffffff', (0.4 + fear * 0.3) * a);
    g.beginPath(); g.ellipse(ex, ey, 5 + fear * 2, 1.4 + fear * 3, 0.5, 0, TAU); g.fill();
    g.restore();
  }

  function sceneUranus(g, t, tl) {
    // Tilt up from the ground at Gaia's side into the unfolding sky.
    const tilt = easeInOut(ss(tl, 0, 2.2));
    const camY = tilt * H * 0.95; // landscape slides down out of frame
    const night = ss(tl, 0.2, 2.0);
    g.fillStyle = vgrad(g, -H * 0.2 + camY * 0.2, H, [
      [0, mix('#0b1830', '#020410', night)], [0.5, mix('#2c3f5c', '#07102a', night)],
      [0.85, mix('#c98a44', '#123a5c', night)], [1, mix('#f2c77a', '#2a4a6a', night)],
    ]);
    g.fillRect(0, 0, W, H);
    // Canopy unfolding: a dome of deep blue spreading from the horizon.
    const unfold = easeOut(ss(tl, 0.5, 3.2));
    g.save();
    g.globalCompositeOperation = 'lighter';
    const cg = g.createRadialGradient(W / 2, H * 1.25, 100, W / 2, H * 1.25, 400 + unfold * 1600);
    cg.addColorStop(0, rgba('#1a3f78', 0.0)); cg.addColorStop(0.75, rgba('#1a3f78', 0.28 * unfold)); cg.addColorStop(1, rgba('#1a3f78', 0));
    g.fillStyle = cg; g.fillRect(0, 0, W, H);
    g.restore();
    // Milky band.
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 16; i++) {
      const x = i * 130 - 40, y = 460 - i * 22 + Math.sin(i) * 30 + (1 - unfold) * 300;
      puff(g, i, '#3b4f86', x, y, 520, 200, 0.18 * unfold, -0.25);
    }
    g.restore();
    drawStars(g, t, ss(tl, 0.9, 4.2) * 1.05, 1, (1 - tilt) * 250);
    drawUranusBody(g, t, ss(tl, 2.4, 4.8), (1 - tilt) * 200, 0, 1 + tl * 0.01);
    // The Earth far below, tiny under the vast sky.
    if (camY < H * 1.2) {
      g.save(); g.translate(0, camY + H * 0.05 * tilt);
      g.globalAlpha = 1;
      drawLandscape(g, t, 1, 1 - night * 0.8, 0);
      g.restore();
    }
    // Horizon glow after the tilt.
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = vgrad(g, H * 0.7, H, [[0, rgba('#e0a860', 0)], [1, rgba('#e0a860', 0.25 * tilt)]]);
    g.fillRect(0, 0, W, H);
    g.restore();
    // Thin silhouette of the world's curve at the bottom.
    if (tilt > 0.6) {
      g.fillStyle = '#05050a';
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) g.lineTo(x, H - 30 - ridge(31, x, 70, 0.004) * ss(tl, 1.2, 2.2) + Math.pow((x - W / 2) / W, 2) * 90);
      g.lineTo(W, H); g.fill();
    }
  }

  // ---------------------------------------------------------------- TITANS
  const TITAN_POSES = [
    { face: 1, aF: 0.5, eF: 0.4, aB: -0.2, eB: 0.2, beard: true, hair: 12, flare: 3 },
    { face: 1, aF: 2.6, eF: 0.2, aB: 0.2, eB: 0.1, beard: true, hair: 10 },
    { face: -1, aF: 0.9, eF: 0.9, aB: 0.1, eB: 0.3, hair: 18, flare: 4 },
    { face: -1, aF: 0.3, eF: 0.1, aB: 2.2, eB: 0.5, beard: true, hair: 8, bulk: 1.1 },
    { face: 1, aF: 1.5, eF: -0.3, aB: -0.4, eB: 0.2, hair: 14 },
  ];
  const TITAN_X = [330, 690, 1010, 1300, 1620];
  const TITAN_H = [440, 470, 450, 480, 430];

  function sceneTitans(g, t, tl) {
    // 0–3.4s: black-figure frieze → living world. Then three monumental glimpses.
    if (tl < 3.4) return titanFrieze(g, t, tl);
    if (tl < 4.5) return titanAboveClouds(g, t, tl - 3.4);
    if (tl < 5.4) return cyclopsEye(g, t, tl - 4.5);
    return hundredHanded(g, t, tl - 5.4);
  }

  function titanFrieze(g, t, tl) {
    const real = ss(tl, 1.3, 3.1); // painted relief becomes a real place
    const push = 1.02 + tl * 0.03;
    g.save();
    g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);

    // Painted: terracotta ground.
    const clay = g.createLinearGradient(0, 0, 0, H);
    clay.addColorStop(0, '#b65a2c'); clay.addColorStop(0.5, '#c46a36'); clay.addColorStop(1, '#9c4722');
    g.fillStyle = clay; g.fillRect(0, 0, W, H);
    textureFill(g, TX.stone, 0.22, 'multiply', 1.6);
    // Curvature of the vessel: darker toward the edges.
    const vg = g.createLinearGradient(0, 0, W, 0);
    vg.addColorStop(0, rgba('#000000', 0.45)); vg.addColorStop(0.5, rgba('#000000', 0)); vg.addColorStop(1, rgba('#000000', 0.45));
    g.fillStyle = vg; g.fillRect(0, 0, W, H);

    // Real: blood-red dusk among immense mountains, fading in over the paint.
    if (real > 0) {
      g.save(); g.globalAlpha = real;
      g.fillStyle = vgrad(g, 0, H, [[0, '#1a0a0a'], [0.45, '#5a1a12'], [0.7, '#b0502a'], [0.8, '#e0904a'], [1, '#2a120c']]);
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      glow(g, W * 0.5, 600, 800, '#ff9a4a', 0.35);
      g.globalCompositeOperation = 'source-over';
      [[42, 560, 260, 0.0022, '#3a1812'], [43, 640, 200, 0.003, '#24100c'], [44, 720, 120, 0.004, '#140807']].forEach(([s, b, a, f, c]) => {
        g.beginPath(); g.moveTo(0, H);
        for (let x = 0; x <= W; x += 12) g.lineTo(x, b - ridge(s, x, a, f));
        g.lineTo(W, H); g.fillStyle = c; g.fill();
      });
      // Low cloud around their knees.
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) puff(g, i, '#c77a4a', (i * 173 + tl * 30) % (W + 400) - 200, 690 + (i % 3) * 30, 600, 150, 0.14);
      g.restore();
    }

    // Figures: black-figure silhouettes with incised lines → rim-lit giants.
    TITAN_POSES.forEach((p, i) => {
      const x = TITAN_X[i], h = TITAN_H[i] * (1 + real * 0.25), y = 700 + real * 40;
      const sway = Math.sin(t * 0.7 + i) * 0.04;
      const pose = Object.assign({}, p, { wind: real * (0.4 + sway * 4), cloak: real > 0.3 });
      const pts = drawFigure(g, pose, x, y, h, {
        fill: mix('#120806', '#0a0605', real), rim: real > 0 ? '#ffb070' : undefined,
        rimDir: [x < W / 2 ? 1 : -1, -0.6], rimW: 0.9, rimA: real, glowRim: 6,
      });
      // Incised details (painted style), fading as they become real.
      if (real < 1) {
        g.save(); g.globalAlpha = 1 - real;
        g.strokeStyle = '#c46a36'; g.lineWidth = 1.6;
        const [hx, hy] = pts.head;
        for (let k = 0; k < 5; k++) {
          g.beginPath(); g.moveTo(x - h * 0.07 + k * h * 0.03, y - h * 0.62); g.lineTo(x - h * 0.1 + k * h * 0.045, y - h * 0.04); g.stroke();
        }
        g.beginPath(); g.arc(hx, hy + h * 0.01, h * 0.03, Math.PI * 0.9, Math.PI * 2.1); g.stroke();
        g.restore();
      }
      // Bronze ornaments catch the light.
      if (real > 0.4) {
        g.save(); g.globalCompositeOperation = 'lighter';
        glow(g, pts.handFBand[0], pts.handFBand[1], 10, C.gold, 0.6 * real);
        g.restore();
      }
    });

    // Pottery bands slide away as the frame opens up.
    if (real < 1) {
      g.save(); g.globalAlpha = 1 - real;
      g.fillStyle = '#140a07'; g.fillRect(0, 0, W, 96); g.fillRect(0, H - 96, W, 96);
      meander(g, -20, 22, W + 40, 13, '#c46a36');
      tongues(g, 0, H - 80, W, 20, '#c46a36');
      g.restore();
    }
    g.restore();
  }

  function titanAboveClouds(g, t, tl) {
    // Low angle: a single Titan above the cloud sea, backlit by a bronze sun.
    g.fillStyle = vgrad(g, 0, H, [[0, '#12060a'], [0.55, '#5a1c14'], [0.8, '#c8683a'], [1, '#e8a060']]);
    g.fillRect(0, 0, W, H);
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, 1180, 560, 700, '#ffa45a', 0.5); glow(g, 1180, 560, 120, '#ffe0b0', 0.8);
    g.restore();
    const push = 1 + tl * 0.05;
    g.save(); g.translate(W / 2, H); g.scale(push, push); g.translate(-W / 2, -H);
    const pts = drawFigure(g, { face: -1, aF: 0.25, eF: 0.2, aB: -0.15, eB: 0.1, beard: true, hair: 14, cloak: true, wind: 0.8 + Math.sin(t) * 0.1, flare: 4, bulk: 1.08 },
      1040, 1010, 780, { fill: '#0b0606', rim: '#ffc58a', rimDir: [1, -0.4], rimW: 0.7, glowRim: 10, shade: 'rgba(90,30,15,0.5)' });
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, pts.handFBand[0], pts.handFBand[1], 26, C.gold, 0.7);
    glow(g, pts.head[0], pts.head[1] + 60, 22, C.gold, 0.35); // bronze fibula
    g.restore();
    g.restore();
    // Cloud sea in front.
    g.save();
    for (let i = 0; i < 26; i++) {
      const x = ((i * 157 - tl * 90 * (1 + (i % 3))) % (W + 700) + W + 700) % (W + 700) - 350;
      const y = 700 + (i % 4) * 30;
      puff(g, i, i % 2 ? '#e7a574' : '#8c4a36', x, y, 700, 220, 0.55);
    }
    g.restore();
    godRays(g, 1180, 560, 0.6, t, '#ffb070');
  }

  function cyclopsEye(g, t, tl) {
    const open = easeOut(ss(tl, 0.1, 0.7));
    const push = 1 + tl * 0.06;
    g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
    drawEye(g, W / 2, H / 2, 1100, {
      open, skin: '#5a3a26', skinTex: 0.9, texScale: 3.4, sclera: '#b8a67e', openH: 0.2, irisR: 0.17,
      iris: ['#ffcf6a', '#b0621c', '#3a1606'], pupil: 0.3 + 0.12 * (1 - open), wrinkles: 7, lashes: 0.003, seed: 9, spec: '#ffcf8a',
    });
    // Forge light raking across the brow.
    g.globalCompositeOperation = 'lighter';
    glow(g, W * 0.15, H * 0.9, 900, '#ff7a2a', 0.25);
    g.globalCompositeOperation = 'source-over';
    g.restore();
  }

  function hundredHanded(g, t, tl) {
    g.fillStyle = vgrad(g, 0, H, [[0, '#070405'], [0.6, '#2a0c0a'], [1, '#120606']]);
    g.fillRect(0, 0, W, H);
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, W / 2, H * 0.45, 700, '#b0301c', 0.45);
    g.restore();
    const unfold = easeOut(ss(tl, 0, 1.6));
    const many = [];
    for (let i = 0; i < 16; i++) {
      const side = i % 2 ? 1 : -1, k = Math.floor(i / 2) / 8;
      const bend = 0.35 + hash(i, 44) * 0.9;
      many.push([lerp(0.3, 0.6 + k * 2.5, unfold), lerp(0.4, bend + Math.sin(i * 1.3 + t * 1.5) * 0.18, unfold) * (i % 3 ? 1 : -0.6), side]);
    }
    const push = 1 + tl * 0.04;
    g.save(); g.translate(W / 2, H); g.scale(push, push); g.translate(-W / 2, -H);
    drawFigure(g, { face: 1, aF: 0.4 + unfold * 2.4, eF: 0.2, aB: 0.4 + unfold * 2.2, eB: 0.2, many, bulk: 1.25, hair: 10, beard: true },
      W / 2, 1060, 880, { fill: '#060303', rim: '#ff6a3a', rimDir: [0, -1], rimW: 0.45, rimA: 0.7, glowRim: 8, alpha: 0.2 + 0.8 * ss(tl, 0, 0.8) });
    g.restore();
    // Smoke drifting through.
    g.save();
    for (let i = 0; i < 22; i++) {
      const x = ((i * 211 + tl * 120 * (i % 2 ? 1 : -1)) % (W + 800) + W + 800) % (W + 800) - 400;
      const y = 200 + ((i * 97) % 600);
      puff(g, i, i % 3 ? '#1a0e0c' : '#3a1a14', x, y, 800, 400, 0.7 - 0.3 * ss(tl, 0, 1.2), i);
    }
    g.restore();
  }

  // ------------------------------------------------------------ IMPRISONMENT
  function sceneImprison(g, t, tl) {
    if (tl < 1.9) return uranusFear(g, t, tl);
    if (tl < 3.55) return stoneWalls(g, t, tl - 1.9);
    return gaiaStoneFace(g, t, tl - 3.55);
  }

  function uranusFear(g, t, tl) {
    g.fillStyle = vgrad(g, 0, H, [[0, '#010208'], [1, '#08142a']]);
    g.fillRect(0, 0, W, H);
    drawStars(g, t, 2, 0.6);
    // He leans down over the world, his face filling the sky.
    const lean = easeInOut(ss(tl, 0, 1.9));
    const fear = ss(tl, 0.5, 1.4);
    drawUranusBody(g, t, 1, 180 - lean * 120, fear, 1.9 + lean * 0.5);
    // The dark Earth below, with the children upon it.
    g.fillStyle = '#030306';
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 14) g.lineTo(x, 700 - ridge(55, x, 90, 0.004));
    g.lineTo(W, H); g.fill();
    TITAN_X.forEach((x, i) => drawFigure(g, Object.assign({}, TITAN_POSES[i], { aF: 0.2, aB: -0.1 }), x, 720, 140, { fill: '#020203', rim: '#6f93d8', rimDir: [0, -1], rimW: 1.4, rimA: 0.8 }));
    fillAll(g, rgba('#0a1a3a', 0.15));
  }

  function stoneWalls(g, t, tl) {
    const close = easeIn(ss(tl, 0.1, 1.25)); // slam at ~1.25s
    const slammed = tl > 1.25;
    g.save();
    shake(g, slammed ? 26 * Math.max(0, 1 - (tl - 1.25) * 2.2) : close * 3, t, 2);
    // The abyss: dark shaft with a red glow deep below.
    g.fillStyle = vgrad(g, 0, H, [[0, '#0a0806'], [1, '#1e0806']]);
    g.fillRect(-40, -40, W + 80, H + 80);
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, W / 2, H * 1.1, 700, '#8a1a10', 0.6);
    g.restore();
    // Enormous silhouettes forced down into the depths.
    for (let i = 0; i < 5; i++) {
      const fall = easeIn(ss(tl, 0.05 + i * 0.08, 1.2 + i * 0.05));
      const x = W / 2 + (i - 2) * 150 * (1 - fall * 0.6);
      const y = 380 + fall * 700 + i * 12;
      drawFigure(g, Object.assign({}, TITAN_POSES[i], { aF: 2.6 + i * 0.1, aB: 2.4, eF: 0.3, wind: 1, cloak: true }), x, y, 420 * (1 - fall * 0.5),
        { fill: '#050304', rim: '#c0402a', rimDir: [0, 1], rimW: 1, rimA: 0.8 });
    }
    // Two colossal carved slabs closing from each side.
    const gap = lerp(W * 0.55, 0, close);
    [[-1, 0], [1, W]].forEach(([s]) => {
      g.save();
      const edge = W / 2 + s * gap / 2;
      g.beginPath();
      if (s < 0) g.rect(-60, -60, edge + 60, H + 120); else g.rect(edge, -60, W - edge + 60, H + 120);
      g.clip();
      g.fillStyle = s < 0 ? '#8a8070' : '#7e7464';
      g.fillRect(-60, -60, W + 120, H + 120);
      textureFill(g, TX.stone, 0.75, 'multiply', 1.2, s * gap, 0);
      // Carved meander relief running down the slab face.
      g.save();
      g.translate(edge + s * 110, 0); g.rotate(Math.PI / 2);
      meander(g, -40, -36, H + 80, 18, rgba('#a8a090', 0.3), 7);
      g.translate(0, 3); meander(g, -40, -36, H + 80, 18, rgba('#0c0a08', 0.85), 6);
      g.restore();
      // Leading edge shading toward the pit's red light.
      const eg = g.createLinearGradient(edge, 0, edge - s * 300, 0);
      eg.addColorStop(0, rgba('#9a3018', 0.45)); eg.addColorStop(1, rgba('#9a3018', 0));
      g.fillStyle = eg; g.fillRect(-60, -60, W + 120, H + 120);
      g.fillStyle = vgrad(g, 0, H, [[0, rgba('#000000', 0.55)], [0.5, rgba('#000000', 0.05)], [1, rgba('#000000', 0.7)]]);
      g.fillRect(-60, -60, W + 120, H + 120);
      g.restore();
    });
    // Dust bursting from the seam.
    if (slammed) {
      const k = tl - 1.25;
      for (let i = 0; i < 18; i++) {
        const y = (i / 18) * H, spread = 80 + k * 500;
        puff(g, i, '#6b5f52', W / 2 + Math.sin(i * 3) * spread * 0.4, y - k * 40, spread * 1.8, spread, 0.5 * Math.max(0, 1 - k * 1.2));
      }
    }
    g.restore();
  }

  function gaiaStoneFace(g, t, tl) {
    const anger = ss(tl, 0.5, 1.6);
    g.save();
    shake(g, 5 * Math.max(0, 1 - tl * 3), t, 3);
    const S = 5.4, ox = 760, oy = 400;
    // Rock wall.
    fillAll(g, '#6e6250');
    textureFill(g, TX.stone, 0.95, 'multiply', 1.4);
    // Everything in front of her profile is recessed: carved away, in shadow.
    const front = PROFILE_S.map(([x, y]) => [ox + x * S, oy + y * S]);
    g.save();
    g.beginPath();
    g.moveTo(front[0][0], -60);
    front.forEach(([x, y]) => g.lineTo(x, y));
    g.lineTo(front[front.length - 1][0], H + 60); g.lineTo(W + 60, H + 60); g.lineTo(W + 60, -60); g.closePath();
    g.clip();
    fillAll(g, rgba('#0a0706', 0.62));
    // Cast shadow of the relief edge.
    g.translate(ox + 14, oy + 10); g.scale(S, S);
    g.filter = 'blur(10px)'; poly(g, PROFILE_S); g.strokeStyle = rgba('#000000', 0.7); g.lineWidth = 7; g.stroke();
    g.restore();
    // Light raking from upper left across the face.
    const lg = g.createLinearGradient(ox - 400, oy - 400, ox + 200, oy + 300);
    lg.addColorStop(0, rgba('#ffd6a0', 0.22)); lg.addColorStop(1, rgba('#000000', 0.35));
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    g.save(); g.translate(ox, oy); g.scale(S, S);
    // Lit edge along brow, nose, lips, chin.
    g.save(); g.translate(-0.4, -0.4); poly(g, PROFILE_S); g.strokeStyle = rgba('#f0dcb4', 0.45); g.lineWidth = 0.7; g.stroke(); g.restore();
    profileFeatures(g, { lid: 0.3 + anger * 0.12, brow: lerp(-0.9, 1, anger), mouth: 0.2 * (1 - anger) }, rgba('#120c08', 0.9), 1.2);
    // Cheek and jaw modelling.
    g.globalCompositeOperation = 'multiply';
    glow(g, -8, 10, 26, '#3a2a1c', 0.5);
    g.globalCompositeOperation = 'lighter';
    glow(g, 2, -12.5, 5 + anger * 6, '#ff8a3a', 0.2 + anger * 0.6);
    const tear = 1 - anger;
    if (tear > 0.05) { g.fillStyle = rgba('#ffc070', 0.8 * tear); g.beginPath(); g.ellipse(3, -8 + tl * 9, 0.8, 1.5, 0, 0, TAU); g.fill(); }
    g.restore();
    // Cracks spread, glowing from within.
    g.save(); g.lineJoin = 'round';
    CRACKS.forEach((c) => {
      const grow = ss(tl, c.t0 * 0.6, c.t0 * 0.6 + 1.2);
      if (grow <= 0) return;
      const n = Math.max(2, Math.floor(c.pts.length * grow));
      const pts = c.pts.slice(0, n);
      g.strokeStyle = '#060403'; g.lineWidth = 3.5; poly(g, pts); g.stroke();
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = rgba('#ff6a2a', 0.2 + anger * 0.4); g.lineWidth = 1.3; poly(g, pts); g.stroke();
      g.globalCompositeOperation = 'source-over';
    });
    g.restore();
    // Dust sifting down.
    g.save(); g.globalCompositeOperation = 'lighter';
    EMBERS.forEach((e, i) => {
      if (i % 2) return;
      const y = (e.y + tl * e.v * 2) % H;
      g.fillStyle = rgba('#b8a488', 0.22); g.fillRect(e.x, y, e.s, e.s * 3);
    });
    g.restore();
    g.restore();
    fillAll(g, rgba('#000000', 0.25 + 0.6 * (1 - ss(tl, 0, 0.4))));
  }

  // ---------------------------------------------------------------- CRONUS
  function sceneCronus(g, t, tl) {
    if (tl < 1.9) return sickleClose(g, t, tl);
    if (tl < 3.5) return cronusReveal(g, t, tl - 1.9);
    return overthrow(g, t, tl - 3.5);
  }

  function drawSickle(g, x, y, s, rot, gleam) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    // Leather-wrapped handle.
    g.fillStyle = '#3a2416'; g.fillRect(-6, -120, 12, 260);
    g.strokeStyle = rgba('#1a0f08', 0.9); g.lineWidth = 1.6;
    for (let k = -116; k < 136; k += 7) { g.beginPath(); g.moveTo(-6, k); g.lineTo(6, k + 5); g.stroke(); }
    g.fillStyle = rgba('#8a5a38', 0.35); g.fillRect(-6, -120, 4, 260);
    // Bronze collar.
    g.fillStyle = '#9c6a30'; g.fillRect(-8, -132, 16, 14);
    // Crescent blade.
    const blade = new Path2D();
    blade.moveTo(-4, -130);
    blade.bezierCurveTo(-10, -260, 120, -330, 230, -270);
    blade.bezierCurveTo(140, -300, 30, -250, 8, -130);
    blade.closePath();
    const bg = g.createLinearGradient(-20, -300, 220, -150);
    bg.addColorStop(0, '#4a2e12'); bg.addColorStop(0.45, '#b98a45'); bg.addColorStop(0.6, '#e0b66a'); bg.addColorStop(1, '#5a3814');
    g.fillStyle = bg; g.fill(blade);
    g.save(); g.clip(blade);
    // Engraved key pattern along the blade.
    g.save(); g.translate(-8, -170); g.rotate(-0.95);
    meander(g, 0, 0, 180, 5, rgba('#3a2208', 0.55), 1.4);
    g.restore();
    // Moving specular gleam.
    g.globalCompositeOperation = 'lighter';
    const gx = lerp(-60, 260, gleam);
    const sg = g.createLinearGradient(gx - 50, -300, gx + 50, -200);
    sg.addColorStop(0, rgba('#fff0c0', 0)); sg.addColorStop(0.5, rgba('#fff0c0', 0.8)); sg.addColorStop(1, rgba('#fff0c0', 0));
    g.fillStyle = sg; g.fillRect(-50, -350, 320, 250);
    g.restore();
    // Honed edge.
    g.strokeStyle = rgba('#ffe2a0', 0.7); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(8, -130); g.bezierCurveTo(30, -250, 140, -300, 230, -270); g.stroke();
    g.restore();
  }

  function drawHand(g, x, y, s, close, color, rim) {
    // A hand seen from the side closing around a vertical handle at (x, y).
    g.save(); g.translate(x, y); g.scale(s, s);
    const paint = (fill) => {
      g.fillStyle = fill; g.strokeStyle = fill; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.ellipse(-46, 8, 44, 38, -0.1, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(-70, -26); g.quadraticCurveTo(-200, -40, -330, -30); g.lineTo(-330, 80); g.quadraticCurveTo(-200, 70, -66, 44); g.fill();
      for (let f = 0; f < 4; f++) {
        const fy = -22 + f * 19;
        const a1 = lerp(-0.12, 0.05, close), a2 = lerp(0.25, 2.0, close), a3 = lerp(0.2, 1.2, close);
        let px = -14, py = fy, ang = a1;
        [[30, 17], [22, 15.5], [15, 14]].forEach(([len, w], k) => {
          if (k === 1) ang += a2 * 0.5; if (k === 2) ang += a3 * 0.6;
          const nx = px + Math.cos(ang) * len, ny = py + Math.sin(ang) * len * 0.3;
          g.lineWidth = w; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
          px = nx; py = ny;
        });
      }
      g.lineWidth = 19; g.beginPath(); g.moveTo(-34, 38); g.quadraticCurveTo(-6, lerp(62, 44, close), lerp(22, 12, close), lerp(52, 34, close)); g.stroke();
    };
    g.save(); g.translate(0, -3); paint(rim); g.restore();
    paint(color);
    // Knuckle highlights.
    g.globalCompositeOperation = 'lighter';
    for (let f = 0; f < 4; f++) glow(g, 12 + close * 6, -26 + f * 19, 12, rim, 0.12);
    g.restore();
  }

  function sickleClose(g, t, tl) {
    fillAll(g, '#070404');
    // Bokeh embers behind — shallow depth of field.
    g.save(); g.globalCompositeOperation = 'lighter';
    EMBERS.forEach((e, i) => {
      const y = ((e.y - tl * e.v) % H + H) % H;
      glow(g, e.x, y, 8 + e.s * 10, i % 3 ? '#ff7a2a' : '#ffb45a', 0.14 + 0.1 * Math.sin(t * 3 + e.ph));
    });
    glow(g, W * 0.75, H * 0.2, 700, '#8a2a10', 0.35);
    g.restore();
    const push = 1 + tl * 0.05;
    g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
    const close = easeInOut(ss(tl, 0.7, 1.55));
    const handIn = easeOut(ss(tl, 0.35, 1.0));
    g.save(); g.filter = 'blur(0.6px)';
    drawSickle(g, 860, 640, 2.1, 0.32, ss(tl, 0, 1.8));
    g.restore();
    g.save(); g.translate(860, 640); g.rotate(0.32); g.translate(-860, -640);
    drawHand(g, 860 - 260 * (1 - handIn), 700, 1.6, close, '#120a07', '#c8703a');
    g.restore();
    g.restore();
    fillAll(g, rgba('#000000', 1 - ss(tl, 0, 0.35)));
  }

  function cronusReveal(g, t, tl) {
    // Firelit darkness. Gaia's face looms behind him, half-lost in shadow.
    fillAll(g, '#060303');
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, 1500, 900, 900, '#8a3010', 0.4);
    g.restore();
    // Gaia behind.
    g.save();
    g.translate(430, 380); g.scale(5.4, 5.4);
    g.globalCompositeOperation = 'lighter';
    g.filter = 'blur(3px)';
    poly(g, PROFILE_S.slice(0, -8)); g.strokeStyle = rgba('#c07040', 0.28); g.lineWidth = 1.2; g.stroke();
    g.filter = 'none';
    profileFeatures(g, { lid: 0.5, brow: 0.6 }, rgba('#a05a30', 0.3), 0.8);
    g.globalCompositeOperation = 'source-over';
    g.globalCompositeOperation = 'lighter';
    glow(g, 0, -12, 8, '#ff9a4a', 0.35);
    g.restore();
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) puff(g, i, '#140c0a', 300 + i * 90, 300 + (i % 3) * 120, 700, 400, 0.4);
    g.restore();
    // Cronus: young, calm, long dark hair; slow push in.
    const push = 1 + tl * 0.04;
    g.save(); g.translate(1180, H); g.scale(push, push); g.translate(-1180, -H);
    const pts = drawFigure(g, { face: -1, aF: 0.12, eF: 0.1, aB: -0.05, eB: 0.05, hair: 26, sickle: 1, cloak: true, wind: 0.25, headTilt: -0.05 },
      1180, 1620, 1500, { fill: '#0c0706', rim: '#ffb070', rimDir: [-1, -0.2], rimW: 0.5, glowRim: 6, shade: 'rgba(70,30,15,0.45)' });
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, pts.handFBand[0], pts.handFBand[1], 20, C.gold, 0.6);
    glow(g, pts.head[0] + 80, pts.head[1] + 150, 16, C.gold, 0.5); // bronze clasp
    g.restore();
    g.restore();
    fillAll(g, rgba('#000000', 0.25 * (1 - ss(tl, 0, 0.6))));
  }

  const OVERTHROW_BOLT = bolt(3, 960, -40, 960, 900, 7, 0.3);
  function overthrow(g, t, tl) {
    // Flash cuts: raise — the sky — white — the stars scatter.
    if (tl < 0.85) {
      g.fillStyle = vgrad(g, 0, H, [[0, '#03040c'], [1, '#1a1a2e']]); g.fillRect(0, 0, W, H);
      drawStars(g, t, 2, 0.8);
      drawUranusBody(g, t, 0.6, 120, 0.8, 1.5);
      const raise = easeOut(ss(tl, 0, 0.7));
      drawFigure(g, { face: 1, aF: lerp(0.4, 2.9, raise), eF: lerp(0.4, -0.1, raise), sickle: 1, hair: 26, cloak: true, wind: 1 }, 700, H + 80, 900,
        { fill: '#030303', rim: '#9fb8ff', rimDir: [0.5, -1], rimW: 0.6, glowRim: 5 });
      return;
    }
    if (tl < 1.65) {
      const k = tl - 0.85;
      g.save(); shake(g, 14, t, 4);
      g.fillStyle = vgrad(g, 0, H, [[0, '#050a1e'], [1, '#101a38']]); g.fillRect(-30, -30, W + 60, H + 60);
      drawStars(g, t, 2, 1);
      drawUranusBody(g, t, 1, 140 - k * 60, 1, 2.6 + k * 0.5);
      g.restore();
      return;
    }
    if (tl < 1.9) {
      // Violent celestial flash.
      const k = (tl - 1.65) / 0.25;
      fillAll(g, mix('#ffffff', '#b8c8ff', k));
      return;
    }
    // Stars scatter; the heavens shake.
    const k = tl - 1.9;
    g.save(); shake(g, 22 * Math.max(0, 1 - k * 0.6), t, 6);
    g.fillStyle = vgrad(g, 0, H, [[0, '#050308'], [1, '#1a0806']]); g.fillRect(-30, -30, W + 60, H + 60);
    drawStars(g, t, 2, 1, 0, easeOut(clamp(k / 1.2)));
    g.save(); g.globalCompositeOperation = 'lighter';
    SCATTER.forEach((s) => {
      const d = s.d + s.v * easeOut(clamp(k / 1.4));
      const x = W / 2 + Math.cos(s.a) * d, y = H * 0.35 + Math.sin(s.a) * d * 0.6;
      g.strokeStyle = rgba(s.b > 0.7 ? '#ffd9a0' : '#cfe0ff', 0.7 * (1 - k / 1.6));
      g.lineWidth = 1 + s.b * 1.5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(s.a) * 40, y - Math.sin(s.a) * 24); g.stroke();
    });
    glow(g, W / 2, H * 0.35, 500 * (1 - k / 1.6), '#ffe8c0', 0.6 * (1 - k / 1.6));
    g.restore();
    g.restore();
    fillAll(g, rgba('#3a0806', 0.3 * ss(k, 0.8, 1.5)));
    void OVERTHROW_BOLT;
  }

  // ----------------------------------------------------------------- REIGN
  function sceneReign(g, t, tl) {
    const dur = 8.4;
    const paranoia = ss(tl, 1.6, 4.8);
    const youngShadow = ss(tl, 2.0, 4.6) * (1 - ss(tl, 5.0, 5.6));
    const ownShadow = ss(tl, 4.8, 6.0);
    const push = 1 + tl * 0.018;
    const fl = 0.85 + 0.15 * noise1(t * 7, 3) + 0.06 * noise1(t * 23, 4);

    g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
    // Temple wall, limestone relief ground, lit by braziers.
    fillAll(g, '#2a1a12');
    textureFill(g, TX.stone, 0.75, 'multiply', 1.3);
    const red = lerp(0.3, 0.75, ss(tl, 0, dur));
    g.save(); g.globalCompositeOperation = 'overlay';
    fillAll(g, rgba('#a02010', red));
    g.restore();
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, 180, 760, 700 * fl, '#ff7a2a', 0.35 * fl);
    glow(g, 1740, 760, 700 * fl, '#ff7a2a', 0.35 * fl);
    g.restore();

    // Firelight pool on the wall where the shadows fall.
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, 1000, 420, 620, '#c0602a', 0.3 * fl);
    g.restore();
    // Shadows cast on the wall by the firelight.
    if (youngShadow > 0) {
      drawFigure(g, { face: 1, aF: 2.8, eF: 0.1, aB: -0.3, hair: 12, cloak: true, wind: 0.4 }, 1060, 770, 600 * (0.7 + youngShadow * 0.45),
        { fill: '#050202', alpha: 0.75 * youngShadow, blur: 10 });
    }
    if (ownShadow > 0) {
      drawFigure(g, { face: 1, seated: true, aF: 1.2, eF: 0.5, hair: 26, beard: false }, 1040, 790, lerp(420, 900, ownShadow),
        { fill: '#050202', alpha: 0.85 * ownShadow, blur: 14 });
    }

    // Architrave with meander frieze and fluted Doric columns.
    g.fillStyle = '#3a2418'; g.fillRect(0, 0, W, 90);
    meander(g, -10, 26, W + 20, 9, rgba('#c88a50', 0.6));
    [[40, 150], [W - 190, 150]].forEach(([x, w]) => {
      const cg = g.createLinearGradient(x, 0, x + w, 0);
      cg.addColorStop(0, '#1a0e0a'); cg.addColorStop(0.35, '#8a5a3a'); cg.addColorStop(0.6, '#6a402a'); cg.addColorStop(1, '#140a08');
      g.fillStyle = cg; g.fillRect(x, 90, w, H);
      g.strokeStyle = rgba('#000000', 0.35); g.lineWidth = 3;
      for (let k = 1; k < 8; k++) { g.beginPath(); g.moveTo(x + (w / 8) * k, 90); g.lineTo(x + (w / 8) * k, H); g.stroke(); }
      g.fillStyle = '#4a2e1e'; g.fillRect(x - 16, 90, w + 32, 26);
    });

    // Cronus on a primitive stone throne, carved in relief.
    g.fillStyle = '#4a3222'; g.fillRect(700, 540, 230, 250);
    textureFill(g, TX.stone, 0.4, 'multiply', 2);
    g.fillStyle = '#5a3c28'; g.fillRect(690, 520, 250, 28);
    const hunch = paranoia;
    drawFigure(g, { face: 1, seated: true, aF: lerp(0.55, 0.35, hunch), eF: lerp(1.25, 1.9, hunch), aB: lerp(-0.2, 0.5, hunch), eB: 0.4,
      hair: 26, sickle: 1, headDx: hunch * 2.5, headDy: hunch * 3.5, headTilt: hunch * 0.25 },
    860, 790, 420, { fill: '#6e4a32', rim: '#ffb070', rimDir: [-1, -0.8], rimW: 1.1, rimA: 0.6 * fl, shade: 'rgba(0,0,0,0.55)' });

    // Newborns: small swaddled lights drifting into his shadow and gone.
    for (let i = 0; i < 5; i++) {
      const t0 = 5.1 + i * 0.55, k = ss(tl, t0, t0 + 1.4);
      if (k <= 0 || k >= 1) continue;
      const x = lerp(1560 - i * 40, 1100, easeInOut(k)), y = lerp(520 + (i % 2) * 60, 360, easeInOut(k)) + Math.sin(t * 2 + i) * 6;
      const a = Math.sin(k * Math.PI) * (1 - k * 0.6);
      g.save(); g.globalAlpha = a;
      // Swaddled silhouette, dissolving into shadow.
      g.globalCompositeOperation = 'lighter';
      glow(g, x, y, 90, '#ffc070', 0.35);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#1a0c08';
      g.save(); g.translate(x, y); g.rotate(-0.5 + Math.sin(t + i) * 0.1);
      g.beginPath(); g.moveTo(-10, -28); g.quadraticCurveTo(16, -26, 14, 6); g.quadraticCurveTo(10, 30, 0, 34); g.quadraticCurveTo(-14, 30, -16, 4); g.quadraticCurveTo(-18, -20, -10, -28); g.fill();
      g.beginPath(); g.arc(-1, -30, 10, 0, TAU); g.fill();
      g.restore();
      g.restore();
    }
    g.restore();
    // Embers rising.
    g.save(); g.globalCompositeOperation = 'lighter';
    EMBERS.forEach((e) => {
      const y = ((e.y - tl * e.v * 1.4) % H + H) % H, x = e.x + Math.sin(t + e.ph) * 20;
      g.fillStyle = rgba('#ffa050', 0.5 * (0.5 + 0.5 * Math.sin(t * 5 + e.ph)));
      g.fillRect(x, y, e.s, e.s);
    });
    g.restore();
    // Tension: the frame closes in with darkness.
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7);
    v.addColorStop(0, rgba('#000000', 0)); v.addColorStop(1, rgba('#000000', 0.4 + 0.4 * ss(tl, 3, dur)));
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  }

  // ---------------------------------------------------------------- CAVE
  function caveBase(g, t, fl, lightning) {
    // Mouth of the cave with rain and blue night beyond.
    fillAll(g, '#050404');
    g.save();
    g.fillStyle = mix('#0c1420', '#6a7a9a', lightning);
    g.beginPath(); g.moveTo(1330, 804);
    for (let k = 0; k <= 40; k++) {
      const a = Math.PI - (k / 40) * Math.PI * 0.62;
      const r = 520 + (noise1(k * 0.7, 61) - 0.5) * 120;
      g.lineTo(1760 + Math.cos(a) * r * 0.85, 820 - Math.sin(a) * r * 1.2);
    }
    g.lineTo(1960, 60); g.lineTo(1960, 804); g.closePath();
    g.fill(); g.clip();
    // Distant sea horizon and Cretan hills.
    g.fillStyle = mix('#060a10', '#2a3444', lightning);
    g.beginPath(); g.moveTo(1300, 804);
    for (let x = 1300; x <= 1960; x += 10) g.lineTo(x, 560 - ridge(71, x, 80, 0.01));
    g.lineTo(1960, 804); g.fill();
    // Rain.
    g.strokeStyle = rgba('#9fb0c8', 0.35 + lightning * 0.4); g.lineWidth = 1.2;
    g.beginPath();
    RAIN.forEach((r) => {
      const x = 1300 + r.x * 660, y = ((r.y + t * r.v * 1.6) % 1) * 820 - 20;
      g.moveTo(x, y); g.lineTo(x - 4, y + r.l);
    });
    g.stroke();
    g.restore();
    // Rock walls lit by torchlight.
    g.save();
    g.globalCompositeOperation = 'multiply';
    textureFill(g, TX.stone, 1, 'multiply', 1.2);
    g.restore();
    g.save(); g.globalCompositeOperation = 'lighter';
    const tx = 420, ty = 300;
    glow(g, tx, ty, 900 * fl, '#b0501a', 0.38 * fl);
    glow(g, tx, ty, 300 * fl, '#ffb45a', 0.4 * fl);
    g.restore();
    // Rock texture catching the light (only where lit).
    g.save(); g.globalCompositeOperation = 'overlay';
    textureFill(g, TX.stone, 0.5 * fl, 'overlay', 1.2);
    g.restore();
    // Torch in its bracket.
    g.fillStyle = '#1a100a'; g.fillRect(tx - 6, ty + 10, 12, 90);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      const k = i / 12, wob = (noise1(t * 9 + i, 12) - 0.5) * 14;
      g.fillStyle = rgba(i < 4 ? '#fff0c0' : '#ff8a30', 0.35 * (1 - k));
      g.beginPath(); g.ellipse(tx + wob * k, ty - k * 70, 16 * (1 - k * 0.6), 30 * (1 - k * 0.3), 0, 0, TAU); g.fill();
    }
    EMBERS.forEach((e, i) => {
      if (i % 4) return;
      const k = ((t * 0.6 + e.ph) % 1);
      g.fillStyle = rgba('#ffb060', 0.8 * (1 - k)); g.fillRect(tx + Math.sin(e.ph + t * 3) * 20 * k, ty - 40 - k * 200, 2, 2);
    });
    g.restore();
    return [tx, ty];
  }

  function drawCradle(g, x, y) {
    g.fillStyle = '#3a2a1e'; g.beginPath(); g.moveTo(x - 190, y - 90); g.lineTo(x + 190, y - 90); g.lineTo(x + 160, y + 40); g.lineTo(x - 160, y + 40); g.closePath(); g.fill();
    textureFill(g, TX.stone, 0.35, 'multiply', 1.5);
    meander(g, x - 150, y - 50, 300, 7, rgba('#140c08', 0.7), 2.4);
    g.fillStyle = rgba('#ffb060', 0.25); g.fillRect(x - 190, y - 94, 380, 6);
  }

  function sceneHidden(g, t, tl) {
    const fl = 0.8 + 0.2 * noise1(t * 8, 21) + 0.08 * noise1(t * 31, 22);
    const lightning = Math.max(0, 1 - Math.abs(tl - 3.8) * 6) * 0.6;
    const push = 1 + tl * 0.02;
    g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
    caveBase(g, t, fl, lightning);
    drawCradle(g, 880, 700);
    // Rhea carries the child through the torchlight, then lays him down.
    const walk = easeInOut(ss(tl, 0, 2.3));
    const stoop = easeInOut(ss(tl, 2.2, 3.2));
    const x = lerp(1400, 1080, walk), bob = Math.sin(tl * 5.5) * 6 * (1 - stoop);
    const pts = drawFigure(g, { face: -1, veil: true, hair: 18, aF: lerp(0.35, 0.9, stoop), eF: lerp(1.2, 0.55, stoop), aB: lerp(0.25, 0.8, stoop), eB: lerp(1.35, 0.7, stoop),
      headDx: stoop * 3, headDy: stoop * 3, headTilt: stoop * 0.35, flare: 2, wind: 0.1 },
    x, 790 + bob, 640, { fill: '#0e0806', rim: '#ffb060', rimDir: [-1, -0.3], rimW: 0.5, rimA: 0.75, glowRim: 5, shade: 'rgba(60,25,10,0.4)' });
    // The swaddled infant: in her arms, then in the cradle.
    const held = [(pts.handF[0] + pts.handB[0]) / 2, (pts.handF[1] + pts.handB[1]) / 2 - 8];
    const laid = ss(tl, 3.0, 3.3);
    const bx = lerp(held[0], 880, laid), by = lerp(held[1], 598, laid);
    // Linen swaddling, warm on the torch side.
    g.save(); g.translate(bx, by); g.rotate(lerp(-0.35, 0, laid));
    const lg = g.createLinearGradient(-50, -30, 40, 30);
    lg.addColorStop(0, '#e2cfa8'); lg.addColorStop(1, '#5a4a36');
    g.fillStyle = lg;
    g.beginPath(); g.moveTo(-40, -20); g.quadraticCurveTo(20, -34, 48, -8); g.quadraticCurveTo(54, 16, 20, 24); g.quadraticCurveTo(-30, 30, -44, 10); g.closePath(); g.fill();
    g.strokeStyle = rgba('#3a2a1a', 0.5); g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-20 + k * 16, -22); g.quadraticCurveTo(-10 + k * 16, 0, -24 + k * 16, 24); g.stroke(); }
    g.fillStyle = '#6a4a36'; g.beginPath(); g.arc(-46, -6, 15, 0, TAU); g.fill();
    g.fillStyle = '#d8c4a0'; g.beginPath(); g.arc(-50, -8, 17, Math.PI * 0.6, Math.PI * 1.9); g.fill();
    g.restore();
    // The tiny hand moves.
    if (laid > 0.9) {
      const k = ss(tl, 3.7, 4.3), wig = Math.sin(tl * 7) * 0.3 * k;
      g.save(); g.translate(bx - 18, by - 22); g.rotate(-0.4 + wig);
      g.fillStyle = '#b89070'; g.beginPath(); g.ellipse(0, 0, 8, 6, 0, 0, TAU); g.fill();
      g.strokeStyle = '#b89070'; g.lineCap = 'round'; g.lineWidth = 3.2;
      for (let f = 0; f < 4; f++) { g.beginPath(); g.moveTo(4, -4 + f * 2.6); g.lineTo(10 + k * 3 - f * 0.3, -6 + f * 3.2 - k * 2); g.stroke(); }
      g.restore();
    }
    g.restore();
    fillAll(g, rgba('#9fb4d8', lightning * 0.12));
  }

  // ------------------------------------------------------------------ ZEUS
  const ZEUS_BOLT = bolt(41, 1160, -60, 820, 520, 8, 0.28);
  const ZEUS_BOLT2 = bolt(57, 300, -60, 560, 380, 7, 0.3);
  const FINAL_BOLT = bolt(88, 1540, -40, 1230, 360, 7, 0.28);

  function sceneZeus(g, t, tl) {
    if (tl < 2.45) return infantEye(g, t, tl);
    if (tl < 4.3) return stormReveal(g, t, tl - 2.45);
    return olympus(g, t, tl - 4.3);
  }

  function infantEye(g, t, tl) {
    const open = easeOut(ss(tl, 1.2, 1.7));
    const flash = Math.max(0, 1 - Math.abs(tl - 1.95) * 5);
    const push = 1 + tl * 0.03;
    g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
    drawEye(g, W / 2, H / 2 + 20, 980, {
      open, skin: '#8a6048', skinTex: 0.55, texScale: 2.6, sclera: '#d8d0c4', openH: 0.2, irisR: 0.23,
      iris: ['#9ec4e8', '#3f6a94', '#0e1a2a'], pupil: 0.46, lashes: 0.0035, seed: 21, spec: '#ffd8a0',
      reflect: (eg, ix, iy, ir) => {
        if (flash <= 0) return;
        // Lightning mirrored in the pupil.
        eg.save(); eg.translate(ix, iy); eg.scale(ir / 400, ir / 400); eg.translate(-960, -300);
        drawBolt(eg, ZEUS_BOLT, flash, 3);
        eg.restore();
      },
    });
    // Torchlight warmth from one side, darkness on the other.
    const sh = g.createLinearGradient(0, 0, W, 0);
    sh.addColorStop(0, rgba('#000000', 0)); sh.addColorStop(1, rgba('#000000', 0.6));
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    glow(g, 0, H * 0.3, 900, '#b0501a', 0.22);
    g.globalCompositeOperation = 'source-over';
    g.restore();
    fillAll(g, rgba('#000000', 0.55 * (1 - ss(tl, 0, 0.8))));
    fillAll(g, rgba('#cfe0ff', flash * 0.08));
  }

  function stormReveal(g, t, tl) {
    // Lightning tears the sky; Zeus's future silhouette for an instant.
    const strike = tl < 0.75 ? Math.max(0, 1 - tl * 1.6) * (0.6 + 0.4 * (hash(Math.floor(tl * 24), 7) > 0.35)) : 0;
    const rise = easeIn(ss(tl, 0.55, 1.85));
    g.fillStyle = vgrad(g, 0, H, [[0, mix('#05070c', '#6a7aa0', strike)], [1, mix('#0a0c12', '#2a3450', strike)]]);
    g.fillRect(0, 0, W, H);
    // Clouds rushing past as the camera rises.
    g.save();
    for (let i = 0; i < 30; i++) {
      const y = ((i * 71 + rise * 2400) % 1300) - 250;
      const x = (i * 263) % (W + 400) - 200;
      const s = 700 + (i % 4) * 200;
      puff(g, i, strike > 0.2 ? '#8a96b8' : '#1c2230', x, y, s * (1 + rise), s * 0.5 * (1 + rise), 0.45 + strike * 0.3, i * 0.3);
    }
    g.restore();
    if (tl < 0.9) {
      // Mountain + silhouette.
      g.fillStyle = mix('#020304', '#0a0c14', strike);
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 12) g.lineTo(x, 620 - Math.max(0, 260 - Math.abs(x - 760) * 0.55) - ridge(81, x, 60, 0.008));
      g.lineTo(W, H); g.fill();
      if (strike > 0.3) {
        drawFigure(g, { face: 1, aF: 2.9, eF: 0.05, aB: 0.35, eB: 0.2, beard: true, hair: 16, cloak: true, wind: 1.2, bulk: 1.05 }, 760, 372, 150,
          { fill: '#000000', rim: '#dfeaff', rimDir: [0.4, -1], rimW: 1.4, glowRim: 3, alpha: 1 });
      }
      drawBolt(g, ZEUS_BOLT, strike, 3.4);
      if (tl > 0.15) drawBolt(g, ZEUS_BOLT2, strike * 0.7, 2.2);
      fillAll(g, rgba('#dfe8ff', strike * 0.25));
    }
    // Break through into light at the top of the climb.
    const breach = ss(tl, 1.35, 1.85);
    fillAll(g, rgba('#fff2d8', breach * 0.85));
  }

  function olympus(g, t, tl) {
    const open = easeOut(ss(tl, 0, 1.4));
    // Heavenly Mediterranean light.
    g.fillStyle = vgrad(g, 0, H, [[0, '#2a5a8a'], [0.45, '#8ab0c8'], [0.7, '#f0d8a8'], [1, '#f8e8c8']]);
    g.fillRect(0, 0, W, H);
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, 1560, 330, 1000, '#ffd08a', 0.45);
    glow(g, 1560, 330, 150, '#fff8e0', 0.8);
    g.restore();
    // Olympus: a massif rising from an ocean of cloud.
    const drift = tl * 0.012;
    g.save(); g.translate(W / 2, H / 2); g.scale(1.06 - drift, 1.06 - drift); g.translate(-W / 2, -H / 2);
    const peak = (x) => 750 - ridge(93, x, 90, 0.0025) - Math.max(0, 250 - Math.abs(x - 960) * 0.55) - Math.max(0, 190 - Math.abs(x - 1110) * 0.7)
      - ridge(91, x, 60, 0.006) - ridge(92, x, 34, 0.03, 4) * clamp(1 - Math.abs(x - 1000) / 600);
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) g.lineTo(x, peak(x));
    g.lineTo(W, H); g.closePath();
    const mg = g.createLinearGradient(700, 150, 1300, 600);
    mg.addColorStop(0, '#5a6a80'); mg.addColorStop(0.5, '#3a4458'); mg.addColorStop(1, '#2a3040');
    g.fillStyle = mg; g.fill();
    g.save(); g.clip();
    textureFill(g, TX.stone, 0.4, 'multiply', 1.1);
    // Golden light on the sunward faces and snow.
    g.globalCompositeOperation = 'lighter';
    const lg = g.createLinearGradient(1300, 200, 900, 500);
    lg.addColorStop(0, rgba('#ffd89a', 0.6)); lg.addColorStop(1, rgba('#ffd89a', 0));
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    g.restore();
    g.save(); g.globalCompositeOperation = 'lighter';
    g.strokeStyle = rgba('#fff0cc', 0.8); g.lineWidth = 2.5;
    g.beginPath(); for (let x = 700; x <= 1300; x += 8) g.lineTo(x, peak(x) + 1); g.stroke();
    // A glint of marble at the summit.
    glow(g, 962, peak(962) - 4, 30, '#fff8e8', 0.7);
    g.fillStyle = rgba('#fff4dc', 0.9);
    for (let c = 0; c < 6; c++) g.fillRect(944 + c * 7, peak(962) - 14, 2.2, 12);
    g.fillRect(940, peak(962) - 17, 44, 3);
    g.restore();
    g.restore();
    // Ocean of clouds, parting around the base.
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 18; i++) {
        const side = i % 2 ? 1 : -1;
        const base = (i * 137) % W;
        const x = base + side * open * (380 - layer * 80) + Math.sin(t * 0.2 + i) * 20 + tl * (layer + 1) * 8 * side;
        const y = 520 + layer * 80 + (i % 3) * 25;
        puff(g, i + layer, layer === 2 ? '#fbeedd' : '#e8dcc8', x, y, 760, 240, 0.65 + layer * 0.1);
      }
    }
    // Clouds still covering the frame at the moment of breach.
    const cover = 1 - open;
    if (cover > 0) {
      for (let i = 0; i < 10; i++) {
        const side = i % 2 ? 1 : -1;
        puff(g, i, '#f4ead8', W / 2 + side * (200 + open * 1400) + (i - 5) * 60, H / 2 + (i % 3 - 1) * 200, 1400, 900, cover);
      }
    }
    // One final distant strike.
    const fb = tl > 1.7 && tl < 2.2 ? Math.max(0, 1 - (tl - 1.7) * 3) * (hash(Math.floor(tl * 24), 3) > 0.3 ? 1 : 0.5) : 0;
    drawBolt(g, FINAL_BOLT, fb * 0.7, 1.6);
    fillAll(g, rgba('#ffffff', fb * 0.06));
    godRays(g, 1560, 330, 0.35, t, '#ffe0a8');

    // Title.
    const ta = ss(tl, 0.9, 1.9);
    if (ta > 0) {
      g.save();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.shadowColor = rgba('#2a1a08', 0.45 * ta); g.shadowBlur = 24;
      g.globalAlpha = ta;
      g.font = '600 76px Cinzel, serif';
      if ('letterSpacing' in g) g.letterSpacing = '22px';
      const tg = g.createLinearGradient(0, 110, 0, 170);
      tg.addColorStop(0, '#fff2c8'); tg.addColorStop(0.55, '#e6c173'); tg.addColorStop(1, '#a8782c');
      g.fillStyle = tg;
      g.fillText('THE BEGINNING', W / 2 + 11, 138);
      g.shadowBlur = 12;
      const sa = ss(tl, 1.4, 2.3);
      g.globalAlpha = sa;
      g.font = '400 25px Cinzel, serif';
      if ('letterSpacing' in g) g.letterSpacing = '11px';
      g.fillStyle = '#f6e8c8';
      g.fillText('A STORY OF GREEK MYTHOLOGY', W / 2 + 5, 206);
      // A thin meander rule between them.
      g.shadowBlur = 0; g.globalAlpha = sa * 0.8;
      meander(g, W / 2 - 150, 170, 300, 3.2, '#e6c173', 1.2);
      g.restore();
    }
  }

  // ------------------------------------------------------------- the cut
  // start (s), function, crossfade-in (s).
  const SCENES = [
    { a: 0.0, fn: sceneVoid, fade: 0 },          // Chaos + primordial void
    { a: 14.1, fn: sceneGaia, fade: 0.9 },
    { a: 19.7, fn: sceneUranus, fade: 0.6 },
    { a: 24.7, fn: sceneTitans, fade: 0.8 },
    { a: 31.3, fn: sceneImprison, fade: 0.5 },
    { a: 36.4, fn: sceneCronus, fade: 0 },       // hard cut on the metallic impact
    { a: 43.4, fn: sceneReign, fade: 0.9 },
    { a: 51.8, fn: sceneHidden, fade: 0 },       // hard cut to silence
    { a: 56.3, fn: sceneZeus, fade: 0.6 },
  ];

  let buf = null;
  function renderScene(g, i, t) {
    g.save();
    SCENES[i].fn(g, t, t - SCENES[i].a);
    g.restore();
  }

  function postFX(g, t) {
    // Vignette.
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    // Film grain, changing every frame.
    const fr = Math.floor(t * 24);
    g.save();
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.09;
    const pat = g.createPattern(TX.grain[fr % TX.grain.length], 'repeat');
    pat.setTransform(new DOMMatrix().translate((fr * 37) % 256, (fr * 91) % 256));
    g.fillStyle = pat; g.fillRect(0, 0, W, H);
    g.restore();
  }

  function render(ctx, t, scale = 1) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    if (t >= PICTURE_END || t < 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
    let i = 0;
    while (i + 1 < SCENES.length && t >= SCENES[i + 1].a) i++;
    renderScene(ctx, i, t);
    // Crossfade from the previous scene.
    const f = SCENES[i].fade;
    if (f > 0 && t < SCENES[i].a + f && i > 0) {
      if (!buf || buf.width !== ctx.canvas.width) buf = canvas(ctx.canvas.width, ctx.canvas.height);
      const bg = buf.getContext('2d');
      bg.setTransform(scale, 0, 0, scale, 0, 0); bg.globalAlpha = 1; bg.globalCompositeOperation = 'source-over'; bg.filter = 'none';
      renderScene(bg, i - 1, t);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1 - smooth(seg(t, SCENES[i].a, SCENES[i].a + f));
      ctx.drawImage(buf, 0, 0);
      ctx.restore();
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    postFX(ctx, t);
    // Gentle fade in from absolute black at the top.
    if (t < 0.6) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.6})`; ctx.fillRect(0, 0, W, H); }
  }

  let ready = false;
  async function init() {
    if (ready) return;
    buildTextures(); tagTextures();
    if (document.fonts) {
      try { await document.fonts.load('600 76px Cinzel'); await document.fonts.load('400 25px Cinzel'); } catch (e) { /* serif fallback */ }
    }
    ready = true;
  }

  window.FILM = { W, H, DURATION, PICTURE_END, FPS: 24, init, render };
})();
