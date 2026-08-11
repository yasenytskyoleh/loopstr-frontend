import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AuthError } from "../auth-errors";
import type { AuthGateway } from "../gateway/auth-gateway";
import { ForgotPasswordForm } from "./forgot-password-form";

function makeGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
  return {
    signIn: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const CONFIRMATION = "If an account exists for that email, we've sent a reset link.";

describe("ForgotPasswordForm", () => {
  it("validates a malformed email before submitting", async () => {
    const gateway = makeGateway();
    render(<ForgotPasswordForm gateway={gateway} />);

    await userEvent.type(screen.getByLabelText("Email"), "nope");
    await userEvent.click(screen.getByRole("button", { name: "Send link" }));

    expect(
      await screen.findByText("Enter a valid work email address."),
    ).toBeInTheDocument();
    expect(gateway.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("requests the reset with a normalized email and shows a neutral confirmation", async () => {
    const requestPasswordReset = vi.fn().mockResolvedValue(undefined);
    render(<ForgotPasswordForm gateway={makeGateway({ requestPasswordReset })} />);

    await userEvent.type(screen.getByLabelText("Email"), "User@Example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send link" }));

    expect(await screen.findByText(CONFIRMATION)).toBeInTheDocument();
    expect(requestPasswordReset).toHaveBeenCalledWith({
      email: "user@example.com",
    });
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  it("shows a retry message and no confirmation on failure", async () => {
    const requestPasswordReset = vi
      .fn()
      .mockRejectedValue(new AuthError("NETWORK_ERROR"));
    render(<ForgotPasswordForm gateway={makeGateway({ requestPasswordReset })} />);

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send link" }));

    expect(
      await screen.findByText(
        "We couldn't reach the server. Check your connection and try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(CONFIRMATION)).not.toBeInTheDocument();
  });
});
