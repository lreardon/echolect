#! /bin/bash

# Prior to running this, make sure to expose ports 80 & 443 to the internet.

# AUTOMATE RUNNING THIS FILE?

source ~/server/.env

mkdir -p /etc/letsencrypt

echo "### Downloading recommended TLS parameters ..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "/etc/letsencrypt/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "/etc/letsencrypt/ssl-dhparams.pem"
echo

certbot certonly -n \
--standalone \
--email $LETSENCRYPT_CONTACT_EMAIL \
--no-eff-email \
--agree-tos \
-d $DOMAIN \
-d www.$DOMAIN \
-d mail.$DOMAIN \
--force-renewal