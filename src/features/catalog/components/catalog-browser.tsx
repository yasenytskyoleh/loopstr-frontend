"use client";

import { useMemo, useState } from "react";

import { SearchIcon, ZoomOutIcon } from "@/components/ui/icons";

import {
  deriveCategories,
  filterTools,
  formatToolCount,
} from "../catalog.utils";
import type { Tool } from "../catalog.types";
import { CatalogEmptyState } from "./catalog-empty";
import { CategoryFilter } from "./category-filter";
import { SearchField } from "./search-field";
import { ToolCard } from "./tool-card";

/** Homepage catalog: name search + category filter over a server-loaded tool
 *  list. All filtering is client-side over data the server already fetched. */
export function CatalogBrowser({ tools }: { tools: Tool[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const categories = useMemo(() => deriveCategories(tools), [tools]);
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const tool of tools) {
      result[tool.category] = (result[tool.category] ?? 0) + 1;
    }
    return result;
  }, [tools]);
  const visible = useMemo(
    () => filterTools(tools, { category, query }),
    [tools, category, query],
  );

  const trimmedQuery = query.trim();
  const countLine = buildCountLine({
    total: tools.length,
    visible: visible.length,
    categoryCount: categories.length,
    category,
    query: trimmedQuery,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-content-primary">
        Browse tools
      </h1>
      <SearchField value={query} onChange={setQuery} />
      <div className="flex flex-col gap-4">
        <CategoryFilter
          categories={categories}
          counts={counts}
          active={category}
          onChange={setCategory}
        />
        <p className="text-sm text-content-secondary">{countLine}</p>
      </div>
      {renderResults(tools.length, visible)}
    </div>
  );
}

function buildCountLine({
  total,
  visible,
  categoryCount,
  category,
  query,
}: {
  total: number;
  visible: number;
  categoryCount: number;
  category: string | null;
  query: string;
}): string {
  if (total === 0) return "0 tools";
  if (query) return `${formatToolCount(visible)} · matching "${query}"`;
  if (category) return `${formatToolCount(visible)} · ${category}`;
  return `${formatToolCount(total)} · ${categoryCount} categories`;
}

function renderResults(total: number, visible: Tool[]) {
  if (total === 0) {
    return (
      <CatalogEmptyState
        icon={ZoomOutIcon}
        title="No tools in the catalog yet"
        description="When Maker Commons adds tools, they'll show up here."
      />
    );
  }
  if (visible.length === 0) {
    return (
      <CatalogEmptyState
        icon={SearchIcon}
        title="No tools match your search"
        description="Try a different name or pick another category."
      />
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map((tool) => (
        <li key={tool.id}>
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  );
}
