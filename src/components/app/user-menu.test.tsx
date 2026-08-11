import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { UserMenu } from "./user-menu";

beforeEach(() => push.mockClear());

function renderMenu() {
  render(<UserMenu name="Maya Lindqvist" role="Member" initials="ML" />);
}

describe("UserMenu", () => {
  it("keeps the menu closed until the account button is clicked", () => {
    renderMenu();
    expect(
      screen.queryByRole("menuitem", { name: /log out/i }),
    ).not.toBeInTheDocument();
  });

  it("opens the menu and logs out to the login screen", async () => {
    renderMenu();

    await userEvent.click(screen.getByRole("button", { name: /maya/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /log out/i }));

    expect(push).toHaveBeenCalledWith("/login");
  });
});
