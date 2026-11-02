// NotchPeek — open Mission Control by touching the notch with your cursor.
// © 2026 Vishwas. All rights reserved.

import Cocoa
import ServiceManagement

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem!
    private var timer: Timer?
    private var enteredAt: Date?
    private var hasFired = false

    private let defaults = UserDefaults.standard
    private var enabled: Bool {
        get { defaults.object(forKey: "enabled") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "enabled") }
    }
    private var dwell: Double {
        get { defaults.object(forKey: "dwell") as? Double ?? 0.15 }
        set { defaults.set(newValue, forKey: "dwell") }
    }

    private let edgeTolerance: CGFloat = 2
    private let fallbackWidth: CGFloat = 200

    // MARK: Lifecycle

    func applicationDidFinishLaunching(_ notification: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = statusItem.button {
            let image = NSImage(systemSymbolName: "rectangle.3.group", accessibilityDescription: "NotchPeek")
            image?.isTemplate = true
            button.image = image
        }
        rebuildMenu()

        timer = Timer(timeInterval: 0.03, repeats: true) { [weak self] _ in self?.tick() }
        RunLoop.main.add(timer!, forMode: .common)

        // Turn on launch at login the first time the app runs.
        if #available(macOS 13.0, *), !defaults.bool(forKey: "didSetupLogin") {
            try? SMAppService.mainApp.register()
            defaults.set(true, forKey: "didSetupLogin")
            rebuildMenu()
        }
    }

    // MARK: Notch detection

    private func notchRect(for screen: NSScreen) -> NSRect {
        let f = screen.frame
        if #available(macOS 12.0, *),
           let left = screen.auxiliaryTopLeftArea,
           let right = screen.auxiliaryTopRightArea {
            let minX = f.minX + left.width
            let maxX = f.maxX - right.width
            return NSRect(x: minX, y: f.maxY - edgeTolerance, width: maxX - minX, height: edgeTolerance + 1)
        }
        return NSRect(x: f.midX - fallbackWidth / 2, y: f.maxY - edgeTolerance,
                      width: fallbackWidth, height: edgeTolerance + 1)
    }

    private func tick() {
        guard enabled else { enteredAt = nil; hasFired = false; return }
        let p = NSEvent.mouseLocation
        let inZone = NSScreen.screens.contains { notchRect(for: $0).contains(p) }
        if inZone {
            if enteredAt == nil { enteredAt = Date() }
            if !hasFired, let t = enteredAt, Date().timeIntervalSince(t) >= dwell {
                openMissionControl()
                hasFired = true
            }
        } else {
            enteredAt = nil
            hasFired = false
        }
    }

    private func openMissionControl() {
        let url = URL(fileURLWithPath: "/System/Applications/Mission Control.app")
        NSWorkspace.shared.openApplication(at: url, configuration: NSWorkspace.OpenConfiguration())
    }

    // MARK: Menu

    private func rebuildMenu() {
        let menu = NSMenu()

        let title = NSMenuItem(title: "NotchPeek", action: nil, keyEquivalent: "")
        title.isEnabled = false
        menu.addItem(title)
        menu.addItem(.separator())

        let toggle = NSMenuItem(title: "Enabled", action: #selector(toggleEnabled), keyEquivalent: "e")
        toggle.target = self
        toggle.state = enabled ? .on : .off
        menu.addItem(toggle)

        let delayItem = NSMenuItem(title: "Trigger Delay", action: nil, keyEquivalent: "")
        let delayMenu = NSMenu()
        for (name, value) in [("Instant", 0.0), ("Short", 0.15), ("Medium", 0.35), ("Long", 0.7)] {
            let item = NSMenuItem(title: name, action: #selector(setDelay(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = value
            item.state = abs(dwell - value) < 0.001 ? .on : .off
            delayMenu.addItem(item)
        }
        delayItem.submenu = delayMenu
        menu.addItem(delayItem)

        if #available(macOS 13.0, *) {
            let login = NSMenuItem(title: "Launch at Login", action: #selector(toggleLogin), keyEquivalent: "")
            login.target = self
            login.state = SMAppService.mainApp.status == .enabled ? .on : .off
            menu.addItem(login)
        }

        menu.addItem(.separator())
        let about = NSMenuItem(title: "About NotchPeek", action: #selector(showAbout), keyEquivalent: "")
        about.target = self
        menu.addItem(about)

        let quit = NSMenuItem(title: "Quit NotchPeek", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        menu.addItem(quit)

        statusItem.menu = menu
    }

    @objc private func toggleEnabled() {
        enabled.toggle()
        rebuildMenu()
    }

    @objc private func setDelay(_ sender: NSMenuItem) {
        if let v = sender.representedObject as? Double { dwell = v }
        rebuildMenu()
    }

    @objc private func toggleLogin() {
        if #available(macOS 13.0, *) {
            do {
                if SMAppService.mainApp.status == .enabled {
                    try SMAppService.mainApp.unregister()
                } else {
                    try SMAppService.mainApp.register()
                }
            } catch {
                let alert = NSAlert()
                alert.messageText = "Couldn't change Launch at Login"
                alert.informativeText = error.localizedDescription
                alert.runModal()
            }
            rebuildMenu()
        }
    }

    @objc private func showAbout() {
        NSApp.activate(ignoringOtherApps: true)
        let credits = NSAttributedString(
            string: "Touch the notch with your cursor to open Mission Control.\n\nMade by Vishwas · github.com/vrlegacy/notchpeek",
            attributes: [.font: NSFont.systemFont(ofSize: 11), .foregroundColor: NSColor.secondaryLabelColor])
        NSApp.orderFrontStandardAboutPanel(options: [.credits: credits])
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)   // menu bar only, no Dock icon
app.run()
