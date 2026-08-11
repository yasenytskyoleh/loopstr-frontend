/** Stable keys for the static placeholder rows — no reorder, but keyed by token
 *  rather than array index per the project list-key rule. */
const PILL_PLACEHOLDERS = ["p1", "p2", "p3", "p4", "p5", "p6"];
const CARD_PLACEHOLDERS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

/** Loading placeholder for the homepage: the static shell plus shimmering card
 *  and filter blocks. Shown by the route's `loading.tsx` while the catalog loads
 *  (visible on the HTTP path; the fixture resolves instantly). */
export function CatalogSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label="Loading tools"
    >
      <h1 className="text-2xl font-semibold text-content-primary">
        Browse tools
      </h1>
      <div className="h-[38px] w-full max-w-[440px] rounded-lg border border-line bg-surface" />
      <div className="flex flex-wrap gap-2">
        {PILL_PLACEHOLDERS.map((key) => (
          <div
            key={key}
            className="h-8 w-24 animate-pulse rounded-lg bg-line/60"
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CARD_PLACEHOLDERS.map((key) => (
          <li
            key={key}
            className="overflow-hidden rounded-xl border border-line bg-surface shadow-card"
          >
            <div className="aspect-[16/10] animate-pulse bg-line/50" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-line/50" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-line/40" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
