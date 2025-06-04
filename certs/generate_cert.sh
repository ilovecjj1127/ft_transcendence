#!/bin/sh
set -e

CERT_PATH="/etc/ssl/certs/ft_transcendence.crt"
KEY_PATH="/etc/ssl/certs/ft_transcendence.key"

if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
    echo "Generating self-signed certificate"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_PATH" \
        -out "$CERT_PATH" \
        -subj "/C=NL/ST=North Holland/L=Amsterdam/O=Codam/CN=transcendence.codam.nl"
fi

exec "$@"