#!/bin/bash

set -euo pipefail

HERE="$(realpath "${0}" | xargs dirname)"

set -a; source "$HERE/../.env"; set +a
yarn zapatos
