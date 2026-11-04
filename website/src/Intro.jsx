import { useEffect, useRef, useState } from 'react'

const SEEN_KEY = 'notchpeek-intro-seen'

const WINDOWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'how', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'install', label: 'Install' },
]

function readSeen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}
function writeSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* private mode: the intro simply plays again next time */
  }
}
function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Preview({ id }) {
  if (id === 'overview')
    return (
      <div className="pv pv-overview">
        <span className="pv-icon" />
        <span className="pv-h1" />
        <span className="pv-h1 short" />
        <span className="pv-p" />
        <span className="pv-btn" />
        <span className="pv-mac" />
      </div>
    )
  if (id === 'how')
    return (
      <div className="pv pv-how">
        <span className="pv-h2" />
        <span className="pv-row">
          <i />
          <i />
          <i />
        </span>
      </div>
    )
  if (id === 'features')
    return (
      <div className="pv pv-features">
        <span className="pv-h2" />
        <span className="pv-bento">
          <i className="wide" />
          <i className="dark" />
          <i />
          <i />
          <i />
        </span>
      </div>
    )
  return (
    <div className="pv pv-install">
      <span className="pv-h2" />
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="pv-step">
          <b />
          <i />
        </span>
      ))}
    </div>
  )
}

// Stages: home -> notch (cursor at island) -> lift -> grid -> target -> press -> zoom -> done
export default function Intro() {
  const [active, setActive] = useState(() => !readSeen() && !reducedMotion())
  const [stage, setStage] = useState('home')
  const timers = useRef([])

  const finish = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    writeSeen()
    document.documentElement.removeAttribute('data-intro')
    setActive(false)
  }

  // Replay from the footer link
  useEffect(() => {
    const replay = () => {
      window.scrollTo({ top: 0, behavior: 'instant' })
      setStage('home')
      setActive(true)
    }
    window.addEventListener('notchpeek:replay-intro', replay)
    return () => window.removeEventListener('notchpeek:replay-intro', replay)
  }, [])

  useEffect(() => {
    if (!active) return
    const root = document.documentElement
    root.setAttribute('data-intro', 'on')
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))
    at(350, () => setStage('notch'))
    at(1450, () => {
      root.setAttribute('data-intro', 'touch')
      setStage('lift')
    })
    at(1600, () => setStage('grid'))
    at(2850, () => setStage('target'))
    at(3800, () => setStage('press'))
    at(4000, () => {
      root.setAttribute('data-intro', 'on')
      setStage('zoom')
    })
    at(4650, () => setStage('done'))
    at(5000, finish)

    const onKey = (e) => e.key === 'Escape' && finish()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      timers.current.forEach(clearTimeout)
      timers.current = []
      root.removeAttribute('data-intro')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  if (!active) return null

  return (
    <div className={`intro stage-${stage}`}>
      <div className="intro-desk" aria-hidden="true">
        <div className="intro-bg" />
        <div className="intro-dim" />
        {WINDOWS.map((w, i) => (
          <div key={w.id} className={`iw iw-${i}`}>
            <div className="iw-bar">
              <i />
              <i />
              <i />
            </div>
            <Preview id={w.id} />
            <span className="iw-label">{w.label}</span>
          </div>
        ))}
        <svg className="intro-cursor" viewBox="0 0 24 34">
          <path
            d="M2 2 L2 26 L8 20.5 L12.5 31 L16.6 29.2 L12.2 19 L20 19 Z"
            fill="#fff"
            stroke="#14112b"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <button type="button" className="intro-skip" onClick={finish}>
        Skip intro
      </button>
    </div>
  )
}
