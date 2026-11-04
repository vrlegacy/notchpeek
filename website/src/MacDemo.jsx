import { useCallback, useEffect, useRef, useState } from 'react'

// Window positions in % of the screen. "desk" is the normal messy desktop,
// "grid" is the spread-out Mission Control layout.
const WINDOWS = [
  { id: 'notes', name: 'Notes', desk: [12, 13, 46, 50], grid: [12, 15, 36, 34] },
  { id: 'photos', name: 'Photos', desk: [40, 19, 46, 52], grid: [52, 15, 36, 34] },
  { id: 'code', name: 'Code', desk: [6, 34, 42, 50], grid: [12, 57, 36, 34] },
  { id: 'mail', name: 'Mail', desk: [46, 40, 44, 50], grid: [52, 57, 36, 34] },
]
const START = { x: 74, y: 84 }
const NOTCH = { x: 50, y: 1.2 }

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

function WindowBody({ id }) {
  if (id === 'notes')
    return (
      <div className="wb wb-notes">
        <i style={{ width: '62%' }} className="h" />
        {[88, 74, 92, 58, 80, 66, 86].map((w, i) => (
          <i key={i} style={{ width: `${w}%` }} />
        ))}
      </div>
    )
  if (id === 'photos')
    return (
      <div className="wb wb-photos">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} className={`p${i % 6}`} />
        ))}
      </div>
    )
  if (id === 'code')
    return (
      <div className="wb wb-code">
        {[
          [['k', 18], ['f', 30]],
          [['s', 12], ['v', 40]],
          [['s', 12], ['f', 22], ['v', 26]],
          [['s', 24], ['k', 14], ['v', 30]],
          [['s', 12], ['f', 34]],
          [['k', 10]],
          [['c', 54]],
          [['k', 18], ['f', 22]],
        ].map((line, i) => (
          <span key={i} className="ln">
            {line.map(([c, w], j) => (
              <i key={j} className={c} style={{ width: `${w}%` }} />
            ))}
          </span>
        ))}
      </div>
    )
  return (
    <div className="wb wb-mail">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="row">
          <b className={`av a${i}`} />
          <span>
            <i style={{ width: `${[48, 60, 40, 54][i]}%` }} className="h" />
            <i style={{ width: `${[80, 70, 86, 64][i]}%` }} />
          </span>
        </span>
      ))}
    </div>
  )
}

export default function MacDemo() {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [order, setOrder] = useState(['notes', 'code', 'photos', 'mail'])
  const [cursor, setCursor] = useState({ ...START, press: false })
  const [auto, setAuto] = useState(true)
  const [userHere, setUserHere] = useState(false)
  const timers = useRef([])
  const resume = useRef(null)
  const dwell = useRef(null)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const front = useCallback((id) => setOrder((o) => [...o.filter((x) => x !== id), id]), [])

  // The self-playing loop, used until someone tries it themselves
  useEffect(() => {
    if (!auto || reduced) return
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))
    const run = () => {
      setCursor({ ...START, press: false })
      at(900, () => setCursor({ ...NOTCH, press: false }))
      at(2300, () => setOpen(true))
      at(3600, () => setCursor({ x: 30, y: 31, press: false }))
      at(5000, () => setCursor({ x: 30, y: 31, press: true }))
      at(5250, () => {
        setCursor({ x: 30, y: 31, press: false })
        front('notes')
        setOpen(false)
      })
      at(6600, () => setCursor({ ...START, press: false }))
      at(8600, run)
    }
    run()
    return clearTimers
  }, [auto, reduced, front])

  useEffect(() => () => {
    clearTimers()
    clearTimeout(resume.current)
    clearTimeout(dwell.current)
  }, [])

  const takeOver = () => {
    clearTimeout(resume.current)
    if (auto) {
      clearTimers()
      setAuto(false)
      setOpen(false)
    }
    setUserHere(true)
  }
  const handBack = () => {
    setUserHere(false)
    clearTimeout(dwell.current)
    setOpen(false)
    resume.current = setTimeout(() => setAuto(true), 4000)
  }

  const onNotchEnter = (e) => {
    if (e.pointerType !== 'mouse') return
    clearTimeout(dwell.current)
    dwell.current = setTimeout(() => setOpen(true), 150)
  }
  const onNotchLeave = () => clearTimeout(dwell.current)

  const onWindowClick = (id) => {
    if (!open) return front(id)
    front(id)
    setOpen(false)
  }

  const hint = open
    ? 'Click a window to jump to it.'
    : 'Move your pointer up into the notch. On a phone, tap it.'

  return (
    <figure className="demo">
      <div className="mac">
        <div className="bezel">
          <div
            className={`screen${open ? ' is-open' : ''}`}
            onPointerEnter={(e) => e.pointerType === 'mouse' && takeOver()}
            onPointerLeave={(e) => e.pointerType === 'mouse' && handBack()}
            onClick={(e) => {
              if (e.target === e.currentTarget && open) setOpen(false)
            }}
          >
            <div className="menubar" aria-hidden="true">
              <span className="mb-left">
                <i className="mb-dot" />
                <i style={{ width: '4cqw' }} />
                <i style={{ width: '3cqw' }} />
                <i style={{ width: '3.4cqw' }} />
              </span>
              <span className="mb-right">
                <i style={{ width: '2cqw' }} />
                <i style={{ width: '2cqw' }} />
                <i style={{ width: '6.5cqw' }} />
              </span>
            </div>
            <div className="glow" aria-hidden="true" />

            {WINDOWS.map((w) => {
              const [x, y, ww, hh] = open ? w.grid : w.desk
              return (
                <div
                  key={w.id}
                  className={`win win-${w.id}`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${ww}%`,
                    height: `${hh}%`,
                    zIndex: open ? 2 : 2 + order.indexOf(w.id),
                  }}
                  onClick={() => onWindowClick(w.id)}
                  aria-hidden="true"
                >
                  <div className="win-bar">
                    <i />
                    <i />
                    <i />
                  </div>
                  <WindowBody id={w.id} />
                  <span className="win-name">{w.name}</span>
                </div>
              )
            })}

            <button
              type="button"
              className="notch"
              aria-label={open ? 'Close Mission Control in the demo' : 'Touch the notch to try the demo'}
              aria-pressed={open}
              onPointerEnter={onNotchEnter}
              onPointerLeave={onNotchLeave}
              onClick={() => {
                takeOver()
                setOpen((v) => !v)
              }}
            />

            {!userHere && !reduced && (
              <svg
                className={`fake-cursor${cursor.press ? ' press' : ''}`}
                style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
                viewBox="0 0 24 34"
                aria-hidden="true"
              >
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
        </div>
        <div className="mac-base" aria-hidden="true">
          <span />
        </div>
      </div>
      <figcaption className="demo-hint" aria-live="polite">
        {hint}
      </figcaption>
    </figure>
  )
}
