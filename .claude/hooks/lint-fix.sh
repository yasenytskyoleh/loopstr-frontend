#!/usr/bin/env bash
# PostToolUse(Edit|Write): run ESLint --fix on the single file Claude just touched.
# Exits 0 on every path that isn't a real lint failure, so the template stays usable
# in a repo that has no ESLint set up yet.
set -uo pipefail

payload=$(cat)

file_path=$(node -e '
  let raw = "";
  process.stdin.on("data", (d) => (raw += d));
  process.stdin.on("end", () => {
    try {
      process.stdout.write(JSON.parse(raw)?.tool_input?.file_path ?? "");
    } catch {
      process.stdout.write("");
    }
  });
' <<<"$payload" 2>/dev/null) || exit 0

[[ -n "$file_path" && -f "$file_path" ]] || exit 0
[[ "$file_path" =~ \.(ts|tsx|js|jsx|mjs|cjs)$ ]] || exit 0

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$project_dir" || exit 0

# No ESLint config means nothing to enforce — stay quiet.
shopt -s nullglob
configs=(eslint.config.* .eslintrc.*)
shopt -u nullglob
if [[ ${#configs[@]} -eq 0 ]] && ! node -e 'process.exit(require("./package.json").eslintConfig ? 0 : 1)' 2>/dev/null; then
  exit 0
fi

# Match the repo's package manager rather than imposing one.
if [[ -f pnpm-lock.yaml ]]; then
  runner=(pnpm exec)
elif [[ -f yarn.lock ]]; then
  runner=(yarn)
elif [[ -f package-lock.json ]]; then
  runner=(npx --no-install)
else
  runner=(npx --no-install)
fi

output=$("${runner[@]}" eslint --fix "$file_path" 2>&1)
status=$?

# ESLint exits 1 for remaining problems and 2 for a crash/missing binary. Only a
# genuine lint problem is worth surfacing; a crash means ESLint isn't usable here.
if [[ $status -eq 1 && -n "$output" ]]; then
  echo "$output" >&2
  exit 2 # Feed the unfixable problems back to Claude.
fi

exit 0
