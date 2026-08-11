import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Tool } from "../catalog.types";
import { CatalogBrowser } from "./catalog-browser";

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
  tool({ id: "3", name: "Bosch Jigsaw", category: "Power tools" }),
];

describe("CatalogBrowser", () => {
  it("shows the totals line and a card per tool", () => {
    render(<CatalogBrowser tools={tools} />);

    expect(screen.getByText("3 tools · 2 categories")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("filters by name as the Member types and reports the match count", async () => {
    render(<CatalogBrowser tools={tools} />);

    await userEvent.type(screen.getByLabelText("Search tools"), "drill");

    expect(screen.getByText('1 tool · matching "drill"')).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "DeWalt Drill" }),
    ).toBeInTheDocument();
  });

  it("clears the query with the clear button", async () => {
    render(<CatalogBrowser tools={tools} />);

    const search = screen.getByLabelText("Search tools");
    await userEvent.type(search, "drill");
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(search).toHaveValue("");
    expect(screen.getByText("3 tools · 2 categories")).toBeInTheDocument();
  });

  it("filters by category and shows its count in the active pill", async () => {
    render(<CatalogBrowser tools={tools} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Power tools" }),
    );

    expect(
      screen.getByRole("button", { name: "2 tools · Power tools" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("2 tools · Power tools", { selector: "p" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("shows an empty message when nothing matches", async () => {
    render(<CatalogBrowser tools={tools} />);

    await userEvent.type(screen.getByLabelText("Search tools"), "zzz");

    expect(screen.getByText("No tools match your search")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
