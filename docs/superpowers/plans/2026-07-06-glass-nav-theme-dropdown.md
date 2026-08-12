# Glass Floating Nav + Theme Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current edge-to-edge nav bar into two floating "glass" pill islands (logo top-left, links+actions top-right), and replace the sun/moon mode toggle plus the bottom-left shuffle-on-click `ThemeBadge` with one dropdown (grouped Dark/Light) living inside the actions island, next to Resume.

**Architecture:** `Nav.tsx` splits its single fixed header into two independent `position: fixed` pill elements, both always rendered with a shared `.glass-panel` CSS utility (translucent `bg-surface`, `backdrop-blur-xl`, `border-edge`, plus a depth shadow + inset highlight defined once in `globals.css` since Tailwind has no inset-highlight utility). A new `ThemeDropdown.tsx` component (its own file — it owns open/close state, outside-click/Escape handling, and the grouped theme list) replaces the old inline `ModeToggle`. `ThemeBadge.tsx` is deleted outright once its job is fully covered by the new dropdown.

**Tech Stack:** Next.js 16 App Router, React 19 client components, Tailwind v4 (`@theme inline` tokens already defined in `globals.css`), no new dependencies.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-06-glass-nav-theme-dropdown-design.md` — read it before starting if anything below is unclear.
- **No test runner exists in this repo** (no jest/vitest). Verification is `npm run build`, `npm run lint`, the dev server, and manual/Playwright browser checks — matching this project's established convention.
- **Never run `git commit`.** Per this project's CLAUDE.md, the owner commits and pushes himself. Leave changes staged/unstaged after each task.
- Must work across all 14 themes (9 dark + 5 light) via the existing CSS custom properties (`--surface`, `--edge`, `--foreground`, `--accent`) — no hardcoded colors in component/utility CSS (the one exception, per spec, is the `THEME_ACCENTS` swatch lookup, which necessarily hardcodes each theme's accent hex so a swatch can preview a theme that isn't currently active).
- Islands: `position: fixed`, `top-4`; logo island `left-4`; actions island `right-4`; both `rounded-full`.
- Glass utility: `bg-surface/60`, `backdrop-blur-xl`, `backdrop-saturate-150`, `border border-edge`, plus the new `.glass-panel` CSS class for shadow/highlight.
- Always-glass: no scroll-triggered show/hide — remove the existing `scrolled` state entirely.
- No mobile hamburger menu (out of scope) — keep the existing `hidden md:flex` behavior for the link list.
- Theme dropdown does not touch `setMode`, `shuffleTheme` in `src/lib/theme.ts` (still used by `Terminal.tsx`) — it only calls the existing `setThemeByName`.
- Path alias `@/` maps to `src/`.

---

### Task 1: Floating glass nav shape

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/Nav.tsx`

**Interfaces:**
- Produces: a `.glass-panel` CSS class (shadow + inset highlight only — background/blur/border come from Tailwind utility classes applied alongside it) available to any component. Task 2's `ThemeDropdown` panel reuses this same class.
- No change yet to `ModeToggle` — this task only reshapes the nav's structure/positioning. Task 2 replaces `ModeToggle` with `ThemeDropdown`.

- [ ] **Step 1: Add the `.glass-panel` utility to `globals.css`**

Find this existing block (around line 418-430):
```css
/* Light mode: cards need shadows to lift off the tinted background */
[data-mode="light"] .tilt-card,
[data-mode="light"] .lift {
  box-shadow:
    0 1px 2px rgba(20, 24, 40, 0.05),
    0 8px 24px rgba(20, 24, 40, 0.08);
}

[data-mode="light"] .tilt-card:hover {
  box-shadow:
    0 2px 4px rgba(20, 24, 40, 0.06),
    0 16px 40px rgba(20, 24, 40, 0.12);
}
```

Immediately after it, add:
```css

/* Floating glass nav islands + theme dropdown panel: a depth shadow plus a
   faint inset top highlight so translucent panels read as glass rather
   than a flat tinted box. Background/blur/border come from Tailwind
   utility classes (bg-surface/60, backdrop-blur-xl, border-edge) applied
   alongside this class — this only supplies what Tailwind has no utility
   for. */
.glass-panel {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 20%, transparent);
}

[data-mode="light"] .glass-panel {
  box-shadow:
    0 1px 2px rgba(20, 24, 40, 0.05),
    0 8px 24px rgba(20, 24, 40, 0.1),
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 30%, transparent);
}
```

- [ ] **Step 2: Restructure `Nav.tsx` into two floating islands**

