---
name: frontend-testing
description: Use when writing or fixing frontend tests — Vitest and React Testing Library for unit and component tests, Playwright specs for end-to-end flows. Covers what to test, what to leave alone, and the query and mocking rules that keep tests honest.
---

# Frontend testing

Tests encode behaviour so it can't regress. They are not how you confirm a change works right
now — that's the `ui-verification` skill, and it happens in a browser.

Test what a user can perceive. The component's internals are free to change.

## Unit and component tests

Vitest + React Testing Library.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("shows a validation message for an invalid email", async () => {
  const user = userEvent.setup();
  render(<SignupForm />);

  await user.type(screen.getByLabelText("Email"), "nope");
  await user.click(screen.getByRole("button", { name: "Sign up" }));

  expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
});
```

Query priority — this order is not stylistic, it's how close the query is to what a user
actually perceives:

1. `getByRole` (with `name`) — how assistive tech finds it
2. `getByLabelText` — form controls
3. `getByText` — visible content
4. `getByTestId` — last resort, when nothing above can identify it

If `getByRole` can't find your element, that's usually a real accessibility bug the test just
caught. Fix the markup rather than reaching for a test-id.

Rules that keep these tests honest:

- `userEvent`, not `fireEvent` — it produces the full event sequence a real user does.
- `findBy*` for anything async; never `waitFor` around a bare `getBy*`.
- Don't assert on state, props, or class names. Assert on rendered output.
- Don't mock the component under test's own children to make a test pass.
- One behaviour per test, named for the behaviour.

**What not to unit-test:** server components that just `await` and render, third-party library
internals, or types the compiler already proves. A test that restates the implementation costs
maintenance and catches nothing.

Mock at the network boundary (MSW) rather than stubbing your own modules — that way the test
exercises the real data layer including the parsing you rely on.

## End-to-end tests

Reserve Playwright specs for flows where the integration _is_ the feature: sign-up, checkout,
anything spanning auth and navigation. They're slow and they break; earn each one.

```ts
import { test, expect } from "@playwright/test";

test("a member can publish a post", async ({ page }) => {
  await page.goto("/posts/new");
  await page.getByLabel("Title").fill("Hello");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("heading", { name: "Hello" })).toBeVisible();
});
```

Same locator priority as RTL — role and label first. Use web-first assertions
(`await expect(locator).toBeVisible()`), which retry; never `waitForTimeout`, which is a race
condition with a timer on it.

These specs are a different thing from the Playwright MCP: specs are committed files CI runs,
the MCP drives a browser interactively. A project can use either, both, or neither.

### Visual regression

A committed `toHaveScreenshot` spec in `e2e/` pixel-diffs the screens under test against golden
images — the one thing that catches _visual_ drift a tree read can't (see the `ui-verification`
skill, "Structure vs. looks"). Two rules keep it from flaking:

- **Mask anything that changes** — timers, relative timestamps, live counts. Pass `mask: [locator]`
  instead of snapshotting the moving value.
- **Baselines are per-platform.** CI runs Linux, so commit Linux goldens: regenerate with
  `playwright test --update-snapshots` inside `mcr.microsoft.com/playwright:v<version>-jammy`, not
  on macOS. Determinism defaults (animations off, caret hidden, diff tolerance) live in
  `playwright.config.ts`.
