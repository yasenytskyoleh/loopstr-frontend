---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Anti-Patterns

Do not write code that matches these patterns. This file is the floor — it states the rule
and names the skill that carries the reasoning and the worked example. Where a skill and this
file could disagree, the skill wins; nothing here should contradict one.

## React

- No client-side fetching for data the server already has — fetch it in the server
  component. When data genuinely depends on interaction or polls, use the project's data
  layer rather than hand-rolling `useState` + `useEffect`. (`nextjs` skill)
- No state for a value you can derive during render. (`react` skill)
- No unstable object or arrow prop passed to a memoized child — a new reference every render
  defeats the `memo`. (`react` skill)
- No index as a list key — it breaks state on reorder or delete. (`react` skill)
- No event listener or subscription without cleanup. (`react` skill)
- No direct DOM manipulation alongside React state.

## Accessibility

Get these right while writing, not at review — they're cheap now and a rewrite later.

- No `<div onClick>`. Use the semantic element (`<button>`, `<a>`, `<nav>`, `<main>`) or you
  lose keyboard, focus, and role. (`/design-review` for the full audit)
- No input without a real label, and no icon-only control without an accessible name.
- No removed focus outline — restyle it with `focus-visible:` instead.
- No state conveyed by colour alone; add text or ARIA.

## TypeScript

- No `any`. Take `unknown` at the boundary and narrow it. (`typescript` skill)
- No `as` to silence an error — narrow it, or validate at the boundary. (`typescript` skill)
- No `@ts-ignore`. `@ts-expect-error` with a one-line reason is acceptable.
- No async function that leaves its errors unhandled.

## Imports

- No deep relative path that climbs out of its folder (`../../…`) — use the project's `@/` alias
  for anything crossing a feature or top-level folder (`app`, `lib`, `components`).
- Keep imports relative _within_ a module — a sibling (`./x`), or a short hop to the feature root.
  Cohesive files that move together shouldn't reach for each other through the alias.
