#!/bin/sh
set -eu
umask 077
operator_dir="${PIGGY_OPERATOR_DATA_DIR:-/data/piggy}"
mkdir -p "$operator_dir"
chmod 700 "$operator_dir"
# The kernel keeps this lock until the entire supervised command exits. The
# persistent Railway volume also prevents overlapping deployment mounts.
exec flock --no-fork --exclusive --nonblock "$operator_dir/operator.flock" env PIGGY_OPERATOR_LOCK_HELD=1 node /app/scripts/operator-service.mjs
