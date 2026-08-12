import { describe, expect, it } from "vitest";

import { formatRole, getInitials } from "./auth.utils";

describe("getInitials", () => {
  it("takes the first and last word initials for a multi-word name", () => {
    expect(getInitials("Maya Lindqvist")).toBe("ML");
    expect(getInitials("Maya Elena Lindqvist")).toBe("ML");
  });

  it("takes the first two letters of a single-word name", () => {
    expect(getInitials("Maya")).toBe("MA");
  });
});

describe("formatRole", () => {
  it("capitalizes the role", () => {
    expect(formatRole("member")).toBe("Member");
  });
});
