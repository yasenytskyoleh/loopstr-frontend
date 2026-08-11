import { afterEach, describe, expect, it } from "vitest";

import { createAuthGateway } from "./create-auth-gateway";

const ORIGINAL = process.env.NEXT_PUBLIC_API_BASE_URL;

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL;
  }
});

describe("createAuthGateway", () => {
  it("fails closed when the API base URL is not configured", () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    expect(() => createAuthGateway()).toThrow(/NEXT_PUBLIC_API_BASE_URL/);
  });

  it("creates a gateway when the API base URL is configured", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";
    expect(createAuthGateway()).toBeDefined();
  });
});
