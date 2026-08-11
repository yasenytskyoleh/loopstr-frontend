---
paths:
  - "**/*.tsx"
  - "app/**/*.css"
---

# Figma → code

Rules for implementing a Figma design (design → code). This is the portable team default — a
checked-in rule that travels when `.claude/` is copied into a new project, not only `CLAUDE.md`,
which can be regenerated.

## Fetch the real design once, up front

- Before writing UI for a Figma frame, you MUST call `get_design_context` on that frame **once**.
  One call returns reference code + a viewable screenshot + token hints — enough to implement from.
- Do NOT code a layout from tokens, a screenshot alone, a written spec, or memory. Tokens + prose
  look plausible but reliably get copy, spacing, radii, control sizing, and icons wrong.
- `get_metadata` is only for cheaply locating sibling frame ids. `get_variable_defs` and
  `get_screenshot` do NOT substitute for `get_design_context`.
- Fetch each frame once, record its copy / structure / tokens, and reuse that. Don't refetch the
  same frame — the responses are large, and re-reading them every later turn is what actually runs
  the context budget up.
- If a returned screenshot can't be downloaded, route around it: open the URL in the browser (this
  repo forbids `curl` to external hosts), or read the returned reference code. Never silently skip
  the design and hand-write from guesses.

## Precedence

- **Figma wins on visual truth**: spacing, radii, typography, shadows, icons, exact dimensions.
- **The product spec (`docs/product/` or equivalent) wins on copy and behavior**: flow, states,
  error strings, accessibility, security. Where wording disagrees, the product doc overrides
  Figma text.
- Reproduce the exact icons the frame references — don't invent SVG paths. Reuse a project icon
  only when its glyph genuinely matches.

## After building

- Write the tokens you pulled into `@theme inline` in `app/globals.css` — the token system, not the
  chat.
- Verify fidelity in the browser, not by re-screenshotting Figma (`ui-verification` skill). You
  already have the numbers; don't refetch the frame to compare.
