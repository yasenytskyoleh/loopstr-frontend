---
name: typescript
description: Use when removing `any` or an unsafe cast, designing a union or generic that has to carry real invariants, validating data crossing a runtime boundary (API responses, forms, env, URL params), reaching for a utility type, or typing props, hooks, and events.
---

# TypeScript

Types exist to make illegal states unrepresentable. A type that merely restates the shape
of the data pays for itself once; a type that rules out a bug pays forever.

## Non-negotiables

- `strict: true`. If a project lacks it, say so rather than working around it.
- No `any`. Use `unknown` at boundaries and narrow, or write the real type.
- No `as` to silence an error. `as` is a claim you know better than the compiler — it is
  only honest after a runtime check, or for `as const`.
- No `@ts-ignore`. `@ts-expect-error` with a one-line reason is acceptable when a
  dependency is genuinely mistyped; it fails loudly once the dependency is fixed.
- No non-null `!` on values that can actually be null. Narrow instead.

## Make illegal states unrepresentable

Optional fields that are secretly correlated are the most common source of impossible
states. Model the correlation with a discriminated union.

```ts
// WRONG — permits { status: "success", error: "boom" } and { status: "loading", data: {...} }
type State = {
  status: "loading" | "success" | "error";
  data?: User;
  error?: string;
};

// CORRECT — the compiler now enforces which fields coexist
type State =
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: string };
```

The payoff arrives at the use site: narrowing on `state.status` gives exact types, and a
`switch` with a `never` default catches any variant added later.

```tsx
function render(state: State) {
  switch (state.status) {
    case "loading":
      return <Spinner />;
    case "success":
      return <Profile user={state.data} />; // data is defined here, no `?.` needed
    case "error":
      return <ErrorMessage message={state.error} />;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}
```

## Validate at the boundary, trust inside

Anything from outside the program — an API response, `localStorage`, form input, env vars,
URL params — is `unknown` no matter what the annotation says. An `as ApiResponse` on a
`fetch` is a lie the compiler cannot check, and it turns a network problem into a crash
three components away.

Parse once, at the edge, then let inference carry the type inward.

```ts
import { z } from "zod";

const User = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

export type User = z.infer<typeof User>; // derive the type, don't hand-write it twice

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`getUser failed: ${res.status}`);
  return User.parse(await res.json()); // throws here, where the cause is obvious
}
```

Derive types from schemas rather than declaring both — two sources of truth drift.

## Inference over annotation

Annotate what you _accept_; let TypeScript infer what you _return_. Over-annotating return
types adds maintenance and hides widening you did not intend.

```ts
// Unnecessary — the return type is obvious and the annotation can go stale
function toLabel(user: User): string {
  return `${user.email} (${user.role})`;
}

// Enough
function toLabel(user: User) {
  return `${user.email} (${user.role})`;
}
```

Exception: exported public API, where an explicit return type is a contract and stops an
internal refactor from silently widening what callers see.

## Generics only when a type actually flows

A generic earns its place when a type travels from input to output. If the parameter is
used once, it is a worse spelling of a concrete type.

```ts
// WRONG — T is used once; this is `(value: unknown) => void` with extra steps
function log<T>(value: T): void {}

// CORRECT — the caller's element type flows through to the result
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

Constrain with `extends` when the body relies on structure, and prefer `readonly` arrays
for parameters you do not mutate. Name type parameters for what they are (`TItem`, `TData`),
not `T1`/`T2`.

## Utility types worth reaching for

| Utility                     | Use when                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| `Pick` / `Omit`             | Derive a view of a type instead of redeclaring fields            |
| `Partial`                   | Patch/update payloads. On props it usually hides a missing union |
| `Record<K, V>`              | Lookup maps; a union key forces exhaustiveness                   |
| `NonNullable`               | Strip `null`/`undefined` after a guard                           |
| `ReturnType` / `Parameters` | Adapt to a function you do not own                               |
| `Extract` / `Exclude`       | Filter a union                                                   |

`satisfies` checks a literal against a type _without_ widening it:

```ts
// `as const` alone loses the check; a type annotation alone loses the literal keys
const routes = {
  home: "/",
  profile: "/profile",
} satisfies Record<string, `/${string}`>;

type Route = keyof typeof routes; // "home" | "profile" — preserved
```

## Typing React

Covered in depth by the `react` skill; the type-level rules:

- Props: a plain `type` alias. Don't reach for `React.FC` — it adds an implicit `children`
  and complicates generics.
- Children: `React.ReactNode`, never `JSX.Element` (which rejects strings and arrays).
- Events: let the handler infer from the JSX attribute. Annotate only for a standalone
  handler, and then use the specific type — `React.ChangeEvent<HTMLInputElement>`.
- Extending a DOM element: `ComponentPropsWithoutRef<"button">` rather than hand-listing
  attributes, so the component accepts everything a real `<button>` does.

```ts
type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "ghost";
};
```

## Review checklist

- [ ] No `any`, no unchecked `as`, no `@ts-ignore`, no gratuitous `!`
- [ ] Correlated optional fields modelled as a discriminated union
- [ ] External data parsed/validated at the boundary, not asserted
- [ ] Types derived (`z.infer`, `Pick`, `ReturnType`) rather than duplicated
- [ ] Generics carry a type through; single-use type parameters removed
- [ ] Unions switched on exhaustively, with a `never` default
