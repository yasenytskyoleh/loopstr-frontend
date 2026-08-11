---
name: ui-verification
description: Use after changing anything a user will see — a component, a route, styling, layout, copy — to confirm it actually renders and behaves in a real browser. Covers which browser tooling to reach for, what to exercise, and how to report what you observed.
---

# UI verification

A green build is not verification. `pnpm lint`, `pnpm typecheck`, and `pnpm test` passing tells
you the code compiles and the assertions someone thought to write still hold. It tells you
nothing about whether the page renders.

If you changed something a user looks at, look at it.

This is not the same job as writing tests — that's the `frontend-testing` skill. A test stops a
regression later. Verification confirms the thing works now.

## Which browser you have

Two different toolsets. Check which is present before planning the loop:

- **Browser tools** (`mcp__Claude_Browser__*`) — present in the Claude Code desktop and web apps.
  Prefer these when they exist: nothing to install, no separate process to manage.
- **Playwright MCP** (`mcp__plugin_playwright_playwright__browser_*`) — comes from the
  `playwright` plugin this repo enables, so it's there on every surface including the terminal.

Never request computer use or control of the machine's screen. (`mcp__Claude_Browser__computer`
is _not_ that, despite the name — it's mouse and keyboard scoped to the browser pane, and it's
the right tool for clicking and typing there.)

If neither toolset is available, say so and stop short of claiming the change is verified.
"I couldn't check this in a browser" is a legitimate report. "Typecheck passes" dressed up as
verification is not.

## The loop

| Step                 | Browser tools                                                                                 | Playwright MCP                                       |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Start the app        | `preview_start` — a `name` from `.claude/launch.json`, or a `url` if the server is already up | `pnpm dev` backgrounded, then navigate               |
| Go to the route      | `navigate`                                                                                    | `browser_navigate`                                   |
| See what's there     | `read_page`                                                                                   | `browser_snapshot`                                   |
| Click / type / press | `computer`                                                                                    | `browser_click`, `browser_type`, `browser_press_key` |
| Resize               | `resize_window`                                                                               | `browser_resize`                                     |
| Console              | `read_console_messages`                                                                       | `browser_console_messages`                           |
| Network              | `read_network_requests`                                                                       | `browser_network_requests`                           |
| Screenshot           | `computer` with `action: "screenshot"`                                                        | `browser_take_screenshot`                            |

## Keep it cheap

These tools return text for almost everything — spend that, not image tokens. A screenshot is
the one expensive output here, and re-reading a huge page tree every turn is the quiet one.

- **Read the tree, not pixels.** `read_page` / `browser_snapshot` tells you what the DOM
  actually contains; a screenshot only shows what it looks like. Reach for a screenshot only when
  the question is genuinely visual — spacing, alignment, contrast — and take it _once, as proof_,
  not once per step.
- **Focus the read.** `read_page` truncates at ~50k chars, so don't pull a giant tree
  repeatedly. Narrow it: `filter: "interactive"`, a `ref_id`/`depth` subtree, or `find` for one
  element's ref. `get_page_text` when you only need the visible copy.
- **Filter console and network.** `read_console_messages` with `onlyErrors` / `pattern`,
  `read_network_requests` with `urlPattern` / `limit` — a filtered check beats dumping every
  line into context.
- **Scope the screenshot when you do need one.** `resize_window` to the viewport under test, and
  `computer`'s `zoom` / `region` to capture just the area in question, rather than a full page at
  full size.

## Structure vs. looks

A tree read tells you the DOM is _correct_ — right roles, labels, text, no console or network
errors. It cannot tell you the page _looks_ right; identical markup can render fine or broken.
Those are different jobs, and which visual method you reach for depends on the environment:

- **Ad-hoc "does this look off?"** — one scoped screenshot, judge it. Cheap, no baseline.
- **Does it match Figma?** — screenshot against the frame, or assert the computed style of a few
  known tokens (`getComputedStyle` via `javascript_tool` / `browser_evaluate`) — e.g. the primary
  button is `#4f39f6`. The `figma-design-to-code` rule covers pulling those values from the frame.
- **A full visual audit** — `/design-review` puts a dedicated agent on every breakpoint and WCAG.
- **Catch drift automatically over time** — a committed pixel-diff spec in `e2e/`
  (`toHaveScreenshot`); see the `frontend-testing` skill.

So "console clean, elements present" is a real result — just don't report it as "looks right."

## What to exercise

Walk the real path — click, type, submit. Then the parts nobody builds:

- **Empty and error states.** Usually never rendered during development.
- **Loading**, especially anything streaming or suspended.
- **Hydration mismatches.** Server and client rendered different markup. Console-only; the page
  often looks correct until it doesn't.
- **Layout shift**, typically an image without `width`/`height`.
- **Keyboard.** Tab to the control you added. Focus visible, activates on Enter/Space.
- **A narrow viewport**, if you touched anything responsive.

Console and network are not optional. A silent 500 or a hydration warning is a failure even when
the page looks right.

## Report what you observed

In those terms — what you did, what happened:

> Loaded `/pricing`, clicked Subscribe. Dialog opened with focus on the first field. Console
> clean. At 375px the card grid overflows horizontally.

Not "the change works." And if something was untestable — a route behind auth, a state you
couldn't reach, no dev server — say that rather than letting silence imply you checked.

For a full audit rather than a quick confirmation — every breakpoint, WCAG 2.2 AA, visual
polish — run `/design-review`, which puts a dedicated agent on it.
