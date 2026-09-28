/* =====================================================================
   Arcova — "The arc": the line between your vision and your reality.
   Builds #arc (pinned, scroll-scrubbed) and a thin arc behind the hero.
   Depends on: gsap + ScrollTrigger (optional — degrades to a static
   final state), CSS in arc.css. No other libraries.
   ===================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduced;

  /* ---------------------------------------------------------------- */
  /* i18n                                                              */
  /* ---------------------------------------------------------------- */
  const I18N = {
    es: {
      eyebrow: '→ El arco',
      t1: 'El arco entre', t2: 'tu visión', t3: 'y', t4: 'tu realidad.',
      lead: 'Todo empieza como un borrador: una idea, un brief, un boceto. Nuestro trabajo es trazar el camino que lo convierte en algo que tus clientes ven, usan y recuerdan.',
      leadMono: 'Arcova · de “arco” — lo que une dos puntos',
      vision: '01 — Tu visión', visionSub: 'Ideas, briefs y bocetos.',
      reality: '02 — Tu realidad', realitySub: 'Marca, web y experiencia.',
      n1: 'Think', n1s: 'Entendemos el reto',
      n2: 'Create', n2s: 'Diseñamos el sistema',
      n3: 'Build', n3s: 'Lo hacemos real',
      meter: 'del arco trazado', meterDone: 'visión → realidad',
      cta: 'Empecemos tu arco',
      w1: '↖ ¿logo aquí?', w2: '¿foto o video?', w3: '← cta principal', w4: '3 servicios ↓', wm: '1440 px',
      rcTitle: 'Lo que mueve<br>tu marca.', rcSub: 'Estrategia, diseño y tecnología en una sola dirección.', rcBtn: 'Empezar', rcLive: 'En vivo',
    },
    en: {
      eyebrow: '→ The arc',
      t1: 'The arc between', t2: 'your vision', t3: 'and', t4: 'your reality.',
      lead: 'Everything starts as a draft: an idea, a brief, a sketch. Our job is to draw the line that turns it into something your customers see, use and remember.',
      leadMono: 'Arcova · from “arc” — what joins two points',
      vision: '01 — Your vision', visionSub: 'Ideas, briefs and sketches.',
      reality: '02 — Your reality', realitySub: 'Brand, web and experience.',
      n1: 'Think', n1s: 'We understand the challenge',
      n2: 'Create', n2s: 'We design the system',
      n3: 'Build', n3s: 'We make it real',
      meter: 'of the arc drawn', meterDone: 'vision → reality',
      cta: 'Let’s start your arc',
      w1: '↖ logo here?', w2: 'photo or video?', w3: '← main cta', w4: '3 services ↓', wm: '1440 px',
      rcTitle: 'What moves<br>your brand.', rcSub: 'Strategy, design and technology in one direction.', rcBtn: 'Get started', rcLive: 'Live',
    }
  };
  const HTML_KEYS = new Set(['rcTitle']);
  const getLang = () => (String(document.documentElement.lang || 'es').toLowerCase().startsWith('en') ? 'en' : 'es');
  const applyLang = (root, lang) => {
    const d = I18N[lang] || I18N.es;
    $$('[data-arc-i18n]', root).forEach(el => {
      const k = el.dataset.arcI18n;
      if (!(k in d)) return;
      if (HTML_KEYS.has(k)) el.innerHTML = d[k]; else el.textContent = d[k];
    });
  };

  /* ---------------------------------------------------------------- */
  /* Helpers                                                           */
  /* ---------------------------------------------------------------- */
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const svgEl = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const pad2 = n => String(n).padStart(2, '0');

  /* ================================================================ */
  /* 1. THE ARC SECTION                                                */
  /* ================================================================ */
  function buildArc() {
    const section = $('#arc');
    if (!section) return;
    section.innerHTML = '';

    /* ---- DOM ---- */
    const inner = el('div', 'arc__inner');
    inner.append(el('div', 'arc__grid'), el('div', 'arc__bg'));

    const head = el('div', 'arc__head');
    head.innerHTML = `
      <div>
        <p class="eyebrow" data-arc-i18n="eyebrow"></p>
        <h2 class="arc__title">
          <span class="line"><span data-arc-i18n="t1"></span></span>
          <span class="line"><span><span class="arc__o" data-arc-i18n="t2"></span> <span data-arc-i18n="t3"></span></span></span>
          <span class="line"><span class="grad" data-arc-i18n="t4"></span></span>
        </h2>
      </div>
      <p class="arc__lead"><span data-arc-i18n="lead"></span><span class="mono" data-arc-i18n="leadMono"></span></p>`;

    const stage = el('div', 'arc__stage');

    // Vision side (wireframe)
    const vision = el('div', 'arc__side arc__side--vision');
    vision.innerHTML = `
      <div class="arc__label"><span class="mono" data-arc-i18n="vision"></span><span class="arc__label-s" data-arc-i18n="visionSub"></span></div>
      <div class="arc__card arc__card--wire">
        ${wireSVG('wire--gray')}
        ${wireSVG('wire--lit', true)}
        <div class="wire__m"><span data-arc-i18n="wm"></span></div>
        <span class="wire__note" style="left:15%;top:13%;transform:rotate(-4deg)" data-arc-i18n="w1"></span>
        <span class="wire__note" style="left:61%;top:44%;transform:rotate(3deg)" data-arc-i18n="w2"></span>
        <span class="wire__note" style="left:29%;top:50%;transform:rotate(-2deg)" data-arc-i18n="w3"></span>
        <span class="wire__note" style="left:33%;top:67%;transform:rotate(2deg)" data-arc-i18n="w4"></span>
        <div class="arc__scan"></div>
      </div>`;

    // Reality side (polished)
    const reality = el('div', 'arc__side arc__side--reality');
    reality.innerHTML = `
      <div class="arc__label"><span class="mono" data-arc-i18n="reality"></span><span class="arc__label-s" data-arc-i18n="realitySub"></span></div>
      <div class="arc__card arc__card--real">
        <div class="rc">
          <div class="rc__nav"><span class="rc__logo"></span><i></i><i></i><i></i><b class="rc__pill"></b></div>
          <div class="rc__hero">
            <div class="rc__copy"><h4 data-arc-i18n="rcTitle"></h4><p data-arc-i18n="rcSub"></p><span class="rc__btn"><span data-arc-i18n="rcBtn"></span> →</span></div>
            <div class="rc__img"><span data-arc-i18n="rcLive"></span></div>
          </div>
          <div class="rc__cards"><i></i><i></i><i></i></div>
        </div>
      </div>`;

    // SVG arc
    const svg = svgEl('svg', { class: 'arc__svg', 'aria-hidden': 'true', viewBox: '0 0 1000 500' });
    const defs = svgEl('defs');
    const grad = svgEl('linearGradient', { id: 'arcGrad', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1000, y2: 0 });
    [['0', '#8b3dff'], ['.5', '#2563eb'], ['1', '#22d3ee']].forEach(([o, c]) => grad.append(svgEl('stop', { offset: o, 'stop-color': c })));
    const cometGlow = svgEl('radialGradient', { id: 'cometGlow' });
    [['0', '#fff', '.9'], ['.25', '#67e8f9', '.55'], ['1', '#22d3ee', '0']].forEach(([o, c, a]) => cometGlow.append(svgEl('stop', { offset: o, 'stop-color': c, 'stop-opacity': a })));
    defs.append(grad, cometGlow);

    const ghost = svgEl('path', { class: 'arc__ghost' });
    const glow = svgEl('path', { class: 'arc__glow' });
    const glow2 = svgEl('path', { class: 'arc__glow2' });
    const line = svgEl('path', { class: 'arc__line' });
    const tail = svgEl('path', { class: 'arc__tail' });
    const anchorS = svgEl('circle', { class: 'arc__anchor', r: 5 });
    const anchorE = svgEl('circle', { class: 'arc__anchor arc__anchor--end', r: 5 });
    const nodes = [0.25, 0.5, 0.75].map(() => {
      const g = svgEl('g', { class: 'arc__node' });
      g.append(svgEl('circle', { class: 'arc__node-pulse', r: 10 }), svgEl('circle', { class: 'arc__node-ring', r: 13 }), svgEl('circle', { class: 'arc__node-core', r: 5 }));
      return g;
    });
    const comet = svgEl('g', { class: 'arc__comet' });
    comet.append(svgEl('circle', { r: 26, fill: 'url(#cometGlow)' }), svgEl('circle', { r: 3.5, fill: '#fff' }));
    svg.append(defs, ghost, glow, glow2, line, tail, anchorS, anchorE, ...nodes, comet);

    // Chips
    const chips = [1, 2, 3].map(i => {
      const c = el('div', 'arc__chip');
      c.innerHTML = `<span class="arc__chip-n">0${i}</span><span><span class="arc__chip-t" data-arc-i18n="n${i}"></span><span class="arc__chip-s" data-arc-i18n="n${i}s"></span></span>`;
      return c;
    });

    // Meter + CTA
    const meter = el('div', 'arc__meter');
    meter.innerHTML = `<div class="arc__num"><span class="arc__num-v">0</span><small>%</small></div><span class="mono arc__meter-l" data-arc-i18n="meter"></span><br><a href="#contact" class="arc__cta"><span data-arc-i18n="cta"></span><i>→</i></a>`;

    stage.append(svg, vision, reality, ...chips, meter);
    inner.append(head, stage);
    section.append(inner);

    /* ---- refs ---- */
    const visionCard = $('.arc__card--wire', vision);
    const realityCard = $('.arc__card--real', reality);
    const wireGray = $('.wire--gray', vision), wireLit = $('.wire--lit', vision), scan = $('.arc__scan', vision);
    const bg = $('.arc__bg', inner), grid = $('.arc__grid', inner);
    const numEl = $('.arc__num-v', meter), meterLabel = $('.arc__meter-l', meter), cta = $('.arc__cta', meter);
    const drawPaths = [glow, glow2, line];
    const NODE_T = [0.25, 0.5, 0.75];
    const TAIL = 110;

    /* ---- i18n ---- */
    let lang = getLang();
    applyLang(section, lang);
    window.addEventListener('arcova:lang', e => {
      lang = (e.detail && e.detail.lang) ? (String(e.detail.lang).startsWith('en') ? 'en' : 'es') : getLang();
      applyLang(section, lang);
      render(state.p, true);
    });

    /* ---- geometry ---- */
    const state = { p: 0 };
    let L = 1, mobile = false;
    const isMobile = () => window.matchMedia('(max-width: 820px)').matches;

    function layout() {
      mobile = isMobile();
      const W = Math.max(1, stage.offsetWidth), H = Math.max(1, stage.offsetHeight);
      if (!mobile) {
        const cw = Math.max(220, Math.min(W * 0.28, 400, (H * 0.6) * 4 / 3));
        stage.style.setProperty('--cw', cw + 'px');
        stage.classList.toggle('arc__stage--narrow', cw < 300);
      } else {
        stage.style.setProperty('--cw', visionCard.offsetWidth + 'px');
      }
      // re-measure after width change. Offsets (not rects): immune to the
      // entrance/scrub transforms that may be applied at refresh time.
      const W2 = Math.max(1, stage.offsetWidth), H2 = Math.max(1, stage.offsetHeight);
      svg.setAttribute('viewBox', `0 0 ${W2} ${H2}`);
      const rel = n => {
        let x = 0, y = 0, e = n;
        while (e && e !== stage) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
        return { x, y, w: n.offsetWidth, h: n.offsetHeight };
      };
      const v = rel(visionCard), r = rel(realityCard), vs = rel(vision), rs = rel(reality);
      let S, E, d;
      if (!mobile) {
        S = { x: v.x + v.w / 2, y: v.y - 16 };
        E = { x: r.x + r.w / 2, y: r.y - 16 };
        const apex = 22;
        const cy = (4 * apex - S.y - E.y) / 2;
        d = `M${S.x},${S.y} Q${(S.x + E.x) / 2},${cy} ${E.x},${E.y}`;
      } else {
        S = { x: v.x + v.w / 2, y: vs.y + vs.h + 16 };
        E = { x: r.x + r.w / 2, y: rs.y - 16 };
        const cx = Math.min(W2 - 24, W2 * 1.02);
        d = `M${S.x},${S.y} Q${cx},${(S.y + E.y) / 2} ${E.x},${E.y}`;
      }
      [ghost, glow, glow2, line, tail].forEach(p => p.setAttribute('d', d));
      L = line.getTotalLength() || 1;
      drawPaths.forEach(p => { p.style.strokeDasharray = `${L} ${L}`; });
      tail.style.strokeDasharray = `${TAIL} ${L + TAIL}`;
      grad.setAttribute('x1', S.x); grad.setAttribute('y1', S.y); grad.setAttribute('x2', E.x); grad.setAttribute('y2', E.y);
      anchorS.setAttribute('cx', S.x); anchorS.setAttribute('cy', S.y);
      anchorE.setAttribute('cx', E.x); anchorE.setAttribute('cy', E.y);
      NODE_T.forEach((t, i) => {
        const pt = line.getPointAtLength(L * t);
        nodes[i].setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        const c = chips[i];
        if (!mobile) {
          if (i === 0) { c.style.left = pt.x + 26 + 'px'; c.style.top = pt.y + 30 + 'px'; c.style.transform = 'none'; }
          else if (i === 1) { c.style.left = pt.x + 'px'; c.style.top = pt.y + 26 + 'px'; c.style.transform = 'translateX(-50%)'; }
          else { c.style.left = pt.x - 26 + 'px'; c.style.top = pt.y + 30 + 'px'; c.style.transform = 'translateX(-100%)'; }
        } else {
          c.style.left = pt.x - 20 + 'px'; c.style.top = pt.y + 'px'; c.style.transform = 'translate(-100%,-50%)';
        }
      });
      render(state.p, true);
    }

    function render(p, force) {
      const off = L * (1 - p);
      drawPaths.forEach(el => { el.style.strokeDashoffset = off; });
      tail.style.strokeDashoffset = -(L * p - TAIL);
      const pt = line.getPointAtLength(L * p);
      comet.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      comet.style.opacity = p > 0.004 ? 1 : 0;
      NODE_T.forEach((t, i) => {
        const on = p >= t - 0.006;
        nodes[i].classList.toggle('is-on', on);
        chips[i].classList.toggle('is-on', on);
      });
      const pct = Math.round(p * 100);
      if (force || numEl.textContent !== String(pct)) numEl.textContent = pct;
      const done = p >= 0.995;
      section.classList.toggle('is-done', done);
      const d = I18N[lang] || I18N.es;
      meterLabel.textContent = done ? d.meterDone : d.meter;
    }

    /* ---- Static fallback ---- */
    if (!motion) {
      section.classList.add('arc--static');
      state.p = 1;
      layout();
      window.addEventListener('resize', layout);
      return;
    }

    /* ---- Motion ---- */
    const gsap = window.gsap, ST = window.ScrollTrigger;
    let tl = null, entrance = null, mode = null;

    // Smooth scroll for the CTA (created after main.js bound its anchors)
    cta.addEventListener('click', e => {
      const target = $('#contact');
      if (!target) return;
      e.preventDefault();
      const o = { y: window.scrollY };
      gsap.to(o, { y: target.getBoundingClientRect().top + window.scrollY, duration: 1.6, ease: 'power3.inOut', onUpdate: () => window.scrollTo(0, o.y) });
    });

    function build() {
      mobile = isMobile();
      layout();
      // Fallback to non-pinned flow if the pinned block doesn't fit the viewport
      const fits = inner.getBoundingClientRect().height <= window.innerHeight + 4;
      const pin = !mobile && fits;
      mode = pin ? 'pin' : 'flow';

      tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: pin
          ? { trigger: section, start: 'top top', end: () => '+=' + Math.round(window.innerHeight * 2.3), pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
          : { trigger: stage, start: 'top 78%', end: 'bottom 40%', scrub: 0.6, invalidateOnRefresh: true }
      });
      tl.to(state, { p: 1, duration: 0.88, onUpdate: () => render(state.p) }, 0.04)
        .fromTo(grid, { opacity: 1 }, { opacity: 0.35, duration: 0.3 }, 0.6)
        .fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.62)
        .fromTo(wireLit, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.56)
        .fromTo(wireGray, { opacity: 1 }, { opacity: 0.22, duration: 0.3 }, 0.56)
        .fromTo(scan, { xPercent: -100, opacity: 1 }, { xPercent: 0, duration: 0.3 }, 0.56)
        .to(scan, { opacity: 0, duration: 0.06 }, 0.86)
        .fromTo(realityCard, { opacity: 0.32, scale: 0.94, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.2 }, 0.74)
        .fromTo(reality, { '--glow': 0 }, { '--glow': 1, duration: 0.22 }, 0.76)
        .fromTo(cta, { opacity: 0, y: 12, pointerEvents: 'none' }, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.07 }, 0.91);

      entrance = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 75%', once: true }, defaults: { ease: 'expo.out' } });
      entrance
        .from($('.eyebrow', head), { opacity: 0, x: -20, duration: 1 }, 0)
        .from($$('.arc__title .line > span', head), { yPercent: 115, rotate: 3, duration: 1.3, stagger: 0.1 }, 0)
        .from($('.arc__lead', head), { opacity: 0, y: 20, duration: 1 }, 0.3)
        .from([vision, reality, meter], { opacity: 0, y: 40, duration: 1.2, stagger: 0.1 }, 0.2)
        .from(chips, { opacity: 0, y: 14, duration: 0.9, stagger: 0.08 }, 0.5)
        .from(svg, { opacity: 0, duration: 1 }, 0.4);
    }

    function destroy() {
      if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); tl = null; }
      if (entrance) { entrance.scrollTrigger && entrance.scrollTrigger.kill(); entrance.kill(); entrance = null; }
      gsap.set([grid, bg, wireLit, wireGray, scan, realityCard, cta, svg, vision, reality, meter, ...chips, $('.eyebrow', head), $('.arc__lead', head), ...$$('.arc__title .line > span', head)], { clearProps: 'all' });
      state.p = 0;
    }

    build();
    ST.addEventListener('refreshInit', layout);

    // Rebuild on breakpoint / fit change (debounced)
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const fits = inner.getBoundingClientRect().height <= window.innerHeight + 4;
        const want = (!isMobile() && fits) ? 'pin' : 'flow';
        if (want !== mode) { destroy(); build(); ST.refresh(); }
      }, 200);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
  }

  /* Wireframe SVG (400x300 → 1em = 10 units, mirrors the "real" card) */
  function wireSVG(cls, lit) {
    const shapes = `
      <rect class="wire__fill" x="20" y="20" width="24" height="24" rx="7"/>
      <line x1="176" y1="32" x2="206" y2="32"/><line x1="216" y1="32" x2="246" y2="32"/><line x1="256" y1="32" x2="286" y2="32"/>
      <rect x="320" y="21" width="60" height="22" rx="11"/>
      <rect x="20" y="70" width="190" height="18" rx="3"/>
      <rect x="20" y="94" width="150" height="18" rx="3"/>
      <line x1="20" y1="124" x2="150" y2="124"/><line x1="20" y1="132" x2="110" y2="132"/>
      <rect class="wire__fill" x="20" y="148" width="84" height="24" rx="12"/>
      <rect class="wire__fill" x="232" y="64" width="148" height="140" rx="12"/>
      <line class="wire__x" x1="232" y1="64" x2="380" y2="204"/><line class="wire__x" x1="380" y1="64" x2="232" y2="204"/>
      <rect x="20" y="226" width="110" height="54" rx="10"/><rect x="145" y="226" width="110" height="54" rx="10"/><rect x="270" y="226" width="110" height="54" rx="10"/>
      <circle class="wire__dot" cx="37" cy="243" r="6"/><circle class="wire__dot" cx="162" cy="243" r="6"/><circle class="wire__dot" cx="287" cy="243" r="6"/>
      <line x1="30" y1="266" x2="90" y2="266"/><line x1="155" y1="266" x2="200" y2="266"/><line x1="280" y1="266" x2="350" y2="266"/>`;
    const defs = lit ? `<defs><linearGradient id="wireGradLit" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="0"><stop offset="0" stop-color="#8b3dff"/><stop offset=".5" stop-color="#2563eb"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>` : '';
    return `<svg class="${cls}" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">${defs}${shapes}</svg>`;
  }

  /* ================================================================ */
  /* 2. HERO ARC                                                       */
  /* ================================================================ */
  function buildHeroArc() {
    const hero = $('.hero');
    if (!hero) return;
    const svg = svgEl('svg', { class: 'hero-arc', 'aria-hidden': 'true' });
    svg.innerHTML = `<defs>
      <linearGradient id="heroArcGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0"><stop offset="0" stop-color="#8b3dff"/><stop offset=".5" stop-color="#2563eb"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
      <radialGradient id="heroDotGlow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#67e8f9" stop-opacity=".5"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
    </defs>
    <path class="hero-arc__ghost"/><path class="hero-arc__soft"/><path class="hero-arc__line"/>
    <g class="hero-arc__dot"><circle r="18" fill="url(#heroDotGlow)"/><circle r="2.5" fill="#fff"/></g>`;
    hero.append(svg);
    const ghost = $('.hero-arc__ghost', svg), soft = $('.hero-arc__soft', svg), line = $('.hero-arc__line', svg), dot = $('.hero-arc__dot', svg), grad = $('#heroArcGrad', svg);
    let L = 1;
    const o = { p: 0 };
    let drawn = !motion;

    function layout() {
      const W = hero.clientWidth || 1, H = hero.clientHeight || 1;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const S = { x: -W * 0.03, y: H * 0.86 }, E = { x: W * 1.05, y: H * 0.72 };
      const apex = H * 0.16;
      const cy = (4 * apex - S.y - E.y) / 2;
      const d = `M${S.x},${S.y} Q${W * 0.47},${cy} ${E.x},${E.y}`;
      [ghost, soft, line].forEach(p => p.setAttribute('d', d));
      L = line.getTotalLength() || 1;
      grad.setAttribute('x1', 0); grad.setAttribute('x2', W);
      [soft, line].forEach(p => { p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = drawn ? 0 : L; });
      place();
    }
    function place() {
      const pt = line.getPointAtLength(L * o.p);
      dot.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    }
    layout();
    window.addEventListener('resize', layout);

    if (!motion) { o.p = 0.42; place(); return; }
    const gsap = window.gsap;
    const dashTo = (v) => { [soft, line].forEach(p => { p.style.strokeDashoffset = v; }); };
    const dObj = { v: L };
    // Draw in after the loader/intro (~3s), then let the dot loop along it.
    const loop = gsap.to(o, { p: 1, duration: 9, ease: 'none', repeat: -1, paused: true, onUpdate: place });
    gsap.timeline({ delay: 3.1 })
      .to(dObj, { v: 0, duration: 2.6, ease: 'power3.inOut', onStart: () => { dObj.v = L; }, onUpdate: () => dashTo(dObj.v), onComplete: () => { drawn = true; } })
      .to(dot, { opacity: 1, duration: 0.8, onStart: () => loop.play() }, '-=0.6');
    // Parallax with the title & pause the loop when the hero is off-screen
    gsap.to(svg, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, onToggle: s => { if (drawn) s.isActive ? loop.play() : loop.pause(); } } });
  }

  /* ---------------------------------------------------------------- */
  try { buildArc(); } catch (e) { console.error('[arcova/arc] section failed', e); }
  try { buildHeroArc(); } catch (e) { console.error('[arcova/arc] hero arc failed', e); }
})();
