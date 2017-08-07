#!/bin/bash

if [ -n "$GOOGLE_APPLICATION_CREDENTIALS_JSON" ]; then
    echo "$GOOGLE_APPLICATION_CREDENTIALS_JSON" > /usr/src/app/keyfile.json
    chmod +r /usr/src/app/keyfile.json
    unset GOOGLE_APPLICATION_CREDENTIALS_JSON
fi

exec "$@"
