#!/bin/sh
set -eu
umask 077
operator_dir="${PIGGY_OPERATOR_DATA_DIR:-/data/piggy}"
mkdir -p "$operator_dir"
chmod 700 "$operator_dir"
# The kernel keeps this lock until the entire supervised command exits. The
# persistent Railway volume also prevents overlapping deployment mounts.
if [ -n "${PIGGY_OPERATOR_LEGACY_DATA_DIR:-}" ]; then
  [ -d "$PIGGY_OPERATOR_LEGACY_DATA_DIR" ] || { echo 'Legacy operator volume is missing.' >&2; exit 1; }
  [ "$operator_dir" != "$PIGGY_OPERATOR_LEGACY_DATA_DIR" ] || { echo 'Legacy operator volume must be distinct.' >&2; exit 1; }
  exec flock --no-fork --exclusive --nonblock "$operator_dir/operator.flock" \
    flock --no-fork --exclusive --nonblock "$PIGGY_OPERATOR_LEGACY_DATA_DIR/operator.flock" \
    env PIGGY_OPERATOR_LOCK_HELD=1 PIGGY_OPERATOR_LEGACY_LOCK_HELD=1 node /app/scripts/operator-service.mjs
fi
exec flock --no-fork --exclusive --nonblock "$operator_dir/operator.flock" env PIGGY_OPERATOR_LOCK_HELD=1 node /app/scripts/operator-service.mjs
