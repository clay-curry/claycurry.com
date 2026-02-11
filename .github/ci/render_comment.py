"""Render a merge-criteria PR comment from plugin results."""

from __future__ import annotations

import os
import uuid
from pathlib import Path

# ---------------------------------------------------------------------------
# Plugin registry
# ---------------------------------------------------------------------------
# Each plugin maps an environment variable (set by a prior workflow step) to a
# row in the merge-criteria table.  To add a new check:
#   1. Add a check step in the workflow YAML that outputs result=pass|fail
#   2. Pass its output as an env var to the render step
#   3. Append a dict here
# ---------------------------------------------------------------------------

PLUGINS: list[dict[str, object]] = [
    {
        "id": "changelog",
        "label": "Changelog message",
        "env_var": "CHANGELOG",
        "required": True,
        "pass_action": "None",
        "fail_action": "Add an entry to `CHANGELOG.md` describing this change",
        "footnote": (
            "Every PR to `main` must include a human-readable entry in "
            "`CHANGELOG.md` summarizing the change. This keeps the project "
            "history useful for contributors and consumers. See "
            "[Keep a Changelog](https://keepachangelog.com) for formatting guidance."
        ),
    },
    {
        "id": "commits",
        "label": "Commit message format",
        "env_var": "COMMITS",
        "required": True,
        "pass_action": "None",
        "fail_action": "Reword commits to follow the [Conventional Commits](https://www.conventionalcommits.org) format",
        "footnote": (
            "All commits must follow the "
            "[Conventional Commits](https://www.conventionalcommits.org) "
            "specification (e.g. `feat:`, `fix:`, `docs:`). This is enforced "
            "by [commitlint](https://commitlint.js.org) with the "
            "`@commitlint/config-conventional` preset."
        ),
    },
]

# ---------------------------------------------------------------------------
# Template
# ---------------------------------------------------------------------------

TEMPLATE_PATH = Path(__file__).parent / "merge-criteria.md"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _evaluate(plugin: dict[str, object]) -> bool:
    """Return True when the plugin's env var indicates a pass."""
    value = os.environ.get(str(plugin["env_var"]), "").strip().lower()
    return value == "pass"


def _render_row(plugin: dict[str, object], index: int, passed: bool) -> str:
    icon = ":white_check_mark:" if passed else ":x:"
    action = plugin["pass_action"] if passed else plugin["fail_action"]
    return f"| {index} | {plugin['label']} [^{index}] | {icon} | {action} |"


def _render_footnote(plugin: dict[str, object], index: int) -> str:
    return f"[^{index}]: {plugin['footnote']}"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    template = TEMPLATE_PATH.read_text()

    rows: list[str] = []
    footnotes: list[str] = []
    all_passed = True

    for i, plugin in enumerate(PLUGINS, start=1):
        passed = _evaluate(plugin)
        if plugin["required"] and not passed:
            all_passed = False
        rows.append(_render_row(plugin, i, passed))
        footnotes.append(_render_footnote(plugin, i))

    comment = template.format(
        rows="\n".join(rows),
        footnotes="\n\n".join(footnotes),
    )

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        delimiter = f"ghdelim_{uuid.uuid4().hex}"
        with open(github_output, "a") as f:
            f.write(f"comment<<{delimiter}\n")
            f.write(comment)
            if not comment.endswith("\n"):
                f.write("\n")
            f.write(f"{delimiter}\n")
            f.write(f"all_passed={'true' if all_passed else 'false'}\n")
    else:
        print(comment)
        print(f"---\nall_passed={'true' if all_passed else 'false'}")


if __name__ == "__main__":
    main()
