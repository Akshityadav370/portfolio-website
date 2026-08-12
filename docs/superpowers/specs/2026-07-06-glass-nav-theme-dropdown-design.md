# Glass Floating Nav + Theme Dropdown — Design

## Goal
Replace the current edge-to-edge nav bar with an iOS-style floating "glass" nav made of two islands, and replace the two separate theme controls (sun/moon mode toggle in the nav, shuffle-on-click `ThemeBadge` pill bottom-left) with a single dropdown that lets visitors pick an exact theme, grouped by Dark/Light.

Validated via the brainstorming visual companion (three shape options compared, then the theme-dropdown placement iterated per feedback — see session screens, not persisted).

## Part 1: Floating glass nav

### Shape: split islands
Two independent floating panes instead of one bar:
- **Logo island** — top-left, small pill, just the `~/akshit` terminal-open button.
- **Actions island** — top-right, pill containing (left to right): nav links (Experience/Projects/Skills/Contact, desktop only) → theme dropdown trigger → Resume link.

Both are `position: fixed`, `top-4`. Logo island is `left-4`; actions island is `right-4`. Both fully rounded (`rounded-full`).

### Glass treatment
Always visible from page load — no scroll-triggered appearance/disappearance (unlike today's transparent-until-scroll behavior). Must work across all 14 themes (9 dark + 5 light) using the existing CSS custom properties (`--surface`, `--edge`, `--foreground`), not hardcoded colors:
- Translucent background (existing `bg-surface` token at reduced opacity, e.g. `bg-surface/60`–`/70`)
- `backdrop-blur-xl` plus a `backdrop-saturate-150` boost, to get the "frosted" look
- `border-edge` (theme already defines this as a translucent, theme-appropriate border color)
- A subtle depth shadow plus a faint inner top highlight (specular-highlight line), to read as glass rather than a flat translucent box — likely needs one small custom CSS utility class since Tailwind has no built-in inset-highlight utility

### Mobile behavior
No new hamburger menu (out of scope). Keep today's behavior of hiding the link list below `md`; the logo island and actions island (now containing the theme dropdown + Resume, no separate mode toggle) both still render, just restyled as glass.

### Removed
The scroll-position-dependent `scrolled` state and its conditional border/background classes in `Nav.tsx` go away entirely — the glass style is unconditional.

## Part 2: Theme dropdown

### Replaces
- The `ModeToggle` sun/moon button in `Nav.tsx` (removed entirely).
- The bottom-left `ThemeBadge` pill (`src/components/ThemeBadge.tsx`, removed entirely, including its import/usage in `page.tsx`).

### What it does not touch
`src/lib/theme.ts`'s `setMode`, `shuffleTheme`, and `setThemeByName` all stay — `Terminal.tsx`'s `theme`/`mode` commands depend on `setMode` and `shuffleTheme` and are unrelated to this change. The new dropdown is simply a new consumer of `setThemeByName` (already exported, already used by the terminal) and reads current theme/mode the same way `ThemeBadge`/`ModeToggle` already do (`useSyncExternalStore` + `MutationObserver` on `data-theme`/`data-mode`, matching the existing pattern so there's no new hydration-mismatch risk).

### Placement
Sits between the nav links and the Resume button inside the actions island (confirmed via mockup iteration — initially proposed as a separate island, moved per feedback to live inline in the actions pill).

### Trigger (closed state)
Compact: a small accent-colored glyph (reusing the existing `◐` from the old `ThemeBadge`) plus a caret, no theme name shown — matches the approved mockup and keeps the already-crowded actions island compact. Clicking toggles the dropdown panel open/closed.

### Panel (open state)
Absolutely positioned below the trigger, same glass treatment as the islands themselves. Two labeled groups, in this order: **Dark**, then **Light**, each listing that group's themes from `DARK_THEMES`/`LIGHT_THEMES` (`src/data/themes.ts`) in their existing declared order. Each row shows a small color swatch and the theme's name. The current theme's row is visually highlighted (matches the approved mockup's `active` row treatment).

**Swatch colors:** a row previews a theme that may not be the currently-active one, so it cannot read `var(--accent)` (that reflects only whichever theme is live on `<html>` right now). It needs each theme's actual accent hex value regardless of what's active. Add a small `THEME_ACCENTS: Record<string, string>` lookup (one hex per theme name) next to `DARK_THEMES`/`LIGHT_THEMES` in `src/data/themes.ts`, copied from each theme's `--accent` value already declared in `globals.css`, and use it for the swatch's inline `background` color.

### Interaction
- Clicking a row calls `setThemeByName(name)` (already handles switching mode if the picked theme is in the other pool) and closes the panel.
- Closes on: selecting a row, clicking outside the panel, and Escape key.
- No other new behavior (no keyboard arrow navigation, no search/filter) — YAGNI for a 14-item list.

## Out of scope
- Mobile hamburger menu.
- Any change to the pre-paint boot script in `layout.tsx` that picks the initial theme by time of day.
- Any change to `Terminal.tsx`'s `theme`/`mode` commands or to `setMode`/`shuffleTheme` in `theme.ts`.
- Scroll-position-based style variation for the glass nav (it's unconditional now).
