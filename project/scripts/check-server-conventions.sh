#!/usr/bin/env bash
set -euo pipefail

API_DIR="server/api"
HAS_ERRORS=0

check_pattern() {
  local pattern="$1"
  local title="$2"
  local matches

  matches="$(grep -RInE --include='*.ts' "$pattern" "$API_DIR" || true)"
  if [ -n "$matches" ]; then
    echo "ERROR: $title"
    echo "$matches"
    echo
    HAS_ERRORS=1
  fi
}

check_pattern 'serverSupabaseUser\(' \
  "Do not call serverSupabaseUser directly in routes (use requireUser/getOptionalUser helpers)."
check_pattern '\.auth\.getUser\(' \
  "Do not call supabase.auth.getUser() directly in routes (use requireUser/getOptionalUser helpers)."
check_pattern '\[("admin"|'\"'admin'\"'),[[:space:]]*("manager"|'\"'manager'\"'),[[:space:]]*("staff"|'\"'staff'\"')\]' \
  "Do not redefine the staff role list in routes (use staffRoles from server/utils/permissions.ts)."
check_pattern 'const[[:space:]]+hasStaffRole[[:space:]]*=' \
  "Do not redefine hasStaffRole in routes (use server/utils/permissions.ts helper)."

if [ "$HAS_ERRORS" -eq 1 ]; then
  echo "Server conventions check failed."
  exit 1
fi

echo "Server conventions check passed."
