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

echo
echo "This might take about 15 or 30 minutes depending on your CPU speed and how many"
echo "SDKs you have on your Mac."
echo

while :; do
  read -p "Do you want to continue? [yn] " -n 1 -r
  if [ "x$REPLY" == "x" ]; then
    break
  fi
  echo
  case $REPLY in
    [Yy])
      break
      ;;
    [Nn])
      exit
      ;;
    *)
      echo "unknown input: type y or n to continue"
      ;;
  esac
done

TEMP_FILE=`mktemp "${TMPDIR:-/tmp}/.sentryuploader.XXXXXXXX"`

cleanup() {
  rm -f "$TEMP_FILE"
}

trap cleanup EXIT
echo
echo "➡️  Downloading symbol extractor ..."
curl -SL --progress-bar "$DOWNLOAD_URL" > "$TEMP_FILE"
chmod +x "$TEMP_FILE"
echo
echo "⚙️  Converting SDKs and sharing them with sentry.io"
"$TEMP_FILE" convert-sdk --default-location --share-to <%= server_url %>/api/sdk

echo
echo '🌟 Done!'