Replace the entire contents of `src/components/Nav.tsx` with:
```tsx
"use client";

import { useSyncExternalStore } from "react";
import { profile } from "@/data/resume";
import { setMode } from "@/lib/theme";

const links = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

function subscribeMode(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  });
  return () => observer.disconnect();
}

function ModeToggle() {
  const mode = useSyncExternalStore(
    subscribeMode,
    () => document.documentElement.dataset.mode ?? "dark",
    () => null,
  );

  if (!mode) return null;
  const next = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-edge text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
    >
      {mode === "dark" ? "☀" : "☾"}
    </button>
  );
}

export default function Nav() {
  return (
    <>
      <div className="glass-panel fixed top-4 left-4 z-40 flex items-center rounded-full border border-edge bg-surface/60 px-5 py-2.5 backdrop-blur-xl backdrop-saturate-150">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("terminal:open"))}
          title="Open the terminal"
          className="cursor-pointer font-mono text-sm font-semibold text-foreground"
        >
          <span className="text-accent">~/</span>akshit
          <span aria-hidden className="tw-caret ml-1 align-middle" />
        </button>
      </div>

      <nav className="glass-panel fixed top-4 right-4 z-40 flex items-center gap-6 rounded-full border border-edge bg-surface/60 px-5 py-2.5 backdrop-blur-xl backdrop-saturate-150">
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-accent/40 px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            Resume
          </a>
        </div>
      </nav>
    </>
  );
}
```

Note what changed from the original: the `scrolled` state, its `useEffect` scroll listener, and the conditional `border-b`/`bg-background` classes are gone entirely — the header no longer waits for scroll to become visible. The single `<header><nav>...</nav></header>` pair becomes two siblings: a plain `<div>` for the logo (not a nav landmark) and a `<nav>` for links/actions (proper landmark, since it holds the actual site navigation).

- [ ] **Step 3: Verify visually**

Run `npm run dev`, open `http://localhost:3000`, and confirm:
- Two separate rounded pills float top-left (logo) and top-right (links/mode toggle/Resume), both visible immediately on load (no scroll needed).
- Background content (the aurora blobs from `BackgroundFX`) is visibly blurred through both pills.
- Scrolling the page does not change either pill's appearance.
- Toggle light/dark mode (existing sun/moon button, unchanged in this task) and confirm the glass still looks right in both — the shadow should look subtly different (lighter, "lifted" shadow) in light mode per the `[data-mode="light"] .glass-panel` override.
- Resize to a narrow (mobile) viewport: the link list disappears (existing `hidden md:flex` behavior, untouched), logo pill and the mode-toggle+Resume pill remain.

