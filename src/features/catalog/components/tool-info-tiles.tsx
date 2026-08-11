import type { ComponentType, SVGProps } from "react";

import {
  InfoIcon,
  MapPinIcon,
  ShieldIcon,
  TagIcon,
} from "@/components/ui/icons";

import { formatPricePerDay } from "../catalog.utils";
import type { Tool } from "../catalog.types";

/** The four at-a-glance facts under the gallery: price, condition, brand/model
 *  and category. */
export function ToolInfoTiles({ tool }: { tool: Tool }) {
  const tiles: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    value: string;
    label: string;
  }[] = [
    {
      icon: TagIcon,
      value: formatPricePerDay(tool.price_per_day_usd),
      label: "Price per day",
    },
    { icon: ShieldIcon, value: tool.condition, label: "Condition" },
    { icon: InfoIcon, value: tool.brand_model, label: "Brand & model" },
    { icon: MapPinIcon, value: tool.category, label: "Category" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-content-secondary">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-content-primary">
              {value}
            </p>
            <p className="text-xs text-content-secondary">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
