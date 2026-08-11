# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Frontend for **loopstr** — a Next.js App Router web app, currently at the clean-scaffold
stage. First feature work is the login / authorization / homepage PoC (see
`docs/PoC Scope Login, Authorization & Homepage.pdf`). All stack and convention choices
follow the company standard in `docs/Engineering Baseline - Frontend.md` — read it before
introducing new patterns.

## Stack

- **Framework**: Next.js 16 — App Router, Turbopack
- **Language**: TypeScript 5, strict
- **UI**: React 19
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) — no `tailwind.config`; theme via
  `@theme` in `src/app/globals.css`
- **Server state**: TanStack Query v5 (provider in `src/app/providers.tsx`)
- **Forms**: React Hook Form + Zod (`@hookform/resolvers`)
- **Package manager**: pnpm — detect from the lockfile, never switch it
- **Testing**: Vitest + React Testing Library (jsdom)
- **Auth**: not yet implemented — PoC pending
- **Deploy**: not yet configured

## Commands

- `pnpm dev` — dev server on 3000
- `pnpm build` / `pnpm start` — production build and serve
- `pnpm lint` — ESLint (flat config)
- `pnpm format` — Prettier write
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — unit tests (`vitest run`) · `pnpm test <pattern>` for one file
- `pnpm test:watch` — Vitest watch mode
- `pnpm test:cov` — coverage (v8)

## Layout

```
src/
  app/          routes; server components by default
    providers.tsx   client "use client" boundary (TanStack Query)
  test/         Vitest setup (setup.ts)
```

Path alias: `@/*` → `./src` (e.g. `@/lib/utils`). This is a group-by-type `src/` layout per
the Engineering Baseline — as features land, add `src/api`, `src/schemas`, `src/constants`,
`src/hooks`, `src/lib`, `src/components`, `src/features`. See `.claude/rules/anti-patterns.md`
for the alias-vs-relative rule.

## Conventions

- Server components are the default. `"use client"` only for state, effects, event handlers,
  or browser APIs — and pushed as far down the tree as possible.
- Type props explicitly. Do not rely on Next's generated `LayoutProps`/`PageProps` globals —
  they only exist after a build, so `pnpm typecheck` fails on them in isolation.
- Server state goes through TanStack Query, not hand-rolled `useState` + `useEffect` fetching.
- Validate external data at the boundary with Zod; derive types from the schema (`z.infer`),
  don't hand-write both. Schemas live in `src/schemas/`.
- Tailwind: use theme tokens over arbitrary values. Class ordering is enforced by
  `prettier-plugin-tailwindcss` (run `pnpm format`). When conditional classes are needed,
  add a `cn()` helper in `src/lib/utils.ts` rather than string concatenation.
- Read env vars through a typed accessor (`src/lib/env.ts`), never `process.env` directly.
  Anything without a `NEXT_PUBLIC_` prefix must stay server-side.
- Before creating a component, search existing ones first. A component used by one route lives
  beside that route; promote it to shared on the _second_ use, not in anticipation.

## Project specifics

- **Baseline-lite scaffold.** Deliberately deferred (add when a feature needs them, per the
  Engineering Baseline): Zustand, MSW, Playwright (no `test:e2e`), i18n, type-aware lint
  rules, and the CI 80%-changed-code coverage gate. Vitest has no global coverage thresholds.
- **`eslint-plugin-tailwindcss` is intentionally not installed** — it doesn't support
  Tailwind v4. Class ordering is handled by `prettier-plugin-tailwindcss` instead.
- ESLint extends `eslint-config-next` (which already bundles `@typescript-eslint`,
  `react-hooks`, `jsx-a11y`, `import`). Do **not** re-register those plugins — it errors.
- Prettier is scoped away from `.claude/` and `docs/` (see `.prettierignore`) so it doesn't
  reformat template-managed files.

## Notes

- Project rules live in `.claude/rules/`; skills (React, Next.js, Tailwind, TypeScript,
  testing, UI verification) come from enabled plugins. Project-specific conventions belong
  here in CLAUDE.md — this file wins over a skill on any conflict.
- The `PostToolUse` hook (`.claude/hooks/lint-fix.sh`) runs ESLint `--fix` on files Claude
  edits. It does not replace `pnpm lint` over the whole repo.
- A green build is not proof the UI works. For visual changes, verify in a browser — the
  `ui-verification` skill, or `/design-review` for a full audit.
