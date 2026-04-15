#!/bin/bash

# Update .env file to use HTTPS URLs after SSL is configured

set -e

DOMAIN="parathan.com"
ENV_FILE=".env"

echo "Updating $ENV_FILE for HTTPS..."

# Backup the original .env file
cp $ENV_FILE "${ENV_FILE}.backup"

# Update ALLOWED_ORIGINS
sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}|g" $ENV_FILE

# Update FRONTEND_URL
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://${DOMAIN}|g" $ENV_FILE

echo "✅ Environment file updated!"
echo ""
echo "Updated values:"
grep "ALLOWED_ORIGINS" $ENV_FILE
grep "FRONTEND_URL" $ENV_FILE
echo ""
echo "Backup saved to: ${ENV_FILE}.backup"
echo ""
echo "Now restart your Docker containers:"
echo "  docker compose down"
echo "  docker compose up -d"
