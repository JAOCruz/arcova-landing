import { useState, useRef, useEffect } from 'react'

const FA = ({ icon, className = '' }: { icon: string; className?: string }) => (
  <i className={`${icon} ${className}`} />
)

const introLines = [
  'Cada gran proyecto empieza con una conversación.',
  'El arco está abierto. ¿Cruzamos?',
  'Estás a un paso del otro lado.',
  'Lo que construyas hoy define lo que serás mañana.',
  'No vendemos servicios. Construimos puentes.',
]

type Path = 'project' | 'team' | 'about' | 'entrepreneur' | null

interface StepData {
  name: string
  projectType: string
  stage: string
  timeline: string
  email: string
  whatsapp: string
}

interface HistoryEntry {
  text: string
  step: number
  path: Path
}

export default function Hablemos() {
  const [path, setPath] = useState<Path>(null)
  const [step, setStep] = useState(0)
  const [data, setData] = useState<StepData>({ name: '', projectType: '', stage: '', timeline: '', email: '', whatsapp: '' })
  const [introLine] = useState(() => introLines[Math.floor(Math.random() * introLines.length)])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [, setSubmitted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const pushHistory = (text: string) => {
    setHistory(prev => [...prev, { text, step, path }])
  }

  const selectPath = (p: Path, label: string) => {
    pushHistory(label)
    setPath(p)
    setStep(1)
  }

  const nextStep = (choiceLabel?: string) => {
    if (choiceLabel) pushHistory(choiceLabel)
    setStep(s => s + 1)
  }

  const goBack = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setPath(prev.path)
    setStep(prev.step)
    // Data is preserved — user can change their answer if they want
  }

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [step, path])

  const handleSubmit = () => {
    setSubmitted(true)
    pushHistory(`${data.email} / ${data.whatsapp}`)
    setStep(99)
  }

  const reset = () => {
    setPath(null)
    setStep(0)
    setData({ name: '', projectType: '', stage: '', timeline: '', email: '', whatsapp: '' })
    setHistory([])
    setSubmitted(false)
  }

  const canGoBack = history.length > 0 && step !== 99

  return (
    <section id="hablemos" className="hablemos-section" ref={sectionRef}>
      <div className="container hablemos-grid">
        {/* Visual */}
        <div className="hablemos-visual">
          <video src="/hablemos-video.webm" autoPlay loop muted playsInline />
        </div>

        {/* Conversation on the left */}
        <div className="hablemos-conversation">
          {/* Back button */}
          {canGoBack && (
            <button className="hablemos-back" onClick={goBack}>
              <FA icon="fa-solid fa-arrow-left" /> Atrás
            </button>
          )}

          {/* History — blurred previous messages */}
          <div className="hablemos-history">
            {history.map((h, i) => (
              <p key={i} className="hablemos-past" style={{
                opacity: Math.max(0.15, 1 - (history.length - i) * 0.25),
                filter: `blur(${Math.min(3, (history.length - i) * 1)}px)`
              }}>
                {h.text}
              </p>
            ))}
          </div>

          {/* Current step */}
          <div className="hablemos-current" key={`${path}-${step}`}>
            {/* Step 0: The Gate */}
            {step === 0 && (
              <>
                <p className="hablemos-intro-small">Arcova</p>
                <h2 className="hablemos-headline">{introLine}</h2>
                <p className="hablemos-prompt">¿Qué te trae aquí?</p>
                <div className="hablemos-options">
                  <button onClick={() => selectPath('project', 'Iniciar un Proyecto')} className="hablemos-option">
                    <FA icon="fa-solid fa-arrow-right" className="hablemos-opt-arrow" /> Iniciar un Proyecto
                  </button>
                  <button onClick={() => selectPath('team', 'Unirte al Equipo')} className="hablemos-option">
                    <FA icon="fa-solid fa-arrow-right" className="hablemos-opt-arrow" /> Unirte al Equipo
                  </button>
                  <button onClick={() => selectPath('about', 'Quiénes Somos')} className="hablemos-option">
                    <FA icon="fa-solid fa-arrow-right" className="hablemos-opt-arrow" /> Quiénes Somos
                  </button>
                  <button onClick={() => selectPath('entrepreneur', 'Arcova Entrepreneur')} className="hablemos-option hablemos-option-special">
                    <FA icon="fa-solid fa-bolt" className="hablemos-opt-arrow" /> Arcova Entrepreneur
                  </button>
                </div>
              </>
            )}

            {/* PROJECT PATH */}
            {path === 'project' && step === 1 && (
              <>
                <p className="hablemos-small-note">Vamos a construir algo juntos.</p>
                <h2 className="hablemos-headline">¿Cómo te llamas?</h2>
                <form className="hablemos-input-row" onSubmit={e => { e.preventDefault(); if (data.name.trim()) { pushHistory(`Soy ${data.name}`); nextStep() } }}>
                  <input type="text" placeholder="Tu nombre" className="hablemos-input" autoFocus
                    value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
                  <button type="submit" className="hablemos-next" disabled={!data.name.trim()}>
                    <FA icon="fa-solid fa-arrow-right" />
                  </button>
                </form>
              </>
            )}

            {path === 'project' && step === 2 && (
              <>
                <p className="hablemos-small-note">Perfecto, {data.name}.</p>
                <h2 className="hablemos-headline">¿Qué tienes en mente?</h2>
                <div className="hablemos-options">
                  {['Sitio Web', 'ERP & Automatización', 'Marketing & Growth', 'AI & Bots', 'Aún no sé'].map(opt => (
                    <button key={opt} className={`hablemos-option ${data.projectType === opt ? 'hablemos-option-selected' : ''}`}
                      onClick={() => { setData({ ...data, projectType: opt }); nextStep(opt) }}>
                      <FA icon="fa-solid fa-arrow-right" className="hablemos-opt-arrow" /> {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {path === 'project' && step === 3 && (
              <>
                <p className="hablemos-small-note">{data.projectType} — buena elección.</p>
                <h2 className="hablemos-headline">¿En qué etapa estás?</h2>
                <div className="hablemos-options">
                  {[
                    { label: 'Empezando desde cero', icon: 'fa-solid fa-seedling' },
                    { label: 'Tengo algo, necesito mejorar', icon: 'fa-solid fa-wrench' },
                    { label: 'Quiero escalar', icon: 'fa-solid fa-rocket' },
                  ].map(opt => (
                    <button key={opt.label} className={`hablemos-option ${data.stage === opt.label ? 'hablemos-option-selected' : ''}`}
                      onClick={() => { setData({ ...data, stage: opt.label }); nextStep(opt.label) }}>
                      <FA icon={opt.icon} className="hablemos-opt-arrow" /> {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {path === 'project' && step === 4 && (
              <>
                <p className="hablemos-small-note">Entendido.</p>
                <h2 className="hablemos-headline">¿Cuándo arrancamos?</h2>
                <div className="hablemos-options">
                  {['Ya mismo', 'Este mes', 'Próximos 3 meses', 'Solo estoy explorando'].map(opt => (
                    <button key={opt} className={`hablemos-option ${data.timeline === opt ? 'hablemos-option-selected' : ''}`}
                      onClick={() => { setData({ ...data, timeline: opt }); nextStep(opt) }}>
                      <FA icon="fa-solid fa-arrow-right" className="hablemos-opt-arrow" /> {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {path === 'project' && step === 5 && (
              <>
                <p className="hablemos-small-note">Casi listo, {data.name}.</p>
                <h2 className="hablemos-headline">¿Cómo te contactamos?</h2>
                <form className="hablemos-contact-form" onSubmit={e => { e.preventDefault(); if (data.email.trim() || data.whatsapp.trim()) handleSubmit() }}>
                  <input type="email" placeholder="Email" className="hablemos-input" autoFocus
                    value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
                  <input type="tel" placeholder="WhatsApp" className="hablemos-input"
                    value={data.whatsapp} onChange={e => setData({ ...data, whatsapp: e.target.value })} />
                  <button type="submit" className="hablemos-submit" disabled={!data.email.trim() && !data.whatsapp.trim()}>
                    Cruzar el arco <FA icon="fa-solid fa-arrow-right" />
                  </button>
                </form>
              </>
            )}

            {path === 'project' && step === 99 && (
              <>
                <h2 className="hablemos-headline hablemos-final">Nos vemos del otro lado. ✨</h2>
                <div className="hablemos-summary">
                  <div className="hablemos-summary-row"><span>Nombre</span><span>{data.name}</span></div>
                  <div className="hablemos-summary-row"><span>Proyecto</span><span>{data.projectType}</span></div>
                  <div className="hablemos-summary-row"><span>Etapa</span><span>{data.stage}</span></div>
                  <div className="hablemos-summary-row"><span>Timeline</span><span>{data.timeline}</span></div>
                  <div className="hablemos-summary-row"><span>Contacto</span><span>{data.email || data.whatsapp}</span></div>
                </div>
                <p className="hablemos-small-note" style={{ marginTop: '1.5rem' }}>Te contactaremos en menos de 24 horas.</p>
                <button className="hablemos-reset" onClick={reset}><FA icon="fa-solid fa-rotate-left" /> Empezar de nuevo</button>
              </>
            )}

            {/* TEAM PATH */}
            {path === 'team' && step === 1 && (
              <>
                <p className="hablemos-small-note">Siempre buscamos gente con hambre.</p>
                <h2 className="hablemos-headline">¿En qué eres bueno?</h2>
                <div className="hablemos-options">
                  {['Desarrollo / Código', 'Diseño / UX', 'Marketing / Growth', 'Ventas / Estrategia', 'Otro'].map(opt => (
                    <button key={opt} className="hablemos-option" onClick={() => { pushHistory(opt); nextStep() }}>
                      <FA icon="fa-solid fa-arrow-right" className="hablemos-opt-arrow" /> {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {path === 'team' && step === 2 && (
              <>
                <h2 className="hablemos-headline">Mándanos tu info.</h2>
                <form className="hablemos-contact-form" onSubmit={e => { e.preventDefault(); if (data.email.trim() || data.whatsapp.trim()) { setSubmitted(true); setStep(99) } }}>
                  <input type="text" placeholder="Tu nombre" className="hablemos-input" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} autoFocus />
                  <input type="email" placeholder="Email" className="hablemos-input" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
                  <input type="tel" placeholder="WhatsApp" className="hablemos-input" value={data.whatsapp} onChange={e => setData({ ...data, whatsapp: e.target.value })} />
                  <button type="submit" className="hablemos-submit">Enviar <FA icon="fa-solid fa-arrow-right" /></button>
                </form>
              </>
            )}

            {path === 'team' && step === 99 && (
              <>
                <h2 className="hablemos-headline hablemos-final">Recibido. Hablamos pronto. 🤝</h2>
                <button className="hablemos-reset" onClick={reset}><FA icon="fa-solid fa-rotate-left" /> Empezar de nuevo</button>
              </>
            )}

            {/* ABOUT PATH */}
            {path === 'about' && step === 1 && (
              <>
                <h2 className="hablemos-headline">Somos Arcova.</h2>
                <p className="hablemos-body">Un equipo de Santo Domingo que cree que la tecnología debería simplificar, no complicar. Construimos sistemas digitales — webs, ERPs, bots, estrategias — que llevan negocios de donde están a donde quieren llegar.</p>
                <p className="hablemos-body" style={{ marginTop: '1rem' }}>El arco es nuestra metáfora: un puente entre tu presente y tu potencial.</p>
                <div className="hablemos-options" style={{ marginTop: '2rem' }}>
                  <button className="hablemos-option" onClick={() => { setPath('project'); pushHistory('Quiénes Somos → Iniciar proyecto'); setStep(1) }}>
                    <FA icon="fa-solid fa-arrow-right" className="hablemos-opt-arrow" /> Iniciar un Proyecto
                  </button>
                </div>
              </>
            )}

            {/* ENTREPRENEUR PATH */}
            {path === 'entrepreneur' && step === 1 && (
              <>
                <p className="hablemos-small-note">Programa especial para emprendedores.</p>
                <h2 className="hablemos-headline">Arcova Entrepreneur</h2>
                <p className="hablemos-body">¿Tienes un negocio pequeño con grandes ideas pero presupuesto limitado? Este programa es para ti. Ofrecemos nuestros servicios a precios accesibles para negocios que califiquen.</p>
                <p className="hablemos-body" style={{ marginTop: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--accent)' }}>Web + Bot + Estrategia — desde RD$50,000</p>
                <div className="hablemos-options" style={{ marginTop: '2rem' }}>
                  <button className="hablemos-option" onClick={() => { setPath('project'); pushHistory('Entrepreneur → Aplicar'); setStep(1) }}>
                    <FA icon="fa-solid fa-arrow-right" className="hablemos-opt-arrow" /> Quiero aplicar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
