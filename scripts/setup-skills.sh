#!/bin/bash
# Installs agent skills from remote sources

npx skills add vercel/turborepo --yes
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines --yes
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices --yes
