import { useState, useEffect, useRef, useCallback } from 'react'

/* ─────────────────────────────────────────
   HOOKS
───────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function useCountUp(target, duration = 2000, active = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return value
}

/* ─────────────────────────────────────────
   PARTICLES
───────────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 6,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            background: '#c8a96e',
            animation: `floatParticle ${p.duration}s ${p.delay}s infinite ease-in-out`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────
   NAV
───────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  const linkStyle = {
    position: 'relative', color: '#f5f0e8', textDecoration: 'none',
    fontSize: '0.72rem', letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif',
    fontWeight: 400, paddingBottom: '4px',
  }
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '1.4rem 3rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(200,169,110,0.15)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '1.4rem', color: '#c8a96e', letterSpacing: '0.05em' }}>
        HR-PULSE
      </div>
      <div style={{ display: 'flex', gap: '2.5rem' }}>
        {['PIPELINE', 'PREDICT', 'ABOUT'].map(link => (
          <a key={link} href={`#${link.toLowerCase()}`} style={linkStyle}
            className="nav-link"
            onMouseEnter={e => {
              e.currentTarget.style.color = '#c8a96e'
              const line = e.currentTarget.querySelector('.nav-underline')
              if (line) line.style.width = '100%'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#f5f0e8'
              const line = e.currentTarget.querySelector('.nav-underline')
              if (line) line.style.width = '0%'
            }}>
            {link}
            <span className="nav-underline" style={{
              position: 'absolute', bottom: 0, left: 0,
              height: '1px', width: '0%',
              background: '#c8a96e',
              transition: 'width 0.3s ease',
            }} />
          </a>
        ))}
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────
   SECTION 1 — HERO
───────────────────────────────────────── */
function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t) }, [])

  const wordStyle = (delay) => ({
    display: 'inline-block',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(50px)',
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  })

  return (
    <section id="pipeline" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#0a0a0a' }}>
      {/* Gradient mesh */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(16,24,40,0.9) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(10,30,20,0.7) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 50% 80%, rgba(30,20,10,0.5) 0%, transparent 70%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 12s ease infinite',
      }} />
      <Particles />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 2rem' }}>
        <div style={{ ...wordStyle(0.1), fontSize: '0.75rem', letterSpacing: '0.35em', color: '#c8a96e', marginBottom: '1rem', fontFamily: 'Inter', fontWeight: 400 }}>
          INTELLIGENT PIPELINE
        </div>

        <h1 style={{ lineHeight: 0.9, marginBottom: '1.2rem' }}>
          <span style={{ ...wordStyle(0.3), display: 'block', fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 900, fontSize: 'clamp(5rem, 14vw, 11rem)', color: '#f5f0e8', letterSpacing: '-0.02em' }}>
            HR-PULSE
          </span>
        </h1>

        <div style={{ ...wordStyle(0.5), fontSize: '0.75rem', letterSpacing: '0.35em', color: '#c8a96e', marginBottom: '3rem', fontFamily: 'Inter', fontWeight: 400 }}>
          NATIVE CONTAINERIZATION
        </div>

        <div style={{ ...wordStyle(0.7), display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => document.getElementById('pipeline-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '0.9rem 2.2rem', background: 'transparent',
              border: '1px solid #c8a96e', color: '#c8a96e',
              fontSize: '0.75rem', letterSpacing: '0.2em', cursor: 'pointer',
              fontFamily: 'Inter', transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#c8a96e'; e.currentTarget.style.color = '#0a0a0a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c8a96e' }}>
            → EXPLORE PIPELINE
          </button>
          <button
            onClick={() => document.getElementById('predict')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '0.9rem 2.2rem', background: 'transparent',
              border: '1px solid rgba(245,240,232,0.3)', color: '#f5f0e8',
              fontSize: '0.75rem', letterSpacing: '0.2em', cursor: 'pointer',
              fontFamily: 'Inter', transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8a96e'; e.currentTarget.style.color = '#c8a96e' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.3)'; e.currentTarget.style.color = '#f5f0e8' }}>
            RUN PREDICTION
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c8a96e', opacity: 0.7 }}>SCROLL</span>
        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #c8a96e, transparent)' }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8a96e', animation: 'bounceDown 1.5s ease-in-out infinite' }} />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   SECTION 2 — PIPELINE OVERVIEW
───────────────────────────────────────── */
const pipelineNodes = [
  { label: 'CSV Upload', icon: '⬆', tech: 'FastAPI · Multipart', color: '#c8a96e' },
  { label: 'Data Cleaning', icon: '⚙', tech: 'Pandas · Regex', color: '#c8a96e' },
  { label: 'Azure NER', icon: '🧠', tech: 'Azure AI Language', color: '#c8a96e' },
  { label: 'Azure SQL', icon: '🗄', tech: 'SQLAlchemy · SQL Server', color: '#c8a96e' },
  { label: 'ML Predict', icon: '📊', tech: 'scikit-learn · joblib', color: '#c8a96e' },
]

function PipelineSection() {
  const [sectionRef, inView] = useInView(0.2)
  const [hovered, setHovered] = useState(null)
  const jobs = useCountUp(1247, 2200, inView)
  const acc = useCountUp(94, 2000, inView)

  return (
    <section id="pipeline-section" ref={sectionRef} style={{ padding: '8rem 3rem', background: '#0d0d0d', position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        maxWidth: '900px', margin: '0 auto 5rem',
        opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.35em', color: '#c8a96e', marginBottom: '1rem', fontFamily: 'Inter' }}>ARCHITECTURE</div>
        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
          <em style={{ fontStyle: 'italic', color: '#f5f0e8' }}>The Pipeline</em>{' '}
          <span style={{ fontWeight: 200, color: 'rgba(245,240,232,0.55)', fontStyle: 'normal' }}>Explained</span>
        </h2>
      </div>

      {/* Pipeline diagram */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
        {/* SVG connecting lines */}
        <svg style={{ position: 'absolute', top: '28px', left: '0', width: '100%', height: '4px', overflow: 'visible', zIndex: 0 }}>
          <line x1="10%" y1="2" x2="90%" y2="2"
            stroke="#c8a96e" strokeWidth="1.5" strokeDasharray="800" strokeDashoffset="800"
            style={{ animation: inView ? 'drawLine 2s 0.5s ease forwards' : 'none' }} />
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {pipelineNodes.map((node, i) => (
            <div key={node.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: '1 1 140px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '0.8rem', cursor: 'pointer',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.12}s`,
              }}>
              {/* Node circle */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#141414',
                border: hovered === i ? '1.5px solid #c8a96e' : '1.5px solid rgba(200,169,110,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem',
                boxShadow: hovered === i ? '0 0 20px rgba(200,169,110,0.35)' : 'none',
                animation: hovered === i ? 'pulse-gold 2s infinite' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {node.icon}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontFamily: 'Inter', fontWeight: 500, color: '#f5f0e8', marginBottom: '0.3rem' }}>{node.label}</div>
                <div style={{
                  fontSize: '0.65rem', color: '#c8a96e', letterSpacing: '0.05em',
                  maxHeight: hovered === i ? '40px' : '0', overflow: 'hidden',
                  transition: 'max-height 0.4s ease', opacity: hovered === i ? 1 : 0,
                }}>
                  {node.tech}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: '800px', margin: '6rem auto 0', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
        {[
          { value: jobs, display: jobs.toLocaleString(), label: 'Jobs Analyzed' },
          { value: acc, display: `${acc}%`, label: 'NER Accuracy' },
          { value: 1, display: '< 2s', label: 'Avg Response', skip: true },
        ].map((stat, i) => (
          <div key={stat.label} style={{
            textAlign: 'center',
            opacity: inView ? 1 : 0,
            animation: inView ? `countUp 0.6s ${0.4 + i * 0.2}s both` : 'none',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#c8a96e', fontWeight: 400, lineHeight: 1 }}>
              {stat.skip ? stat.display : stat.display}
            </div>
            <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.45)', marginTop: '0.5rem', fontFamily: 'Inter' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   SECTION 3 — PREDICTION STUDIO
───────────────────────────────────────── */
const PIPELINE_STEPS = [
  { label: 'Input Received', detail: null },
  { label: 'Text Preprocessing', detail: null },
  { label: 'Azure NER Extraction', detail: 'skills' },
  { label: 'Database Storage', detail: null },
  { label: 'ML Model Inference', detail: 'loading' },
  { label: 'Result Ready', detail: null },
]

const MOCK_SKILLS = ['Python', 'SQL', 'Docker', 'FastAPI', 'ML', 'Azure']

const TERMINAL_LINES = [
  '> Connecting to Azure SQL...',
  '> Preprocessing job description text...',
  '> Running NER on job description...',
  '> Extracted 6 skills in 0.34s',
  '> Storing result in database...',
  '> Loading ML model: salary_predictor_v2.pkl',
  '> Model prediction: 52,400€',
  '> ✓ Pipeline complete in 1.87s',
]

function LiveTrace({ activeStep, skills, termLines }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', height: '100%' }}>
      <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#c8a96e', marginBottom: '1.4rem', fontFamily: 'Inter' }}>LIVE PIPELINE TRACE</div>

      {PIPELINE_STEPS.map((step, i) => {
        const status = activeStep === null ? 'idle' : activeStep > i ? 'done' : activeStep === i ? 'active' : 'idle'
        return (
          <div key={step.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {/* Dot */}
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                background: status === 'done' ? '#c8a96e' : status === 'active' ? '#c8a96e' : '#2a2a2a',
                boxShadow: status === 'active' ? '0 0 10px rgba(200,169,110,0.7)' : 'none',
                animation: status === 'active' ? 'pulse-dot 1s infinite' : 'none',
                transition: 'all 0.4s ease',
              }} />
              <span style={{
                fontSize: '0.8rem', fontFamily: 'Inter',
                color: status === 'done' ? 'rgba(245,240,232,0.45)' : status === 'active' ? '#f5f0e8' : 'rgba(245,240,232,0.25)',
                transition: 'color 0.4s ease',
              }}>
                {step.label}
              </span>
              {status === 'done' && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4ade80' }}>✓</span>
              )}
              {status === 'active' && (
                <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#c8a96e', letterSpacing: '0.1em', animation: 'glow-pulse 1s infinite' }}>ACTIVE</span>
              )}
            </div>

            {/* Skills tags for step 3 */}
            {step.detail === 'skills' && status !== 'idle' && (
              <div style={{ paddingLeft: '1.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {MOCK_SKILLS.slice(0, skills).map((sk, si) => (
                  <span key={sk} style={{
                    padding: '0.2rem 0.6rem', border: '1px solid #c8a96e',
                    fontSize: '0.6rem', color: '#c8a96e', letterSpacing: '0.1em',
                    fontFamily: 'Inter',
                    opacity: 0, animation: `fadeInScale 0.4s ${si * 0.15}s forwards`,
                  }}>
                    {sk}
                  </span>
                ))}
              </div>
            )}

            {/* Loading bar for step 5 */}
            {step.detail === 'loading' && status === 'active' && (
              <div style={{ paddingLeft: '1.8rem' }}>
                <div style={{ height: '2px', background: '#1a1a1a', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#c8a96e', animation: 'fillBar 2s ease forwards', '--fill-width': '100%' }} />
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Terminal */}
      <div style={{
        marginTop: '1.5rem', background: '#0d0d0d', borderRadius: '4px',
        padding: '0.8rem', border: '1px solid #1a1a1a', minHeight: '120px',
        flex: 1,
      }}>
        {termLines.map((line, i) => (
          <div key={i} style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            color: '#4ade80', lineHeight: 1.7,
            opacity: 0, animation: `slideUp 0.3s ${i * 0.25}s forwards`,
          }}>
            {line}
          </div>
        ))}
        {termLines.length === 0 && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(74,222,128,0.25)' }}>
            {'> waiting for input...'}
          </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ visible }) {
  const skills = MOCK_SKILLS
  return (
    <div style={{
      marginTop: '2rem',
      clipPath: visible ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
      transition: 'clip-path 0.8s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{
        border: '1px solid rgba(200,169,110,0.35)', background: '#111',
        padding: '2rem', borderRadius: '2px',
      }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#c8a96e', marginBottom: '1.8rem', fontFamily: 'Inter' }}>
          PREDICTED SALARY RANGE
        </div>

        {/* Salary range bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'rgba(245,240,232,0.5)' }}>45,000€</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'rgba(245,240,232,0.5)' }}>62,000€</span>
          </div>
          <div style={{ position: 'relative', height: '4px', background: '#1a1a1a', borderRadius: '2px' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              background: 'linear-gradient(90deg, rgba(200,169,110,0.3), #c8a96e)',
              animation: visible ? 'fillBar 1.2s 0.3s ease forwards' : 'none',
              '--fill-width': '60%', width: 0,
            }} />
            <div style={{
              position: 'absolute', left: '59%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px', height: '12px', borderRadius: '50%',
              background: '#c8a96e', boxShadow: '0 0 12px rgba(200,169,110,0.6)',
            }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.8rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', color: '#c8a96e' }}>
            52,400€
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(200,169,110,0.15)', margin: '1.5rem 0' }} />

        <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#c8a96e', marginBottom: '0.8rem', fontFamily: 'Inter' }}>
          EXTRACTED SKILLS
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {skills.map((sk, i) => (
            <span key={sk} style={{
              padding: '0.3rem 0.8rem', border: '1px solid #c8a96e',
              fontSize: '0.68rem', color: '#c8a96e', letterSpacing: '0.1em', fontFamily: 'Inter',
              opacity: 0,
              animation: visible ? `fadeInScale 0.4s ${0.5 + i * 0.12}s forwards` : 'none',
            }}>
              {sk}
            </span>
          ))}
        </div>

        <div style={{ height: '1px', background: 'rgba(200,169,110,0.15)', margin: '1.5rem 0' }} />

        <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#c8a96e', marginBottom: '0.6rem', fontFamily: 'Inter' }}>
          MARKET INSIGHT
        </div>
        <p style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.6)', lineHeight: 1.6, fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}>
          "This profile is in the top 23% of demand in your region."
        </p>
      </div>
    </div>
  )
}

function PredictionStudio() {
  const [sectionRef, inView] = useInView(0.1)
  const [form, setForm] = useState({ title: '', description: '', contract: 'CDI', location: '' })
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(null)
  const [skills, setSkills] = useState(0)
  const [termLines, setTermLines] = useState([])
  const [done, setDone] = useState(false)

  const handleSubmit = useCallback(() => {
    if (running || done) return
    setRunning(true)
    setActiveStep(0)
    setSkills(0)
    setTermLines([])
    setDone(false)

    // Animate through steps
    const delays = [0, 1200, 2200, 3400, 4200, 5400]
    delays.forEach((delay, step) => {
      setTimeout(() => {
        setActiveStep(step === delays.length - 1 ? 99 : step + 1)
        setTermLines(prev => [...prev, TERMINAL_LINES[step]])
        if (step === 2) {
          // Reveal skills one by one
          MOCK_SKILLS.forEach((_, si) => {
            setTimeout(() => setSkills(s => s + 1), si * 200 + 200)
          })
        }
        if (step === delays.length - 1) {
          setTermLines(TERMINAL_LINES)
          setRunning(false)
          setDone(true)
        }
      }, delay)
    })
  }, [running, done])

  return (
    <section id="predict" ref={sectionRef} style={{ padding: '8rem 3rem', background: '#0a0a0a', position: 'relative' }}>
      {/* Header */}
      <div style={{
        maxWidth: '900px', margin: '0 auto 4rem',
        opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.35em', color: '#c8a96e', marginBottom: '1rem', fontFamily: 'Inter' }}>PREDICTION STUDIO</div>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontFamily: 'Playfair Display, serif', lineHeight: 1.15 }}>
          <span style={{ fontWeight: 200, color: 'rgba(245,240,232,0.6)' }}>What does your </span>
          <em style={{ fontStyle: 'italic', color: '#f5f0e8' }}>job offer reveal?</em>
        </h2>
      </div>

      {/* Split layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>

        {/* LEFT — Live Trace */}
        <div style={{
          background: '#0f0f0f', border: '1px solid rgba(200,169,110,0.12)',
          padding: '2rem', display: 'flex', flexDirection: 'column',
          opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-40px)',
          transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
          minHeight: '500px',
        }}>
          <LiveTrace activeStep={activeStep} skills={skills} termLines={termLines} />
        </div>

        {/* RIGHT — Form */}
        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(40px)',
          transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s',
          display: 'flex', flexDirection: 'column', gap: '0',
        }}>
          <div style={{ border: '1px solid rgba(200,169,110,0.2)', background: '#0f0f0f', padding: '2.5rem' }}>
            {/* Job Title */}
            {[
              { label: 'Job Title', key: 'title', placeholder: 'ex: Senior Data Engineer', type: 'input' },
              { label: 'Job Description', key: 'description', placeholder: 'Paste the full job description...', type: 'textarea' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '1.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.2em', color: '#c8a96e', marginBottom: '0.7rem', fontFamily: 'Inter' }}>
                  {field.label.toUpperCase()}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={5}
                    style={{
                      width: '100%', background: 'transparent',
                      border: 'none', borderBottom: '1px solid rgba(200,169,110,0.3)',
                      color: '#f5f0e8', fontSize: '0.9rem', fontFamily: 'Inter', fontWeight: 300,
                      padding: '0.5rem 0', outline: 'none', resize: 'vertical',
                      '::placeholder': { color: 'rgba(245,240,232,0.2)' },
                    }}
                  />
                ) : (
                  <input
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', background: 'transparent',
                      border: 'none', borderBottom: '1px solid rgba(200,169,110,0.3)',
                      color: '#f5f0e8', fontSize: '0.9rem', fontFamily: 'Inter', fontWeight: 300,
                      padding: '0.5rem 0', outline: 'none',
                    }}
                  />
                )}
              </div>
            ))}

            {/* Contract */}
            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.2em', color: '#c8a96e', marginBottom: '0.7rem', fontFamily: 'Inter' }}>
                CONTRACT TYPE
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={form.contract}
                  onChange={e => setForm(f => ({ ...f, contract: e.target.value }))}
                  style={{
                    width: '100%', background: 'transparent', appearance: 'none',
                    border: 'none', borderBottom: '1px solid rgba(200,169,110,0.3)',
                    color: '#f5f0e8', fontSize: '0.9rem', fontFamily: 'Inter', fontWeight: 300,
                    padding: '0.5rem 0', outline: 'none', cursor: 'pointer',
                  }}>
                  <option value="CDI" style={{ background: '#141414' }}>CDI</option>
                  <option value="CDD" style={{ background: '#141414' }}>CDD</option>
                  <option value="Freelance" style={{ background: '#141414' }}>Freelance</option>
                </select>
                <span style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', color: '#c8a96e', pointerEvents: 'none' }}>▾</span>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.2em', color: '#c8a96e', marginBottom: '0.7rem', fontFamily: 'Inter' }}>
                LOCATION (OPTIONAL)
              </label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Paris, Lyon, Remote..."
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(200,169,110,0.3)',
                  color: '#f5f0e8', fontSize: '0.9rem', fontFamily: 'Inter', fontWeight: 300,
                  padding: '0.5rem 0', outline: 'none',
                }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={running}
              style={{
                width: '100%', padding: '1.1rem',
                background: running ? 'rgba(200,169,110,0.5)' : '#c8a96e',
                border: 'none', color: '#0a0a0a',
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em',
                fontFamily: 'Inter', cursor: running ? 'wait' : 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { if (!running) { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(200,169,110,0.35)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}>
              {running ? '⟳  ANALYZING...' : '→  ANALYZE & PREDICT'}
            </button>
          </div>

          {/* Result card */}
          <ResultCard visible={done} />
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   SECTION 4 — TECH STACK
───────────────────────────────────────── */
const TECH = [
  { name: 'FastAPI', desc: 'High-performance async REST API framework', emoji: '⚡' },
  { name: 'SQLAlchemy', desc: 'ORM + Azure SQL Server integration', emoji: '🗄' },
  { name: 'Azure AI Language', desc: 'Named Entity Recognition at scale', emoji: '🧠' },
  { name: 'Docker', desc: 'Containerized microservices pipeline', emoji: '🐳' },
  { name: 'scikit-learn', desc: 'ML salary prediction model', emoji: '📊' },
  { name: 'JWT Auth', desc: 'Stateless token-based authentication', emoji: '🔐' },
  { name: 'GitHub Actions', desc: 'CI/CD pipeline automation', emoji: '🔄' },
  { name: 'Terraform', desc: 'Infrastructure as Code on Azure', emoji: '☁' },
]

function TechStack() {
  const [sectionRef, inView] = useInView(0.1)
  const [hovered, setHovered] = useState(null)

  return (
    <section id="about" ref={sectionRef} style={{ padding: '8rem 3rem', background: '#0d0d0d' }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.35em', color: '#c8a96e', marginBottom: '1rem', fontFamily: 'Inter' }}>TECHNOLOGY</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
            <em style={{ color: 'rgba(245,240,232,0.5)', fontWeight: 200, fontStyle: 'italic' }}>Built with </em>
            <strong style={{ color: '#f5f0e8', fontStyle: 'normal' }}>Precision</strong>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem' }}>
          {TECH.map((tech, i) => (
            <div key={tech.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: '#111', padding: '1.8rem',
                border: hovered === i ? '1px solid #c8a96e' : '1px solid rgba(200,169,110,0.1)',
                cursor: 'default',
                transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered === i ? '0 8px 30px rgba(200,169,110,0.15)' : 'none',
                transition: 'all 0.3s ease',
                opacity: inView ? 1 : 0,
                animation: inView ? `slideUp 0.6s ${0.1 + i * 0.07}s both` : 'none',
              }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>{tech.emoji}</div>
              <div style={{ fontSize: '0.95rem', fontFamily: 'Inter', fontWeight: 500, color: '#f5f0e8', marginBottom: '0.5rem' }}>{tech.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.4)', lineHeight: 1.5, fontFamily: 'Inter' }}>{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   SECTION 5 — FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: '#080808', padding: '4rem 3rem 2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', paddingBottom: '3rem' }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '2.2rem', color: '#c8a96e', marginBottom: '0.6rem' }}>
              HR-PULSE
            </div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.35)', fontFamily: 'Inter' }}>
              Intelligent Pipeline.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            {[['GitHub', 'https://github.com'], ['API Docs', '#']].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'rgba(245,240,232,0.4)', textDecoration: 'none', fontFamily: 'Inter', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c8a96e'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,232,0.4)'}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Gold separator */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, #c8a96e, transparent)', marginBottom: '1.5rem' }} />

        <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(245,240,232,0.2)', fontFamily: 'Inter', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>© 2026 HR-PULSE AI. All rights reserved.</span>
          <span>Simplon — SAS Programme</span>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────
   ROOT APP
───────────────────────────────────────── */
export default function App() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <PipelineSection />
      <PredictionStudio />
      <TechStack />
      <Footer />
    </div>
  )
}
