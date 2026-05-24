#!/usr/bin/env bash
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
pnpm --filter @climbr/api-types generate
echo "API types regenerated → packages/api-types/src/index.ts"
