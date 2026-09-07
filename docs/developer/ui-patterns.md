# UI Patterns

## Overview

This app uses a modern CSS stack optimized for Tauri desktop applications:

- **Tailwind CSS v4** with CSS-based configuration
- **shadcn/ui v4** component library
- **Semantic design tokens** backed by OKLCH palette values
- **Desktop-specific defaults** for native app feel

## Tailwind v4 Configuration

Tailwind v4 uses CSS-based configuration instead of `tailwind.config.js`.

### File Structure

```
src/
├── App.css              # Main window styles + Tailwind imports
├── quick-pane.css       # Quick pane window styles
└── theme-variables.css  # Shared theme variables (colors, radii)
```

**Multi-window theming**: `theme-variables.css` is imported by both `App.css` and `quick-pane.css` so all windows share the same theme tokens. When adding new color variables, add them to `theme-variables.css`.

### Structure

```css
@import 'tailwindcss'; /* Core Tailwind */
@import 'tw-animate-css'; /* Animation utilities */

@custom-variant dark (&:is(.dark *)); /* Dark mode variant */

@theme inline {
  /* Map CSS variables to Tailwind tokens */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */
}

:root {
  /* Light mode values */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

.dark {
  /* Dark mode overrides */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}

@layer base {
  /* Global base styles */
}
```

### Key Concepts

| Directive              | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `@theme inline`        | Maps CSS variables to Tailwind's design token system |
| `@custom-variant dark` | Enables `dark:` prefix based on `.dark` class        |
| `@layer base`          | Base styles that apply globally                      |

### Adding Custom Colors

To add a new semantic color:

```css
@theme inline {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
}

:root {
  --success: oklch(0.7 0.15 145);
  --success-foreground: oklch(1 0 0);
}

.dark {
  --success: oklch(0.6 0.15 145);
  --success-foreground: oklch(1 0 0);
}
```

Then consume the semantic alias with Tailwind, for example `text-success` or
`bg-success/10`.

CSS is required at the token boundary because Tailwind v4 reads its theme from
CSS. Component code should still use Tailwind utilities: palette values live in
CSS variables, `@theme inline` exposes semantic aliases, and JSX consumes those
aliases such as `bg-surface`, `border-border-strong`, or `text-destructive`.
This keeps light, dark, cream, and accent changes out of individual components.

## Appearance Themes and Accents

### How It Works

1. **ThemeProvider** (`src/components/ThemeProvider.tsx`) manages the surface
   theme and identity accent as independent preferences.
2. Adds the resolved `.light`, `.dark`, or `.cream` class to `<html>`.
3. Adds `data-axis-accent="blue|purple|red"` to `<html>`.
4. Syncs native chrome with Tauri `app.setTheme()`; cream maps to light and
   system delegates to the operating system.
5. Semantic CSS variables feed the Tailwind v4 bridge, so components use
   utilities such as `bg-background`, `bg-primary`, and `ring-ring`.

### Theme Options

- `light` - Force light mode
- `dark` - Force dark mode
- `cream` - Force the warm paper-like light surface
- `system` - Follow OS preference (default)

The independent accent options are `blue` (default), `purple`, and `red`.
Status colors such as success, warning, destructive, and information do not
change with the selected accent.

## App Shell Navigation

The main window uses a stable desktop-first navigation column:

- Wide mode uses `--axis-sidebar-width` (`15rem`) with icon and translated
  label.
- Below `1100px`, the same destinations collapse to
  `--axis-sidebar-width-compact` (`3.5rem`). Labels become screen-reader-only
  and each control exposes a tooltip.
- In wide mode, the header control lets the user manually collapse the column
  to the same icon rail without hiding navigation. The title-bar action and
  `Cmd/Ctrl+1` remain the separate affordances for hiding the sidebar entirely.
- Primary order is fixed: Today, Tasks, Notes, Calendar, Habits, Focus, and
  Analysis.
- Quick Capture and Settings stay in a separate utility area at the bottom.
- The active item combines `aria-current="page"`, stronger text weight,
  a raised foreground layer, surface contrast, and a leading rail. Pressing it
  temporarily uses the inset state; the stable selection never depends on
  color alone.
- The sidebar uses the semantic `sidebar-*` tokens in every surface theme and
  selected accent. Page-specific CSS must not resize or recolor the shell.

