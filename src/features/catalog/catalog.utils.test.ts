import { describe, expect, it } from "vitest";

import type { Tool } from "./catalog.types";
import {
  deriveCategories,
  filterTools,
  formatPricePerDay,
  formatToolCount,
  isAvailable,
} from "./catalog.utils";

function tool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: "id",
    name: "Name",
    category: "Power tools",
    price_per_day_usd: 5,
    photos: ["https://example.test/1.jpg"],
    description: "",
    condition: "",
    brand_model: "",
    status: "Available",
    ...overrides,
  };
}

const tools: Tool[] = [
  tool({ id: "1", name: "DeWalt Drill", category: "Power tools" }),
  tool({ id: "2", name: "Prusa MK4", category: "3D printing" }),
  tool({
    id: "3",
    name: "Makita Sander",
    category: "Power tools",
    status: "Under maintenance",
  }),
  tool({ id: "4", name: "DeWalt Drill — Unit 2", category: "Power tools" }),
];

describe("isAvailable", () => {
  it("is true only for the Available status", () => {
    expect(isAvailable(tool({ status: "Available" }))).toBe(true);
    expect(isAvailable(tool({ status: "Under maintenance" }))).toBe(false);
    expect(isAvailable(tool({ status: "Retired" }))).toBe(false);
  });
});

describe("deriveCategories", () => {
  it("returns distinct categories in first-seen order", () => {
    expect(deriveCategories(tools)).toEqual(["Power tools", "3D printing"]);
  });
});

describe("filterTools", () => {
  it("filters by category", () => {
    const result = filterTools(tools, { category: "3D printing", query: "" });
    expect(result.map((t) => t.id)).toEqual(["2"]);
  });

  it("matches the name case-insensitively", () => {
    const result = filterTools(tools, { category: null, query: "dewalt" });
    expect(result.map((t) => t.id)).toEqual(["1", "4"]);
  });

  it("does not hide unavailable tools", () => {
    const result = filterTools(tools, { category: "Power tools", query: "" });
    expect(result.map((t) => t.id)).toContain("3");
  });

  it("applies category and query together", () => {
    const result = filterTools(tools, {
      category: "Power tools",
      query: "drill",
    });
    expect(result.map((t) => t.id)).toEqual(["1", "4"]);
  });
});

describe("formatPricePerDay", () => {
  it("formats the daily price", () => {
    expect(formatPricePerDay(6)).toBe("$6 / day");
  });
});

describe("formatToolCount", () => {
  it("singularizes a count of one and pluralizes the rest", () => {
    expect(formatToolCount(1)).toBe("1 tool");
    expect(formatToolCount(0)).toBe("0 tools");
    expect(formatToolCount(5)).toBe("5 tools");
  });
});
