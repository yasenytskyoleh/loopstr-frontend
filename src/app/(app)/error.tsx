"use client";

import { AlertTriangleIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

/** Error boundary for the homepage. Rendered when the catalog gateway throws;
 *  `reset()` re-runs the server render. */
export default function CatalogError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-content-primary">
        Browse tools
      </h1>
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-danger-subtle text-danger">
          <AlertTriangleIcon className="size-6" />
        </span>
        <p className="text-lg font-medium text-content-primary">
          Couldn&rsquo;t load the catalog
        </p>
        <p className="max-w-xs text-sm text-content-secondary">
          Something went wrong on our end. Try again.
        </p>
        <Button variant="outline" onClick={reset} className="mt-1">
          Retry
        </Button>
      </div>
    </div>
  );
}
