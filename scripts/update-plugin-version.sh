#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  echo "Usage: pixi run update-plugin-version <version>"
  echo "Example: pixi run update-plugin-version 1.0.2"
  exit 1
fi

REPO="itsloopyo/obs-quickfeed-plugin"
DEST="downloads/obs-plugin"
FILE="index.html"
PLATFORMS=(windows macos linux)

# Verify gh is authenticated and can access the private repo
if ! gh release view "v${VERSION}" --repo "$REPO" > /dev/null 2>&1; then
  echo "Error: could not find release v${VERSION} in ${REPO}"
  echo "Make sure you're authenticated with gh and the release exists."
  exit 1
fi

OLD_VERSION=$(sed -n 's/.*data-quickfeed-version="\([^"]*\)".*/\1/p' "$FILE")
if [ -z "$OLD_VERSION" ]; then
  echo "Error: could not find data-quickfeed-version in $FILE"
  exit 1
fi

echo "Updating QuickFeed OBS Plugin: v${OLD_VERSION} -> v${VERSION}"

# Download release assets from private repo
mkdir -p "$DEST"
for platform in "${PLATFORMS[@]}"; do
  asset="quickfeed-${platform}.zip"
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
  -e "s|data-quickfeed-version=\"${OLD_VERSION}\"|data-quickfeed-version=\"${VERSION}\"|g" \
  -e "s|>v${OLD_VERSION}</p>|>v${VERSION}</p>|g" \
  "$FILE"

# Replace any remote GitHub URLs with local paths
for platform in "${PLATFORMS[@]}"; do
  sed -i.bak \
    "s|https://github.com/${REPO}/releases/download/v[^/]*/quickfeed-${platform}.zip|${DEST}/quickfeed-${platform}.zip|g" \
    "$FILE"
done

rm -f "${FILE}.bak"

echo ""
echo "Done. v${VERSION} assets are in ${DEST}/ and index.html links updated."
echo "Don't forget to commit the downloaded files."
