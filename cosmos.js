/* =====================================================================
   Arcova — "Cosmos": the senior core with its specialist network in orbit.
   Canvas 2D with a tiny 3D projection. No dependencies.
   Mounts into .kinetic (replaces the old text cylinder).
   ===================================================================== */
(() => {
  'use strict';
  const section = document.querySelector('.kinetic');
  if (!section) return;
  const stage = section.querySelector('.kinetic__stage');
  if (stage) stage.remove();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'cosmos';
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);
  section.classList.add('has-cosmos');
  const ctx = canvas.getContext('2d');

  const LABELS = {
    es: ['Desarrollo', 'Ingeniería', 'IA', 'Datos', 'AR', 'Producción', 'Fabricación', 'Impresión', 'Fotografía', 'Video', 'Contenido', 'Paid Media'],
    en: ['Development', 'Engineering', 'AI', 'Data', 'AR', 'Production', 'Fabrication', 'Printing', 'Photography', 'Video', 'Content', 'Paid Media']
  };
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'es');

  // Brand palette for orbs [inner, outer]
  const PAL = [
    ['#c4b5fd', '#6d28d9'], ['#93c5fd', '#2563eb'], ['#a5f3fc', '#0891b2'],
    ['#f0abfc', '#9333ea'], ['#bae6fd', '#3b82f6'], ['#ddd6fe', '#7c3aed']
  ];

  // Pre-rendered sprites
  function orbSprite([inner, outer], size = 128) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), r = size / 2;
    // halo
    let grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, outer + 'aa'); grd.addColorStop(0.35, outer + '44'); grd.addColorStop(1, outer + '00');
    g.fillStyle = grd; g.fillRect(0, 0, size, size);
    // body
    const br = r * 0.36;
    grd = g.createRadialGradient(r - br * 0.35, r - br * 0.4, br * 0.05, r, r, br);
    grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.25, inner); grd.addColorStop(0.85, outer); grd.addColorStop(1, '#0b0620');
    g.fillStyle = grd; g.beginPath(); g.arc(r, r, br, 0, Math.PI * 2); g.fill();
    // rim light
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = size * 0.012;
    g.beginPath(); g.arc(r, r, br * 0.97, Math.PI * 0.9, Math.PI * 1.6); g.stroke();
    return c;
  }
  function coreSprite(size = 512) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), r = size / 2;
    let grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, 'rgba(167,139,250,.55)'); grd.addColorStop(0.3, 'rgba(99,102,241,.22)'); grd.addColorStop(0.6, 'rgba(34,211,238,.07)'); grd.addColorStop(1, 'rgba(34,211,238,0)');
    g.fillStyle = grd; g.fillRect(0, 0, size, size);
    const br = r * 0.34;
    grd = g.createLinearGradient(r - br, r - br, r + br, r + br);
    grd.addColorStop(0, '#8b3dff'); grd.addColorStop(0.5, '#2563eb'); grd.addColorStop(1, '#22d3ee');
    g.fillStyle = grd; g.beginPath(); g.arc(r, r, br, 0, Math.PI * 2); g.fill();
    // inner shading for volume
    grd = g.createRadialGradient(r - br * 0.45, r - br * 0.5, br * 0.05, r, r, br * 1.05);
    grd.addColorStop(0, 'rgba(255,255,255,.85)'); grd.addColorStop(0.18, 'rgba(255,255,255,.25)'); grd.addColorStop(0.6, 'rgba(10,6,40,0)'); grd.addColorStop(1, 'rgba(5,3,20,.75)');
    g.fillStyle = grd; g.beginPath(); g.arc(r, r, br, 0, Math.PI * 2); g.fill();
    // glassy rim
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2;
    g.beginPath(); g.arc(r, r, br - 1, Math.PI * 0.85, Math.PI * 1.55); g.stroke();
    return c;
  }
  const sprites = PAL.map(p => orbSprite(p));
  const core = coreSprite();

  // Scene
  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, scale = 1, small = false;
  const stars = [], orbs = [], dust = [], meteors = [];

  function build() {
    stars.length = orbs.length = dust.length = 0;
    const nStars = small ? 180 : 380;
    for (let i = 0; i < nStars; i++) stars.push({ x: Math.random(), y: Math.random(), z: Math.random(), tw: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() * 2 });
    const labels = LABELS[lang()];
    labels.forEach((label, i) => {
      const ring = i % 3;
      orbs.push({
        label,
        r: [210, 300, 390][ring],
        inc: [0.42, -0.3, 0.2][ring],
        node: [0.15, 1.2, -0.7][ring],
        speed: [0.19, 0.13, 0.09][ring],
        phase: Math.floor(i / 3) * (Math.PI / 2) + ring * 0.6,
        size: 26 + Math.random() * 20,
        sprite: sprites[i % sprites.length],
        hover: 0
      });
    });
    for (let i = 0; i < (small ? 60 : 140); i++) dust.push({ a: Math.random() * Math.PI * 2, r: 120 + Math.random() * 360, y: (Math.random() - 0.5) * 60, s: 0.02 + Math.random() * 0.06, o: Math.random() });
  }

  function resize() {
    const r = section.getBoundingClientRect();
    small = innerWidth < 1024;
    DPR = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    cx = small ? W * 0.5 : W * 0.32;
    cy = small ? Math.min(H * 0.32, 340) : H * 0.5;
    scale = small ? Math.min(W / 1150, 0.55) : Math.min(W / 1900, H / 1000, 0.95);
    build();
  }

  // Pointer parallax
  let px = 0, py = 0, tx = 0, ty = 0, mx = -1e4, my = -1e4;
  section.addEventListener('pointermove', e => {
    const r = section.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    tx = (mx / r.width - 0.5); ty = (my / r.height - 0.5);
  });
  section.addEventListener('pointerleave', () => { tx = ty = 0; mx = my = -1e4; });

  function rot(x, y, z, inc, node) {
    // tilt around X (inclination), then spin around Y (node)
    let y1 = y * Math.cos(inc) - z * Math.sin(inc), z1 = y * Math.sin(inc) + z * Math.cos(inc);
    let x2 = x * Math.cos(node) + z1 * Math.sin(node), z2 = -x * Math.sin(node) + z1 * Math.cos(node);
    return [x2, y1, z2];
  }
  const FOV = 900;
  function project(x, y, z) {
    // camera yaw/pitch from pointer
    const yaw = px * 0.5, pitch = -0.28 + py * 0.3;
    let x1 = x * Math.cos(yaw) - z * Math.sin(yaw), z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
    let y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch), z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
    const k = FOV / (FOV + z2);
    return { x: cx + x1 * k * scale, y: cy + y2 * k * scale, z: z2, k };
  }

  function drawNebula(t) {
    ctx.globalCompositeOperation = 'lighter';
    const blobs = [
      [0.25 + Math.sin(t * 0.05) * 0.08, 0.45 + Math.cos(t * 0.04) * 0.1, 0.55, 'rgba(109,40,217,'],
      [0.62 + Math.cos(t * 0.035) * 0.1, 0.3 + Math.sin(t * 0.05) * 0.08, 0.45, 'rgba(37,99,235,'],
      [0.5 + Math.sin(t * 0.03 + 2) * 0.12, 0.8 + Math.cos(t * 0.045) * 0.06, 0.4, 'rgba(6,182,212,'],
      [0.12 + Math.cos(t * 0.04 + 1) * 0.06, 0.15 + Math.sin(t * 0.03) * 0.08, 0.3, 'rgba(192,38,211,']
    ];
    for (const [bx, by, br, col] of blobs) {
      const x = bx * W, y = by * H, r = br * Math.max(W, H);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col + '0.20)'); g.addColorStop(0.5, col + '0.07)'); g.addColorStop(1, col + '0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawStars(t) {
    for (const s of stars) {
      const depth = 0.3 + s.z * 0.7;
      const x = ((s.x + t * 0.0025 * depth) % 1) * W - px * 40 * depth;
      const y = s.y * H - py * 30 * depth;
      const a = (0.35 + 0.65 * Math.abs(Math.sin(t * s.sp * 0.6 + s.tw))) * depth;
      ctx.fillStyle = `rgba(226,232,255,${a.toFixed(3)})`;
      const sz = depth * 1.6;
      ctx.fillRect(x, y, sz, sz);
      if (s.z > 0.93) { // a few sparkle crosses
        ctx.fillStyle = `rgba(200,220,255,${(a * 0.4).toFixed(3)})`;
        ctx.fillRect(x - 3, y + sz / 2 - 0.5, 6 + sz, 1); ctx.fillRect(x + sz / 2 - 0.5, y - 3, 1, 6 + sz);
      }
    }
  }

  function drawMeteors(dt) {
    if (!reduced && Math.random() < 0.004) {
      meteors.push({ x: Math.random() * W * 0.8 + W * 0.2, y: Math.random() * H * 0.4, vx: -(6 + Math.random() * 5), vy: 2.5 + Math.random() * 2, life: 1 });
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx * dt * 60; m.y += m.vy * dt * 60; m.life -= dt * 0.9;
      if (m.life <= 0) { meteors.splice(i, 1); continue; }
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
      g.addColorStop(0, `rgba(255,255,255,${m.life})`); g.addColorStop(1, 'rgba(125,211,252,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14); ctx.stroke();
    }
  }

  function orbitPath(o) {
    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const [x, y, z] = rot(Math.cos(a) * o.r, 0, Math.sin(a) * o.r, o.inc, o.node);
      pts.push(project(x, y, z));
    }
    return pts;
  }

  let T = 0, last = performance.now(), running = false, raf = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!reduced) T += dt;
    px += (tx - px) * 0.04; py += (ty - py) * 0.04;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawNebula(T);
    drawStars(T);
    drawMeteors(dt);

    // Orbit rings (drawn as arcs, brighter in front)
    const seen = new Set();
    for (const o of orbs) {
      const key = o.r.toFixed(0) + o.inc.toFixed(2);
      if (seen.has(key)) continue; seen.add(key);
      const pts = orbitPath(o);
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const front = (a.z + b.z) < 0;
        ctx.strokeStyle = front ? 'rgba(165,180,252,.22)' : 'rgba(165,180,252,.07)';
        ctx.lineWidth = front ? 1 : 0.8;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    // Dust ring
    ctx.globalCompositeOperation = 'lighter';
    for (const d of dust) {
      d.a += d.s * dt;
      const [x, y, z] = rot(Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r, 0.35, 0.2);
      const p = project(x, y, z);
      const a = (0.15 + 0.35 * Math.abs(Math.sin(T * 0.8 + d.o * 9))) * p.k;
      ctx.fillStyle = `rgba(147,197,253,${a.toFixed(3)})`;
      ctx.fillRect(p.x, p.y, 1.5 * p.k, 1.5 * p.k);
    }
    ctx.globalCompositeOperation = 'source-over';

    // Collect bodies and depth sort
    const bodies = [];
    const cp = project(0, Math.sin(T * 0.8) * 6, 0);
    bodies.push({ core: true, p: cp });
    for (const o of orbs) {
      const ang = o.phase + T * o.speed;
      const [x, y, z] = rot(Math.cos(ang) * o.r, 0, Math.sin(ang) * o.r, o.inc, o.node);
      const p = project(x, y, z);
      // trail: previous positions along the orbit
      const trail = [];
      for (let k = 1; k <= 14; k++) {
        const a2 = ang - k * 0.035;
        const [tx2, ty2, tz2] = rot(Math.cos(a2) * o.r, 0, Math.sin(a2) * o.r, o.inc, o.node);
        trail.push(project(tx2, ty2, tz2));
      }
      bodies.push({ o, p, trail });
    }
    bodies.sort((a, b) => b.p.z - a.p.z);
    const front3 = new Set(bodies.filter(b => !b.core).slice(-3).map(b => b.o));

    for (const b of bodies) {
      if (b.core) {
        const pulse = 1 + Math.sin(T * 1.4) * 0.025;
        const s = 560 * scale * b.p.k * pulse;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.5;
        ctx.drawImage(core, b.p.x - s * 0.75, b.p.y - s * 0.75, s * 1.5, s * 1.5);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(core, b.p.x - s / 2, b.p.y - s / 2, s, s);
        continue;
      }
      const { o, p, trail } = b;
      // hover detection
      const near = Math.hypot(mx - p.x, my - p.y) < o.size * 1.4 * scale * p.k + 12;
      o.hover += ((near ? 1 : 0) - o.hover) * 0.12;
      const depthA = Math.max(0.25, Math.min(1, 1.15 - (p.z + 400) / 900));
      // comet trail
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < trail.length; i++) {
        const q = trail[i];
        const a = (1 - i / trail.length) * 0.35 * depthA;
        ctx.fillStyle = `rgba(147,197,253,${a.toFixed(3)})`;
        const rr = (1 - i / trail.length) * 3 * scale * q.k + 0.5;
        ctx.beginPath(); ctx.arc(q.x, q.y, rr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      const sz = o.size * 2.8 * scale * p.k * (1 + o.hover * 0.45);
      ctx.globalAlpha = depthA;
      ctx.drawImage(o.sprite, p.x - sz / 2, p.y - sz / 2, sz, sz);
      // label (on small screens only the front half, to avoid clutter)
      if (small && !front3.has(o) && o.hover < 0.5) { ctx.globalAlpha = 1; continue; }
      const fs = Math.max(10, 13 * p.k * (small ? 0.9 : 1) + o.hover * 3);
      ctx.font = `500 ${fs.toFixed(1)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = `rgba(235,238,255,${(0.35 + 0.65 * depthA * (0.6 + o.hover * 0.4)).toFixed(3)})`;
      const right = p.x + sz * 0.26 + ctx.measureText(o.label.toUpperCase()).width > W - 12;
      ctx.textAlign = right ? 'right' : 'left';
      ctx.fillText(o.label.toUpperCase(), p.x + (right ? -1 : 1) * sz * 0.26, p.y - sz * 0.18);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    // Core label
    ctx.font = `600 ${small ? 11 : 12}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.textAlign = 'center';
    ctx.fillText('ARCOVA · CORE', cp.x, cp.y + 560 * scale * cp.k * 0.19 + 22);
    ctx.textAlign = 'left';

    if (running) raf = requestAnimationFrame(frame);
  }

  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (!running) frame(performance.now()); }, 150); });
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(resize, 150); }).observe(section);

  if (reduced) { T = 12; frame(performance.now()); }
  else new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '100px' }).observe(section);

  addEventListener('arcova:lang', () => { const L = LABELS[lang()]; orbs.forEach((o, i) => (o.label = L[i])); if (!running) frame(performance.now()); });
})();
