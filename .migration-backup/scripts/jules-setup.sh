#!/usr/bin/env bash
set -eo pipefail

echo "======================================================"
echo " Setting up Jules environment for shothik-web"
echo "======================================================"

# Ensure pnpm is available
if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm@10
fi

# Install dependencies using pnpm
echo "Installing dependencies..."
pnpm install

# Copy example environment variables if .env.local does not exist
if [ ! -f .env.local ] && [ -f .env.example ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
fi

# Export safe fallback env placeholders for build/type-checking
export NEXT_PUBLIC_CONVEX_URL="${NEXT_PUBLIC_CONVEX_URL:-https://placeholder.convex.cloud}"
export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_placeholder}"

echo "======================================================"
echo " Jules environment setup complete!"
echo "======================================================"
