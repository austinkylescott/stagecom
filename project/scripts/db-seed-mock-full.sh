#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_PATH="${1:-$ROOT_DIR/mock-data.config.json}"
RESOLVED_PATH="${2:-$ROOT_DIR/mock-data.resolved.json}"

node "$ROOT_DIR/scripts/seed-auth-users.mjs" --config "$CONFIG_PATH" --out "$RESOLVED_PATH"
"$ROOT_DIR/scripts/db-seed-mock.sh" "$RESOLVED_PATH"
