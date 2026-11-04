import { useState } from 'react'
import Island from './Island.jsx'
import Intro from './Intro.jsx'
import MacDemo from './MacDemo.jsx'
import { DMG, REPO, RELEASES, ICON } from './links.js'

const DELAYS = [
  { name: 'Instant', note: 'Opens the moment your pointer reaches the notch.' },
  { name: 'Short', note: 'Waits 0.15 seconds. This is the default.' },
  { name: 'Medium', note: 'Waits 0.35 seconds, for a more deliberate touch.' },
  { name: 'Long', note: 'Waits 0.7 seconds, so it never opens by accident.' },
]

function GlyphGroup() {
  return (
    <svg viewBox="0 0 20 16" width="18" height="15" aria-hidden="true">
      <rect x="1" y="1" width="18" height="6" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="8" height="6" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="9" width="8" height="6" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function Hero() {
  return (
    <section id="overview" className="hero">
      <div className="hero-copy">
        <img className="hero-icon" src={ICON} alt="" width="88" height="88" />
        <h1>
          Touch the notch.
          <br />
          See every window.
        </h1>
        <p className="lede">
          NotchPeek is a tiny, free Mac app. Move your pointer into the camera notch and Mission Control opens.
        </p>
        <div className="actions">
          <a className="btn btn-primary" href={DMG}>
            Download for Mac
          </a>
          <a className="btn-link" href={REPO}>
            View on GitHub
          </a>
        </div>
        <p className="fine">Free for macOS 12 Monterey and later.</p>
      </div>
      <MacDemo />
    </section>
  )
}

function How() {
  const steps = [
    { t: 'Move', d: 'Push your pointer to the top of the screen, toward the camera.' },
    { t: 'Touch', d: 'Let it rest in the notch for a moment.' },
    { t: 'Peek', d: 'Every open window spreads out. Click one to jump straight to it.' },
  ]
  return (
    <section id="how" className="how">
      <h2>Three moves. Nothing to remember.</h2>
      <p className="sub">
        No keyboard shortcut, no trackpad gesture, no hot corner. The notch is already there, so NotchPeek puts it to
        work.
      </p>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={s.t}>
            <div className={`step-art art-${i}`} aria-hidden="true">
              <span className="sa-notch" />
              <span className="sa-cursor" />
              <span className="sa-w w1" />
              <span className="sa-w w2" />
              <span className="sa-w w3" />
              <span className="sa-w w4" />
            </div>
            <span className="step-num">{i + 1}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Features() {
  const [delay, setDelay] = useState(1)
  return (
    <section id="features" className="features">
      <h2>A small app with careful details.</h2>
      <div className="bento">
        <article className="tile tile-delay">
          <h3>You choose the delay.</h3>
          <p>Decide how long your pointer rests in the notch before Mission Control opens.</p>
          <div className="segmented" role="radiogroup" aria-label="Trigger delay">
            {DELAYS.map((d, i) => (
              <button
                key={d.name}
                type="button"
                role="radio"
                aria-checked={delay === i}
                className={delay === i ? 'on' : ''}
                onClick={() => setDelay(i)}
              >
                {d.name}
              </button>
            ))}
          </div>
          <p className="seg-note" aria-live="polite">
            {DELAYS[delay].note}
          </p>
        </article>

        <article className="tile tile-dark tile-display">
          <div className="display-art" aria-hidden="true">
            <span className="da-screen">
              <span className="da-strip" />
            </span>
            <span className="da-stand" />
          </div>
          <h3>No notch? Still works.</h3>
          <p>On an external display, a strip at the top center does the same job.</p>
        </article>

        <article className="tile tile-login">
          <div className="switch-row" aria-hidden="true">
            <img src={ICON} alt="" width="28" height="28" />
            <span>NotchPeek</span>
            <span className="switch">
              <span />
            </span>
          </div>
          <h3>Ready when you log in.</h3>
          <p>NotchPeek starts with your Mac, so the notch always works.</p>
        </article>

        <article className="tile tile-hide">
          <div className="mini-bar" aria-hidden="true">
            <span className="mini-icon ghost">
              <GlyphGroup />
            </span>
            <i />
            <i />
            <i className="long" />
          </div>
          <h3>Hide the icon if you like.</h3>
          <p>Keep your menu bar clean. Open NotchPeek again to bring the icon back.</p>
        </article>

        <article className="tile tile-perm">
          <p className="big-zero" aria-hidden="true">
            0
          </p>
          <h3>Permissions to grant.</h3>
          <p>NotchPeek only checks where your pointer is. It never asks to see your screen or control your Mac.</p>
        </article>

        <article className="tile tile-dark tile-size">
          <p className="big-num">
            318<span> KB</span>
          </p>
          <h3>Lighter than a photo.</h3>
          <p>One download runs natively on Macs with Apple silicon and Intel.</p>
        </article>

        <article className="tile tile-open">
          <h3>Free and open source.</h3>
          <p>MIT licensed. Every line of code is on GitHub for you to read, change or build yourself.</p>
          <a className="text-link" href={REPO}>
            Read the code on GitHub
          </a>
        </article>
      </div>
    </section>
  )
}

function MenuSection() {
  return (
    <section className="menu-section" aria-labelledby="menu-title">
      <div className="menu-copy">
        <h2 id="menu-title">Everything lives in one small menu.</h2>
        <p className="sub">
          Click the NotchPeek icon in the menu bar to turn it on or off, change the delay, or hide the icon. There are no
          windows and no settings pages to dig through.
        </p>
      </div>
      <div className="menu-stage" aria-hidden="true">
        <div className="stage-bar">
          <span className="stage-icon">
            <GlyphGroup />
          </span>
          <i />
          <i />
          <i className="clock">Wed 4 Nov 16:00</i>
        </div>
        <div className="mac-menu">
          <p className="mm-title">NotchPeek</p>
          <hr />
          <p className="mm-item checked">
            Enabled<kbd>⌘E</kbd>
          </p>
          <p className="mm-item sub-arrow">Trigger Delay</p>
          <p className="mm-item checked">Launch at Login</p>
          <p className="mm-item">Hide Menu Bar Icon</p>
          <hr />
          <p className="mm-item">About NotchPeek</p>
          <p className="mm-item">
            Quit NotchPeek<kbd>⌘Q</kbd>
          </p>
        </div>
      </div>
    </section>
  )
}

function Install() {
  return (
    <section id="install" className="install">
      <h2>Install in about a minute.</h2>
      <ol className="install-steps">
        <li>
          <h3>Download NotchPeek.</h3>
          <p>
            Get <a href={DMG}>NotchPeek-1.0.dmg</a> from the{' '}
            <a href={RELEASES}>GitHub releases page</a>.
          </p>
        </li>
        <li>
          <h3>Drag it into Applications.</h3>
          <p>Open the downloaded file and drag NotchPeek onto the Applications folder.</p>
        </li>
        <li>
          <h3>Open it and confirm once.</h3>
          <p>
            NotchPeek isn't from the App Store, so macOS asks you to confirm the first time you open it.
          </p>
          <ul className="os-notes">
            <li>
              <strong>macOS 15 Sequoia or later:</strong> click Done, then open System Settings, go to Privacy &amp;
              Security and click Open Anyway.
            </li>
            <li>
              <strong>macOS 14 or earlier:</strong> right-click NotchPeek in Applications and choose Open.
            </li>
          </ul>
        </li>
        <li>
          <h3>Touch the notch.</h3>
          <p>Look for the icon in your menu bar, then move your pointer up into the notch.</p>
        </li>
      </ol>

      <div className="build">
        <h3>Prefer to build it yourself?</h3>
        <p>You'll need the Xcode Command Line Tools.</p>
        <pre>
          <code>{`git clone https://github.com/vrlegacy/notchpeek.git
cd notchpeek
bash build.command`}</code>
        </pre>
      </div>
    </section>
  )
}

function Closing() {
  return (
    <section className="closing">
      <img src={ICON} alt="" width="120" height="120" />
      <h2>Every window, one touch away.</h2>
      <div className="actions">
        <a className="btn btn-primary" href={DMG}>
          Download for Mac
        </a>
        <a className="btn-link" href={REPO}>
          View on GitHub
        </a>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Intro />
      <Island />
      <main id="main">
        <Hero />
        <How />
        <Features />
        <MenuSection />
        <Install />
        <Closing />
      </main>
      <footer className="footer">
        <p>© 2026 Vishwas. NotchPeek is released under the MIT license.</p>
        <p>
          NotchPeek is an independent project and isn't affiliated with or endorsed by Apple. Mac and Mission Control
          are trademarks of Apple Inc.
        </p>
        <p>
          <a href={REPO}>GitHub</a>
          <a href={`${REPO}/issues`}>Report a problem</a>
          <a href={`${REPO}/blob/main/LICENSE`}>License</a>
          <button
            type="button"
            className="footer-link"
            onClick={() => window.dispatchEvent(new Event('notchpeek:replay-intro'))}
          >
            Replay intro
          </button>
        </p>
      </footer>
    </>
  )
}
