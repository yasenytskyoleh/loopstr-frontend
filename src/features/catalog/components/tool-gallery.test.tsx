import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToolGallery } from "./tool-gallery";

const photos = [
  "https://example.test/1.jpg",
  "https://example.test/2.jpg",
  "https://example.test/3.jpg",
  "https://example.test/4.jpg",
];

describe("ToolGallery", () => {
  it("starts on the first photo", () => {
    render(<ToolGallery photos={photos} name="Drill" />);
    expect(screen.getByText("1 of 4")).toBeInTheDocument();
  });

  it("advances with Next", async () => {
    render(<ToolGallery photos={photos} name="Drill" />);
    await userEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("2 of 4")).toBeInTheDocument();
  });

  it("wraps to the last photo when going back from the first", async () => {
    render(<ToolGallery photos={photos} name="Drill" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Previous photo" }),
    );
    expect(screen.getByText("4 of 4")).toBeInTheDocument();
  });

  it("jumps to a photo from its thumbnail", async () => {
    render(<ToolGallery photos={photos} name="Drill" />);
    await userEvent.click(screen.getByRole("button", { name: "Show photo 3" }));
    expect(screen.getByText("3 of 4")).toBeInTheDocument();
  });
});
