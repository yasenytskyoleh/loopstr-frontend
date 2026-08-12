import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

import { AuthError } from "../auth-errors";
import type { AuthGateway } from "../gateway/auth-gateway";
import { LoginForm } from "./login-form";

const testUser = {
  id: 1,
  email: "user@example.com",
  fullName: "Maya Lindqvist",
  role: "member" as const,
};

function makeGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
  return {
    signIn: vi.fn().mockResolvedValue(testUser),
    register: vi.fn().mockResolvedValue(testUser),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

async function fillCredentials(email = "User@Example.com", password = "s3cret") {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Password"), password);
}

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
});

describe("LoginForm validation", () => {
  it("keeps Log in disabled until both fields are filled", async () => {
    renderWithProviders(<LoginForm gateway={makeGateway()} />);
    const submit = screen.getByRole("button", { name: "Log in" });

    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Password"), "s3cret");
    expect(submit).toBeEnabled();
  });

  it("shows an error and blocks submission for a malformed email", async () => {
    const gateway = makeGateway();
    renderWithProviders(<LoginForm gateway={gateway} />);

    await userEvent.type(screen.getByLabelText("Email"), "not-an-email");
    await userEvent.type(screen.getByLabelText("Password"), "pw");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText("Enter a valid work email address."),
    ).toBeInTheDocument();
    expect(gateway.signIn).not.toHaveBeenCalled();
  });
});

describe("LoginForm submission", () => {
  it("normalizes the email and navigates to the homepage on success", async () => {
    const signIn = vi.fn().mockResolvedValue(testUser);
    renderWithProviders(<LoginForm gateway={makeGateway({ signIn })} />);

    await userEvent.click(screen.getByLabelText("Remember me for 30 days"));
    await fillCredentials();
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(signIn).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "s3cret",
      rememberMe: true,
    });
  });

  it("submits with Enter when the form is valid", async () => {
    const signIn = vi.fn().mockResolvedValue(testUser);
    renderWithProviders(<LoginForm gateway={makeGateway({ signIn })} />);

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "s3cret{Enter}");

    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
  });

  it("prevents duplicate submissions while a request is pending", async () => {
    let resolve: (() => void) | undefined;
    const signIn = vi.fn(
      () =>
        new Promise<typeof testUser>((r) => {
          resolve = () => r(testUser);
        }),
    );
    renderWithProviders(<LoginForm gateway={makeGateway({ signIn })} />);

    await fillCredentials();
    const submit = screen.getByRole("button", { name: "Log in" });
    await userEvent.click(submit);
    await waitFor(() => expect(submit).toBeDisabled());
    await userEvent.click(submit);

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(submit).toHaveAttribute("aria-busy", "true");
    resolve?.();
  });
});

describe("LoginForm errors", () => {
  it("shows generic copy and preserves email but clears password on invalid credentials", async () => {
    const signIn = vi.fn().mockRejectedValue(new AuthError("INVALID_CREDENTIALS"));
    renderWithProviders(<LoginForm gateway={makeGateway({ signIn })} />);

    await fillCredentials("user@example.com", "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText("Email or password is incorrect."),
    ).toBeInTheDocument();
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
      "user@example.com",
    );
    expect((screen.getByLabelText("Password") as HTMLInputElement).value).toBe(
      "",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("shows the account-locked message", async () => {
    const signIn = vi.fn().mockRejectedValue(new AuthError("ACCOUNT_LOCKED"));
    renderWithProviders(<LoginForm gateway={makeGateway({ signIn })} />);

    await fillCredentials();
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText("Too many failed attempts. Try again in 15 minutes."),
    ).toBeInTheDocument();
  });

  it("shows the network-failure message", async () => {
    const signIn = vi.fn().mockRejectedValue(new AuthError("NETWORK_ERROR"));
    renderWithProviders(<LoginForm gateway={makeGateway({ signIn })} />);

    await fillCredentials();
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText(
        "We couldn't reach the server. Check your connection and try again.",
      ),
    ).toBeInTheDocument();
  });
});
