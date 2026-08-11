import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { AuthError } from "../auth-errors";
import type { AuthGateway } from "../gateway/auth-gateway";
import { RegisterForm } from "./register-form";

function makeGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
  return {
    signIn: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

async function fillForm({
  fullName = "Maya Lindqvist",
  email = "User@Example.com",
  password = "Password1",
  confirmPassword = password,
}: Partial<Record<
  "fullName" | "email" | "password" | "confirmPassword",
  string
>> = {}) {
  await userEvent.type(screen.getByLabelText("Full name"), fullName);
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.type(screen.getByLabelText("Confirm password"), confirmPassword);
}

beforeEach(() => push.mockClear());

describe("RegisterForm validation", () => {
  it("keeps Create account disabled until every field is filled", async () => {
    render(<RegisterForm gateway={makeGateway()} />);
    const submit = screen.getByRole("button", { name: "Create account" });

    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Full name"), "Maya Lindqvist");
    await userEvent.type(screen.getByLabelText("Email"), "maya@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "Password1");
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Confirm password"), "Password1");
    expect(submit).toBeEnabled();
  });

  it("rejects a password that misses the length/letter/number rule", async () => {
    const gateway = makeGateway();
    render(<RegisterForm gateway={gateway} />);

    await fillForm({ password: "abcdefg", confirmPassword: "abcdefg" });
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("At least 8 characters, with a letter and a number."),
    ).toBeInTheDocument();
    expect(gateway.register).not.toHaveBeenCalled();
  });

  it("blocks submission when the passwords do not match", async () => {
    const gateway = makeGateway();
    render(<RegisterForm gateway={gateway} />);

    await fillForm({ password: "Password1", confirmPassword: "Password2" });
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
    expect(gateway.register).not.toHaveBeenCalled();
  });
});

describe("RegisterForm submission", () => {
  it("registers with a normalized payload and navigates to the homepage", async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    render(<RegisterForm gateway={makeGateway({ register })} />);

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(register).toHaveBeenCalledWith({
      fullName: "Maya Lindqvist",
      email: "user@example.com",
      password: "Password1",
    });
  });

  it("shows the taken-email error inline and does not navigate", async () => {
    const register = vi.fn().mockRejectedValue(new AuthError("EMAIL_TAKEN"));
    render(<RegisterForm gateway={makeGateway({ register })} />);

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText(
        "An account with this email already exists. Log in instead.",
      ),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a top-level alert on a network failure", async () => {
    const register = vi.fn().mockRejectedValue(new AuthError("NETWORK_ERROR"));
    render(<RegisterForm gateway={makeGateway({ register })} />);

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText(
        "We couldn't reach the server. Check your connection and try again.",
      ),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
