#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_PATH="${1:-$ROOT_DIR/mock-data.config.json}"
RESOLVED_PATH="${2:-$ROOT_DIR/mock-data.resolved.json}"

"$ROOT_DIR/scripts/db-reset.sh"
"$ROOT_DIR/scripts/db-seed-mock-full.sh" "$CONFIG_PATH" "$RESOLVED_PATH"
