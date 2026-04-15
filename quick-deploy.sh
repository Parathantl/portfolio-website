#!/bin/bash

##############################################################################
# Quick Deployment Script (Minimal Error Handling)
# Usage: ./quick-deploy.sh
##############################################################################

set -e  # Exit on error

echo "Starting quick deployment..."

# Navigate to project root
cd "$(dirname "$0")"

# Pull latest code
echo "Pulling latest code..."
git pull --rebase

# Deploy with Docker
echo "Rebuilding and restarting containers..."
docker compose down
docker compose build
docker compose up -d

# Wait and check status
echo "Waiting for containers to start..."
sleep 5

docker compose ps

echo "Deployment complete!"
echo "View logs: docker compose logs -f"
