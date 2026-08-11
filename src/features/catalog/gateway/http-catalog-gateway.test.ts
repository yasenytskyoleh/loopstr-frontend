import { afterEach, describe, expect, it, vi } from "vitest";

import type { Tool } from "../catalog.types";
import { HttpCatalogGateway } from "./http-catalog-gateway";

const gateway = new HttpCatalogGateway("https://api.test");

const tool: Tool = {
  id: "dewalt-dcd791-drill",
  name: "DeWalt DCD791 Cordless Drill",
  category: "Power tools",
  price_per_day_usd: 6,
  photos: ["https://cdn.test/1.jpg"],
  description: "A drill.",
  condition: "Good",
  brand_model: "DeWalt DCD791",
  status: "Available",
};

function mockFetch(value: { ok?: boolean; status: number; body?: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: value.ok ?? (value.status >= 200 && value.status < 300),
    status: value.status,
    json: async () => value.body ?? {},
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("HttpCatalogGateway.getCatalog", () => {
  it("GETs /tools with cookies and returns the validated list", async () => {
    const fetchMock = mockFetch({ status: 200, body: [tool] });

    await expect(gateway.getCatalog()).resolves.toEqual([tool]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/tools",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("throws on a non-2xx response", async () => {
    mockFetch({ status: 500 });
    await expect(gateway.getCatalog()).rejects.toThrow();
  });

  it("throws when the payload is malformed", async () => {
    mockFetch({ status: 200, body: [{ id: "x" }] });
    await expect(gateway.getCatalog()).rejects.toThrow();
  });
});

describe("HttpCatalogGateway.getTool", () => {
  it("GETs /tools/{id} and returns the validated tool", async () => {
    const fetchMock = mockFetch({ status: 200, body: tool });

    await expect(gateway.getTool(tool.id)).resolves.toEqual(tool);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/tools/dewalt-dcd791-drill",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("returns null on 404", async () => {
    mockFetch({ status: 404 });
    await expect(gateway.getTool("missing")).resolves.toBeNull();
  });

  it("throws on other non-2xx responses", async () => {
    mockFetch({ status: 500 });
    await expect(gateway.getTool("boom")).rejects.toThrow();
  });
});
