#!/bin/bash
# Publishes NotchPeek to github.com/vrlegacy/notchpeek using your Mac's SSH key.
set -e
cd "$(dirname "$0")"

GH_USER="vrlegacy"
REPO="notchpeek"
DESC="Touch the notch with your cursor to open Mission Control. A tiny macOS menu bar app."
VERSION="1.0"
DMG="dist/NotchPeek-$VERSION.dmg"

echo "==> Finding the SSH key for $GH_USER"
# Try plain github.com plus every Host alias in ~/.ssh/config that points to github.com
HOSTS="github.com"
if [ -f "$HOME/.ssh/config" ]; then
  HOSTS="$HOSTS $(awk '
    tolower($1)=="host" { delete names; n=0; for (i=2;i<=NF;i++) if ($i !~ /[*?]/) names[++n]=$i }
    tolower($1)=="hostname" && tolower($2)=="github.com" { for (i=1;i<=n;i++) print names[i] }
  ' "$HOME/.ssh/config" | sort -u | tr '\n' ' ')"
fi
SSH_HOST=""
for H in $HOSTS; do
  OUT=$(ssh -T -o BatchMode=yes -o StrictHostKeyChecking=accept-new "git@$H" 2>&1 || true)
  WHO=$(echo "$OUT" | sed -n 's/^Hi \([^!]*\)!.*/\1/p')
  echo "    git@$H -> ${WHO:-no access}"
  if [ "$WHO" = "$GH_USER" ]; then SSH_HOST="$H"; break; fi
