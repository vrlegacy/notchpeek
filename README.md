<p align="center"><img src="demo.gif" width="720" alt="The cursor moves up into the notch and all windows spread out into Mission Control"></p>

<h1 align="center">NotchPeek</h1>

<p align="center">Touch the notch with your cursor to open Mission Control.</p>

<p align="center"><a href="https://vrlegacy.github.io/notchpeek/">Website</a> &nbsp;&nbsp; <a href="https://github.com/vrlegacy/notchpeek/releases/latest">Download</a></p>

---

NotchPeek is a tiny menu bar app for macOS. Push your cursor up into the camera notch at the top of your MacBook screen and Mission Control opens. On screens without a notch, a strip at the top center works the same way.

## Install

1. Download **NotchPeek-1.0.dmg** from [Releases](https://github.com/vrlegacy/notchpeek/releases).
2. Open it and drag **NotchPeek** into **Applications**.
3. Open NotchPeek from Applications.

The first time, macOS may block it because it's from an unidentified developer:

- **macOS 15 Sequoia or later:** click **Done**, then go to **System Settings → Privacy & Security**, scroll down and click **Open Anyway** next to NotchPeek.
- **macOS 14 or earlier:** right-click the app, choose **Open**, then **Open** again.

You only need to do this once.

## Use

NotchPeek has no Dock icon or window. After you open it, look for its icon in the menu bar near the clock. From there you can:

- turn it **on or off**
- choose a **Trigger Delay** (Instant, Short, Medium, Long) so it doesn't fire by accident
- turn **Launch at Login** on or off
- **Hide Menu Bar Icon**: NotchPeek keeps working in the background. To bring the icon back, open NotchPeek again from Applications or Spotlight.
- **Quit**

## Requirements

macOS 12 Monterey or later, on Apple silicon or Intel.

## Build from source

Needs Xcode Command Line Tools (`xcode-select --install`).

```bash
git clone https://github.com/vrlegacy/notchpeek.git
cd notchpeek
bash build.command
```

This builds `NotchPeek.app`, installs it in `/Applications` (or `~/Applications` if that isn't writable), starts it, and makes `dist/NotchPeek-1.0.dmg`. It takes about a minute and ends with **Done!**

## Uninstall

Click the NotchPeek icon in the menu bar (if it's hidden, open NotchPeek from Applications to show it), choose **Quit NotchPeek**, then move **NotchPeek** from Applications to the Trash.

## License

MIT © 2026 Vishwas

## Website

The marketing site lives in [`website/`](website/) (React + Vite) and deploys to GitHub Pages automatically on every push to `main`. To work on it locally:

```bash
cd website
npm install
npm run dev
```
