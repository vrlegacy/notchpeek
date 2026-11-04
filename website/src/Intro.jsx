import { useEffect, useRef, useState } from 'react'
import './Intro.css'

// Mission Control for the page: every section appears as its own window.
// It plays once by itself as the first-visit intro, and opens whenever
// someone rests the pointer on (or taps) the Dynamic Island.

const SEEN_KEY = 'notchpeek-intro-seen'

export const SECTIONS = [
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

function goTo(index) {
  const id = SECTIONS[index].id
  if (index === 0) window.scrollTo({ top: 0, behavior: 'instant' })
  else document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
}

// Stages
//   intro: home -> notch -> lift -> grid -> target -> press -> zoom -> done
//   user:  lift -> grid -> (pick a window) zoom -> done
export default function Intro() {
  const [run, setRun] = useState(() =>
    !readSeen() && !reducedMotion() ? { mode: 'intro', from: 0, target: 0 } : null
  )
  const [stage, setStage] = useState(run ? 'home' : 'idle')
  const timers = useRef([])
  const firstWindow = useRef(null)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))

  const close = () => {
    clearTimers()
    document.documentElement.removeAttribute('data-intro')
    setRun((r) => {
      if (r?.mode === 'intro') writeSeen()
      return null
    })
    setStage('idle')
  }

  const choose = (index) => {
    clearTimers()
    document.documentElement.setAttribute('data-intro', 'on')
    setRun((r) => ({ ...r, target: index }))
    setStage('zoom')
    at(650, () => {
      goTo(index)
      setStage('done')
    })
    at(1000, close)
  }

  // Open requests from the island, and replay from the footer
  useEffect(() => {
    const open = (e) => {
      if (run) return
      const from = e.detail?.from ?? 0
      const viaKeyboard = !!e.detail?.viaKeyboard
      if (reducedMotion()) {
        setRun({ mode: 'user', from, target: null, viaKeyboard })
        setStage('grid')
        document.documentElement.setAttribute('data-intro', 'touch')
        return
      }
      document.documentElement.setAttribute('data-intro', 'touch')
      setRun({ mode: 'user', from, target: null, viaKeyboard })
      setStage('lift')
      at(40, () => setStage('grid'))
    }
    const replay = () => {
      if (run) return
      window.scrollTo({ top: 0, behavior: 'instant' })
      setRun({ mode: 'intro', from: 0, target: 0 })
      setStage('home')
    }
    window.addEventListener('notchpeek:mission', open)
    window.addEventListener('notchpeek:replay-intro', replay)
    return () => {
      window.removeEventListener('notchpeek:mission', open)
      window.removeEventListener('notchpeek:replay-intro', replay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  // The self-playing first-visit intro
  useEffect(() => {
    if (run?.mode !== 'intro' || stage !== 'home') return
    const root = document.documentElement
    root.setAttribute('data-intro', 'on')
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
    at(5000, close)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, stage])

  // Keyboard: Escape skips the intro, or zooms back to where you were
  useEffect(() => {
    if (!run) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (run.mode === 'intro') close()
      else if (stage === 'grid') choose(run.from)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, stage])

  // Move keyboard focus into the windows when someone opens them
  useEffect(() => {
    if (run?.mode === 'user' && run.viaKeyboard && stage === 'grid')
      firstWindow.current?.focus({ preventScroll: true })
  }, [run, stage])

  useEffect(() => () => clearTimers(), [])

  if (!run) return null
  const interactive = run.mode === 'user' && stage === 'grid'

  return (
    <div
      className={`intro mode-${run.mode} stage-${stage}`}
      role={interactive ? 'dialog' : undefined}
      aria-modal={interactive ? 'true' : undefined}
      aria-label={interactive ? 'All sections' : undefined}
    >
      <div
        className="intro-desk"
        aria-hidden={interactive ? undefined : 'true'}
        onClick={(e) => interactive && e.target === e.currentTarget && choose(run.from)}
      >
        <div className="intro-bg" />
        <div className="intro-dim" />
        {SECTIONS.map((s, i) => {
          const cls = [
            'iw',
            `iw-${i}`,
            `iw-${s.id}`,
            i === run.from ? 'is-from' : '',
            i === run.target ? 'is-target' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <div
              key={s.id}
              ref={i === 0 ? firstWindow : undefined}
              className={cls}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : -1}
              aria-label={interactive ? `Go to ${s.label}` : undefined}
              onClick={() => interactive && choose(i)}
              onKeyDown={(e) => {
                if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  choose(i)
                }
              }}
            >
              <div className="iw-bar">
                <i />
                <i />
                <i />
              </div>
              <Preview id={s.id} />
              <span className="iw-label">{s.label}</span>
            </div>
          )
        })}
        {run.mode === 'intro' && (
          <svg className="intro-cursor" viewBox="0 0 24 34">
            <path
              d="M2 2 L2 26 L8 20.5 L12.5 31 L16.6 29.2 L12.2 19 L20 19 Z"
              fill="#fff"
              stroke="#14112b"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {run.mode === 'intro' ? (
        <button type="button" className="intro-skip" onClick={close}>
          Skip intro
        </button>
      ) : (
        <p className="intro-hint">
          Choose a section.<span className="hint-esc"> Press Esc to go back.</span>
        </p>
      )}
    </div>
  )
}
