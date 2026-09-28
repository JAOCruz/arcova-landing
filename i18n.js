// Arcova i18n — ES/EN. Priority: ?lang= → saved choice → browser language → ES.
(() => {
  const D = {
    es: {
      'meta.title': 'Arcova — Construimos marcas. Creamos experiencias.',
      'meta.desc': 'Arcova es un estudio creativo multidisciplinario en Santo Domingo que combina estrategia, diseño y tecnología para construir marcas, experiencias y soluciones que generan valor.',
      'nav.studio': 'Estudio', 'nav.services': 'Servicios', 'nav.why': 'Por qué', 'nav.clients': 'Clientes', 'nav.contact': 'Contacto', 'nav.cta': 'Hablemos',
      'hero.l1': 'Construimos', 'hero.l2': 'marcas<em>.</em>', 'hero.l3': 'Creamos', 'hero.l4': 'experiencias.',
      'hero.lead': 'Estudio creativo multidisciplinario. Estrategia, diseño y tecnología para construir marcas que se ven, se usan y se recuerdan.',
      'loc': 'Santo Domingo,<br>República Dominicana', 'loc.flat': 'Santo Domingo, República Dominicana',
      'studio.title': 'Construimos lo que impulsa a las marcas hacia adelante.',
      'studio.p1': 'Arcova es un estudio creativo multidisciplinario que combina estrategia, diseño y tecnología para construir marcas, experiencias y soluciones que generan valor para los negocios.',
      'studio.p2': 'Trabajamos desde la definición estratégica y la identidad de marca hasta experiencias digitales, espacios físicos, inteligencia artificial y automatización.',
      'stat.1': 'Años de<br>experiencia', 'stat.2': 'Clientes e<br>industrias', 'stat.3': 'Disciplinas<br>integradas',
      'studio.chip': 'Estudio liderado por seniors',
      'eb.method': '→ Método',
      'proc.t1': 'La creatividad es', 'proc.t2': 'una herramienta de negocio',
      'proc.intro': '<strong>No diseñamos por diseñar.</strong> Entendemos primero el negocio, la audiencia y el problema. Luego usamos creatividad, tecnología y diseño para convertir esa estrategia en algo que las personas puedan ver, usar, experimentar y recordar.',
      'proc.c1': 'Entendemos el reto y definimos la oportunidad.', 'proc.c2': 'Desarrollamos conceptos, sistemas y experiencias.', 'proc.c3': 'Convertimos las ideas en soluciones reales.',
      'svc.t1': 'Cinco disciplinas.', 'svc.t2': 'Una sola dirección.',
      'svc.1': 'Estrategia de marca · Naming · Identidad visual · Sistemas de marca · Packaging',
      'svc.2': 'Dirección creativa · Campañas · Desarrollo de conceptos · Estrategia de comunicación · Contenido · Editorial',
      'svc.3': 'Web · E-commerce · UI/UX · Experiencias interactivas · AR · Productos digitales',
      'svc.4': 'Retail · Spatial branding · Señalética · Activaciones · Instalaciones · Experiencias inmersivas',
      'svc.5': 'Inteligencia artificial · Automatización · Business Intelligence · Optimización de procesos · Agentes y chatbots de WhatsApp · Soluciones digitales',
      'kin.title': 'Un core team senior. Una red de especialistas que crece con cada reto.',
      'kin.p': 'Mantenemos una dirección creativa y estratégica consistente mientras integramos las capacidades técnicas y de producción que cada proyecto necesita.',
      'why.1': 'Los proyectos son liderados directamente por nuestro equipo fundador y creativo.',
      'why.2': 'Partimos del problema de negocio, no del entregable.',
      'why.3': 'Combinamos creatividad, diseño, tecnología y ejecución.',
      'why.4': 'Integramos especialistas y partners según el alcance de cada proyecto.',
      'why.5': 'Desde la idea hasta la implementación, mantenemos una dirección central y consistente.',
      'why.t1': '¿Por qué', 'why.t2': 'Arcova?',
      'cl.t1': 'Marcas que', 'cl.t2': 'confían en nosotros.',
      'eb.talk': '→ Hablemos', 'ct.t1': 'Construyamos', 'ct.t2': 'algo',
      'ct.mail': 'Correo', 'ct.phone': 'Teléfono', 'ct.wa': 'Escríbenos →', 'ft.top': 'Volver arriba ↑',
      'cursor.write': 'Escríbenos', 'cursor.hi': 'Hola',
    },
    en: {
      'meta.title': 'Arcova — Building brands. Creating experiences.',
      'meta.desc': 'Arcova is a multidisciplinary creative studio in Santo Domingo combining strategy, design and technology to build brands, experiences and solutions that create business value.',
      'nav.studio': 'Studio', 'nav.services': 'Services', 'nav.why': 'Why us', 'nav.clients': 'Clients', 'nav.contact': 'Contact', 'nav.cta': 'Let’s talk',
      'hero.l1': 'Building', 'hero.l2': 'brands<em>.</em>', 'hero.l3': 'Creating', 'hero.l4': 'experiences.',
      'hero.lead': 'A multidisciplinary creative studio. Strategy, design and technology to build brands people see, use and remember.',
      'loc': 'Santo Domingo,<br>Dominican Republic', 'loc.flat': 'Santo Domingo, Dominican Republic',
      'studio.title': 'We build what moves brands forward.',
      'studio.p1': 'Arcova is a multidisciplinary creative studio that combines strategy, design and technology to build brands, experiences and solutions that create value for businesses.',
      'studio.p2': 'We work from strategic definition and brand identity to digital experiences, physical spaces, artificial intelligence and automation.',
      'stat.1': 'Years of<br>experience', 'stat.2': 'Clients &amp;<br>industries', 'stat.3': 'Integrated<br>disciplines',
      'studio.chip': 'Senior-led studio',
      'eb.method': '→ Method',
      'proc.t1': 'Creativity is', 'proc.t2': 'a business tool',
      'proc.intro': '<strong>We don’t design for design’s sake.</strong> First we understand the business, the audience and the problem. Then we use creativity, technology and design to turn that strategy into something people can see, use, experience and remember.',
      'proc.c1': 'We understand the challenge and define the opportunity.', 'proc.c2': 'We develop concepts, systems and experiences.', 'proc.c3': 'We turn ideas into real solutions.',
      'svc.t1': 'Five disciplines.', 'svc.t2': 'One direction.',
      'svc.1': 'Brand strategy · Naming · Visual identity · Brand systems · Packaging',
      'svc.2': 'Creative direction · Campaigns · Concept development · Communication strategy · Content · Editorial',
      'svc.3': 'Web · E-commerce · UI/UX · Interactive experiences · AR · Digital products',
      'svc.4': 'Retail · Spatial branding · Wayfinding · Activations · Installations · Immersive experiences',
      'svc.5': 'Artificial intelligence · Automation · Business Intelligence · Process optimization · WhatsApp agents & chatbots · Digital solutions',
      'kin.title': 'A senior core team. A specialist network that grows with every challenge.',
      'kin.p': 'We keep a consistent creative and strategic direction while bringing in the technical and production capabilities each project needs.',
      'why.1': 'Projects are led directly by our founding and creative team.',
      'why.2': 'We start from the business problem, not the deliverable.',
      'why.3': 'We combine creativity, design, technology and execution.',
      'why.4': 'We bring in specialists and partners based on each project’s scope.',
      'why.5': 'From idea to implementation, we keep one central, consistent direction.',
      'why.t1': 'Why', 'why.t2': 'Arcova?',
      'cl.t1': 'Brands that', 'cl.t2': 'trust us.',
      'eb.talk': '→ Let’s talk', 'ct.t1': 'Let’s build', 'ct.t2': 'something',
      'ct.mail': 'Email', 'ct.phone': 'Phone', 'ct.wa': 'Message us →', 'ft.top': 'Back to top ↑',
      'cursor.write': 'Write us', 'cursor.hi': 'Hi',
    }
  };

  const store = {
    get() { try { return localStorage.getItem('arcova-lang'); } catch { return null; } },
    set(v) { try { localStorage.setItem('arcova-lang', v); } catch {} }
  };

  function detect() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && D[q]) return q;
    const saved = store.get();
    if (saved && D[saved]) return saved;
    for (const l of navigator.languages || [navigator.language || 'es']) {
      const b = (l || '').slice(0, 2).toLowerCase();
      if (D[b]) return b;
    }
    return 'es';
  }

  function splitWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w" style="opacity:1">${w}</span>`).join(' ');
  }

  function apply(lang, initial) {
    const t = D[lang];
    document.documentElement.lang = lang;
    document.title = t['meta.title'];
    document.querySelector('meta[name="description"]')?.setAttribute('content', t['meta.desc']);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = t[el.dataset.i18n]; if (v == null) return;
      el.textContent = v;
      if (el.dataset.text !== undefined) el.dataset.text = v;
      if (!initial && el.classList.contains('reveal-words')) splitWords(el);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { const v = t[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    document.querySelectorAll('[data-i18n-cursor]').forEach(el => { const v = t[el.dataset.i18nCursor]; if (v != null) el.dataset.cursor = v; });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    window.dispatchEvent(new CustomEvent('arcova:lang', { detail: { lang } }));
    if (!initial && window.ScrollTrigger) ScrollTrigger.refresh();
  }

  apply(detect(), true);

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (!b) return;
    store.set(b.dataset.lang);
    apply(b.dataset.lang, false);
  });

  window.arcovaI18n = { apply, dict: D };
})();
