#!/usr/bin/env bash
# Bootstrap DataShare for local development:
# - starts the PostgreSQL database (Docker)
# - installs backend dependencies, generates JWT keys, runs migrations + fixtures
# - installs frontend dependencies
#
# Usage: ./setup.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "==> 1/5 Starting database (Docker)"
(cd "$BACKEND_DIR" && docker compose up -d database)

echo "==> 2/5 Installing backend dependencies (Composer)"
(cd "$BACKEND_DIR" && composer install)

echo "==> 3/5 Generating JWT keypair (if missing)"
if [ ! -f "$BACKEND_DIR/config/jwt/private.pem" ]; then
  (cd "$BACKEND_DIR" && php bin/console lexik:jwt:generate-keypair)
else
  echo "    JWT keys already present, skipping."
fi

echo "==> 4/5 Running database migrations and fixtures"
(cd "$BACKEND_DIR" && php bin/console doctrine:migrations:migrate --no-interaction)
(cd "$BACKEND_DIR" && php bin/console doctrine:fixtures:load --no-interaction)

echo "==> 5/5 Installing frontend dependencies (npm)"
(cd "$FRONTEND_DIR" && npm install)

echo ""
echo "Setup complete. Next steps:"
echo "  - Backend:  cd backend && symfony server:start (or php -S 127.0.0.1:8000 -t public)"
echo "  - Frontend: cd frontend && npm run dev"
