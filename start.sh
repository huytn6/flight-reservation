#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/backend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Prerequisites ────────────────────────────────────────────────────────────
command -v docker  >/dev/null 2>&1 || error "Docker is not installed."
command -v python3 >/dev/null 2>&1 || error "Python 3 is not installed."

# ── Virtual environment ──────────────────────────────────────────────────────
VENV="$ROOT/.venv"
if [ ! -d "$VENV" ]; then
  info "Creating virtual environment at .venv ..."
  python3 -m venv "$VENV"
fi
source "$VENV/bin/activate"

# ── Python dependencies ──────────────────────────────────────────────────────
info "Installing Python dependencies..."
pip install -q -r "$BACKEND_DIR/requirements.txt"

# ── Start MySQL ──────────────────────────────────────────────────────────────
info "Starting MySQL container..."
docker compose -f "$ROOT/docker-compose.yml" up -d mysql

info "Waiting for MySQL to be ready..."
until docker compose -f "$ROOT/docker-compose.yml" exec -T mysql \
    mysqladmin ping -uroot -proot --silent 2>/dev/null; do
  printf "."
  sleep 2
done
echo ""
info "MySQL is ready."

# ── Flyway migration ─────────────────────────────────────────────────────────
info "Running Flyway migrations..."
docker compose -f "$ROOT/docker-compose.yml" run --rm flyway

# ── Seed demo data ────────────────────────────────────────────────────────────
info "Seeding demo data..."
cd "$BACKEND_DIR"
python3 -W ignore::DeprecationWarning -m database.seed

# ── Start server ──────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Starting Flight Booking API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 main.py
