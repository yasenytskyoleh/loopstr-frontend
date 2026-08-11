import { afterEach, describe, expect, it, vi } from "vitest";

import { HttpAuthGateway } from "./http-auth-gateway";

const gateway = new HttpAuthGateway("https://api.test");
const credentials = { email: "a@b.com", password: "pw", rememberMe: false };

function mockFetch(value: { ok: boolean; status: number; body?: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: value.ok,
    status: value.status,
    json: async () => value.body ?? {},
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("HttpAuthGateway.signIn", () => {
  it("posts credentials to /auth/login with cookies and resolves on 2xx", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200 });

    await expect(gateway.signIn(credentials)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify(credentials),
      }),
    );
  });

  it("maps an error body code to a typed AuthError", async () => {
    mockFetch({ ok: false, status: 401, body: { code: "INVALID_CREDENTIALS" } });
    await expect(gateway.signIn(credentials)).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
  });

  it("maps lockout statuses to ACCOUNT_LOCKED when the body lacks a known code", async () => {
    mockFetch({ ok: false, status: 423, body: {} });
    await expect(gateway.signIn(credentials)).rejects.toMatchObject({
      code: "ACCOUNT_LOCKED",
    });

    mockFetch({ ok: false, status: 429, body: {} });
    await expect(gateway.signIn(credentials)).rejects.toMatchObject({
      code: "ACCOUNT_LOCKED",
    });
  });

  it("maps an unrecognized status to UNKNOWN_ERROR", async () => {
    mockFetch({ ok: false, status: 500, body: {} });
    await expect(gateway.signIn(credentials)).rejects.toMatchObject({
      code: "UNKNOWN_ERROR",
    });
  });

  it("maps a fetch rejection to NETWORK_ERROR", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(gateway.signIn(credentials)).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
  });
});

describe("HttpAuthGateway.register", () => {
  const account = { fullName: "Maya Lindqvist", email: "a@b.com", password: "pw123456" };

  it("posts the account to /auth/register with cookies and resolves on 2xx", async () => {
    const fetchMock = mockFetch({ ok: true, status: 201 });

    await expect(gateway.register(account)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/auth/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify(account),
      }),
    );
  });

  it("maps a 409 conflict to EMAIL_TAKEN when the body lacks a known code", async () => {
    mockFetch({ ok: false, status: 409, body: {} });
    await expect(gateway.register(account)).rejects.toMatchObject({
      code: "EMAIL_TAKEN",
    });
  });
});

describe("HttpAuthGateway.requestPasswordReset", () => {
  it("posts the email to /auth/forgot-password and resolves on 2xx", async () => {
    const fetchMock = mockFetch({ ok: true, status: 204 });

    await expect(
      gateway.requestPasswordReset({ email: "a@b.com" }),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/auth/forgot-password",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("resolves even on a non-2xx response so the status can't be enumerated", async () => {
    mockFetch({ ok: false, status: 404, body: {} });
    await expect(
      gateway.requestPasswordReset({ email: "unknown@b.com" }),
    ).resolves.toBeUndefined();
  });

  it("rejects only on a transport failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(
      gateway.requestPasswordReset({ email: "a@b.com" }),
    ).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });
});
