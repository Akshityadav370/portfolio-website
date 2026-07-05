// Client-side theme switching. The source of truth is the data-mode /
// data-theme attributes on <html>, stamped pre-paint by layout.tsx's boot
// script; ThemeBadge reacts to changes via MutationObserver.
import { DARK_THEMES, LIGHT_THEMES, type Mode, poolFor } from "@/data/themes";

export function currentMode(): Mode {
  return document.documentElement.dataset.mode === "light" ? "light" : "dark";
}

export function currentTheme(): string {
  return document.documentElement.dataset.theme ?? DARK_THEMES[0];
}

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode — the choice still applies for this visit
  }
}

export function applyTheme(theme: string, mode: Mode) {
  document.documentElement.dataset.mode = mode;
  document.documentElement.dataset.theme = theme;
  persist(`theme-i-${mode}`, String(poolFor(mode).indexOf(theme)));
}

/* Explicit sun/moon choice: persists as an override of the time-of-day
   default, and restores that mode's last-seen theme. */
export function setMode(mode: Mode) {
  const pool = poolFor(mode);
  let index = NaN;
  try {
    index = parseInt(localStorage.getItem(`theme-i-${mode}`) ?? "", 10);
  } catch {
    // ignore
  }
  const theme =
    pool[
      Number.isNaN(index)
        ? Math.floor(Math.random() * pool.length)
        : ((index % pool.length) + pool.length) % pool.length
    ];
  applyTheme(theme, mode);
  persist("mode", mode);
}

export function shuffleTheme(): string {
  const mode = currentMode();
  const pool = poolFor(mode);
  const next = pool[(pool.indexOf(currentTheme()) + 1) % pool.length];
  applyTheme(next, mode);
  return next;
}

/* Set a theme by name from either pool (used by the terminal). Switches
   mode when the theme lives in the other pool. Returns false if unknown. */
export function setThemeByName(name: string): boolean {
  const lists: [Mode, readonly string[]][] = [
    ["dark", DARK_THEMES],
    ["light", LIGHT_THEMES],
  ];
  for (const [mode, pool] of lists) {
    if (pool.includes(name)) {
      applyTheme(name, mode);
      persist("mode", mode);
      return true;
    }
  }
  return false;
}
