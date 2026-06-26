#!/bin/sh
set -eu

: "${MFM_DOMAIN:?MFM_DOMAIN is required}"

certificate="/etc/letsencrypt/live/${MFM_DOMAIN}/fullchain.pem"
private_key="/etc/letsencrypt/live/${MFM_DOMAIN}/privkey.pem"

if [ -r "$certificate" ] && [ -r "$private_key" ]; then
  template="/etc/mfm/nginx.conf.template"
else
  template="/etc/mfm/nginx.bootstrap.conf.template"
  echo "TLS certificate not found; starting ACME bootstrap mode" >&2
fi

envsubst '${MFM_DOMAIN}' < "$template" > /tmp/nginx.conf

mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi
chown -R nginx:nginx /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi

exec nginx -c /tmp/nginx.conf -g 'daemon off;'
