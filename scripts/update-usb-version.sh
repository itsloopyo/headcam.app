#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  echo "Usage: pixi run update-usb-version <version>"
  echo "Example: pixi run update-usb-version 1.0.6"
  exit 1
fi

REPO="itsloopyo/headcam-usb"
DEST="downloads/headcam-usb"
FILE="index.html"
PLATFORMS=(windows macos linux)

# Verify gh is authenticated and can access the repo
if ! gh release view "v${VERSION}" --repo "$REPO" > /dev/null 2>&1; then
  echo "Error: could not find release v${VERSION} in ${REPO}"
  echo "Make sure you're authenticated with gh and the release exists."
  exit 1
fi

OLD_VERSION=$(sed -n 's/.*data-headcam-usb-version="\([^"]*\)".*/\1/p' "$FILE")
if [ -z "$OLD_VERSION" ]; then
  echo "Error: could not find data-headcam-usb-version in $FILE"
  exit 1
fi

echo "Updating Headcam USB Companion: v${OLD_VERSION} -> v${VERSION}"

# Download release assets
mkdir -p "$DEST"
for platform in "${PLATFORMS[@]}"; do
  asset="headcam-usb-${platform}.zip"
  echo "Downloading ${asset}..."
  gh release download "v${VERSION}" \
    --repo "$REPO" \
    --pattern "$asset" \
    --dir "$DEST" \
    --clobber
done

echo "Assets downloaded to ${DEST}/"

# Update version and links in index.html to point at local files
sed -i.bak \
  -e "s|data-headcam-usb-version=\"${OLD_VERSION}\"|data-headcam-usb-version=\"${VERSION}\"|g" \
  -e "s|>v${OLD_VERSION}</p><!-- usb-version -->|>v${VERSION}</p><!-- usb-version -->|g" \
  "$FILE"

# Replace any remote GitHub URLs with local paths
for platform in "${PLATFORMS[@]}"; do
  sed -i.bak \
    "s|https://github.com/${REPO}/releases/download/v[^/]*/headcam-usb-${platform}.zip|${DEST}/headcam-usb-${platform}.zip|g" \
    "$FILE"
done

rm -f "${FILE}.bak"

echo ""
echo "Done. v${VERSION} assets are in ${DEST}/ and index.html links updated."
echo "Don't forget to commit the downloaded files."
