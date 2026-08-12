import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

const useCurrentUser = vi.fn();
vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: () => useCurrentUser(),
}));

import { AppHeader } from "./app-header";

describe("AppHeader", () => {
  it("shows the signed-in account's name, role and initials", () => {
    useCurrentUser.mockReturnValue({
      data: { id: 1, email: "maya@example.com", fullName: "Maya Lindqvist", role: "member" },
    });

    render(<AppHeader />);

    expect(
      screen.getByRole("button", { name: /maya lindqvist/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(screen.getByText("ML")).toBeInTheDocument();
  });

  it("renders no account button when there is no signed-in account", () => {
    useCurrentUser.mockReturnValue({ data: null });

    render(<AppHeader />);

    expect(
      screen.queryByRole("button", { name: /maya/i }),
    ).not.toBeInTheDocument();
  });
});
