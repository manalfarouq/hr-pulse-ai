import { useState, useEffect, useRef, useCallback } from 'react'

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  bg: '#FDFAF5',
  white: '#FFFFFF',
  text: '#1C1410',
  gold: '#8B6914',
  goldLight: '#C8A96E',
  goldMuted: '#A0896A',
  border: '#E8DCC8',
  termBg: '#0F0F0F',
  termText: '#4ade80',
}

const T = {
  playfair: "'Playfair Display', Georgia, serif",
  inter: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Mono', monospace",
}

/* ─────────────────────────────────────────────
   SVG ICON COMPONENTS
───────────────────────────────────────────── */
const Icon = ({ size = 20, color, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || 'currentColor'} strokeWidth="1.4"
    strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const IcBolt = p => <Icon {...p}><path d="M13 2L4.09 12.96A.5.5 0 004.5 14H11l-1 8 8.91-10.96A.5.5 0 0018.5 10H12l1-8z" /></Icon>
const IcDb = p => <Icon {...p}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" /></Icon>
const IcNeural = p => <Icon {...p}><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M12 7v4M12 11l-5 6M12 11l5 6" /></Icon>
const IcBox = p => <Icon {...p}><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></Icon>
const IcChart = p => <Icon {...p}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></Icon>
const IcLock = p => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></Icon>
const IcGit = p => <Icon {...p}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 9v1a2 2 0 002 2h5a2 2 0 012 2v1" /><circle cx="18" cy="6" r="3" /><line x1="18" y1="6" x2="18" y2="9" /></Icon>
const IcLayers = p => <Icon {...p}><polygon points="12,2 2,7 12,12 22,7" /><polyline points="2,17 12,22 22,17" /><polyline points="2,12 12,17 22,12" /></Icon>
const IcUpload = p => <Icon {...p}><polyline points="16,16 12,12 8,16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" /></Icon>
const IcGear = p => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M22 12h-2M4 12H2M19.07 19.07l-1.41-1.41M5.34 6.34L3.93 4.93M12 22v-2M12 4V2" /></Icon>
const IcCpu = p => <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></Icon>
const IcEye = () => <Icon size={16}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>
const IcEyeOff = () => <Icon size={16}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" /></Icon>

/* ─────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function useCountUp(target, duration = 2000, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let v = 0; const step = target / (duration / 16)
    const id = setInterval(() => {
      v += step; if (v >= target) { setVal(target); clearInterval(id) }
      else setVal(Math.floor(v))
    }, 16)
    return () => clearInterval(id)
  }, [active, target, duration])
  return val
}

/* ─────────────────────────────────────────────
   FONT INJECTION
───────────────────────────────────────────── */
function useFonts() {
  useEffect(() => {
    if (document.getElementById('gf-hr-pulse')) return
    const lk = document.createElement('link')
    lk.id = 'gf-hr-pulse'; lk.rel = 'stylesheet'
    lk.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Inter:wght@100;200;300;400;500;600;700&family=JetBrains+Mono&display=swap'
    document.head.appendChild(lk)
  }, [])
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{
      position: 'fixed', top: '1.6rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: C.gold, color: C.bg,
      padding: '0.75rem 1.8rem', display: 'flex', alignItems: 'center', gap: '1.2rem',
      fontFamily: T.inter, fontSize: '0.72rem', letterSpacing: '0.12em', fontWeight: 500,
      boxShadow: '0 8px 40px rgba(139,105,20,0.3)',
      animation: 'slideDown 0.4s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.bg, cursor: 'pointer', opacity: 0.65, fontSize: '1rem', lineHeight: 1 }}>&#x2715;</button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
function Nav({ view, setView, isLoggedIn, user, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const navLink = (label, href) => (
    <a key={label} href={href}
      style={{ color: C.goldMuted, textDecoration: 'none', fontFamily: T.inter, fontSize: '0.62rem', fontWeight: 300, letterSpacing: '0.3em', transition: 'color 0.2s', position: 'relative' }}
      onMouseEnter={e => e.currentTarget.style.color = C.gold}
      onMouseLeave={e => e.currentTarget.style.color = C.goldMuted}>
      {label}
    </a>
  )

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
      padding: '1.2rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(253,250,245,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
      transition: 'all 0.5s ease',
    }}>
      <button onClick={() => setView('home')} style={{ fontFamily: T.playfair, fontStyle: 'italic', fontWeight: 700, fontSize: '1.15rem', color: C.gold, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}>
        HR-PULSE
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.2rem' }}>
        {view === 'home' && <>
          {navLink('PIPELINE', '#pipeline')}
          {navLink('PREDICT', '#predict')}
          {navLink('ABOUT', '#about')}
        </>}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginLeft: '0.8rem' }}>
          {isLoggedIn ? (
            <>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${C.gold}`, background: `rgba(139,105,20,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.inter, fontSize: '0.6rem', fontWeight: 600, color: C.gold }}>
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <button onClick={onLogout} style={{ background: 'none', border: 'none', fontFamily: T.inter, fontSize: '0.6rem', letterSpacing: '0.22em', color: C.goldMuted, cursor: 'pointer', fontWeight: 300, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.goldMuted}>LOG OUT</button>
            </>
          ) : (
            <>
              <button onClick={() => setView('login')} style={{ background: 'none', border: `1px solid ${C.text}`, color: C.text, padding: '0.35rem 0.95rem', fontFamily: T.inter, fontSize: '0.6rem', letterSpacing: '0.2em', cursor: 'pointer', fontWeight: 300, transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.text; e.currentTarget.style.color = C.text }}>LOG IN</button>
              <button onClick={() => setView('register')} style={{ background: C.gold, border: `1px solid ${C.gold}`, color: C.bg, padding: '0.35rem 0.95rem', fontFamily: T.inter, fontSize: '0.6rem', letterSpacing: '0.2em', cursor: 'pointer', fontWeight: 400, transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.borderColor = C.goldLight }}
                onMouseLeave={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.borderColor = C.gold }}>SIGN UP</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────
   HERO — "Editorial Bold Luxury"
───────────────────────────────────────────── */
const HERO_LETTERS = 'HR-PULSE'.split('')

function Hero() {
  const [phase, setPhase] = useState(0) // 0=idle → 1=letters → 2=echo
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100)
    const t2 = setTimeout(() => setPhase(2), 100 + HERO_LETTERS.length * 55 + 900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const echoShadow = phase === 2 ? [
    '8px 8px 0px rgba(139,105,20,0.11)',
    '16px 16px 0px rgba(139,105,20,0.07)',
    '24px 24px 0px rgba(139,105,20,0.05)',
    '32px 32px 0px rgba(139,105,20,0.03)',
  ].join(', ') : 'none'

  return (
    <section id="home" style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bg, overflow: 'hidden',
      backgroundImage: `radial-gradient(circle, rgba(200,169,110,0.045) 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}>
      {/* Corner details */}
      <div style={{ position: 'absolute', top: '6rem', left: '3rem', fontFamily: T.inter, fontSize: '0.58rem', letterSpacing: '0.25em', color: C.goldMuted, fontWeight: 300 }}>
        2026 — AI PLATFORM
      </div>
      <div style={{ position: 'absolute', top: '6rem', right: '3rem', fontFamily: T.inter, fontSize: '0.58rem', letterSpacing: '0.25em', color: C.goldMuted, fontWeight: 300, textAlign: 'right' }}>
        AZURE · FASTAPI · DOCKER
      </div>

      {/* Central content */}
      <div style={{ textAlign: 'center', padding: '0 2rem', position: 'relative', zIndex: 1 }}>

        {/* Top label */}
        <div style={{ fontFamily: T.inter, fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.45em', color: C.gold, marginBottom: '2.5rem', opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.9s ease 0.1s' }}>
          INTELLIGENT PIPELINE
        </div>

        {/* Giant echo title */}
        <div style={{ position: 'relative', lineHeight: 0.88, marginBottom: '2.5rem', display: 'inline-block' }}>
          <h1 style={{
            fontFamily: T.playfair, fontStyle: 'italic', fontWeight: 900,
            fontSize: 'clamp(88px, 16vw, 240px)',
            color: C.text, lineHeight: 0.88,
            textShadow: echoShadow,
            transition: 'text-shadow 1.2s ease',
            animation: phase >= 2 ? 'subtlePulse 6s ease-in-out infinite' : 'none',
            margin: 0,
          }}>
            {HERO_LETTERS.map((ch, i) => (
              <span key={i} style={{
                display: 'inline-block',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateY(0)' : 'translateY(1.1em)',
                transition: `opacity 0.6s ease ${i * 0.055}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${i * 0.055}s`,
              }}>{ch === '-' ? <span style={{ letterSpacing: '0.02em' }}>{ch}</span> : ch}</span>
            ))}
          </h1>
        </div>

        {/* Bottom label */}
        <div style={{ fontFamily: T.inter, fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.45em', color: C.goldMuted, marginBottom: '3.5rem', opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.9s ease 0.55s' }}>
          NATIVE CONTAINERIZATION
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.9s ease 0.75s' }}>
          <button onClick={() => document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '0.85rem 2.4rem', background: 'transparent', border: `1.5px solid ${C.text}`, color: C.text, fontFamily: T.inter, fontSize: '0.6rem', fontWeight: 400, letterSpacing: '0.22em', cursor: 'pointer', transition: 'all 0.28s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.text; e.currentTarget.style.color = C.text }}>
            EXPLORE PIPELINE
          </button>
          <button onClick={() => document.getElementById('predict')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '0.85rem 2.4rem', background: C.gold, border: `1.5px solid ${C.gold}`, color: C.bg, fontFamily: T.inter, fontSize: '0.6rem', fontWeight: 400, letterSpacing: '0.22em', cursor: 'pointer', transition: 'all 0.28s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.borderColor = C.goldLight }}
            onMouseLeave={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.borderColor = C.gold }}>
            RUN PREDICTION
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: '2.8rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: phase >= 1 ? 0.8 : 0, transition: 'opacity 1s ease 1.2s' }}>
        <span style={{ fontFamily: T.inter, fontSize: '0.52rem', letterSpacing: '0.35em', color: C.goldMuted }}>SCROLL</span>
        <div style={{ width: '1px', height: '40px', background: `linear-gradient(to bottom, ${C.goldLight}, transparent)` }} />
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: C.gold, animation: 'bounceDown 1.8s ease-in-out infinite' }} />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PIPELINE SECTION
───────────────────────────────────────────── */
const NODES = [
  { num: '01', label: 'CSV Upload', tech: 'FastAPI · Multipart', Icon: IcUpload },
  { num: '02', label: 'Data Cleaning', tech: 'Pandas · Regex', Icon: IcGear },
  { num: '03', label: 'Azure NER', tech: 'Azure AI Language', Icon: IcNeural },
  { num: '04', label: 'Azure SQL', tech: 'SQLAlchemy · SQL Server', Icon: IcDb },
  { num: '05', label: 'ML Predict', tech: 'scikit-learn · joblib', Icon: IcCpu },
]

function OutlineNum({ n, size = 130, visible }) {
  return (
    <div style={{
      fontFamily: T.inter, fontWeight: 100, fontSize: `${size}px`,
      color: 'transparent', WebkitTextStroke: `1px ${C.goldLight}`,
      lineHeight: 1, opacity: visible ? 0.55 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 1.1s cubic-bezier(0.16,1,0.3,1)',
      userSelect: 'none', letterSpacing: '-0.04em',
    }}>{n}</div>
  )
}

function PipelineSection() {
  const [ref, inView] = useInView(0.15)
  const jobs = useCountUp(1247, 2400, inView)
  const acc = useCountUp(94, 2000, inView)

  return (
    <section id="pipeline" ref={ref} style={{ background: C.bg, padding: '9rem 4rem', position: 'relative' }}>
      {/* dot grid on this section too */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, rgba(200,169,110,0.04) 1px, transparent 1px)`, backgroundSize: '24px 24px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '6rem', alignItems: 'flex-start' }}>

          {/* LEFT — section header */}
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s ease' }}>
            <OutlineNum n="01" visible={inView} />
            <div style={{ fontFamily: T.inter, fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.38em', color: C.gold, marginBottom: '1.5rem', marginTop: '-0.5rem' }}>ARCHITECTURE</div>
            <h2 style={{ fontFamily: T.playfair, lineHeight: 1.1, color: C.text }}>
              <em style={{ fontSize: 'clamp(2.8rem, 4.5vw, 5rem)', fontWeight: 700, display: 'block' }}>The Pipeline</em>
              <span style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.8rem)', fontWeight: 300, color: C.goldMuted, fontStyle: 'normal', display: 'block', marginTop: '0.2rem' }}>Explained</span>
            </h2>
            <p style={{ marginTop: '2rem', fontFamily: T.inter, fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.85, color: C.goldMuted, maxWidth: '320px' }}>
              An end-to-end machine learning pipeline — from raw CSV to salary prediction — powered by Azure AI and containerized microservices.
            </p>
          </div>

          {/* RIGHT — vertical node list */}
          <div style={{ paddingTop: '1rem' }}>
            {NODES.map((node, i) => (
              <div key={node.label} style={{
                display: 'flex', alignItems: 'center', gap: '1.4rem',
                padding: '1.5rem 0',
                borderBottom: i < NODES.length - 1 ? `1px solid ${C.border}` : 'none',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateX(0)' : 'translateX(30px)',
                transition: `opacity 0.7s ease ${0.1 + i * 0.12}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.12}s`,
              }}>
                <div style={{ fontFamily: T.inter, fontWeight: 100, fontSize: '0.62rem', letterSpacing: '0.1em', color: C.goldLight, minWidth: '22px' }}>{node.num}</div>
                <div style={{ width: '36px', height: '36px', border: `1px solid ${C.border}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.goldMuted }}>
                  <node.Icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.inter, fontWeight: 500, fontSize: '0.85rem', color: C.text, marginBottom: '0.2rem' }}>{node.label}</div>
                  <div style={{ fontFamily: T.inter, fontWeight: 300, fontSize: '0.68rem', color: C.goldMuted, letterSpacing: '0.05em' }}>{node.tech}</div>
                </div>
                <div style={{ height: '1px', flex: '0 0 40px', background: `linear-gradient(90deg, ${C.border}, transparent)`, marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ marginTop: '7rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', borderTop: `1px solid ${C.border}`, paddingTop: '4rem' }}>
          {[
            { val: jobs.toLocaleString(), suffix: '', label: 'Jobs Analyzed' },
            { val: acc, suffix: '%', label: 'NER Accuracy' },
            { val: '< 2', suffix: 's', label: 'Avg Response' },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', opacity: inView ? 1 : 0, animation: inView ? `countUp 0.7s ${0.4 + i * 0.18}s both` : 'none' }}>
              <div style={{ fontFamily: T.inter, fontWeight: 100, fontSize: 'clamp(3.5rem, 7vw, 6rem)', color: 'transparent', WebkitTextStroke: `1.5px ${C.gold}`, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.val}{s.suffix}
              </div>
              <div style={{ fontFamily: T.inter, fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.3em', color: C.goldMuted, marginTop: '0.8rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PREDICTION STUDIO — live trace
───────────────────────────────────────────── */
const P_STEPS = [
  { num: '01', label: 'Input Received' },
  { num: '02', label: 'Text Preprocessing' },
  { num: '03', label: 'Azure NER Extraction', detail: 'skills' },
  { num: '04', label: 'Database Storage' },
  { num: '05', label: 'ML Model Inference', detail: 'loading' },
  { num: '06', label: 'Result Ready' },
]
const SKILLS = ['Python', 'SQL', 'Docker', 'FastAPI', 'ML', 'Azure']
const TERM_LINES = [
  '> Connecting to Azure SQL...',
  '> Preprocessing job description...',
  '> Running NER extraction...',
  '> Extracted 6 skills in 0.34s',
  '> Storing result in database...',
  '> Loading salary_predictor_v2.pkl',
  '> Prediction: 52,400 EUR',
  '> Pipeline complete in 1.87s',
]

function LiveTrace({ activeStep, skillCount, termLines }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontFamily: T.inter, fontSize: '0.58rem', fontWeight: 300, letterSpacing: '0.32em', color: C.gold, marginBottom: '1.8rem' }}>LIVE PIPELINE TRACE</div>

      {/* Steps */}
      <div style={{ position: 'relative', paddingLeft: '1.2rem' }}>
        {/* vertical connector */}
        <div style={{ position: 'absolute', left: 0, top: '12px', bottom: '12px', width: '1px', background: `linear-gradient(to bottom, ${C.goldLight}, ${C.border})` }} />

        {P_STEPS.map((step, i) => {
          const st = activeStep === null ? 'idle' : activeStep > i ? 'done' : activeStep === i ? 'active' : 'idle'
          return (
            <div key={step.num} style={{ marginBottom: '1.1rem', paddingLeft: '1.2rem', position: 'relative' }}>
              {/* connector dot */}
              <div style={{
                position: 'absolute', left: '-1.2rem', top: '6px',
                width: '7px', height: '7px', borderRadius: '50%',
                background: st !== 'idle' ? C.gold : C.border,
                boxShadow: st === 'active' ? `0 0 8px ${C.gold}` : 'none',
                animation: st === 'active' ? 'pulse-dot 1s infinite' : 'none',
                transition: 'all 0.4s ease', zIndex: 1,
              }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.7rem' }}>
                <span style={{ fontFamily: T.inter, fontWeight: 100, fontSize: '0.58rem', color: C.goldLight, minWidth: '18px' }}>{step.num}</span>
                <span style={{ fontFamily: T.inter, fontWeight: st === 'active' ? 400 : 300, fontSize: '0.78rem', color: st === 'done' ? C.goldMuted : st === 'active' ? C.text : C.border, transition: 'color 0.4s ease' }}>{step.label}</span>
                {st === 'done' && <span style={{ fontFamily: T.inter, fontSize: '0.55rem', letterSpacing: '0.15em', color: C.gold, marginLeft: 'auto' }}>DONE</span>}
                {st === 'active' && <span style={{ fontFamily: T.inter, fontSize: '0.55rem', letterSpacing: '0.15em', color: C.gold, marginLeft: 'auto', animation: 'glowPulse 1s infinite' }}>ACTIVE</span>}
              </div>
              {step.detail === 'skills' && st !== 'idle' && (
                <div style={{ paddingLeft: '1.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {SKILLS.slice(0, skillCount).map((sk, si) => (
                    <span key={sk} style={{ padding: '0.14rem 0.5rem', border: `1px solid ${C.goldLight}`, fontFamily: T.inter, fontSize: '0.58rem', color: C.gold, letterSpacing: '0.08em', opacity: 0, animation: `fadeInScale 0.35s ${si * 0.13}s forwards` }}>{sk}</span>
                  ))}
                </div>
              )}
              {step.detail === 'loading' && st === 'active' && (
                <div style={{ paddingLeft: '1.6rem', marginTop: '0.5rem' }}>
                  <div style={{ height: '1px', background: C.border, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: C.gold, animation: 'fillBar 2s ease forwards', '--fill-width': '100%' }} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Terminal */}
      <div style={{ marginTop: '1.6rem', background: C.termBg, padding: '1rem 1.2rem', flex: 1, minHeight: '140px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: 'rgba(74,222,128,0.22)', marginBottom: '0.2rem' }}>{'> terminal ready'}</div>
        {termLines.map((line, i) => (
          <div key={i} style={{ fontFamily: T.mono, fontSize: '0.62rem', color: C.termText, lineHeight: 1.9, opacity: 0, animation: `slideUp 0.3s ${i * 0.2}s forwards` }}>{line}</div>
        ))}
        {termLines.length === 0 && <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: 'rgba(74,222,128,0.2)' }}>{'> waiting for input...'}</div>}
      </div>
    </div>
  )
}

function SalaryCard({ visible }) {
  return (
    <div style={{ marginTop: '1.8rem', clipPath: visible ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)', transition: 'clip-path 0.9s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: '2rem' }}>
        <div style={{ fontFamily: T.inter, fontSize: '0.58rem', fontWeight: 300, letterSpacing: '0.32em', color: C.gold, marginBottom: '1.4rem' }}>PREDICTED SALARY RANGE</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: T.mono, fontSize: '0.88rem', color: C.goldMuted }}>45,000 EUR</span>
          <span style={{ fontFamily: T.mono, fontSize: '0.88rem', color: C.goldMuted }}>62,000 EUR</span>
        </div>
        <div style={{ position: 'relative', height: '2px', background: C.border, marginBottom: '0.7rem' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: `linear-gradient(90deg, rgba(139,105,20,0.3), ${C.gold})`, animation: visible ? 'fillBar 1.3s 0.3s ease forwards' : 'none', '--fill-width': '62%', width: 0 }} />
          <div style={{ position: 'absolute', left: '61%', top: '50%', transform: 'translate(-50%,-50%)', width: '10px', height: '10px', borderRadius: '50%', background: C.gold, boxShadow: `0 0 10px ${C.gold}` }} />
        </div>
        <div style={{ textAlign: 'center', fontFamily: T.mono, fontSize: '1.6rem', color: C.gold, fontWeight: 400 }}>52,400 EUR</div>
        <div style={{ height: '1px', background: C.border, margin: '1.4rem 0' }} />
        <div style={{ fontFamily: T.inter, fontSize: '0.58rem', fontWeight: 300, letterSpacing: '0.32em', color: C.gold, marginBottom: '0.7rem' }}>EXTRACTED SKILLS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.4rem' }}>
          {SKILLS.map((sk, i) => <span key={sk} style={{ padding: '0.25rem 0.7rem', border: `1px solid ${C.gold}`, fontFamily: T.inter, fontSize: '0.62rem', color: C.gold, letterSpacing: '0.08em', opacity: 0, animation: visible ? `fadeInScale 0.4s ${0.5 + i * 0.1}s forwards` : 'none' }}>{sk}</span>)}
        </div>
        <div style={{ height: '1px', background: C.border, margin: '1.4rem 0' }} />
        <p style={{ fontFamily: T.playfair, fontStyle: 'italic', fontSize: '0.88rem', color: C.goldMuted, lineHeight: 1.7 }}>"This profile is in the top 23% of demand in your region."</p>
      </div>
    </div>
  )
}

function PredictionStudio({ isLoggedIn, setView }) {
  const [ref, inView] = useInView(0.1)
  const [form, setForm] = useState({ title: '', desc: '', contract: 'CDI', location: '' })
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(null)
  const [skillCount, setSkillCount] = useState(0)
  const [termLines, setTermLines] = useState([])
  const [done, setDone] = useState(false)
  const [authMsg, setAuthMsg] = useState(false)

  const run = useCallback(() => {
    if (!isLoggedIn) { setAuthMsg(true); return }
    if (running || done) return
    setAuthMsg(false); setRunning(true); setActiveStep(0); setSkillCount(0); setTermLines([]); setDone(false)
    const delays = [0, 1100, 2100, 3200, 4100, 5300]
    delays.forEach((d, step) => {
      setTimeout(() => {
        setActiveStep(step === delays.length - 1 ? 999 : step + 1)
        setTermLines(p => [...p, TERM_LINES[step]])
        if (step === 2) SKILLS.forEach((_, si) => setTimeout(() => setSkillCount(s => s + 1), si * 210 + 100))
        if (step === delays.length - 1) { setTermLines(TERM_LINES); setRunning(false); setDone(true) }
      }, d)
    })
  }, [isLoggedIn, running, done])

  const inp = { width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`, color: C.text, fontSize: '0.88rem', fontFamily: T.inter, fontWeight: 300, padding: '0.5rem 0', outline: 'none' }
  const fade = d => ({ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(38px)', transition: `all 0.9s cubic-bezier(0.16,1,0.3,1) ${d}s` })

  return (
    <section id="predict" ref={ref} style={{ background: C.bg, padding: '9rem 4rem', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, rgba(200,169,110,0.04) 1px, transparent 1px)`, backgroundSize: '24px 24px', pointerEvents: 'none' }} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

        {/* Section header */}
        <div style={{ marginBottom: '5rem', ...fade(0) }}>
          <OutlineNum n="02" visible={inView} />
          <div style={{ fontFamily: T.inter, fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.38em', color: C.gold, marginBottom: '1rem', marginTop: '-0.5rem' }}>PREDICTION STUDIO</div>
          <h2 style={{ fontFamily: T.playfair, lineHeight: 1.1, color: C.text }}>
            <span style={{ fontSize: 'clamp(2rem, 3.5vw, 3.8rem)', fontWeight: 300, color: C.goldMuted, display: 'block' }}>What does your</span>
            <em style={{ fontSize: 'clamp(2.8rem, 5vw, 5.5rem)', fontWeight: 900, display: 'block', textShadow: inView ? '6px 6px 0 rgba(139,105,20,0.08), 12px 12px 0 rgba(139,105,20,0.05)' : 'none', transition: 'text-shadow 1s ease 0.5s' }}>job offer reveal?</em>
          </h2>
        </div>

        {/* Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.5rem' }}>

          {/* Left — trace */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: '2.2rem', display: 'flex', flexDirection: 'column', ...fade(0.2), minHeight: '540px' }}>
            <LiveTrace activeStep={activeStep} skillCount={skillCount} termLines={termLines} />
          </div>

          {/* Right — form */}
          <div style={{ ...fade(0.35), display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: '2.8rem' }}>

              {[
                { label: 'JOB TITLE', key: 'title', ph: 'ex. Senior Data Engineer', type: 'text' },
                { label: 'JOB DESCRIPTION', key: 'desc', ph: 'Paste the full job description...', type: 'area' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '1.8rem' }}>
                  <label style={{ display: 'block', fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.3em', color: C.gold, marginBottom: '0.7rem' }}>{f.label}</label>
                  {f.type === 'area'
                    ? <textarea value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} rows={4} style={{ ...inp, resize: 'vertical' }} />
                    : <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={inp} />}
                </div>
              ))}

              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ display: 'block', fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.3em', color: C.gold, marginBottom: '0.7rem' }}>CONTRACT TYPE</label>
                <div style={{ position: 'relative' }}>
                  <select value={form.contract} onChange={e => setForm(p => ({ ...p, contract: e.target.value }))} style={{ ...inp, appearance: 'none', cursor: 'pointer', paddingRight: '1.5rem' }}>
                    {['CDI', 'CDD', 'Freelance'].map(o => <option key={o} value={o} style={{ background: C.white }}>{o}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: C.gold, pointerEvents: 'none', fontFamily: T.inter, fontSize: '0.65rem' }}>v</span>
                </div>
              </div>

              <div style={{ marginBottom: '2.4rem' }}>
                <label style={{ display: 'block', fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.3em', color: C.gold, marginBottom: '0.7rem' }}>LOCATION — OPTIONAL</label>
                <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Paris, Lyon, Remote..." style={inp} />
              </div>

              <button onClick={run} disabled={running}
                style={{ width: '100%', padding: '1.1rem', fontFamily: T.inter, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.25em', cursor: running ? 'wait' : 'pointer', transition: 'all 0.28s ease', border: isLoggedIn ? 'none' : `1.5px solid ${C.text}`, background: isLoggedIn ? (running ? `rgba(139,105,20,0.4)` : C.gold) : 'transparent', color: isLoggedIn ? C.bg : C.text, opacity: running ? 0.6 : 1 }}
                onMouseEnter={e => { if (!running) { e.currentTarget.style.transform = 'scale(1.012)'; if (isLoggedIn) e.currentTarget.style.boxShadow = `0 6px 28px rgba(139,105,20,0.28)` } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}>
                {running ? 'ANALYZING...' : 'ANALYZE + PREDICT'}
              </button>

              {authMsg && (
                <div style={{ marginTop: '0.8rem', textAlign: 'center', fontFamily: T.inter, fontSize: '0.72rem', fontWeight: 300, color: C.goldMuted }}>
                  Sign in to unlock predictions{' '}
                  <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontFamily: T.inter, fontSize: '0.72rem', textDecoration: 'underline' }}>Sign in</button>
                </div>
              )}
            </div>
            <SalaryCard visible={done} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   SHARED AUTH INPUT
───────────────────────────────────────────── */
const authInp = {
  width: '100%', background: 'transparent', border: 'none',
  borderBottom: `1px solid #E8DCC8`, color: '#1C1410',
  fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", fontWeight: 300,
  padding: '0.55rem 0', outline: 'none',
}

/* ─────────────────────────────────────────────
   LOGIN PAGE
───────────────────────────────────────────── */
function LoginPage({ setView, onLogin }) {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [show, setShow] = useState(false)
  const sub = e => { e.preventDefault(); onLogin({ email }); setView('home') }
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', backgroundImage: `radial-gradient(circle, rgba(200,169,110,0.04) 1px, transparent 1px)`, backgroundSize: '24px 24px' }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', fontFamily: T.inter, fontSize: '0.6rem', letterSpacing: '0.22em', color: C.goldMuted, cursor: 'pointer', marginBottom: '3rem', fontWeight: 300, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = C.gold}
          onMouseLeave={e => e.currentTarget.style.color = C.goldMuted}>&#x2190; BACK</button>

        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontFamily: T.playfair, fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 700, color: C.gold, textShadow: '4px 4px 0 rgba(139,105,20,0.1), 8px 8px 0 rgba(139,105,20,0.06)' }}>HR-PULSE</div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: '3rem', marginTop: '2rem', boxShadow: '0 8px 48px rgba(139,105,20,0.06)' }}>
          <div style={{ fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.35em', color: C.gold, marginBottom: '1rem' }}>WELCOME BACK</div>
          <h2 style={{ fontFamily: T.playfair, lineHeight: 1.12, marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 300, color: C.goldMuted }}>Sign in </span>
            <em style={{ fontSize: '1.6rem', fontWeight: 700, color: C.text }}>to your account</em>
          </h2>
          <form onSubmit={sub}>
            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'block', fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.3em', color: C.gold, marginBottom: '0.7rem' }}>EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={authInp} />
            </div>
            <div style={{ marginBottom: '2.4rem' }}>
              <label style={{ display: 'block', fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.3em', color: C.gold, marginBottom: '0.7rem' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} required placeholder="••••••••" style={{ ...authInp, paddingRight: '2rem' }} />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.goldMuted, cursor: 'pointer', display: 'flex' }}>
                  {show ? <IcEyeOff /> : <IcEye />}
                </button>
              </div>
            </div>
            <button type="submit" style={{ width: '100%', padding: '1rem', background: C.gold, border: 'none', color: C.bg, fontFamily: T.inter, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.25em', cursor: 'pointer', transition: 'all 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.goldLight}
              onMouseLeave={e => e.currentTarget.style.background = C.gold}>SIGN IN</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.6rem', fontFamily: T.inter, fontSize: '0.72rem', fontWeight: 300, color: C.goldMuted }}>
            No account?{' '}
            <button onClick={() => setView('register')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontFamily: T.inter, fontSize: '0.72rem', textDecoration: 'underline' }}>Create one</button>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   REGISTER PAGE
───────────────────────────────────────────── */
function RegisterPage({ setView, onLogin }) {
  const [name, setName] = useState(''), [email, setEmail] = useState('')
  const [pw, setPw] = useState(''), [pw2, setPw2] = useState(''), [show, setShow] = useState(false)
  const str = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3
  const strCol = ['transparent', '#ef4444', '#f97316', C.gold][str]
  const strLbl = ['', 'WEAK', 'MEDIUM', 'STRONG'][str]
  const bad = pw2.length > 0 && pw !== pw2
  const sub = e => { e.preventDefault(); if (bad || pw.length < 6) return; onLogin({ name, email }); setView('home') }
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', backgroundImage: `radial-gradient(circle, rgba(200,169,110,0.04) 1px, transparent 1px)`, backgroundSize: '24px 24px' }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', fontFamily: T.inter, fontSize: '0.6rem', letterSpacing: '0.22em', color: C.goldMuted, cursor: 'pointer', marginBottom: '3rem', fontWeight: 300, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = C.gold}
          onMouseLeave={e => e.currentTarget.style.color = C.goldMuted}>&#x2190; BACK</button>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontFamily: T.playfair, fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 700, color: C.gold, textShadow: '4px 4px 0 rgba(139,105,20,0.1), 8px 8px 0 rgba(139,105,20,0.06)' }}>HR-PULSE</div>
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: '3rem', marginTop: '2rem', boxShadow: '0 8px 48px rgba(139,105,20,0.06)' }}>
          <div style={{ fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.35em', color: C.gold, marginBottom: '1rem' }}>JOIN HR-PULSE</div>
          <h2 style={{ fontFamily: T.playfair, lineHeight: 1.12, marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 300, color: C.goldMuted }}>Create </span>
            <em style={{ fontSize: '1.6rem', fontWeight: 700, color: C.text }}>your account</em>
          </h2>
          <form onSubmit={sub}>
            {[
              { label: 'FULL NAME', val: name, fn: setName, type: 'text', ph: 'Marie Dupont' },
              { label: 'EMAIL ADDRESS', val: email, fn: setEmail, type: 'email', ph: 'you@example.com' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '1.8rem' }}>
                <label style={{ display: 'block', fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.3em', color: C.gold, marginBottom: '0.7rem' }}>{f.label}</label>
                <input type={f.type} value={f.val} onChange={e => f.fn(e.target.value)} required placeholder={f.ph} style={authInp} />
              </div>
            ))}
            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'block', fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.3em', color: C.gold, marginBottom: '0.7rem' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} required placeholder="Min. 8 characters" style={{ ...authInp, paddingRight: '2rem' }} />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.goldMuted, cursor: 'pointer', display: 'flex' }}>
                  {show ? <IcEyeOff /> : <IcEye />}
                </button>
              </div>
              {pw.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '1.5px', background: C.border, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: strCol, width: `${str * 33.3}%`, transition: 'width 0.4s, background 0.4s' }} />
                  </div>
                  <span style={{ fontFamily: T.inter, fontSize: '0.55rem', letterSpacing: '0.18em', color: strCol, fontWeight: 400 }}>{strLbl}</span>
                </div>
              )}
            </div>
            <div style={{ marginBottom: '2.4rem' }}>
              <label style={{ display: 'block', fontFamily: T.inter, fontSize: '0.55rem', fontWeight: 300, letterSpacing: '0.3em', color: C.gold, marginBottom: '0.7rem' }}>CONFIRM PASSWORD</label>
              <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} required placeholder="Repeat password" style={{ ...authInp, borderBottomColor: bad ? '#ef4444' : '#E8DCC8' }} />
              {bad && <span style={{ fontFamily: T.inter, fontSize: '0.6rem', color: '#ef4444', marginTop: '0.3rem', display: 'block' }}>Passwords do not match</span>}
            </div>
            <button type="submit" disabled={bad || pw.length < 6}
              style={{ width: '100%', padding: '1rem', background: C.gold, border: 'none', color: C.bg, fontFamily: T.inter, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.25em', cursor: bad || pw.length < 6 ? 'not-allowed' : 'pointer', transition: 'all 0.25s', opacity: bad || pw.length < 6 ? 0.45 : 1 }}
              onMouseEnter={e => { if (!bad && pw.length >= 6) e.currentTarget.style.background = C.goldLight }}
              onMouseLeave={e => e.currentTarget.style.background = C.gold}>CREATE ACCOUNT</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.6rem', fontFamily: T.inter, fontSize: '0.72rem', fontWeight: 300, color: C.goldMuted }}>
            Already registered?{' '}
            <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontFamily: T.inter, fontSize: '0.72rem', textDecoration: 'underline' }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TECH STACK
───────────────────────────────────────────── */
const TECH = [
  { name: 'FastAPI', desc: 'High-performance async REST API', Icon: IcBolt },
  { name: 'SQLAlchemy', desc: 'ORM + Azure SQL Server integration', Icon: IcDb },
  { name: 'Azure AI Language', desc: 'Named Entity Recognition at scale', Icon: IcNeural },
  { name: 'Docker', desc: 'Containerized microservices pipeline', Icon: IcBox },
  { name: 'scikit-learn', desc: 'ML salary prediction model', Icon: IcChart },
  { name: 'JWT Auth', desc: 'Stateless token-based auth', Icon: IcLock },
  { name: 'GitHub Actions', desc: 'CI/CD pipeline automation', Icon: IcGit },
  { name: 'Terraform', desc: 'Infrastructure as Code on Azure', Icon: IcLayers },
]

function TechStack() {
  const [ref, inView] = useInView(0.1), [hov, setHov] = useState(null)
  return (
    <section id="about" ref={ref} style={{ background: C.bg, padding: '9rem 4rem', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, rgba(200,169,110,0.04) 1px, transparent 1px)`, backgroundSize: '24px 24px', pointerEvents: 'none' }} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div style={{ marginBottom: '5rem', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s ease' }}>
          <OutlineNum n="03" visible={inView} />
          <div style={{ fontFamily: T.inter, fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.38em', color: C.gold, marginBottom: '1rem', marginTop: '-0.5rem' }}>TECHNOLOGY</div>
          <h2 style={{ fontFamily: T.playfair, lineHeight: 1.1 }}>
            <em style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)', fontWeight: 700, color: C.text }}>Built with </em>
            <span style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)', fontWeight: 300, color: C.goldMuted, fontStyle: 'normal' }}>Precision</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1px', background: C.border }}>
          {TECH.map((t, i) => (
            <div key={t.name}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ background: hov === i ? C.white : C.bg, padding: '2rem 1.8rem', borderLeft: hov === i ? `2px solid ${C.gold}` : '2px solid transparent', transform: hov === i ? 'translateY(-2px)' : 'none', boxShadow: hov === i ? `0 8px 32px rgba(139,105,20,0.1)` : 'none', transition: 'all 0.28s ease', opacity: inView ? 1 : 0, animation: inView ? `fadeUp 0.6s ${0.05 + i * 0.07}s both` : 'none', color: hov === i ? C.gold : C.goldMuted }}>
              <div style={{ marginBottom: '1.2rem' }}><t.Icon size={19} /></div>
              <div style={{ fontFamily: T.inter, fontWeight: 500, fontSize: '0.88rem', color: C.text, marginBottom: '0.4rem' }}>{t.name}</div>
              <div style={{ fontFamily: T.inter, fontWeight: 300, fontSize: '0.7rem', color: C.goldMuted, lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: '4.5rem 4rem 2.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', paddingBottom: '3.5rem' }}>
          <div>
            <div style={{ fontFamily: T.playfair, fontStyle: 'italic', fontWeight: 700, fontSize: '2rem', color: C.gold, marginBottom: '0.5rem', textShadow: '4px 4px 0 rgba(139,105,20,0.08)' }}>HR-PULSE</div>
            <div style={{ fontFamily: T.inter, fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.3em', color: C.goldMuted }}>INTELLIGENT PIPELINE</div>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem', paddingTop: '0.5rem' }}>
            {[['GitHub', 'https://github.com'], ['API Docs', '#']].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                style={{ fontFamily: T.inter, fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.2em', color: C.goldMuted, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.goldMuted}>{label}</a>
            ))}
          </div>
        </div>
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${C.gold}, transparent 70%)`, marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontFamily: T.inter, fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em', color: C.goldMuted, opacity: 0.55 }}>2026 HR-PULSE AI. All rights reserved.</span>
          <span style={{ fontFamily: T.inter, fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em', color: C.goldMuted, opacity: 0.55 }}>Simplon — SAS Programme</span>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  useFonts()
  const [view, setView] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState(null)

  const dismiss = useCallback(() => setToast(null), [])
  const handleLogin = u => { setUser(u); setIsLoggedIn(true); setToast(`Welcome back, ${u.email}`) }
  const handleRegister = u => { setUser(u); setIsLoggedIn(true); setToast(`Account created. Welcome, ${u.name || u.email}!`) }
  const handleLogout = () => { setUser(null); setIsLoggedIn(false); setView('home'); setToast('See you soon.') }

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      {toast && <Toast msg={toast} onClose={dismiss} />}
      <Nav view={view} setView={setView} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />

      {view === 'home' && <>
        <Hero />
        <PipelineSection />
        <PredictionStudio isLoggedIn={isLoggedIn} setView={setView} />
        <TechStack />
        <Footer />
      </>}
      {view === 'login' && <LoginPage setView={setView} onLogin={handleLogin} />}
      {view === 'register' && <RegisterPage setView={setView} onLogin={handleRegister} />}
    </div>
  )
}
