#!/bin/bash
# Creates symlinks from agent directories to .agents/skills/

AGENTS=(".claude" ".codex" ".cursor" ".kiro")
SKILLS_DIR=".agents/skills"

for agent in "${AGENTS[@]}"; do
  mkdir -p "$agent/skills"
  for skill in "$SKILLS_DIR"/*; do
    if [ -d "$skill" ]; then
      skill_name=$(basename "$skill")
      link_path="$agent/skills/$skill_name"
      if [ ! -e "$link_path" ]; then
        ln -s "../../$SKILLS_DIR/$skill_name" "$link_path"
      fi
    fi
  done
done