done
SSH_KEY=""
try_key() {
  OUT=$(ssh -T $1 -o IdentitiesOnly=yes -o IgnoreUnknown=UseKeychain -o UseKeychain=yes -o StrictHostKeyChecking=accept-new -i "$2" git@github.com 2>&1 || true)
  echo "$OUT" | sed -n 's/^Hi \([^!]*\)!.*/\1/p'
}
if [ -z "$SSH_HOST" ]; then
  # No alias worked: try every key in ~/.ssh and every key loaded in the SSH agent
  TMPK=$(mktemp -d)
  KEYS=""
  for pub in "$HOME"/.ssh/*.pub; do
    [ -f "$pub" ] && [ -f "${pub%.pub}" ] && KEYS="$KEYS ${pub%.pub}"
  done
  i=0
  ssh-add -L 2>/dev/null | grep -v "no identities" | while read -r line; do
    i=$((i+1)); echo "$line" > "$TMPK/agent$i.pub"
  done
  for pub in "$TMPK"/agent*.pub; do [ -f "$pub" ] && KEYS="$KEYS $pub"; done
  for pass in batch interactive; do
    [ "$pass" = batch ] && OPT="-o BatchMode=yes" || OPT=""
    [ "$pass" = interactive ] && echo "    Retrying keys that need a passphrase (type it if asked)..."
    for K in $KEYS; do
      WHO=$(try_key "$OPT" "$K")
      [ "$pass" = batch ] && echo "    $(basename "$K") -> ${WHO:-no access}"
      if [ "$WHO" = "$GH_USER" ]; then SSH_KEY="$K"; break 2; fi
    done
  done
fi
if [ -z "$SSH_HOST" ] && [ -z "$SSH_KEY" ]; then
  NEWKEY="$HOME/.ssh/id_ed25519_$GH_USER"
  echo ""
  echo "==> Setting up an SSH key for $GH_USER"
  echo "    GitHub doesn't allow one key on two accounts, so $GH_USER needs its own."
  if [ ! -f "$NEWKEY" ]; then
    mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"
    ssh-keygen -q -t ed25519 -C "vrlegacy.care@gmail.com" -f "$NEWKEY" -N ""
    echo "    Created $NEWKEY"
  fi
  pbcopy < "$NEWKEY.pub"
  echo ""
  echo "    The new public key is copied to your clipboard."
  echo "    1. In the browser, make sure you're signed in to GitHub as $GH_USER (not vishwas-sirpi)."
  echo "    2. Title: 'MacBook - NotchPeek', paste the key, click 'Add SSH key'."
  open "https://github.com/settings/ssh/new"
  while true; do
    read -r -p "    Press Return once it's added... "
    WHO=$(try_key "-o BatchMode=yes" "$NEWKEY")
    if [ "$WHO" = "$GH_USER" ]; then SSH_KEY="$NEWKEY"; echo "    Signed in as $GH_USER"; break; fi
    echo "    That key signs in as: ${WHO:-nobody yet}. Check you added it to $GH_USER, then press Return again."
  done
fi
if [ -n "$SSH_KEY" ]; then
  # Copy an agent-only key reference somewhere stable
  case "$SSH_KEY" in "$TMPK"/*) mkdir -p "$HOME/.config/notchpeek"; cp "$SSH_KEY" "$HOME/.config/notchpeek/${GH_USER}.pub"; SSH_KEY="$HOME/.config/notchpeek/${GH_USER}.pub";; esac
  SSH_HOST="github.com"
  echo "    Using key $SSH_KEY"
else
  echo "    Using git@$SSH_HOST"
fi

# Use the GitHub CLI only if it is signed in as $GH_USER
GH_OK=""
if command -v gh >/dev/null 2>&1 && [ "$(gh api user -q .login 2>/dev/null)" = "$GH_USER" ]; then GH_OK=1; fi

echo "==> Preparing the git repository"
[ -d .git ] || git init -q -b main
git config user.name "Vishwas"
git config user.email "vrlegacy.care@gmail.com"
if [ -n "$SSH_KEY" ]; then git config core.sshCommand "ssh -i \"$SSH_KEY\" -o IdentitiesOnly=yes -o IgnoreUnknown=UseKeychain -o UseKeychain=yes"; fi
git add -A
if ! git diff --cached --quiet; then
  if git rev-parse HEAD >/dev/null 2>&1; then MSG="Update NotchPeek"; else MSG="NotchPeek $VERSION"; fi
  git commit -q -F - <<MSG
$MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0153eGvB57qimtwY2krCtDLg
MSG
fi
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "git@$SSH_HOST:$GH_USER/$REPO.git"
else
  git remote add origin "git@$SSH_HOST:$GH_USER/$REPO.git"
fi

echo "==> Making sure github.com/$GH_USER/$REPO exists"
if ! git ls-remote origin >/dev/null 2>&1; then
  if [ -n "$GH_OK" ]; then
    gh repo create "$GH_USER/$REPO" --public --description "$DESC"
  else
    echo "    Opening GitHub so you can create it. Click 'Create repository' (leave everything else empty)."
    open "https://github.com/new?name=$REPO&visibility=public&description=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$DESC")"
    read -r -p "    Press Return here once it's created... "
  fi
fi

echo "==> Pushing code"
git push -u origin main

echo "==> Publishing the DMG as a release"
if [ ! -f "$DMG" ]; then
  echo "    $DMG not found. Run build.command first, then run this again to attach it."
elif [ -n "$GH_OK" ]; then
  if gh release view "v$VERSION" -R "$GH_USER/$REPO" >/dev/null 2>&1; then
    gh release upload "v$VERSION" "$DMG" --clobber -R "$GH_USER/$REPO"
  else
    gh release create "v$VERSION" "$DMG" -R "$GH_USER/$REPO" --title "NotchPeek $VERSION" \
      --notes "Touch the notch with your cursor to open Mission Control. Download the DMG, drag NotchPeek to Applications, then right-click → Open the first time."
  fi
else
  echo "    Opening the release page. Tag: v$VERSION, then drag in:"
  echo "    $(pwd)/$DMG"
  open "https://github.com/$GH_USER/$REPO/releases/new?tag=v$VERSION&title=NotchPeek%20$VERSION"
  open -R "$DMG"
fi

echo ""
echo "Done! https://github.com/$GH_USER/$REPO"
open "https://github.com/$GH_USER/$REPO"
