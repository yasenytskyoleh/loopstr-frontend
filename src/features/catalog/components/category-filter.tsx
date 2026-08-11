"use client";

import { cn } from "@/lib/utils";

import { ALL_CATEGORY } from "../catalog.config";
import { formatToolCount } from "../catalog.utils";

interface CategoryFilterProps {
  categories: string[];
  counts: Record<string, number>;
  /** Selected category, or `null` for "All". */
  active: string | null;
  onChange: (category: string | null) => void;
}

/** Category pill row. "All" is first; the active non-All pill shows its tool
 *  count (e.g. "5 tools · Power tools"). */
export function CategoryFilter({
  categories,
  counts,
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1">
      <Pill active={active === null} onClick={() => onChange(null)}>
        {ALL_CATEGORY}
      </Pill>
      {categories.map((category) => {
        const isActive = active === category;
        return (
          <Pill
            key={category}
            active={isActive}
            onClick={() => onChange(category)}
          >
            {isActive
              ? `${formatToolCount(counts[category])} · ${category}`
              : category}
          </Pill>
        );
      })}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        active
          ? "bg-brand-subtle font-medium text-content-brand"
          : "text-content-secondary hover:text-content-primary",
      )}
    >
      {children}
    </button>
  );
}
