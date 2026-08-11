# loopstr — frontend

Web frontend for **loopstr**, built with the Next.js App Router. The repo is currently at
the clean-scaffold stage; the first feature is the login / authorization / homepage PoC
(`docs/PoC Scope Login, Authorization & Homepage.pdf`). Stack and conventions follow the
company standard in `docs/Engineering Baseline - Frontend.md`.

## Stack

- **Next.js 16** — App Router, Turbopack
- **React 19** + **TypeScript 5** (strict)
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **TanStack Query v5** — server state
- **React Hook Form + Zod** — forms and validation
- **Vitest + React Testing Library** — unit/component tests
- **pnpm** — package manager (detected from the lockfile; don't switch it)

## Quick start

```bash
pnpm install
pnpm dev
```

The dev server runs on http://localhost:3000.

## Scripts

| Command           | What it does                             |
| ----------------- | ---------------------------------------- |
| `pnpm dev`        | Dev server on port 3000                  |
| `pnpm build`      | Production build                         |
| `pnpm start`      | Serve the production build               |
| `pnpm lint`       | ESLint (flat config)                     |
| `pnpm format`     | Prettier write                           |
| `pnpm typecheck`  | `tsc --noEmit`                           |
| `pnpm test`       | Run unit tests (`pnpm test <pattern>` for one file) |
| `pnpm test:watch` | Vitest watch mode                        |
| `pnpm test:cov`   | Coverage (v8)                            |

## Project structure

```
src/
  app/          routes; server components by default
    providers.tsx   client boundary (TanStack Query)
  test/         Vitest setup
```

Path alias: `@/*` → `./src`. This is a group-by-type `src/` layout per the Engineering
Baseline — as features land, add `src/api`, `src/schemas`, `src/constants`, `src/hooks`,
`src/lib`, `src/components`, `src/features`.

## Conventions

Full conventions live in [CLAUDE.md](CLAUDE.md). The essentials:

- Server components by default; `"use client"` only for state, effects, event handlers, or
  browser APIs, pushed as far down the tree as possible.
- Server state goes through TanStack Query — no hand-rolled `useState` + `useEffect` fetching.
- Validate external data at the boundary with Zod; derive types via `z.infer`.
- Use Tailwind theme tokens over arbitrary values; class ordering is handled by
  `prettier-plugin-tailwindcss` (`pnpm format`).

### Deferred (baseline-lite scaffold)

Add when a feature needs them, per the Engineering Baseline: Zustand, MSW, Playwright (no
`test:e2e` yet), i18n, type-aware lint rules, and the CI 80%-changed-code coverage gate.
`eslint-plugin-tailwindcss` is intentionally omitted — it doesn't support Tailwind v4.

## Claude Code setup

This repo ships a shared Claude Code configuration (skills, agents, plugins, guardrails).
See [CLAUDE-SETUP.md](CLAUDE-SETUP.md) for how it works, the plugins enabled, and
prerequisites.
