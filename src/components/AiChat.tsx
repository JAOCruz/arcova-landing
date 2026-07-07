import { useState, useRef, useEffect } from 'react'

interface Msg { role: 'bot' | 'user'; text: string }

const QA: Record<string, string> = {
  '¿Qué hace Arcova?': 'Arcova es un estudio de estrategia y tecnología en Santo Domingo. Combinamos ERP, desarrollo web, marketing digital e inteligencia artificial para llevar negocios al siguiente nivel.',
  '¿Qué servicios ofrecen?': 'Trabajamos en tres pilares: Arcova Strategy (diagnóstico y arquitectura de crecimiento), Arcova Growth (marketing, contenido y performance) y Arcova Systems (automatización, CRM, dashboards e IA).',
  '¿Cuánto cuesta?': 'Cada proyecto es diferente. Trabajamos con presupuestos desde startups hasta empresas establecidas. Lo mejor es agendar una consulta gratis para entender tus necesidades — sin compromiso.',
  '¿Trabajan con Odoo?': 'Sí, somos especialistas en Odoo Community. Implementamos módulos de ventas, inventario, contabilidad, manufactura, RRHH y facturación electrónica e-CF para la DGII.',
  '¿Dónde están ubicados?': 'Estamos en Santo Domingo, República Dominicana. Trabajamos con clientes locales y remotos.',
  '¿Tienen WhatsApp bots?': 'Sí, desarrollamos chatbots inteligentes para WhatsApp con IA que atienden clientes 24/7, generan leads y automatizan seguimiento.',
}

const suggestions = ['¿Qué hace Arcova?', '¿Qué servicios ofrecen?', '¿Cuánto cuesta?', '¿Trabajan con Odoo?']

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: 'Hola 👋 Soy el asistente de Arcova. ¿En qué puedo ayudarte?' }
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const respond = (question: string) => {
    const userMsg: Msg = { role: 'user', text: question }
    const match = QA[question]
    const botMsg: Msg = { role: 'bot', text: match || 'Buena pregunta. Para darte la mejor respuesta, te recomiendo agendar una consulta gratis con nuestro equipo. ¿Te gustaría iniciar un proyecto?' }
    setMessages(prev => [...prev, userMsg])
    setTimeout(() => setMessages(prev => [...prev, botMsg]), 600)
  }

  const handleSend = () => {
    if (!input.trim()) return
    respond(input.trim())
    setInput('')
  }

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Chat">
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-message'}`} />
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <div className="chat-header-title">Arcova AI</div>
              <div className="chat-header-sub">Respuestas en segundos</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === 'bot' ? 'chat-msg-bot' : 'chat-msg-user'}`}>
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length < 3 && (
            <div className="chat-suggestions">
              {suggestions.map(s => (
                <button key={s} className="chat-suggestion" onClick={() => respond(s)}>{s}</button>
              ))}
            </div>
          )}

          <form className="chat-input-row" onSubmit={e => { e.preventDefault(); handleSend() }}>
            <input
              type="text"
              className="chat-input"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="chat-send"><i className="fa-solid fa-paper-plane" /></button>
          </form>
        </div>
      )}
    </>
  )
}
