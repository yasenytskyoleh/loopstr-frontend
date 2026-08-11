/** Loading placeholder for the tool-details route: breadcrumb, hero image and
 *  text lines. Shown by the route's `loading.tsx`. */
export function ToolDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading tool">
      <div className="h-4 w-40 animate-pulse rounded bg-line/50" />
      <div className="h-7 w-64 animate-pulse rounded bg-line/60" />
      <div className="aspect-[16/9] animate-pulse rounded-xl bg-line/50" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-line/50" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-line/40" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-line/40" />
      </div>
    </div>
  );
}
