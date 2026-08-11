---
name: nextjs
description: Use when deciding whether a component is server or client or adding "use client"; when data doesn't refresh after a write; when a page is unexpectedly dynamic or unexpectedly cached; or when writing a server action, route handler, layout, streaming/Suspense boundary, metadata export, or loading/error file.
---

# Next.js (App Router)

The App Router's defaults are good. Most Next.js problems come from opting out of them by
reflex: `"use client"` at the top of a tree that never needed it, or a `useEffect` fetch
where an `await` would do.

> **Check the version before trusting any caching advice.** The caching model changed
> materially across 13 → 15 → 16, and stale blog posts (and stale pages in Next's own
> docs) actively contradict current behaviour. Read `package.json`, then confirm against
> Context7 rather than memory.

## Server components are the default

Every component under `app/` is a server component until something makes it otherwise.
Server components can be `async`, can query the database directly, and ship **no**
JavaScript to the browser.

Add `"use client"` only for what genuinely needs the browser:

- state or effects (`useState`, `useReducer`, `useEffect`)
- event handlers (`onClick`, `onChange`, …)
- browser APIs (`window`, `localStorage`, `IntersectionObserver`)
- a hook from a library that itself needs the client

Everything else stays on the server. Fetching data is _not_ a reason to go client.

## Push the boundary down

`"use client"` is contagious: it applies to the file and everything it _imports_. One
directive at the top of a page pulls the whole subtree into the bundle.

```tsx
// WRONG — the entire page and its imports become client code for one button
"use client";
export default function Page() {
  const [open, setOpen] = useState(false);
  return (
    <article>
      <ExpensiveMarkdown source={doc} /> {/* now shipped to the browser too */}
      <button onClick={() => setOpen(true)}>Details</button>
    </article>
  );
}
```

```tsx
// CORRECT — the page stays on the server; only the button is client code
export default async function Page() {
  const doc = await getDoc();
  return (
    <article>
      <ExpensiveMarkdown source={doc} />
      <DetailsToggle /> {/* the only "use client" file */}
    </article>
  );
}
```

Note the escape hatch: a client component can still _render_ server components passed to
it as `children` or props. Those are rendered on the server and handed over as output —
they do not join the client bundle. Use this to keep a client-side shell (a provider, a
tab strip) without dragging its contents client-side.

Props crossing into a client component must be **serializable**. Functions, class
instances, `Date` methods, and symbols do not cross. Pass a server action instead of a
callback.

## Fetch on the server, in the component that needs it

```tsx
// WRONG — a client-side waterfall for data the server already has
"use client";
useEffect(() => {
  fetch("/api/user").then(/* … */);
}, []);

// CORRECT
export default async function Page() {
  const user = await getUser(); // runs on the server, no loading state, no round trip
  return <Profile user={user} />;
}
```

Don't prop-drill fetched data to keep it "in one place". Call the fetch in each component
that needs it and wrap the accessor in React's `cache()` — requests dedupe within a render
pass, so two calls make one query.

Fetch in parallel when requests don't depend on each other, or you have rebuilt the
waterfall you moved to the server to avoid:

```tsx
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

## Caching: know which model you're in

Two models exist in Next 16, and the advice is opposite between them.

**Default (no `cacheComponents`)** — `fetch` is **not** cached. Requests hit the network
each time unless you opt in:

```ts
await fetch(url); // not cached
await fetch(url, { cache: "force-cache" }); // cached until invalidated
await fetch(url, { next: { revalidate: 60 } }); // ISR: revalidate after 60s
await fetch(url, { next: { tags: ["posts"] } }); // invalidate via revalidateTag("posts")
```

Any source claiming `force-cache` is the default describes Next 13/14 and is stale.

**Cache Components** — opt in via `next.config.ts`, which unifies the old `ppr`,
`useCache`, and `dynamicIO` flags:

```ts
const nextConfig: NextConfig = { cacheComponents: true };
```

That unlocks the `use cache` directive with `cacheLife` / `cacheTag`:

```tsx
import { cacheLife, cacheTag } from "next/cache";

export async function getPosts() {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  return db.post.findMany();
}
```

Invalidate writes with `revalidateTag("posts")` or `revalidatePath("/blog")`.

Reading `cookies()`, `headers()`, or `searchParams` opts a route into dynamic rendering —
so an incidental `cookies()` call in a shared helper can silently make every page dynamic.
If a page unexpectedly stopped being static, look there first.

`params` and `searchParams` are **async** — `await` them.

## Server actions

An action is a public HTTP endpoint. `"use server"` does not mean "trusted".

```ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const CreatePost = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

export async function createPost(prevState: State, formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" }; // authorise every action, every time

  const parsed = CreatePost.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" }; // never trust FormData

  await db.post.create({ data: { ...parsed.data, authorId: session.userId } });
  revalidatePath("/posts"); // refresh what the write invalidated
  return { error: null };
}
```

Bind it to a form with `useActionState`, which gives you the pending state for free — no
`useState` submit flag:

```tsx
"use client";
const [state, formAction, pending] = useActionState(createPost, initialState);
return (
  <form action={formAction}>
    <input name="title" required />
    <p aria-live="polite">{state.error}</p>
    <button disabled={pending}>Save</button>
  </form>
);
```

## Route handlers

Only write `app/api/**/route.ts` for a real HTTP surface: webhooks, third-party callbacks,
or a public API. Your own server components should call the data layer directly — a route
handler between a server component and the database is a needless round trip.

## Streaming and file conventions

Don't let one slow query block the page. Send the shell, stream the rest:

```tsx
export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<FeedSkeleton />}>
        <Feed /> {/* async; streams in when ready */}
      </Suspense>
    </>
  );
}
```

- `loading.tsx` — an automatic Suspense boundary for the route segment.
- `error.tsx` — must be `"use client"`; receives `reset()`. Catches its own segment only.
- `not-found.tsx` — pairs with `notFound()`.
- `layout.tsx` — persists across navigation and does **not** re-render on route change.
  Per-page state does not belong here.
- Metadata: export `metadata` or `generateMetadata` from a server component. Never
  hand-write `<title>` in markup.
- Images: `next/image` with explicit `width`/`height` (or `fill`) to avoid layout shift.
  Local imports get dimensions inferred.

## Review checklist

- [ ] `"use client"` present only where state/effects/handlers/browser APIs demand it
- [ ] The boundary sits as low as possible; server content passed as `children` where useful
- [ ] Props into client components are serializable
- [ ] Data fetched on the server; no `useEffect` fetch for first-render data
- [ ] Independent requests parallelised; accessors wrapped in `cache()`
- [ ] Cache behaviour matches the project's model, verified against the installed version
- [ ] Server actions authorise the caller and validate input before touching the database
- [ ] Writes call `revalidateTag`/`revalidatePath`
- [ ] `params` / `searchParams` awaited
- [ ] Slow subtrees wrapped in `Suspense`
