#!/bin/bash
# Builds NotchPeek.app and NotchPeek-1.0.dmg, installs the app and starts it.
# Double-click this file in Finder, or run:  bash build.command
set -e
cd "$(dirname "$0")"

APP_NAME="NotchPeek"
VERSION="1.0"
BUILD="build"
APP="$BUILD/$APP_NAME.app"
DIST="dist"

echo "==> Checking for Xcode Command Line Tools"
if ! xcode-select -p >/dev/null 2>&1; then
  echo "Installing Xcode Command Line Tools. Run this file again when it finishes."
  xcode-select --install
  exit 1
fi

echo "==> Removing the old NotchMissionControl helper (if present)"
OLD_PLIST="$HOME/Library/LaunchAgents/com.user.notchmissioncontrol.plist"
launchctl bootout gui/$(id -u) "$OLD_PLIST" 2>/dev/null || true
rm -f "$OLD_PLIST"
pkill -x NotchMissionControl 2>/dev/null || true
pkill -x "$APP_NAME" 2>/dev/null || true

echo "==> Compiling (Apple silicon + Intel)"
rm -rf "$BUILD" && mkdir -p "$BUILD"
swiftc -O -target arm64-apple-macos12  NotchPeek.swift -o "$BUILD/$APP_NAME-arm64"
swiftc -O -target x86_64-apple-macos12 NotchPeek.swift -o "$BUILD/$APP_NAME-x86_64"
lipo -create "$BUILD/$APP_NAME-arm64" "$BUILD/$APP_NAME-x86_64" -output "$BUILD/$APP_NAME"

echo "==> Assembling $APP_NAME.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
mv "$BUILD/$APP_NAME" "$APP/Contents/MacOS/$APP_NAME"
cp Info.plist "$APP/Contents/Info.plist"
if [ ! -d AppIcon.iconset ]; then
  mkdir -p AppIcon.iconset
  for s in 16 32 128 256 512; do
    sips -z $s $s icon_1024.png --out AppIcon.iconset/icon_${s}x${s}.png >/dev/null
    sips -z $((s*2)) $((s*2)) icon_1024.png --out AppIcon.iconset/icon_${s}x${s}@2x.png >/dev/null
  done
fi
iconutil -c icns AppIcon.iconset -o "$APP/Contents/Resources/AppIcon.icns"
printf "APPL????" > "$APP/Contents/PkgInfo"

echo "==> Signing"
IDENTITY=$(security find-identity -v -p codesigning 2>/dev/null | grep "Developer ID Application" | head -1 | sed -E 's/.*"(.*)"/\1/' || true)
if [ -n "$IDENTITY" ]; then
  echo "    Using: $IDENTITY"
  codesign --force --options runtime --timestamp --sign "$IDENTITY" "$APP"
else
  echo "    No Developer ID found. Signing ad-hoc (works on this Mac; others will see a warning)."
  codesign --force --sign - "$APP"
fi

echo "==> Installing to Applications"
if [ -w /Applications ]; then DEST="/Applications"; else DEST="$HOME/Applications"; fi
rm -rf "$DEST/$APP_NAME.app"
cp -R "$APP" "$DEST/"

echo "==> Making $APP_NAME-$VERSION.dmg"
mkdir -p "$DIST"
STAGE="$BUILD/dmg"
rm -rf "$STAGE" && mkdir -p "$STAGE"
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
rm -f "$DIST/$APP_NAME-$VERSION.dmg"
hdiutil create -volname "$APP_NAME" -srcfolder "$STAGE" -ov -format UDZO "$DIST/$APP_NAME-$VERSION.dmg" >/dev/null
if [ -n "$IDENTITY" ]; then codesign --force --sign "$IDENTITY" "$DIST/$APP_NAME-$VERSION.dmg"; fi

echo "==> Starting $APP_NAME"
open "$DEST/$APP_NAME.app"

echo ""
echo "Done!"
echo "  App:  $DEST/$APP_NAME.app  (look for its icon in the menu bar)"
echo "  DMG:  $(pwd)/$DIST/$APP_NAME-$VERSION.dmg  (share this file)"
open "$DIST"
