import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hablemos from './components/Hablemos'
import AiChat from './components/AiChat'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const FA = ({ icon, className = '' }: { icon: string; className?: string }) => (
  <i className={`${icon} ${className}`} />
)

/* ── Custom Cursor ── */
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const visible = useRef(false)
  const hovering = useRef(false)

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    const cursor = cursorRef.current
    if (!cursor) return

    document.documentElement.classList.add('has-custom-cursor')

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible.current) {
        visible.current = true
        cursor.style.opacity = '1'
      }
    }

    const onEnter = () => { hovering.current = true; cursor.classList.add('cursor-hover') }
    const onLeave = () => { hovering.current = false; cursor.classList.remove('cursor-hover') }

    const addHoverListeners = () => {
      document.querySelectorAll('a, button, .btn, .hablemos-option, .pillar-card, .service-row, .odoo-service, .process-row, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    let rafId: number
    const tick = () => {
      if (cursor) {
        cursor.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      }
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    addHoverListeners()
    rafId = requestAnimationFrame(tick)

    const observer = new MutationObserver(() => { addHoverListeners() })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return <div ref={cursorRef} className="custom-cursor" />
}

/* ── Preloader with decode animation + particles ── */
function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const target = 'ARCOVA'
  const chars = 'ΑΒΓΔΞΛΠΣΦΨΩ░▒▓█▄▀◆◇○●□■△▲∇∆≡≈∞⟐⟑⊕⊗'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Particle {
      x: number; y: number; vx: number; vy: number
      size: number; alpha: number; decay: number; color: string
    }

    const particles: Particle[] = []
    const colors = ['rgba(79,70,229,', 'rgba(139,92,246,', 'rgba(255,255,255,', 'rgba(59,130,246,']
    let animId: number
    let active = true

    function spawnBurst() {
      const cx = canvas!.width / 2
      const cy = canvas!.height / 2
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.5 + Math.random() * 2
        particles.push({
          x: cx + (Math.random() - 0.5) * 200,
          y: cy + (Math.random() - 0.5) * 60,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1 + Math.random() * 2.5,
          alpha: 0.4 + Math.random() * 0.6,
          decay: 0.005 + Math.random() * 0.01,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    function animate() {
      if (!active) return
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay
        if (p.alpha <= 0) { particles.splice(i, 1); continue }

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = p.color + p.alpha + ')'
        ctx!.fill()
      }

      animId = requestAnimationFrame(animate)
    }

    animate()
    const spawnInterval = setInterval(spawnBurst, 80)
    setTimeout(() => clearInterval(spawnInterval), 1500)

    return () => {
      active = false
      cancelAnimationFrame(animId)
      clearInterval(spawnInterval)
    }
  }, [])

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    el.style.opacity = '1'

    let iteration = 0
    const totalIterations = 18
    const interval = setInterval(() => {
      el.textContent = target
        .split('')
        .map((_char, i) => {
          if (i < Math.floor(iteration / (totalIterations / target.length))) {
            return target[i]
          }
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join('')
      iteration++
      if (iteration > totalIterations) {
        clearInterval(interval)
        el.textContent = target
        setTimeout(() => {
          gsap.to(ref.current, {
            yPercent: -100,
            duration: 0.7,
            ease: 'power3.inOut',
            onComplete: onDone,
          })
        }, 400)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div ref={ref} className="preloader">
      <canvas ref={canvasRef} className="preloader-particles" />
      <span ref={textRef} className="preloader-text" style={{ opacity: 0 }}>ARCOVA</span>
    </div>
  )
}

function App() {
  const [preloaderDone, setPreloaderDone] = useState(false)
  const appRef = useRef<HTMLDivElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!preloaderDone) {
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [preloaderDone])

  const onPreloaderDone = useCallback(() => {
    window.scrollTo(0, 0)
    requestAnimationFrame(() => {
      setPreloaderDone(true)
    })
  }, [])

  useEffect(() => {
    if (!preloaderDone || !heroContentRef.current) return

    const els = heroContentRef.current.querySelectorAll('.hero-stagger')
    gsap.fromTo(els,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.1 }
    )
  }, [preloaderDone])

  useEffect(() => {
    if (!preloaderDone) return

    gsap.utils.toArray<HTMLElement>('.gs-reveal').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      )
    })

    document.querySelectorAll('.gs-stagger-parent').forEach(parent => {
      const children = parent.querySelectorAll('.gs-stagger-child')
      gsap.fromTo(children,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: parent, start: 'top 80%', once: true },
        }
      )
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [preloaderDone])

  return (
    <>
      {!preloaderDone && <Preloader onDone={onPreloaderDone} />}
      <CustomCursor />

      <div className="app" ref={appRef}>
        {/* Nav */}
        <nav className="nav">
          <div className="container nav-inner">
            <a href="#" className="logo">Arcova</a>
            <div className="nav-links">
              <a href="#acerca">Acerca</a>
              <a href="#servicios">Servicios</a>
              <a href="#odoo">Odoo</a>
              <a href="#hablemos">Hablemos</a>
            </div>
          </div>
        </nav>

        {/* Hero — Bent Lindberg style */}
        <section className="hero" ref={heroContentRef}>
          <div className="container hero-top">
            <span className="hero-location hero-stagger">Santo Domingo, República Dominicana</span>
            <span className="hero-scroll hero-stagger">Scroll Down <FA icon="fa-solid fa-arrow-down" /></span>
          </div>

          <div className="container hero-title-wrap">
            <h1 className="hero-stagger">Arcova</h1>
            <p className="hero-subtitle hero-stagger">Tecnología con alma</p>
          </div>

          <div className="hero-feature hero-stagger">
            <video autoPlay loop muted playsInline>
              <source src="/arcova.webm" type="video/webm" />
              <source src="/arcova.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="container hero-bottom">
            <p className="hero-stagger">
              Somos el arco entre donde estás y donde quieres llegar. Estrategia, desarrollo web, ERP Odoo, marketing operativo e inteligencia artificial para negocios que escalan.
            </p>
            <a href="#hablemos" className="btn btn-primary hero-stagger">Iniciar proyecto <FA icon="fa-solid fa-arrow-right" /></a>
          </div>
        </section>

        {/* Statement / About */}
        <section id="acerca" className="section">
          <div className="container statement-grid">
            <div>
              <p className="label gs-reveal" style={{ marginBottom: '1rem' }}>Acerca</p>
              <p className="statement-lead gs-reveal">
                No vendemos piezas sueltas. Construimos el <span className="accent-text">motor completo</span> — y lo encendemos contigo.
              </p>
            </div>
            <div className="statement-body gs-reveal">
              <div>
                <p className="label">Nuestro enfoque</p>
                <p>
                  Primero escuchamos. Luego diagnosticamos. Finalmente implementamos. Cada proyecto empieza con una pregunta clara: ¿qué necesita tu negocio para crecer sin caos?
                </p>
              </div>
              <p>
                Desde una landing page hasta un ERP completo, todo lo que hacemos apunta a un solo resultado: que tu operación corra más rápido, más claro y con menos fricción.
              </p>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section id="pilares" className="section section-warm">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title gs-reveal">Tres pilares</h2>
              <p className="section-sub gs-reveal">Cada pilar alimenta a los otros. Esa es la diferencia entre una agencia y un socio de crecimiento.</p>
            </div>

            <div className="pillars-grid gs-stagger-parent">
              {[
                {
                  num: '01',
                  name: 'Arcova Strategy',
                  desc: 'Entendemos tu negocio antes de tocar código. Auditoría 360°, blueprint de crecimiento y customer journey mapping.',
                  items: ['Auditoría estratégica', 'Diagnóstico de embudo', 'Blueprint digital', 'Research de mercado'],
                },
                {
                  num: '02',
                  name: 'Arcova Growth',
                  desc: 'Tu marca no solo existe, resuena. Diseñamos el sistema de adquisición para que cada pieza trabaje mientras tú duermes.',
                  items: ['Contenido + omnicanal', 'Paid media & CRO', 'SEO + Social', 'Nutrición de leads'],
                },
                {
                  num: '03',
                  name: 'Arcova Systems',
                  desc: 'La infraestructura invisible que lo hace todo funcionar: CRM, dashboards, IA y automatizaciones conectadas.',
                  items: ['CRM & automatización', 'Dashboards ejecutivos', 'WhatsApp + Ads + Email', 'IA aplicada a operaciones'],
                },
              ].map((p, i) => (
                <div key={i} className="pillar-card gs-stagger-child">
                  <span className="pillar-num">{p.num}</span>
                  <h3 className="pillar-name">{p.name}</h3>
                  <p className="pillar-desc">{p.desc}</p>
                  <ul className="pillar-items">
                    {p.items.map((item, j) => (
                      <li key={j}><FA icon="fa-solid fa-arrow-right" className="pillar-arrow" /> {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="servicios" className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title gs-reveal">Servicios</h2>
              <p className="section-sub gs-reveal">Cada servicio es una pieza del mismo rompecabezas. Juntos, son tu ventaja competitiva.</p>
            </div>

            <div className="services-list gs-stagger-parent">
              {[
                {
                  title: 'Estrategia & Arquitectura',
                  desc: 'Ves tu negocio con claridad total: dónde pierdes clientes, dónde hay oportunidad oculta y cómo ir del punto A al punto B.',
                  tags: ['Research IA', 'Embudo', 'Blueprint'],
                },
                {
                  title: 'Marketing Operativo',
                  desc: 'Dejas de improvisar. Un sistema de contenido con IA + criterio humano que atrae, convierte y retiene.',
                  tags: ['Contenido', 'Omnicanal', 'SEO'],
                },
                {
                  title: 'Performance & Growth',
                  desc: 'Cada peso rinde más. Funnels afinados, segmentación inteligente y optimización constante de inversión publicitaria.',
                  tags: ['Funnels', 'CRO', 'Ads'],
                },
                {
                  title: 'Marketing Ops & Automatización',
                  desc: 'Tu operación corre sola. CRM, WhatsApp AI, email automation y dashboards que hablan claro, todo conectado.',
                  tags: ['CRM', 'Dashboards', 'WhatsApp AI'],
                },
                {
                  title: 'CMO as a Service',
                  desc: 'Un director de marketing experimentado en tu esquina, sin el salario de seis cifras. KPIs claros y decisiones que mueven la aguja.',
                  tags: ['Dirección', 'KPIs', 'Comité'],
                },
                {
                  title: 'Desarrollo & Experiencia Digital',
                  desc: 'Tu presencia digital deja de ser un brochure y se convierte en tu mejor vendedor. Web rápida, UX impecable.',
                  tags: ['UX', 'React', 'Landing'],
                },
              ].map((s, i) => (
                <div key={i} className="service-row gs-stagger-child">
                  <span className="service-num">0{i + 1}</span>
                  <h3 className="service-title">{s.title}</h3>
                  <p className="service-desc">{s.desc}</p>
                  <div className="service-tags">
                    {s.tags.map((t, j) => <span key={j} className="service-tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Odoo */}
        <section id="odoo" className="section section-ink">
          <div className="container">
            <div className="odoo-editorial">
              <p className="label gs-reveal" style={{ marginBottom: '1rem' }}>Odoo ERP</p>
              <h2 className="odoo-statement gs-reveal">
                Un sistema,<br /><span className="accent-text">cero caos.</span>
              </h2>
              <div className="odoo-body-split">
                <p className="odoo-lead gs-reveal">
                  Ventas, inventario, contabilidad, manufactura y RRHH hablándose entre sí. Implementamos Odoo a la medida de cómo tú trabajas.
                </p>
                <div className="odoo-modules gs-reveal">
                  {['Facturación', 'Inventario', 'Contabilidad', 'Manufactura', 'RRHH', 'Reportes', 'CRM', 'Compras'].map((mod, i) => (
                    <span key={i} className="odoo-module-pill">{mod}</span>
                  ))}
                </div>
              </div>
              <div className="odoo-stats-bar gs-reveal">
                <div className="odoo-stat">
                  <span className="odoo-stat-num">86+</span>
                  <span className="odoo-stat-label">Módulos</span>
                </div>
                <div className="odoo-stat">
                  <span className="odoo-stat-num">100%</span>
                  <span className="odoo-stat-label">Personalizable</span>
                </div>
                <div className="odoo-stat">
                  <span className="odoo-stat-num">DGII</span>
                  <span className="odoo-stat-label">Cumplimiento fiscal</span>
                </div>
              </div>
            </div>

            <div className="dgii-block gs-reveal">
              <div className="dgii-badge"><FA icon="fa-solid fa-shield-halved" /></div>
              <div>
                <h3>Facturación Electrónica <span className="accent-text">e-CF</span></h3>
                <p>Comprobantes fiscales electrónicos con validación en tiempo real ante la DGII. Firma digital, reportes 606/607/608/609.</p>
              </div>
              <div className="dgii-features">
                {['NCF automáticos', 'Firma digital', 'Reportes DGII', 'Ambiente de pruebas', 'e-CF en tiempo real', 'Oficina Virtual'].map((f, i) => (
                  <span key={i} className="dgii-tag"><FA icon="fa-solid fa-check" /> {f}</span>
                ))}
              </div>
            </div>

            <div className="odoo-services gs-stagger-parent">
              {[
                { title: 'Consultoría', desc: 'Empezamos entendiendo tu operación — no vendiendo módulos.' },
                { title: 'Manufactura (MRP)', desc: 'Trazabilidad total de qué produces, con qué materiales y a qué costo.' },
                { title: 'Inventario & Compras', desc: 'Multi-almacén, reorden automático y visibilidad en tiempo real.' },
                { title: 'Contabilidad', desc: 'Plan de cuentas dominicano, conciliación bancaria y reportes fiscales.' },
                { title: 'Ventas & CRM', desc: 'Cada lead tiene seguimiento, cada cotización tiene destino.' },
                { title: 'Capacitación', desc: 'Entrenamiento práctico, documentación clara y soporte real.' },
              ].map((s, i) => (
                <div key={i} className="odoo-service gs-stagger-child">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section section-warm">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title gs-reveal">Cómo trabajamos</h2>
              <p className="section-sub gs-reveal">Un proceso claro, sin jerga. Siempre sabes dónde estamos y qué sigue.</p>
            </div>

            <div className="process-list gs-stagger-parent">
              {[
                { num: '01', title: 'Diagnóstico', desc: 'Nos sentamos contigo. Entendemos cómo opera tu negocio de verdad — no en teoría.' },
                { num: '02', title: 'Diseño', desc: 'Diseñamos el sistema perfecto para tu realidad: módulos, flujos, migraciones.' },
                { num: '03', title: 'Implementación', desc: 'Lo construimos, personalizamos y migramos tus datos sin interrumpir tu operación.' },
                { num: '04', title: 'Capacitación', desc: 'Tu equipo no solo usa el sistema, lo domina. Entrenamiento práctico y sin jerga.' },
                { num: '05', title: 'Soporte', desc: 'No desaparecemos después del go-live. Estamos contigo mientras te haga falta.' },
              ].map((step, i) => (
                <div key={i} className="process-row gs-stagger-child">
                  <span className="process-num">{step.num}</span>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hablemos */}
        <Hablemos />

        {/* Footer */}
        <footer className="footer">
          <div className="container footer-inner">
            <a href="#" className="logo">Arcova</a>
            <div className="footer-links">
              <a href="#acerca">Acerca</a>
              <a href="#servicios">Servicios</a>
              <a href="#odoo">Odoo</a>
              <a href="#hablemos">Hablemos</a>
            </div>
            <p>© 2026 Arcova. Todos los derechos reservados.</p>
          </div>
        </footer>

        {/* AI Chat */}
        <AiChat />
      </div>
    </>
  )
}

export default App
