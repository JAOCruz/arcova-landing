(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Static bits that don't need GSAP
  $('.year').textContent = new Date().getFullYear();
  const clock = $('.clock');
  const tick = () => {
    clock.textContent = 'SDQ ' + new Intl.DateTimeFormat('es-DO', { timeZone: 'America/Santo_Domingo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
  };
  tick(); setInterval(tick, 1000);

  // Split helpers
  $$('.reveal-words').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  });
  const fb = $('.footer__big');
  fb.innerHTML = [...fb.textContent].map(c => `<span class="ch">${c}</span>`).join('');

  // Duplicate logo rows / marquee for seamless loops
  $$('.logos__row').forEach(r => { r.innerHTML += r.innerHTML; });

  // Kinetic cylinder (spacetype "ARCOVA" study) over the cosmos background
  buildCylinder();
  // Cosmos background
  const cl = document.createElement('link'); cl.rel = 'stylesheet'; cl.href = 'cosmos.css'; document.head.appendChild(cl);
  const cs = document.createElement('script'); cs.src = 'cosmos.js'; cs.defer = true; document.body.appendChild(cs);

  // Services accordion
  $$('.svc__item').forEach(item => {
    const btn = $('.svc__row', item);
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      $$('.svc__item').forEach(o => { if (o !== item) { o.classList.remove('is-open'); $('.svc__row', o).setAttribute('aria-expanded', false); } });
    });
  });

  // Mobile menu
  const burger = $('.nav__burger'), menu = $('.menu');
  const setMenu = open => { burger.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', !open); };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Fallback: GSAP missing or reduced motion → show everything
  if (!window.gsap || reduced) {
    document.documentElement.classList.add('reduced');
    document.body.classList.remove('is-loading');
    $('.loader').remove();
    $$('.reveal-words .w').forEach(w => (w.style.opacity = 1));
    $$('.studio__photo-inner').forEach(p => (p.style.clipPath = 'none'));
    $$('[data-count]').forEach(n => (n.textContent = n.dataset.count));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6 });
    }));
  }

  // Nav hide on scroll down
  const nav = $('.nav');
  let lastY = 0;
  ScrollTrigger.create({
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-hidden', y > lastY && y > 200);
      lastY = y;
    }
  });

  // ---------- Loader → Hero intro ----------
  const counter = { v: 0 };
  const num = $('.loader__num');
  nav.classList.add('is-hidden');
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .to('.loader__brand span', { y: 0, duration: 1.1, stagger: 0.06 })
    .to(counter, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => (num.textContent = Math.round(counter.v)) }, 0)
    .to('.loader__bar i', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
    .to('.loader__brand span', { y: '-110%', duration: 0.8, stagger: 0.04, ease: 'expo.in' }, 1.7)
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 2.2)
    .add(() => { document.body.classList.remove('is-loading'); $('.loader').remove(); })
    .from('.hero__title .line > span', { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.09 }, 2.6)
    .from('.hero__glass', { opacity: 0, scale: 0.7, rotate: -25, duration: 2.2 }, 2.5)
    .from('.hero__top > *, .hero__lead, .hero__meta', { opacity: 0, y: 24, duration: 1.2, stagger: 0.08 }, 3)
    .add(() => nav.classList.remove('is-hidden'), 3);

  // Hero parallax on scroll
  gsap.to('.hero__title', { yPercent: 25, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__glass', { yPercent: 40, rotate: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // ---------- Generic reveals ----------
  $$('.big-title, .contact__big').forEach(t => {
    gsap.from($$('.line > span', t), {
      yPercent: 115, rotate: 3, duration: 1.3, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: t, start: 'top 85%' }
    });
  });
  $$('.fade-up').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  $$('.reveal-words').forEach(el => {
    gsap.to($$('.w', el), {
      opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  });
  $$('.eyebrow').forEach(el => {
    gsap.from(el, { opacity: 0, x: -20, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // Counters
  $$('[data-count]').forEach(n => {
    const o = { v: 0 };
    gsap.to(o, {
      v: +n.dataset.count, duration: 2, ease: 'power3.out',
      onUpdate: () => (n.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: n, start: 'top 90%' }
    });
  });

  // Studio photo clip reveal + inner parallax
  gsap.to('.studio__photo-inner', { clipPath: 'inset(0% 0 0 0 round 28px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.studio__photo', start: 'top 80%' } });
  gsap.fromTo('.studio__photo-inner img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.studio__photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.glass-chip', { opacity: 0, x: -30, duration: 1.2, ease: 'expo.out', delay: 0.8, scrollTrigger: { trigger: '.studio__photo', start: 'top 70%' } });
  gsap.fromTo('.studio__vert', { yPercent: -60 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.studio', start: 'top bottom', end: 'bottom top', scrub: true } });

  // Process cards stagger
  gsap.from('.pcard', { y: 120, opacity: 0, rotateX: -20, duration: 1.4, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.process__cards', start: 'top 85%' } });
  gsap.from('.wcard', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.why__grid', start: 'top 85%' } });
  gsap.from('.svc__item', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.svc', start: 'top 85%' } });
  gsap.from('.team__row', { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.team__list', start: 'top 85%' } });

  // Footer letters rise
  gsap.from('.footer__big .ch', { yPercent: 100, duration: 1.4, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.footer', start: 'top 90%' } });

  // ---------- Velocity marquees ----------
  const loops = [];
  const mk = (el, dir, speed) => {
    const tween = gsap.to(el, { xPercent: -50, ease: 'none', duration: speed, repeat: -1 });
    if (dir < 0) tween.progress(1).reversed(true);
    loops.push({ tween, dir });
  };
  mk($('.marquee__track'), 1, 28);
  $$('.logos__row').forEach(r => mk(r, +r.dataset.dir, 40));
  let vel = 0;
  if (lenis) lenis.on('scroll', e => { vel = e.velocity; });
  gsap.ticker.add(() => {
    const boost = 1 + Math.min(Math.abs(vel) * 0.12, 5);
    const sign = vel < -0.5 ? -1 : 1;
    loops.forEach(l => { l.tween.timeScale(gsap.utils.interpolate(l.tween.timeScale(), boost * sign * (l.dir < 0 ? -1 : 1), 0.1)); });
    vel *= 0.92;
  });
  gsap.to('.marquee__track', { skewX: () => 0, ease: 'none' });

  // ---------- Pointer effects (desktop) ----------
  if (!fine) return;

  // Cursor
  const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1 }), dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'expo.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'expo.out' });
  let mx = innerWidth / 2, my = innerHeight / 2;
  window.addEventListener('pointermove', e => { cur.classList.add('is-on'); mx = e.clientX; my = e.clientY; dx(mx); dy(my); rx(mx); ry(my); });
  document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
  $$('a, button, [data-tilt]').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
  });
  $$('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; cur.classList.add('is-label'); });
    el.addEventListener('mouseleave', () => cur.classList.remove('is-label'));
  });

  // Magnetic
  $$('[data-magnetic]').forEach(el => {
    const xT = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1,.4)' }), yT = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1,.4)' });
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * 0.35); yT((e.clientY - r.top - r.height / 2) * 0.35); });
    el.addEventListener('mouseleave', () => { xT(0); yT(0); });
  });

  // Tilt + spotlight
  $$('[data-tilt]').forEach(el => {
    const rX = gsap.quickTo(el, 'rotateX', { duration: 0.6, ease: 'power3.out' }), rY = gsap.quickTo(el, 'rotateY', { duration: 0.6, ease: 'power3.out' });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      rY((px - 0.5) * 12); rX((0.5 - py) * 12);
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
    });
    el.addEventListener('mouseleave', () => { rX(0); rY(0); });
  });

  // Hero: glass + aurora follow pointer
  const gx = gsap.quickTo('.hero__glass', 'x', { duration: 1.6, ease: 'power3.out' }), gy = gsap.quickTo('.hero__glass', 'y', { duration: 1.6, ease: 'power3.out' });
  const ax = gsap.quickTo('.hero .aurora', 'x', { duration: 2.5, ease: 'power3.out' }), ay = gsap.quickTo('.hero .aurora', 'y', { duration: 2.5, ease: 'power3.out' });
  $('.hero').addEventListener('pointermove', e => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    gx(nx * -60); gy(ny * -40); ax(nx * 80); ay(ny * 60);
  });

  // Services floating preview
  const fl = $('.svc__float'), flImg = $('img', fl);
  const fx = gsap.quickTo(fl, 'x', { duration: 0.7, ease: 'power3.out' }), fy = gsap.quickTo(fl, 'y', { duration: 0.7, ease: 'power3.out' });
  const fr = gsap.quickTo(fl, 'rotate', { duration: 0.8, ease: 'power3.out' });
  let lastX = 0;
  $('.svc').addEventListener('pointermove', e => { fx(e.clientX + 40); fy(e.clientY); fr(gsap.utils.clamp(-15, 15, (e.clientX - lastX) * 0.6)); lastX = e.clientX; });
  $$('.svc__item').forEach(item => {
    item.addEventListener('mouseenter', () => { flImg.src = item.dataset.img; gsap.to(fl, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }); });
  });
  $('.svc').addEventListener('mouseleave', () => gsap.to(fl, { opacity: 0, scale: 0.6, duration: 0.4, ease: 'expo.out' }));

  // Cylinder tilts with pointer
  const cyl = $('.cyl');
  $('.kinetic').addEventListener('pointermove', e => {
    const r = e.currentTarget.getBoundingClientRect();
    gsap.to(cyl, { rotateX: -12 + ((e.clientY - r.top) / r.height - 0.5) * -20, rotateZ: ((e.clientX - r.left) / r.width - 0.5) * 8, duration: 1.2, ease: 'power3.out' });
  });

  // ---------- Builders ----------
  function buildCylinder() {
    const cylEl = $('.cyl');
    const stage = $('.kinetic__stage');
    const H = stage.clientHeight || 600;
    const rows = 13;
    const small = innerWidth < 820;
    const baseR = small ? 92 : 175;
    const fs = small ? 16 : 28;
    const word = 'ARCOVA —';
    for (let i = 0; i < rows; i++) {
      const t = i / (rows - 1);
      // waist shape like the reference: wider at the ends, pinched in the middle
      const R = baseR * (0.78 + 0.42 * Math.pow(Math.abs(t - 0.45) * 2, 1.6));
      const n = Math.max(6, Math.round((2 * Math.PI * R) / (fs * 5.2)));
      const ring = document.createElement('div');
      ring.className = 'cyl__ring';
      ring.style.top = (0.04 + t * 0.92) * H + 'px';
      ring.style.setProperty('--dur', (22 + (i % 3) * 3) + 's');
      ring.style.setProperty('--delay', -i * 0.9 + 's');
      ring.style.setProperty('--fs', fs * (0.85 + 0.3 * (1 - Math.abs(t - 0.5))) + 'px');
      if (i % 2) ring.style.animationDirection = 'reverse';
      const hue = 265 - 75 * t;
      for (let k = 0; k < n; k++) {
        const s = document.createElement('span');
        s.textContent = k % 4 === 3 ? 'ARCOVA ×' : word;
        s.style.transform = `rotateY(${(360 / n) * k}deg) translateZ(${R}px) translate(-50%,-50%)`;
        s.style.color = `hsl(${hue} 90% ${72 - Math.abs(t - 0.5) * 20}%)`;
        ring.appendChild(s);
      }
      cylEl.appendChild(ring);
    }
  }
})();
