#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_PATH="${1:-$ROOT_DIR/mock-data.config.json}"

"$ROOT_DIR/scripts/db-reset.sh"
"$ROOT_DIR/scripts/db-seed-mock.sh" "$CONFIG_PATH"
