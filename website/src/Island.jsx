import { useEffect, useRef, useState } from 'react'
import { DMG, ICON } from './links.js'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'how', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'install', label: 'Install' },
]

export default function Island() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(SECTIONS[0])
  const navRef = useRef(null)
  const hoverCapable = useRef(false)

  useEffect(() => {
    hoverCapable.current = window.matchMedia('(hover: hover)').matches
  }, [])

  // Track which section is in the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const s = SECTIONS.find((x) => x.id === e.target.id)
            if (s) setCurrent(s)
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

  // Close on Escape, outside tap, or scroll (touch)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => navRef.current && !navRef.current.contains(e.target) && setOpen(false)
    const onScroll = () => !hoverCapable.current && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open])

  return (
    <header className="island-wrap">
      <nav
        ref={navRef}
        className={`island${open ? ' is-open' : ''}`}
        aria-label="Main"
        onMouseEnter={() => hoverCapable.current && setOpen(true)}
        onMouseLeave={() => hoverCapable.current && setOpen(false)}
      >
        <button
          type="button"
          className="island-compact"
          aria-expanded={open}
          aria-controls="island-menu"
          onClick={() => setOpen((v) => !v)}
          inert={open}
        >
          <img src={ICON} alt="" width="22" height="22" />
          <span className="island-label" key={current.id}>
            {current.label}
          </span>
          <span className="island-live" aria-hidden="true" />
          <span className="visually-hidden">Open navigation</span>
        </button>

        <div id="island-menu" className="island-full" inert={!open}>
          <a className="island-brand" href="#overview" onClick={() => setOpen(false)}>
            <img src={ICON} alt="" width="24" height="24" />
            NotchPeek
          </a>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={current.id === s.id ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="island-cta" href={DMG}>
            Download
          </a>
        </div>
      </nav>
    </header>
  )
}