Use canonical page IDs from `ui-store.ts`. Compatibility with old IDs belongs
inside `normalizeAppPage`, not in components or event listeners. The global
`#axis-active-focus-controller` region lives in `MainWindow` so an active timer
can remain reachable while the user navigates elsewhere.

### Using in Components

```tsx
// Access theme in components
import { useTheme } from '@/hooks/use-theme'

function MyComponent() {
  const { theme, accent, setAccent } = useTheme()

  return (
    <button onClick={() => setAccent('purple')}>
      {theme} / {accent}
    </button>
  )
}
```

### Why Resolved Classes (Not `light-dark()`)

This app uses resolved root classes rather than CSS `light-dark()` because:

- Standard pattern for shadcn/ui ecosystem
- JavaScript control over theme switching
- Supports `system` preference detection while preserving cream as an explicit
  third surface
- Compatible with all shadcn components

## OKLCH Colors

All colors use the OKLCH color space for perceptual uniformity.

### Format

```css
oklch(lightness chroma hue)
oklch(0.7 0.15 250)  /* L: 0-1, C: 0-0.4, H: 0-360 */
```

### Why OKLCH

- **Perceptually uniform** - Equal steps in values = equal perceived change
- **Wide gamut** - Access to P3 display colors
- **Intuitive** - Lightness is predictable (unlike HSL)

### Color Palette Structure

| Token                                    | Purpose                   |
| ---------------------------------------- | ------------------------- |
| `--background` / `--foreground`          | Page background and text  |
| `--card` / `--card-foreground`           | Card surfaces             |
| `--primary` / `--primary-foreground`     | Primary actions           |
| `--secondary` / `--secondary-foreground` | Secondary actions         |
| `--muted` / `--muted-foreground`         | Subdued elements          |
| `--accent` / `--accent-foreground`       | Highlights                |
| `--destructive`                          | Destructive actions (red) |
| `--border` / `--input` / `--ring`        | Borders and focus rings   |

## Desktop-Specific Styles

The `@layer base` section includes styles that make the app feel native on desktop.

### Text Selection

```css
body {
  user-select: none; /* Disable by default */
}

input,
textarea,
[contenteditable='true'] {
  user-select: text !important; /* Enable in editable areas */
}
```

**Why:** Desktop apps typically don't allow selecting UI text, only content.

### Cursor

```css
* {
  cursor: default; /* Arrow cursor everywhere */
}

input,
textarea {
  cursor: text !important;
}

.cursor-pointer {
  cursor: pointer !important;
}
```

**Why:** Native apps use arrow cursor, not text cursor on labels.

### Scroll Behavior

```css
body {
  overscroll-behavior: none; /* Prevent bounce/refresh */
  overflow: hidden; /* Prevent body scroll */
}
```

**Why:** Prevents pull-to-refresh and elastic scrolling that feels wrong in desktop apps.

### Drag Regions

```css
*[data-tauri-drag-region] {
  -webkit-app-region: drag;
  app-region: drag;
}
```

Apply `data-tauri-drag-region` to elements that should drag the window (like title bars).

## Component Organization

```
src/components/
├── layout/           # App structure
│   ├── MainWindow.tsx
│   ├── LeftSideBar.tsx
│   ├── RightSideBar.tsx
│   └── MainWindowContent.tsx
├── titlebar/         # Window chrome
│   ├── TitleBar.tsx
│   ├── MacOSWindowControls.tsx
│   └── WindowsWindowControls.tsx
├── ui/               # shadcn primitives
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── segmented-control.tsx
│   └── ...
├── command-palette/  # Command palette feature
├── preferences/      # Preferences dialog
├── ThemeProvider.tsx
└── ErrorBoundary.tsx
```

### Conventions

