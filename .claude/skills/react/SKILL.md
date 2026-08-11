---
name: react
description: Use when diagnosing stale state, a re-render loop, or renders that shouldn't be happening; when deciding where state should live or whether an effect is needed at all; when a dependency array, context boundary, ref, or list key is in question; or when a component is growing boolean props instead of composing.
---

# React

Most React bugs are state-placement bugs wearing a costume. Before reaching for an effect
or a memo, ask where the state actually belongs.

## Derive, don't synchronise

The single most common mistake: mirroring props or other state into `useState` and keeping
it in sync with an effect. This renders twice, goes stale, and invents a second source of
truth.

```tsx
// WRONG — fullName is a second copy that can disagree with its inputs
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// CORRECT — it was never state
const fullName = `${first} ${last}`;
```

If the derivation is genuinely expensive (measured, not assumed), wrap it in `useMemo`.
Cheap string and array work is not expensive.

To reset state when a prop changes, don't write an effect — change the `key` and let React
remount the subtree:

```tsx
<ProfileForm key={userId} userId={userId} />
```

## What effects are actually for

An effect synchronises with something _outside_ React: the DOM, a subscription, a timer, a
network request, `localStorage`. If no external system is involved, it is probably not an
effect.

Not effects: derived values, transforming data for render, handling a user event (that
belongs in the event handler).

```tsx
// WRONG — this is an event, not a synchronisation
useEffect(() => {
  if (submitted) void postForm(values);
}, [submitted, values]);

// CORRECT
async function handleSubmit() {
  await postForm(values);
}
```

Every effect that subscribes must clean up, and every async effect must handle being torn
down before it resolves — otherwise you set state on a gone component and race responses:

```tsx
useEffect(() => {
  const controller = new AbortController();

  getUser(userId, { signal: controller.signal })
    .then(setUser)
    .catch((err) => {
      if (err.name !== "AbortError") setError(err);
    });

  return () => controller.abort();
}, [userId]);
```

## Dependency arrays are not suggestions

Never silence the exhaustive-deps lint. It is right essentially always; a stale closure is
the bug it is warning about. When the array "has to" be wrong, the real fix is one of:

- The value is derived → compute it during render, drop it from deps.
- The function identity changes every render → move it inside the effect, or `useCallback`
  it at the definition site.
- You want it to run once on mount → say so explicitly and confirm the values it closes
  over genuinely never change.
- It is an event, not an effect → move it to the handler.

## Put state where it belongs

Start with the lowest component that needs it. Lift only when a second component needs the
same value; hoist to context only when the distance is real (many levels, many consumers).

Context is not a state manager. It re-renders **every** consumer on every value change, so
splitting by update frequency matters:

```tsx
// WRONG — a component that only dispatches re-renders on every data change
<AppContext.Provider value={{ user, setUser, theme, setTheme }}>

// CORRECT — separate what changes often from what doesn't
<UserContext.Provider value={user}>
  <UserDispatchContext.Provider value={setUser}>
```

Always memoise a context value that is an object literal — otherwise it is a new reference
every render and every consumer re-renders regardless.

```tsx
const value = useMemo(() => ({ user, permissions }), [user, permissions]);
```

Pair each context with a hook that throws when used outside its provider, so misuse is a
loud error rather than a silent `undefined`:

```tsx
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
```

For server data, don't hand-roll caching in context. Use the project's data layer (React
Query / SWR / RSC — see the `nextjs` skill).

## Composition over configuration

When a component sprouts booleans that toggle chunks of markup, it wants to be several
components, or to accept `children`.

```tsx
// WRONG — every new case adds a prop and a branch
<Card showHeader showFooter hideBorder isCompact title="..." />

// CORRECT — the caller composes what it needs
<Card>
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
</Card>
```

Extract a custom hook when _stateful logic_ repeats — not to hide a single `useState`. A
hook that wraps one primitive with no added behaviour is indirection, not abstraction.

## Keys identify, they don't number

A key tells React which item this is across renders. An array index says "position", so on
reorder or delete React keeps the wrong state attached to the wrong row.

```tsx
// WRONG — deleting the first item leaves its input value on the next one
{
  items.map((item, i) => <Row key={i} item={item} />);
}

// CORRECT
{
  items.map((item) => <Row key={item.id} item={item} />);
}
```

Index keys are only safe for a static list that never reorders, never filters, and whose
rows hold no state.

## Memoise on evidence, not reflex

`memo`, `useMemo`, and `useCallback` all cost something — they allocate, they add deps to
maintain, and they clutter. React is fast; most components do not need them.

Reach for them when: the component renders a genuinely large subtree, the value is a
dependency of a memoised child (or an effect) and its identity churns, or a profile shows
a real cost. Otherwise skip.

`memo` is defeated by an object or arrow prop created inline — memoising the child while
passing `style={{ ... }}` or `onClick={() => ...}` does nothing.

## Diagnosing the classics

- **Stale value in a callback** — a closure captured an old render. Check deps; use the
  updater form `setCount((c) => c + 1)` when the next value depends on the previous.
- **Infinite re-render loop** — an effect sets state that is (transitively) in its own deps,
  usually via an object/array recreated each render. Memoise the dep or drop it.
- **State resets unexpectedly** — the component is being remounted: a changing `key`, or a
  component defined _inside_ another component's body (a new type every render).
- **Two renders, briefly wrong UI** — derived state synced by an effect. See the top.

## Review checklist

- [ ] No state that is derivable from props/state during render
- [ ] Effects synchronise with an external system; events live in handlers
- [ ] Every subscription/async effect cleans up or aborts
- [ ] exhaustive-deps satisfied honestly, not disabled
- [ ] Context values memoised; frequently-changing values split out
- [ ] Keys are stable IDs, not indices
- [ ] Components not defined inside other components
- [ ] `memo`/`useMemo`/`useCallback` justified by a real cost, not added by reflex
