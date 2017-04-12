#!/bin/bash
set -eu

DOWNLOAD_URL="https://github.com/getsentry/symbolserver/releases/download/1.9.0/sentry-symbolserver-Darwin-x86_64"

echo "This script will automatically convert all you system symbols and send them to sentry."
echo "Thanks for helping us out, here is a 🍪"
if [ "x$(id -u)" == "x0" ]; then
  echo "Warning: this script is currently running as root. This is dangerous. "
  echo "         Instead run it as normal user."
fi

if ! hash curl 2> /dev/null; then
  echo "error: you do not have 'curl' installed which is required for this script."
  exit 1
fi

TEMP_FILE=`mktemp "${TMPDIR:-/tmp}/.sentryuploader.XXXXXXXX"`

cleanup() {
  rm -f "$TEMP_FILE"
}

trap cleanup EXIT
echo
echo "➡️  Downloading..."
curl -SL --progress-bar "$DOWNLOAD_URL" > "$TEMP_FILE"
chmod +x "$TEMP_FILE"
echo
echo "⚙️  Converting SDKs and sharing them with sentry.io"
"$TEMP_FILE" convert-sdk --default-location --share-to http://192.168.1.101:8181/api/sdk

echo
echo '🌟 Done!'
