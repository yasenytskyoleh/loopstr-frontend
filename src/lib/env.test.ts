import { afterEach, describe, expect, it } from "vitest";

import { requireApiBaseUrl } from "./env";

const ORIGINAL = process.env.NEXT_PUBLIC_API_BASE_URL;

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL;
  }
});

describe("requireApiBaseUrl", () => {
  it("appends the /api/v1 prefix", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.loopstr.app";
    expect(requireApiBaseUrl()).toBe("https://api.loopstr.app/api/v1");
  });

  it("strips a trailing slash before appending the prefix", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.loopstr.app/";
    expect(requireApiBaseUrl()).toBe("https://api.loopstr.app/api/v1");
  });

  it("throws when unconfigured", () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    expect(() => requireApiBaseUrl()).toThrow(/NEXT_PUBLIC_API_BASE_URL/);
  });
});
