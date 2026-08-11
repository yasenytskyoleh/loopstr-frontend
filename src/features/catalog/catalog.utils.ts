import type { Tool } from "./catalog.types";

/** A tool is browsable-available only when its status is "Available"; the other
 *  statuses render as a grayed, still-visible card (HOME-01 AC #5). */
export function isAvailable(tool: Tool): boolean {
  return tool.status === "Available";
}

/** Distinct categories in catalog order (first occurrence wins). Drives the
 *  filter pills and the "N categories" count — never hardcoded. */
export function deriveCategories(tools: Tool[]): string[] {
  return [...new Set(tools.map((tool) => tool.category))];
}

/** Filter by category and case-insensitive name substring. Unavailable tools are
 *  never hidden — only the two axes the Member controls apply. */
export function filterTools(
  tools: Tool[],
  { category, query }: { category: string | null; query: string },
): Tool[] {
  const needle = query.trim().toLowerCase();
  return tools.filter((tool) => {
    const matchesCategory = !category || tool.category === category;
    const matchesQuery = !needle || tool.name.toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  });
}

/** Price label as shown on cards and the details tile, e.g. "$6 / day". */
export function formatPricePerDay(pricePerDayUsd: number): string {
  return `$${pricePerDayUsd} / day`;
}

/** Tool-count label for the summary line and filter pills, e.g. "1 tool",
 *  "5 tools". */
export function formatToolCount(count: number): string {
  return `${count} ${count === 1 ? "tool" : "tools"}`;
}
