---
description: Run lint, typecheck, tests, and build before opening a PR
allowed-tools: Bash(pnpm lint:*), Bash(pnpm typecheck:*), Bash(pnpm test:*), Bash(pnpm build:*)
---

Run these in order, stopping at the first failure: `pnpm lint`, `pnpm typecheck`,
`pnpm test`, `pnpm build`.

(If this project uses a different package manager, follow its lockfile — don't switch it.
Skip any script that doesn't exist in `package.json`, and say which you skipped.)

Report pass/fail for each step. For a failure, show the relevant error output, then either:

- fix it, if it's clearly caused by uncommitted changes from this session; or
- explain what's wrong and let me decide.

Don't silently work around a failing check — no skipping tests, no loosening types, no
disabling lint rules to get to green. If the fix isn't obvious, say so.

If the change touched UI, note that `pnpm build` passing is not the same as the UI working —
the `ui-verification` skill covers the quick check, `/design-review` the full audit.
