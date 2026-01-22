#!/bin/bash
# Installs agent skills from remote sources
# Skip during CI/deployment (Vercel, GitHub Actions, etc.)

if [ -n "$CI" ] || [ -n "$VERCEL" ]; then
  echo "Skipping skills installation (CI/deployment detected)"
  exit 0
fi

npx skills add vercel/turborepo --yes
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines --yes
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices --yes
