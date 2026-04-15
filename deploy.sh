#!/bin/bash

##############################################################################
# Deployment Script for Blog Full-Stack Application
# Usage: ./deploy.sh
##############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handler
error_exit() {
    log_error "$1"
    exit 1
}

# Check if docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error_exit "Docker is not running. Please start Docker and try again."
    fi
    log_info "Docker is running"
}

# Pull latest code
pull_code() {
    log_info "Pulling latest code..."
    cd "$SCRIPT_DIR" || error_exit "Failed to enter project directory"

    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        log_warn "Uncommitted changes detected:"
        git status -s
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error_exit "Deployment cancelled by user"
        fi
    fi

    # Fetch latest changes
    git fetch origin || error_exit "Failed to fetch from origin"

    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "Current branch: $CURRENT_BRANCH"

    # Pull with rebase
    if ! git pull --rebase origin "$CURRENT_BRANCH"; then
        log_error "Git pull failed. Please resolve conflicts manually."
        exit 1
    fi

    log_info "Successfully updated codebase"
}

# Backup current state
backup_containers() {
    log_info "Creating backup of current container state..."

    if [ -f "$COMPOSE_FILE" ]; then
        cd "$SCRIPT_DIR" || error_exit "Failed to enter script directory"

        # Export container logs before stopping
        if docker compose ps -q > /dev/null 2>&1; then
            BACKUP_DIR="$SCRIPT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
            mkdir -p "$BACKUP_DIR"

            docker compose logs > "$BACKUP_DIR/containers.log" 2>&1 || log_warn "Failed to backup logs"
            log_info "Logs backed up to $BACKUP_DIR"
        fi
    fi
}

# Stop containers gracefully
stop_containers() {
    log_info "Stopping containers..."
    cd "$SCRIPT_DIR" || error_exit "Failed to enter script directory"

    if [ -f "$COMPOSE_FILE" ]; then
        docker compose down || log_warn "Failed to stop containers (they may not be running)"
    else
        log_warn "docker-compose.yml not found at $COMPOSE_FILE"
    fi
}

# Build containers
build_containers() {
    log_info "Building containers..."
    cd "$SCRIPT_DIR" || error_exit "Failed to enter script directory"

    if [ -f "$COMPOSE_FILE" ]; then
        docker compose build --no-cache || error_exit "Failed to build containers"
        log_info "Containers built successfully"
    else
        error_exit "docker-compose.yml not found at $COMPOSE_FILE"
    fi
}

# Start containers
start_containers() {
    log_info "Starting containers..."
    cd "$SCRIPT_DIR" || error_exit "Failed to enter script directory"

    if [ -f "$COMPOSE_FILE" ]; then
        docker compose up -d || error_exit "Failed to start containers"
        log_info "Containers started successfully"
    else
        error_exit "docker-compose.yml not found at $COMPOSE_FILE"
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."

    sleep 5  # Give containers time to start

    cd "$SCRIPT_DIR" || error_exit "Failed to enter script directory"

    # Check if containers are running
    RUNNING=$(docker compose ps --filter "status=running" --format "{{.Service}}" | wc -l)
    TOTAL=$(docker compose ps --format "{{.Service}}" | wc -l)

    if [ "$RUNNING" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
        log_info "Health check passed: $RUNNING/$TOTAL containers running"
        docker compose ps
        return 0
    else
        log_error "Health check failed: Only $RUNNING/$TOTAL containers running"
        docker compose ps
        docker compose logs --tail=50
        return 1
    fi
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    docker image prune -f || log_warn "Failed to cleanup images"
}

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    log_info "Script directory: $SCRIPT_DIR"

    # Pre-deployment checks
    check_docker

    # Pull latest code
    pull_code

    # Backup and stop
    backup_containers
    stop_containers

    # Build and start
    build_containers
    start_containers

    # Verify deployment
    if health_check; then
        cleanup
        log_info "Deployment completed successfully!"
        echo ""
        log_info "You can view logs with: docker compose logs -f"
        log_info "You can stop services with: docker compose down"
    else
        log_error "Deployment completed but health check failed"
        log_warn "Check logs with: docker compose logs"
        exit 1
    fi
}

# Run main function
main "$@"