Use Playwright MCP for a screenshot if useful (remember this project's convention: set `document.documentElement.style.scrollBehavior = 'auto'` before any programmatic scroll in tests).

---

### Task 2: Theme dropdown, replacing the mode toggle

**Files:**
- Modify: `src/data/themes.ts`
- Create: `src/components/ThemeDropdown.tsx`
- Modify: `src/components/Nav.tsx`

**Interfaces:**
- Consumes: `DARK_THEMES`, `LIGHT_THEMES` (`src/data/themes.ts`, already exist), `setThemeByName` (`src/lib/theme.ts`, already exists, returns `boolean`).
- Produces: `THEME_ACCENTS: Record<string, string>` (new export from `src/data/themes.ts`) and `<ThemeDropdown />` (new default export from `src/components/ThemeDropdown.tsx`, no props) — Task 3 doesn't need either directly, but this is the component `Nav.tsx` renders going forward.

- [ ] **Step 1: Add the accent-color lookup to `themes.ts`**

Add this to `src/data/themes.ts`, after the `LIGHT_THEMES` export (before `export type Mode = ...`):
```ts
// One accent hex per theme, copied from each `--accent` value declared in
// globals.css. Needed because a dropdown row previews a theme that may not
// be the currently-active one, so it can't read the live `var(--accent)`.
export const THEME_ACCENTS: Record<string, string> = {
  "deep-space": "#2dd4bf",
  dracula: "#bd93f9",
  nord: "#88c0d0",
  "tokyo-night": "#7aa2f7",
  catppuccin: "#cba6f7",
  gruvbox: "#fabd2f",
  "nordic-aurora": "#34d399",
  "miami-sunset": "#ff6ec7",
  "desert-dusk": "#f59e0b",
  "github-light": "#0969da",
  "solarized-light": "#268bd2",
  "catppuccin-latte": "#8839ef",
  "rose-pine-dawn": "#d7827e",
  "gruvbox-light": "#b57614",
};
```

- [ ] **Step 2: Create `src/components/ThemeDropdown.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DARK_THEMES, LIGHT_THEMES, THEME_ACCENTS } from "@/data/themes";
import { setThemeByName } from "@/lib/theme";

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const GROUPS: [string, readonly string[]][] = [
  ["Dark", DARK_THEMES],
  ["Light", LIGHT_THEMES],
];

export default function ThemeDropdown() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.dataset.theme ?? "deep-space",
    () => null,
  );
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!theme) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Choose theme"
        aria-expanded={open}
        title="Choose theme"
        className="flex h-8 items-center gap-1 rounded-full px-2 text-sm text-accent transition-colors hover:bg-accent/10"
      >
        <span aria-hidden>◐</span>
        <span aria-hidden className="text-xs text-muted">
          ⌄
        </span>
      </button>

      {open && (
        <div className="glass-panel absolute top-full right-0 z-50 mt-2 min-w-44 rounded-2xl border border-edge bg-surface/80 p-1.5 backdrop-blur-xl backdrop-saturate-150">
          {GROUPS.map(([label, pool]) => (
            <div key={label}>
              <p className="px-2.5 pt-1.5 pb-1 font-mono text-[10px] tracking-wide text-muted uppercase">
                {label}
              </p>
              {pool.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setThemeByName(name);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent/10 ${
                    name === theme
                      ? "bg-accent/15 text-foreground"
                      : "text-muted"
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: THEME_ACCENTS[name] }}
                  />
                  {name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire it into `Nav.tsx`, removing `ModeToggle`**

Replace the entire contents of `src/components/Nav.tsx` with:
```tsx
"use client";

import { profile } from "@/data/resume";
import ThemeDropdown from "@/components/ThemeDropdown";

const links = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  return (
    <>
      <div className="glass-panel fixed top-4 left-4 z-40 flex items-center rounded-full border border-edge bg-surface/60 px-5 py-2.5 backdrop-blur-xl backdrop-saturate-150">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("terminal:open"))}
          title="Open the terminal"
          className="cursor-pointer font-mono text-sm font-semibold text-foreground"
        >
          <span className="text-accent">~/</span>akshit
          <span aria-hidden className="tw-caret ml-1 align-middle" />
        </button>
      </div>

      <nav className="glass-panel fixed top-4 right-4 z-40 flex items-center gap-6 rounded-full border border-edge bg-surface/60 px-5 py-2.5 backdrop-blur-xl backdrop-saturate-150">
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeDropdown />
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-accent/40 px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            Resume
          </a>
        </div>
      </nav>
    </>
  );
}
```

Note: `useSyncExternalStore` and `setMode` are no longer imported in `Nav.tsx` — `ThemeDropdown` owns its own theme subscription now, and `Nav.tsx` has no other use for either.

- [ ] **Step 4: Run lint and typecheck**

Run:
```bash
npm run lint
```
Expected: no errors (no unused imports, no unused variables — `Nav.tsx` no longer references `useSyncExternalStore`/`setMode` at all after Step 3).

- [ ] **Step 5: Verify in the browser**

With `npm run dev` running, open `http://localhost:3000`:
- Click the `◐ ⌄` trigger between the nav links and Resume — a panel opens below it showing two groups, "Dark" (9 themes) then "Light" (5 themes), each theme name with a small colored dot matching its actual accent color.
- The current theme's row is visibly highlighted.
- Click a different theme (try one from the opposite group, e.g. pick a light theme while currently in dark mode) — the whole page's mode and theme switch immediately, and the panel closes.
- Reopen the panel, click anywhere outside it — it closes without changing the theme.
- Reopen the panel, press Escape — it closes.
- Confirm the old sun/moon toggle button no longer appears anywhere in the nav.

---

### Task 3: Remove the superseded `ThemeBadge`

**Files:**
- Delete: `src/components/ThemeBadge.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:** none — this is pure removal, nothing downstream depends on `ThemeBadge`.

- [ ] **Step 1: Delete the file**

```bash
rm src/components/ThemeBadge.tsx
```

- [ ] **Step 2: Remove its usage from `page.tsx`**

In `src/app/page.tsx`, current content:
```tsx
import BackgroundFX from "@/components/BackgroundFX";
import ContactSection from "@/components/ContactSection";
import ExperienceSection from "@/components/ExperienceSection";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import PerfHud from "@/components/PerfHud";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import Terminal from "@/components/Terminal";
import ThemeBadge from "@/components/ThemeBadge";

export default function Home() {
  return (
    <>
      <BackgroundFX />
      <Nav />
      <main>
        <Hero />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Terminal />
      <ThemeBadge />
      <PerfHud />
    </>
  );
}
```

Change to:
```tsx
import BackgroundFX from "@/components/BackgroundFX";
import ContactSection from "@/components/ContactSection";
import ExperienceSection from "@/components/ExperienceSection";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import PerfHud from "@/components/PerfHud";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import Terminal from "@/components/Terminal";

export default function Home() {
  return (
    <>
      <BackgroundFX />
      <Nav />
      <main>
        <Hero />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Terminal />
      <PerfHud />
    </>
  );
}
```

- [ ] **Step 3: Confirm nothing else references `ThemeBadge`**

Run:
```bash
grep -rn "ThemeBadge" src/
```
Expected: no output (no matches).

- [ ] **Step 4: Full verification**

Run:
```bash
npm run build
```
Expected: build succeeds with no errors.

Then `npm run dev`, open `http://localhost:3000`, and confirm the bottom-left shuffle pill is gone, while the nav's theme dropdown (Task 2) still works exactly as before.