- **layout/** - Structural components that define app regions
- **titlebar/** - Platform-specific window controls
- **ui/** - owned shadcn/ui primitives customized through shared semantic tokens
- **Feature folders** - Group related components together

## shadcn/ui Usage

### Adding Components

```bash
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add dialog
```

Components are copied to `src/components/ui/` and can be customized.

### Customizing Components

shadcn components are yours to modify. Common customizations:

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva('...', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      // Add custom variant
      success: 'bg-success text-success-foreground',
    },
  },
})
```

### Available Components

This app includes commonly needed components. Run
`bunx --bun shadcn@latest add [component]` to add more from
[ui.shadcn.com](https://ui.shadcn.com/docs/components).

## Shared Control Vocabulary

Controls use the same compact desktop geometry and semantic state language:

- Heights: `h-8` for compact controls, `h-9` by default, and `h-10` for
  prominent actions.
- Surfaces: `bg-surface` by default, `bg-surface-sunken` when disabled, and
  `bg-surface-elevated` for floating content.
- Borders: `border-border`, stronger on hover/focus, subtle when disabled.
- Focus: `shadow-focus-ring` for actions and choices;
  `shadow-focus-input` for editable or selection fields.
- Invalid: fixed `destructive` border and error shadow, independent from the
  user-selected accent.
- Disabled: always combines cursor, surface, border, and text changes; opacity
  is never the only signal.
- Depth: a restrained neumorphic vocabulary communicates physical state.
  Raised controls use `shadow-neu-raised-sm`, panels use
  `shadow-neu-raised`, and editable/pressed surfaces use
  `shadow-neu-pressed`. Light falls vertically from the top edge and shadows
  project downward; avoid diagonal bright casts that can reverse the perceived
  elevation. Borders and contrast remain present so depth is never the only
  state cue.
- Accent: neumorphic shadows stay neutral. `primary` and `ring` may color the
  action, selection border, or focus treatment, but never the cast shadow.

Use `SegmentedControl` for a short, mutually exclusive view or mode choice. It
requires an accessible group label, accepts controlled `value` and
`onValueChange`, and intentionally ignores an attempt to deselect the active
option. Radix supplies roving focus, arrow-key navigation, and radio semantics
with `aria-checked` for the selected segment.

## The `cn()` Utility

All components use the `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils'

function MyComponent({ className, disabled }) {
  return (
    <div
      className={cn(
        'base-styles here',
        disabled && 'opacity-50',
        className // Allow overrides
      )}
    >
      ...
    </div>
  )
}
```

**Pattern:** Always accept `className` prop and merge with `cn()` for flexibility.

## Component Patterns

### Layout Components

Layout components should:

- Accept `children` and `className` props
- Use flexbox with `overflow-hidden` to prevent content bleed
- Not set external margins (let parent control spacing)

```tsx
interface SideBarProps {
  children?: React.ReactNode
  className?: string
}

export function LeftSideBar({ children, className }: SideBarProps) {
  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {children}
    </div>
  )
}
```

### Visibility with CSS

For panels that toggle visibility, prefer CSS over conditional rendering:

```tsx
// Good: Preserves component state
;<ResizablePanel className={cn(!visible && 'hidden')}>
  <SideBar />
</ResizablePanel>

// Avoid: Loses component state on hide/show
{
  visible && <SideBar />
}
```

This preserves scroll position, form state, and resize dimensions.

## Best Practices

### Do

- Use semantic color tokens (`bg-background`, `text-foreground`)
- Accept `className` prop on components
- Use `cn()` for conditional classes
- Keep desktop UX conventions (cursor, selection, scroll)
- Follow existing patterns in codebase

### Don't

- Use raw color values (`bg-white`, `text-gray-900`)
- Hardcode light/dark specific values
- Introduce per-page variants when a shared semantic component can express the
  same need
- Add `cursor-pointer` everywhere (only for actual clickable elements)
- Use viewport-based responsive design (this is a fixed-size desktop app)

## Dashboard Widget Surface Pattern

The dashboard widgets follow a shared shell style in `src/components/grid/WidgetCard.tsx` and `src/components/grid/grid.css`.

Pattern goals:

- **Fast scan header**: compact uppercase title rail with icon and status chip.
- **Unified drag affordance**: dragging always starts from `.widget-drag-handle`.
- **Layered surfaces**: the card body uses a raised semantic surface, its rail
  uses `surface-elevated`, and embedded controls may use the pressed surface.
- **Interaction consistency**: hover lift, resize handle, and drag placeholder use the same token system.
- **Contextual emphasis**: adaptive dashboard styling may change emphasis, but
  it must not reorder the saved layout, force hidden widgets back into view, or
  generate decorative gradients.

When adding new widgets, compose content inside `WidgetCard` and avoid re-implementing card chrome per widget.
