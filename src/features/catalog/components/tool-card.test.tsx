import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Tool } from "../catalog.types";
import { ToolCard } from "./tool-card";

function tool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: "dewalt-dcd791-drill",
    name: "DeWalt DCD791 Cordless Drill",
    category: "Power tools",
    price_per_day_usd: 6,
    photos: ["https://example.test/1.jpg"],
    description: "",
    condition: "",
    brand_model: "",
    status: "Available",
    ...overrides,
  };
}

describe("ToolCard", () => {
  it("renders the tool summary and links to its details", () => {
    render(<ToolCard tool={tool()} />);

    expect(
      screen.getByRole("heading", { name: "DeWalt DCD791 Cordless Drill" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Power tools")).toBeInTheDocument();
    expect(screen.getByText("$6 / day")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "DeWalt DCD791 Cordless Drill" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/tools/dewalt-dcd791-drill",
    );
  });

  it("labels an unavailable tool without offering any booking action", () => {
    render(<ToolCard tool={tool({ status: "Under maintenance" })} />);

    expect(screen.getByText("Currently unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
