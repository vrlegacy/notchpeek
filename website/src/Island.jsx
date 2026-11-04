import { useEffect, useRef, useState } from 'react'
import { ICON } from './links.js'
import { SECTIONS } from './Intro.jsx'
import './Island.css'

// The Dynamic Island works like the notch: rest the pointer on it (or tap it)
// and every section spreads out as its own window.
export default function Island() {
  const [current, setCurrent] = useState(0)
  const dwell = useRef(null)
  const armed = useRef(true)

  // Track which section is in the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = SECTIONS.findIndex((x) => x.id === e.target.id)
            if (i >= 0) setCurrent(i)
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => () => clearTimeout(dwell.current), [])

  const open = (viaKeyboard = false) => {
    armed.current = false
    window.dispatchEvent(new CustomEvent('notchpeek:mission', { detail: { from: current, viaKeyboard } }))
  }

  return (
    <header className="island-wrap">
      <button
        type="button"
        className="island"
        aria-label={`Show all sections. You're on ${SECTIONS[current].label}.`}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse' || !armed.current) return
          clearTimeout(dwell.current)
          dwell.current = setTimeout(() => open(false), 150)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse') return
          clearTimeout(dwell.current)
          armed.current = true
        }}
        onClick={(e) => open(e.detail === 0)}
      >
        <img src={ICON} alt="" width="22" height="22" />
        <span className="island-label" key={current}>
          {SECTIONS[current].label}
        </span>
        <span className="island-live" aria-hidden="true" />
      </button>
    </header>
  )
}
