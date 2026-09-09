# Surface Brief: Daily Closure

## Intent

Help the user close the day without turning the ritual into bookkeeping. The
surface should acknowledge what moved, expose only the carry-over decisions
that still matter, and make tomorrow visible before the user confirms.

## Product Context

- Entry point: the `Encerrar o dia` action at the end of `Hoje`.
- Primary job: review today, decide what continues, choose tomorrow's first
  focus, then persist the closure.
- Data identities remain distinct: task, event, focus session and habit are
  summarized together but are never presented as the same object.
- The native reminder and its configurable schedule are a subsequent round;
  this surface round establishes the complete closure decision flow first.

## Visual Direction

- Calm desktop ritual with one enclosing neumorphic layer.
- Avoid a dashboard of cards. Summary signals sit in a divided strip; the two
  decision regions are direct sections of the dialog.
- Tomorrow receives the stronger raised layer because it is the forward-looking
  decision and must appear before the final confirmation.
- Use active-theme semantic tokens for `light`, `dark` and `cream`; color is
  reserved for state and accent, never for shadows.

## Information Hierarchy

1. Title and short explanation.
2. Compact summary: completed tasks, commitments, focus time and habits.
3. Tomorrow: commitments first, then the first-focus choice.
4. Open work that may move to tomorrow.
5. Explicit final action and reversible dismissal.

## Interaction Rules

- Carry-over tasks are selected explicitly and default to the relevant open
  work from today, not every task in the database.
- Tomorrow's focus candidates combine already-dated tomorrow tasks and selected
  carry-over work without duplicates.
- Empty states explain what is absent without blocking closure.
- Keyboard focus, pressed states and status are perceivable without color alone.
- The layout becomes one column before its sections become cramped and the
  content scrolls inside the dialog on short windows.
