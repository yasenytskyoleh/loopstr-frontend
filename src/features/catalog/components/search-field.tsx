"use client";

import { SearchIcon, XIcon } from "@/components/ui/icons";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/** Homepage search input. Filters the grid by tool name as the Member types; a
 *  clear button appears once there's a query. */
export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div className="relative w-full max-w-[440px]">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-secondary" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search tools…"
        aria-label="Search tools"
        className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-9 text-sm text-content-primary transition-colors placeholder:text-content-secondary focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-content-secondary transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
