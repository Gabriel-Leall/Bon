# Bon Companion

Bon is both the product's visual identity and its contextual companion. It is an interface state renderer, not an external AI agent: every reaction is selected from local, explainable product data.

## Visual contract

- The approved `public/bon/bon-approved.png` is the app symbol and reference for the companion. `bon-face-base.png` preserves the same silhouette while the local SVG eye layer handles expressions.
- The body stays predominantly periwinkle, anchored to `#6674E8`, with only the subtle tonal depth of the approved art.
- The silhouette is the Bon symbol in native application icons, favicons, loading, navigation, and the public site.
- Eyes remain pupil-free and subtly asymmetric. The mouth is hidden at rest and appears for speech or laughter; its center stays fixed while only its opening changes.
- The physical book, speech bubble, eye motion, and mouth opening are lightweight local presentation layers. The mouth stays centered: speech only opens and closes it.
- Legacy Bon sprite assets and `src/lib/bon-chan.ts` are not part of this implementation.

The character concept came from [App Genie Icons](https://icons.appg.co/#icons), which states that its icons are free for personal and commercial use. Bon does not ship the Bible Strong animation package; companion motion is implemented locally with CSS and GSAP.

## State selection

Pure decisions live in `src/lib/bon-domain.ts` and are tested independently from rendering.

- **Today:** compact idle presence, wake-up on first use of a new day, drowsiness near the configured wrap-up time, and sleep after the daily plan reaches `wrapped_up`.
- **Focus:** Bon reads an open book without speaking. Only a timed calendar event starting within five minutes interrupts the reading; timer completion does not.
- **Analysis:** a free-floating companion in the lower-right corner maps evidence levels to curious, proud, happy, attentive, or concerned states and comments without enclosing the avatar in a panel.
- **Wrap-up:** completion, the essential task, habits, and remaining load select a firm but non-punitive reaction.
- **Direct interaction:** nearby pointer movement, restrained click reactions, a short acknowledgement after repeated clicks, and a brief nap after three minutes without input.

## Persistence and accessibility

Persistent controls belong to `AppPreferences` and use the typed Tauri preferences command:

- `buddy_enabled`
- `buddy_proactive_messages_enabled`
- `buddy_reduced_motion`
- `buddy_sound_enabled`
- `buddy_intro_seen`
- `buddy_last_seen_date`

The operating-system `prefers-reduced-motion` preference always disables Bon animation. The explicit app option additionally disables GSAP pointer tracking and CSS motion. Sounds are disabled by default and use the system audio output, so operating-system mute remains authoritative.

## Adding a reaction

1. Add the state to `BonState` only when it represents a real product condition.
2. Add or reuse a visual treatment in `BonAvatar.tsx` and `bon.css`, preserving the approved silhouette.
3. Select it through a pure function in `bon-domain.ts`.
4. Add a focused domain test and translated copy if a speech bubble is necessary.

Avoid random speech, fake processing delays, punishment, streak pressure, or messages triggered only to make Bon look busy.
