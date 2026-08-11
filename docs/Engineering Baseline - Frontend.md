Engineering Baseline \- Frontend

_Standard for React / TypeScript (SPA \+ Next.js) \- company-wide, independent of any specific project_

| Version            | 1.0             |
| :----------------- | :-------------- |
| **Status**         | In progress     |
| **Effective date** |                 |
| **Last updated**   |                 |
| **Owner**          | Ihor Kravchenko |
| **Approved by**    |                 |
| **Classification** | Internal        |

© Globaldev, 2026  
All rights reserved

**[Quick Reference (One-Page Cheat Sheet) 4](<#quick-reference-(one-page-cheat-sheet)>)**

[1\. Technology Stack 5](#1.-technology-stack)

[2\. Local Environment & Tooling 6](#2.-local-environment-&-tooling)

[3\. Project Architecture & Directory Layout 7](#3.-project-architecture-&-directory-layout)

[4\. TypeScript Conventions 10](#4.-typescript-conventions)

[5\. Styling (Tailwind CSS) 11](<#5.-styling-(tailwind-css)>)

[6\. Frontend & React Standards 12](#6.-frontend-&-react-standards)

[6.1 Rules 12](#6.1-rules)

[6.2 Component review checklist 13](#6.2-component-review-checklist)

[6.3. Data Layer: TanStack Query 14](#6.3.-data-layer:-tanstack-query)

[6.4. Forms: React Hook Form \+ Zod 16](#6.4.-forms:-react-hook-form-+-zod)

[6.5. State Management 17](#6.5.-state-management)

[6.6. Routing & Auth (Client-Side) 18](<#6.6.-routing-&-auth-(client-side)>)

[6.7 Localization / i18n 19](#6.7-localization-/-i18n)

[7\. Next.js Guidance 20](#7.-next.js-guidance)

[7.1 Server vs Client Components 20](#7.1-server-vs-client-components)

[7.2 Data fetching 21](#7.2-data-fetching)

[7.3 Structure & conventions 21](#7.3-structure-&-conventions)

[8\. Claude Code Guardrails \- Stack-Specific 22](#8.-claude-code-guardrails---stack-specific)

[8.1 Memory Hierarchy for This Stack 22](#8.1-memory-hierarchy-for-this-stack)

[8.2 Example Declarative Permissions for This Stack 23](#8.2-example-declarative-permissions-for-this-stack)

[8.3 Additional Banned Patterns (stack-specific) 23](<#8.3-additional-banned-patterns-(stack-specific)>)

[9\. Linting, Formatting & Type Checking 24](#9.-linting,-formatting-&-type-checking)

[10\. Verification & Test Architecture 25](#10.-verification-&-test-architecture)

[10.1 Test stack & philosophy 25](#10.1-test-stack-&-philosophy)

[10.2 What to test 26](#10.2-what-to-test)

[10.3 Coverage thresholds & CI gate 26](#10.3-coverage-thresholds-&-ci-gate)

[11\. CI/CD Integration 27](#11.-ci/cd-integration)

[12\. Security & Supply Chain 28](#12.-security-&-supply-chain)

[13\. Observability 29](#13.-observability)

[14\. Git Workflow 30](#14.-git-workflow)

[15\. Templates 30](#15.-templates)

[15.1 Generic Root CLAUDE.md Template (for a new project on this stack) 30](<#15.1-generic-root-claude.md-template-(for-a-new-project-on-this-stack)>)

[16\. New Repository Onboarding Checklist (for this stack) 32](<#16.-new-repository-onboarding-checklist-(for-this-stack)>)

This document describes frontend engineering standards for the React / TypeScript stack: project architecture, code conventions, styling, data fetching, forms, and how to drive **Claude Code** safely on this stack. It does not duplicate Claude Code’s own mechanics (sessions, hooks, memory, verification-as-oracle) \- that is covered in the «AI Agent Playbook» document, which should be read first. Section 14 here only covers how to apply guardrails specifically to this stack, without repeating the general mechanics.

**Important:** some of the examples below (_the specific path aliases, the RBAC role names, the folder names_) are illustrative, taken from a real project to show the shape of a solution. Adapt them to your own domain rather than copying them literally.

# Quick Reference (One-Page Cheat Sheet) {#quick-reference-(one-page-cheat-sheet)}

This document is normally consulted for one specific gotcha, not read end-to-end. Use this table to jump straight to the relevant section instead of searching.

| If you're about to...              | Watch out for...                                                                                                                                        | Section |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| Add a new import in app code       | @\* path aliases are mandatory \- no ../../.. chains across top-level folders. No import cycles.                                                        |    3    |
| Type a component                   | No any, no as casting, no React.FC. Derive prop types from Zod schemas where a schema already exists.                                                   |    4    |
| Style anything                     | Tailwind utilities only. No arbitrary values (w-\[347px\]), no inline style={{}}, no raw hex \- extend tailwind.config instead.                         |    5    |
| React                              | React rules \+ standards, component review checklist                                                                                                    | 6.1,6.2 |
| Fetch server data                  | Never _useEffect \+ fetch_. Use the query/mutation hook pair; _queryKey_ must include the URL constant and every dynamic param.                         |   6.3   |
| Build a form                       | React Hook Form \+ Zod. Schemas live in src/schemas/; no inline schemas; resolve with zodResolver.                                                      |   6.4   |
| Reach for global state             | Server data is not client state \- it belongs in TanStack Query. Genuinely client-owned state goes in a store (Context or Zustand/Redux), kept minimal. |   6.5   |
| Add a Next.js page                 | Server Components can’t use hooks/context/browser APIs. Client-only libs (RHF, TanStack) need a "use client" boundary.                                  |    7    |
| Configure allow/deny for the agent | Deny .env and \*\*/secrets/\*\* explicitly \- this is not optional                                                                                      |    8    |
| Open a PR                          | Coverage gate (80% on changed code) is enforced in CI, not just "nice to have"                                                                          |  9, 10  |
| Land a PR                          | CI must run the exact same test/lint commands as the local hooks \- same pinned versions                                                                |   11    |
| Add a new dependency               | It needs to clear the automated scanner (Dependabot/Snyk) and a pinned lockfile entry                                                                   |   12    |

# 1\. Technology Stack {#1.-technology-stack}

| Component          | Technology                                                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| Language           | TypeScript (strict mode) \-\> §4                                              |
| UI runtime         | React (function components \+ hooks) \-\> §6                                  |
| Framework          | Next.js (App Router) or Vite SPA \-\> §11                                     |
| Styling            | Tailwind CSS \-\> §5                                                          |
| Server state       | TanStack Query (React Query) \-\> §6.3                                        |
| Forms & validation | React Hook Form \+ Zod / Formik \+ Yup \-\> §6.4                              |
| Client state       | Context or Zustand, kept minimal \-\>§6.5                                     |
| Testing            | Vitest \+ React Testing Library; Playwright for E2E \-\> §10                  |
| Tooling            | ESLint (flat config) \+ Prettier; package manager pinned via lockfile \-\> §9 |

# 2\. Local Environment & Tooling {#2.-local-environment-&-tooling}

- **Node version** \- pinned per repo via .nvmrc (and enforced with an engines field in package.json). "Works on my machine" usually means a Node mismatch \- the CI runner must use the same major version.

- **Package manager** \- one per repo, committed lockfile mandatory. Do not mix npm/yarn/pnpm in the same project; the lockfile is the source of truth for installs.

- **Env vars** \- never committed. Provide a .env.example with placeholder keys. Client-exposed vars must carry the framework’s public prefix (NEXT\_PUBLIC\_ / VITE\_) \- anything without it must never reach the bundle.

Standard scripts every repo exposes (names stable across projects, so hooks and CI can call them):

- _npm run dev_ \# local dev server (HMR)

- _npm run build_ \# production build

- _npm run lint_ \# ESLint, zero warnings allowed in CI

- _npm run typecheck_ \# tsc \--noEmit

- _npm run test_ \# unit/component tests

- _npm run test:cov_ \# tests with coverage gate

**Secrets in client code: any value shipped to the browser is public by definition. API keys for third-party services that must stay secret belong behind a backend/proxy route, never in a NEXT\_PUBLIC\_/VITE\_ variable.**

# 3\. Project Architecture & Directory Layout {#3.-project-architecture-&-directory-layout}

The baseline groups code by type (components, hooks, services, and so on) under src/, addressed through path aliases. This is the widely-used layout.

_project\_root/_

_├─ .claude/_

_│ ├─ settings.json \# hooks, permissions (allow/deny) — §14_

_│ └─ rules/\*.md \# path-scoped rules_

_├─ src/_

_├─ components/ \# shared/reusable components_

_├─ pages/ \# route-level views (one per screen)_

_├─ hooks/ \# custom reusable hooks_

_├─ api/ \# axios instance, fetchers, query/mutation hooks_

_├─ store/ \# client state_

_├─ schemas/ \# zod schemas_

_├─ context/ \# React context providers_

_├─ utils/ \# generic helpers_

_├─ constants/ \# app-wide constants, URL constants_

_├─ types/ \# shared TypeScript types_

_├─ styles/ \# global styles, Tailwind entry_

_└─ App.tsx \# root: providers, router_

_├─ .env.example \# placeholder env keys_

_├─ .nvmrc \# pinned Node_

_├─ CLAUDE.md \# root agent instructions_

_├─ eslint.config.js \# flat config_

_├─ tailwind.config.ts \# design tokens_

Aliases mirror the top-level folders: @components, @pages, @hooks, @api, @store, @schemas, @context, @utils, @constants, @types, @styles. Adapt the set to the project.  
**Test file placement \-** two conventions are both acceptable; pick one per repo and keep it consistent. Colocated \- a test sits next to the file it covers (Button.tsx \+ Button.test.tsx); this is the Vitest/RTL default and keeps the test with the code. Separate \- a top-level tests/ (or \_\_tests\_\_/) tree mirrors src/. Playwright E2E specs are the exception: they live in their own top-level e2e/ directory regardless of the unit-test choice. See §10.

**Rules (enforceable):**

- **Path aliases are mandatory** \- use the @\* aliases above. No relative ../../.. chains across top-level folders \- a deep relative import is a signal the file is in the wrong place.
- **No import cycles** \- circular imports between modules are banned (they cause subtle load-order bugs and break tree-shaking). Enforce with lint.
- **Colocate the truly private** \- a helper or subcomponent used by exactly one page/component lives next to it, not in the global folder. Only genuinely shared code goes in the top-level buckets \- this is what stops components/ and hooks/ becoming dumping grounds.
- **Domain-cohesive chunks may get a feature folder** \- If a slice of the app is large and self-contained, a features/\<x\>/ folder that groups its own components/hooks/api is an acceptable escape hatch \- the default stays group-by-type.

# 4\. TypeScript Conventions {#4.-typescript-conventions}

- **Strict mode on**

  - strict: true in tsconfig.json. noImplicitAny, strictNullChecks are non-negotiable.

- **any is forbidden** \- use generics, narrowing, or unknown \+ a type guard. If you truly need an escape hatch, unknown forces a check; any silently disables the compiler.

- **No type casting as a shortcut \-** prefer narrowing over as. as bypasses the checker and hides real shape mismatches. as const (for literal inference) and as unknown as T at genuine boundaries are the only acceptable uses, and the latter needs a comment.

- **Do not use React.FC \-** type props explicitly: function Foo({ id }: FooProps). React.FC adds an implicit children and complicates generics.

- **Derive types from Zod, don’t duplicate \-** where a Zod schema exists, use z.infer\<typeof schema\> as the single source of truth instead of hand-writing a parallel interface. One definition, always in sync. See §6.4.

- **Naming** \- PascalCase for types/components, camelCase for variables/functions, SCREAMING\_SNAKE for module-level constants. Do not prefix interfaces with I \- modern TS convention drops it (a hard break from older internal guides).

# 5\. Styling (Tailwind CSS) {#5.-styling-(tailwind-css)}

- **Tailwind utilities are the styling mechanism** \- compose styles from utility classes in markup. This replaces the previous SCSS-Modules standard.
- **The theme is the design-token source of truth \-** colors, spacing, radii, typography live in tailwind.config.{ts,js}. Reference tokens (text-primary, p-4) \- never raw hex or magic pixel values.
- **No arbitrary values \-** w-\[347px\], text-\[\#1a1a1a\], mt-\[13px\] are banned in normal code \- they bypass the token scale. Extend the theme instead. (This is the Tailwind equivalent of the old "no hardcoded hex" rule.)
- **No inline style={{}}** \- for anything expressible as a utility. Dynamic values that truly can’t be a class (e.g. a computed transform from JS) are the only exception.
- **Conditional classes \-** use clsx/cn() for conditional composition; use tailwind-merge so overrides in reusable components resolve predictably. Avoid hand-built string concatenation of class names.
- **Repeated clusters → a component, not @apply \-** prefer extracting a reusable components/ component over sprinkling @apply. Reserve @apply for genuinely global element styling in one base stylesheet.

# 6\. Frontend & React Standards {#6.-frontend-&-react-standards}

## 6.1 Rules {#6.1-rules}

- **No side effects during render \-** data fetching, subscriptions, and mutations belong in useEffect, event handlers, or query hooks \- never in the render body.
- **Derive, don’t duplicate state \-** if a value can be computed from props or existing state, compute it inline (or useMemo if expensive). Storing derived values in useState creates two sources of truth that drift.
- **Stable list keys** \- use a unique domain ID. Array index as key is banned unless the list is static and never reordered.
- **Memoize deliberately, not reflexively \-** useMemo/useCallback are for expensive computations or for stabilizing references passed into dependency arrays / memoized children \- not a default wrapper on everything.
- **No direct DOM manipulation \-** go through refs and React state. Reaching for document.querySelector to mutate the tree fights the reconciler.
- **Custom hooks for reused logic** \- stateful logic shared by 2+ components extracts to a use\* hook. Keep components focused on rendering.

##

## 6.2 Component review checklist {#6.2-component-review-checklist}

| Component | Technology                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| State     | State for derived values; duplicated server state; unstable object/array literals passed as props                               |
| Effects   | Effects that should be event handlers; missing/incorrect dependency arrays; fetch-in-effect instead of a query hook             |
| Keys      | Array index as key on a dynamic list                                                                                            |
| Types     | any; as casting instead of narrowing; @ts-ignore without an explanation                                                         |
| Hygiene   | console.log in committed code; unhandled promise rejections; inline style={{}}; hardcoded strings that belong in constants/i18n |

## 6.3. Data Layer: TanStack Query {#6.3.-data-layer:-tanstack-query}

Server state is fetched, cached, and synchronized exclusively through **TanStack Query**. Manual useEffect \+ fetch \+ useState for server data is banned \- it reimplements caching, loading, and error handling badly.

Each remote resource in src/api/ is expressed as a pair:

- **Fetcher**
  - getUser.ts \- the pure axios call, returns typed data. No React.
- **Hook**
  - useUser.ts \- wraps the fetcher in useQuery (or useMutation for writes).

_// src/api/user/getUser.ts_

_export const getUser \= (id: string) \=\>_

_api.get\<User\>(\`${USERS\_URL}/${id}\`).then(r \=\> r.data);_

_// src/api/user/useUser.ts_

_export const useUser \= (id: string) \=\>_

_useQuery({_

    *queryKey: \[USERS\_URL, id\],   // URL constant \+ every dynamic param*

    *queryFn: () \=\> getUser(id),*

    *enabled: Boolean(id),*

_});_

##

**Rules:**

- **queryKey discipline**
  - The key must include the URL constant and **all** dynamic parameters. A key that omits a param serves stale/wrong cache entries across different inputs.
- **URLs are constants**
  - Endpoints live in src/constants/ (or src/api/), not inline string literals \- the same constant anchors the fetcher and the query key.
- **Mutations invalidate, not manually patch**
  - After a write, invalidateQueries the affected keys (or set data via setQueryData for optimistic updates). Don’t hand-sync local copies.
- **One QueryClient, sane defaults**
  - Configure staleTime/retry/refetchOnWindowFocus once at the provider. Per-query overrides only when a resource genuinely differs.
- **Errors surface, they don’t vanish** \- lean on error boundaries and the hook’s error state; never swallow a rejected query.

##

## 6.4. Forms: React Hook Form \+ Zod {#6.4.-forms:-react-hook-form-+-zod}

Forms use React Hook Form (RHF) for state/submission and Zod for schema validation, wired with @hookform/resolvers/zod. Or Formik \+ Yup standard as an alternative.

##

**Rules:**

- **Schemas live in src/schemas/ \-** src/schemas/\<name\>.ts. No inline schemas defined in component bodies (they re-create on every render and can’t be reused/tested).
- **Types derive from the schema \-** use type FormValues \= z.infer\<typeof schema\> \- do not hand-write a parallel interface for form values.
- **Validate through zodResolver \-** One resolver on useForm; the schema is the only place validation rules live. Backend still validates independently \- client validation is UX, not a security boundary.
- **Uncontrolled by default \-** prefer RHF register / Controller (for controlled UI libs). Avoid mirroring field values into extra useState.

  #

## 6.5. State Management {#6.5.-state-management}

**Server state → TanStack Query. Client state → Zustand/Redux/Other store or Context, kept minimal.**

- **Server state is not client state \-** anything that comes from an API belongs in TanStack Query’s cache (§6.3), **not** in a store. Duplicating fetched data into a global store is the most common state-management mistake on this stack \- and once server state is out of the picture, most apps have very little client state left.
- **The store is for genuinely client-owned state only** \- UI state that outlives a component and is shared across the tree \- e.g. auth session, theme, cross-page wizard progress, feature flags. If it’s local to one component, useState is enough.
- **Zustand \-** minimal boilerplate, no provider wrapping, hook-based access. A store is a small create() slice in src/store/. Prefer it for the little shared state a typical SPA has.
- **Context for the trivial cases \-** context \+ useReducer (or plain useState) is fine for a single low-frequency value with few consumers \- theme, current user. Remember Context re-renders all consumers on change, so it’s a poor fit for frequently-updated or large state; reach for store there.
- **Keep it minimal** \- do not model derived or server data in the store. Keep slices small and focused; split by concern rather than one god-store.

##

## 6.6. Routing & Auth (Client-Side) {#6.6.-routing-&-auth-(client-side)}

This section covers the **frontend** side of auth and access control. The backend remains the real security boundary; client-side checks are UX (what to show/route), never enforcement.

- **Storage** \- follow the project’s decision (httpOnly cookie strongly preferred; if tokens must live in JS, document the XSS trade-off). Do not invent a per-feature scheme.
- **Attachment \-** a single axios request interceptor attaches the auth header; a response interceptor handles 401 → refresh/redirect. One place, not scattered per call.
- **Refresh** \- centralized in the interceptor with request queuing during refresh, so a burst of 401s triggers exactly one refresh.

Mirror the backend’s role model on the client to decide **visibility and navigation**, enforced at three points

- **Route-level** \- a guard/wrapper redirects unauthenticated or unauthorized users away from protected routes.
- **Component-level** \- a permission-aware helper (e.g. a \<Can/\> component or usePermission hook) hides or disables controls the current role can’t use, driven by a central permission map \- not scattered role \=== "admin" checks.
- **Request-level** \- the UI never assumes success \- the backend still authorizes every call, and the client handles a 403 gracefully.

##

## 6.7 Localization / i18n {#6.7-localization-/-i18n}

**No hardcoded user-facing strings — externalize to i18n**

- Every string a user reads (labels, buttons, errors, empty states, toasts, aria-labels, placeholders) comes from the translation layer, not a literal in JSX. Reserve literals for non-UI values \- test IDs, keys, log messages, enum values.
- Standard: react-i18next (the i18next ecosystem) for SPAs. On Next.js (App Router), next-intl is the option \- it's built for Server Components and the routing/locale model, so client-only useTranslation doesn't fit cleanly (§7). Pick one per repo; don't mix.
- Keys, not English, as the source of truth \- t('cart.checkout.button'), not t('Proceed to checkout'). Using the English string as the key breaks the moment the copy changes and silently desyncs every other locale.
- Interpolation over concatenation \- t('cart.itemCount', { count }), never t('You have') \+ count \+ t('items'). Word order isn't universal; string-building can't be translated correctly and pluralizes wrong. Use i18next plurals (\_one/\_other) rather than hand-rolled count \=== 1 ? … : ….
- Namespace by feature \- mirror the group-by-type layout (§3): one translation namespace/file per area (auth, cart, common), not one monolithic translations.json, so keys stay findable and bundles can split.
- Locale-aware formatting for dates, numbers, and currency \- use Intl.DateTimeFormat / Intl.NumberFormat (or the i18n layer's formatters) tied to the active locale. Never hardcode a format like MM/DD/YYYY or a $ prefix.
- Enforce it \- eslint-plugin-i18next (or eslint-plugin-formatjs) flags literal JSX strings at lint time, so this is a CI failure, not a review comment (§9, §12).

#

# 7\. Next.js Guidance {#7.-next.js-guidance}

This section applies **only** to repos on Next.js (App Router). It layers Next-specific concerns on top of the framework-agnostic baseline; a Vite SPA ignores it.

## 7.1 Server vs Client Components {#7.1-server-vs-client-components}

- **Server Components are the default** \- they run on the server, ship no JS, and can read server-only resources directly. Keep components server-side unless they need interactivity.

- **"use client" is a boundary, push it down \-** a component needs "use client" the moment it uses hooks (useState/useEffect), context, event handlers, or browser APIs. Put the directive on the smallest leaf that needs it, not the whole page, so most of the tree stays server-rendered.

- **Client-only libraries live below a client boundary \-** React Hook Form (§6.4), TanStack Query hooks (§6.3), and the client store (§6.5) all require "use client". Providers (QueryClientProvider, store provider) wrap the tree in a client component near the root.

##

## 7.2 Data fetching {#7.2-data-fetching}

- **Server data: fetch in Server Components \-** for initial/SEO-relevant data, fetch directly in an async Server Component. Use TanStack Query for **client-side** interactive data (mutations, polling, dependent queries, infinite lists).

- **Don’t double-fetch** \- either render it server-side or query it client-side \- pick per view. Hydrate TanStack Query from server data where both are needed, rather than fetching twice.

- **Route Handlers for BFF/proxy \-** app/api/\*/route.ts is where secret-bearing third-party calls go, keeping keys off the client. This is the only "backend" a FE-only repo owns.

##

## 7.3 Structure & conventions {#7.3-structure-&-conventions}

- **Routing is file-based \-** routes live under app/. Keep the src/ layout for logic; app/ segments stay thin and import from it.

- **Use the framework primitives \-** loading.tsx/error.tsx/not-found.tsx for states; middleware.ts for edge auth/redirects; the Metadata API for SEO instead of manual \<head\> tags.

- **Server Actions** \- if used for mutations, validate input with the same Zod schema the form uses. Treat every action as an untrusted entry point \- re-validate server-side.

**Non-obvious gotcha worth putting in** CLAUDE.md**:** *the Server/Client split is the \#1 source of Next.js errors the agent can’t infer from code alone (e.g. "*useState _in a Server Component"). State explicitly which parts of the app are client boundaries._

# 8\. Claude Code Guardrails \- Stack-Specific {#8.-claude-code-guardrails---stack-specific}

General mechanics of hooks, permissions, and sessions are in the «AI Agent Playbook». Here is only what is specific to the React/TS frontend stack: which concrete commands/paths belong in allow/deny, and which additional anti-patterns to block.

## 8.1 Memory Hierarchy for This Stack {#8.1-memory-hierarchy-for-this-stack}

##

| Level        | Location                                   | Purpose                                        |
| :----------- | :----------------------------------------- | :--------------------------------------------- |
| Project      | ./CLAUDE.md                                | Core stack, commands, roles                    |
| Subdirectory | \<project\_name\>/src/\<folder\>/CLAUDE.md | Folder-specific context (e.g., testing/ logic) |
| Path-Scoped  | .claude/rules/\*.md                        | YAML-frontmatter rules for specific file globs |

##

##

## 8.2 Example Declarative Permissions for This Stack {#8.2-example-declarative-permissions-for-this-stack}

##

| Type  | Example                 | Context               |
| ----- | ----------------------- | --------------------- |
| allow | Bash(npm run test:\*)   | Testing               |
| allow | Bash(npm run lint)      | Verification          |
| allow | Edit(src/\*\*)          | Application code      |
| deny  | Edit(.env)              | Secret protection     |
| deny  | Edit(\*\*/secrets/\*\*) | Credential protection |

##

##

## 8.3 Additional Banned Patterns (stack-specific) {#8.3-additional-banned-patterns-(stack-specific)}

| Category   | Anti-pattern                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Logic      | Nested ternaries, magic numbers, deep nesting (\>3 levels)                                      |
| React      | State duplication, state for derived values, unstable object references in props, index as key  |
| TypeScript | Type casting (as) instead of narrowing, any escape hatches                                      |
| Styling    | Inline style={{}}; Tailwind arbitrary values; raw hex                                           |
| Data       | Manual fetch for server state; queryKey missing a dynamic param                                 |
| Next.js    | Hooks/context/browser APIs in a Server Component; secret in a NEXT\_PUBLIC\_ var                |
| General    | console.log, // @ts-ignore without explanation, unhandled async errors, direct DOM manipulation |

_**Note:** back this list with an actual enforcement mechanism where possible (linter rule, type-checker flag) rather than prose alone \- see the "don't duplicate what a tool already enforces" principle in the Playbook._

#

# 9\. Linting, Formatting & Type Checking {#9.-linting,-formatting-&-type-checking}

- **ESLint (flat config) \-** eslint.config.js is the standard (the legacy .eslintrc format is deprecated). Zero warnings in CI \- warnings that never fail the build are ignored forever.
- **Baseline plugin set:**

  - @typescript-eslint \- type-aware rules; ban any, unsafe as, floating promises.
  - eslint-plugin-react \+ react-hooks \- rules-of-hooks and exhaustive-deps as error.
  - eslint-plugin-jsx-a11y \- accessibility lint on JSX.
  - eslint-plugin-tailwindcss \- valid/ordered classes, flag arbitrary values.
  - eslint-plugin-import \- no-cycle and cross-folder relative-import rules.

- **Prettier owns formatting**
  - All formatting rules live in Prettier (with prettier-plugin-tailwindcss); ESLint doesn’t fight it. Formatting is never a review comment.
- **Type checking is a separate gate**
  - tsc \--noEmit (the typecheck script) runs in CI. ESLint does not replace the compiler \- both run.
- **Pre-commit**
  - lint-staged runs ESLint \+ Prettier on staged files; the same commands run in CI on the full tree. Local and CI must call identical commands and pinned versions.

#

# 10\. Verification & Test Architecture {#10.-verification-&-test-architecture}

The general "TDD as an oracle" principle and hook-gate verification are described in the «AI Agent Playbook» (Sections 6–7). Below are the frontend specifics.

## 10.1 Test stack & philosophy {#10.1-test-stack-&-philosophy}

- **Unit/component** \- Vitest \+ React Testing Library. Test behavior a user observes (rendered output, interactions), not implementation details (internal state, instance methods).
- **E2E** \- Playwright for critical user journeys (auth, checkout, primary flows).
- **Query the DOM like a user \-** prefer role/label/text queries (getByRole, getByLabelText). Avoid data-testid unless there’s no accessible handle \- testid-heavy tests pass while the UI is broken for real users.
- **Mock at the network boundary \-** use MSW (or equivalent) to mock HTTP, so tests exercise real query/fetcher code instead of stubbing hooks.

##

## 10.2 What to test {#10.2-what-to-test}

- **Forms** \- valid submit calls the mutation with correct payload; invalid input shows Zod errors and blocks submit (§6.4).
- **Data hooks** \- loading → success and loading → error paths render correctly.
- **Guards/RBAC** \- both the allow and the deny branch \- an authorized role sees the control, an unauthorized one doesn’t (§6.6).

##

## 10.3 Coverage thresholds & CI gate {#10.3-coverage-thresholds-&-ci-gate}

- **New/changed code \-** minimum **80% line coverage**, enforced in CI (Vitest coverage.thresholds / \--coverage). Not "reasonable effort".
- **Overall coverage must not regress** \- track repo baseline as a CI check, not a periodic manual audit.
- **Critical paths** \- auth, payments, RBAC/guards \- explicit allow-and-deny test cases, not just line coverage.

# 11\. CI/CD Integration {#11.-ci/cd-integration}

Local guardrails (§8) only protect the agent's own working session \- they say nothing about what happens once code is pushed. Mirror the same gates in the pipeline so there is a single source of truth for "passing," whether a human or an agent made the change.

- Run the identical test/lint commands in CI that are configured as PostToolUse/Stop hooks locally (§8) \- a passing local hook and a failing CI run for the same command indicates environment drift, not a flaky pipeline.

- Block merges on the CI gate, not on the agent's self-report. "The agent said tests passed" is not a substitute for a green required check on the PR.

- Pin the CI runner's tool versions (Python, Node, package manager) to match local.yml / docker-compose exactly, so "works locally" and "works in CI" mean the same thing.

_**Note:** if your CI provider supports it, surface hook-blocked attempts (§8) as a build annotation or comment on the PR \- this gives reviewers visibility into what the agent tried and was stopped from doing, not just the final diff._

#

# 12\. Security & Supply Chain {#12.-security-&-supply-chain}

- **Dependency scanning**: run an automated scanner (npm audit, Dependabot, or Snyk) on every PR and on a schedule for the default branch.

- **Pin versions**: the lockfile (package-lock.json / pnpm-lock.yaml / yarn.lock) is mandatory and committed; avoid unpinned ranges reaching production.

- **License compliance**: flag copyleft or otherwise restricted licenses in new dependencies before they're merged, not after.

- **Secrets scanning**: run a pre-commit or CI secrets scanner (e.g., gitleaks, trufflehog) in addition to the .env/secrets/\*\* deny-rules in §8.2 \- the hook protects the agent's own session, a scanner catches what humans commit too.

- **Client bundle hygiene** \- no secret-bearing value in a NEXT\_PUBLIC\_/VITE\_ variable (§2); audit what actually ships in the bundle. Keep third-party \<script\> includes minimal and reviewed (supply-chain/XSS surface).

- **Sanitize injected HTML** \- dangerouslySetInnerHTML requires sanitization (e.g. DOMPurify) and an explicit review \- it is the main XSS vector in React.

#

# 13\. Observability {#13.-observability}

Treat error tracking and performance monitoring as part of the baseline, not bolted on at deploy time.

**Error tracking:**

- **wire a client error reporter** (Sentry or equivalent) with source maps uploaded at build, so a production stack trace maps back to real code. Route React errors through error boundaries into the reporter.

- **Never log PII or tokens** \- scrub user data and auth tokens before anything reaches logs or the error reporter \- the same rule the backend follows.

- **Core Web Vitals** \- track LCP / INP / CLS in the field (the framework’s web-vitals hook → your analytics), not just a one-off Lighthouse run.

- **Correlation with backend** \- propagate a request/correlation ID on API calls so a user-facing error can be traced end-to-end across the FE and BE.

- **Release health** \- tag errors and vitals with the release/build version so a regression can be attributed to a specific deploy.

# 14\. Git Workflow {#14.-git-workflow}

- Conventional Commits: imperative present tense (e.g., "Fix auth bug").

- Summary limit: 50 characters.

- Squash merges: mandatory to maintain a clean linear history.

#

# 15\. Templates {#15.-templates}

## 15.1 Generic Root CLAUDE.md Template (for a new project on this stack) {#15.1-generic-root-claude.md-template-(for-a-new-project-on-this-stack)}

_\# Project: \[Name\]_

_\#\# Stack_

_\- Language: TypeScript (strict)_

_\- Framework: \[Next.js App Router | Vite SPA\]_

_\- Styling: Tailwind CSS_

_\- Server state: TanStack Query_

_\- Forms: React Hook Form \+ Zod | Formik \+ Yup_

_\- Client state: Zustand | Redux | Context_

_\- Package manager: \[npm | pnpm | yarn\] (pinned, lockfile committed)_

_\- Node: \[version from .nvmrc\]_

_\#\# Commands_

_\- Dev: \`npm run dev\`_

_\- Build: \`npm run build\`_

_\- Lint: \`npm run lint\`_

_\- Typecheck: \`npm run typecheck\`_

_\- Test: \`npm run test:cov\`_

_\#\# Rules_

_\- Group-by-type structure under src/; @\* path aliases, no cross-folder relative imports._

_\- Server data through TanStack Query hooks; never fetch-in-useEffect._

_\- Forms via RHF \+ Zod; schemas in src/schemas/._

_\- Tailwind tokens only; no arbitrary values, no inline styles._

_\#\# Non-obvious rules_

_\- \[Which parts of the app are Client Components / "use client" boundaries\]_

_\- \[Auth/token storage decision and where the interceptor lives\]_

_\- \[Anything NOT inferable from the code \- a gotcha, an env quirk, an asymmetry\]_

#

_**Note:** do not duplicate AI-tool mechanics (hooks, permissions, memory, sessions) in this file \- that is already covered in the «AI Agent Playbook» and wired via .claude/settings.json. For a live, filled-in example of such a CLAUDE.md, see the «Reference CLAUDE.md \- Example» document._

#

# 16\. New Repository Onboarding Checklist (for this stack) {#16.-new-repository-onboarding-checklist-(for-this-stack)}

- \[ \] npm install succeeds against the committed lockfile; npm run dev starts.

- \[ \] Node version pinned (.nvmrc) and matched by the CI runner.

- \[ \] src/ follows the group-by-type layout in §3, with @\* path aliases configured.

- \[ \] Import lint enforces no cycles and no cross-folder relative imports (§3).

- \[ \] Tailwind configured; theme holds design tokens; arbitrary-value / class-order lint on (§5).

- \[ \] TanStack Query client configured at the root with sane defaults (§6.3)

- \[ \] RHF \+ Zod wired; a sample form validates through zodResolver (§6.4).

- \[ \] Client state uses store or Context, recorded in CLAUDE.md (§6.5).

- \[ \] Auth interceptor (attach \+ refresh) and route/component guards in place (§6.6).

- \[ \] If Next.js: client boundaries documented; Route Handlers used for any secret-bearing calls (§7).

- \[ \] ESLint (flat) \+ Prettier \+ tsc \--noEmit run clean; pre-commit hook wired (§9).

- Vitest \+ RTL set up; 80% changed-code coverage gate wired into CI (§10).

- CI mirrors local hooks (§11): same lint/typecheck/test/build commands, same pinned versions.

- Dependency \+ secrets scanning configured (§12).

- Error tracking (source maps) and Web Vitals reporting configured (§13).

- Root CLAUDE.md filled from the §15 template; .claude/ allow-deny rules set (§8.2).

- The general AI-tool onboarding checklist from «AI Agent Playbook» completed separately.

- A demo "Research-Plan-Execute" session has been run with the team.
