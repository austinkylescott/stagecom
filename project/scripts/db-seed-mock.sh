#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_PATH="${1:-$ROOT_DIR/mock-data.config.json}"
TEMP_SQL="$(mktemp "${TMPDIR:-/tmp}/stagecom-mock-data.XXXXXX.sql")"

cleanup() {
  rm -f "$TEMP_SQL"
}

trap cleanup EXIT

node "$ROOT_DIR/scripts/mock-data.mjs" generate --config "$CONFIG_PATH" --out "$TEMP_SQL"
"$ROOT_DIR/scripts/run-sql-file.sh" "$TEMP_SQL"
