import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { GridIcon, TagIcon } from "@/components/ui/icons";

import { catalogRoutes } from "../catalog.config";
import { formatPricePerDay, isAvailable } from "../catalog.utils";
import type { Tool } from "../catalog.types";

const CARD_IMAGE_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/** Catalog grid card. Links to the read-only details view. Unavailable tools
 *  (under maintenance / retired) are grayed with a label rather than hidden. */
export function ToolCard({ tool }: { tool: Tool }) {
  const available = isAvailable(tool);

  return (
    <Link
      href={catalogRoutes.tool(tool.id)}
      className="group block overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
        <Image
          src={tool.photos[0]}
          alt={tool.name}
          fill
          sizes={CARD_IMAGE_SIZES}
          className={cn("object-cover", !available && "grayscale")}
        />
        {!available && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-content-secondary shadow-card">
            Currently unavailable
          </span>
        )}
      </div>

      <div className="p-4">
        <h3
          className={cn(
            "font-medium",
            available ? "text-content-primary" : "text-content-secondary",
          )}
        >
          {tool.name}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-content-secondary">
          <GridIcon className="size-4 shrink-0" />
          {tool.category}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-content-secondary">
          <TagIcon className="size-4 shrink-0" />
          {formatPricePerDay(tool.price_per_day_usd)}
        </p>
      </div>
    </Link>
  );
}
