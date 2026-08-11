---
name: design-review
description: Review the current UI changes in a real browser — interaction, responsiveness, polish, and accessibility
---

Run a design review of the UI changes on this branch.

Use the Agent tool to invoke the `design-review` agent. Before doing so, check whether a dev
server is already running and start one (backgrounded) if not — pass the agent the port you
end up on, since it can't guess it.

Give the agent this task:

> Review the UI changes on this branch. Start from `git diff` to identify which routes
> changed, and review only those. Work through your phases: interaction and user flows,
> responsiveness at 320/390/834/1440, visual polish, WCAG 2.2 AA accessibility, and robustness
> (console + network). The dev server is running on the port given above.
>
> Report findings grouped as Blockers, High-Priority, Medium-Priority, and Nitpicks. For
> each, give the location and what you actually observed in the browser. If you could not
> test something, say so rather than passing over it.

Relay the agent's report. If it found nothing, say that plainly rather than padding it.
