// Order matters: the pre-paint script in layout.tsx, the ThemeBadge shuffle,
// and the terminal's `theme` command all walk these lists. Palettes live in
// globals.css under [data-theme="…"] selectors keyed by these names.
export const DARK_THEMES = [
  "deep-space",
  "dracula",
  "nord",
  "tokyo-night",
  "catppuccin",
  "gruvbox",
  "nordic-aurora",
  "miami-sunset",
  "desert-dusk",
] as const;

export const LIGHT_THEMES = [
  "github-light",
  "solarized-light",
  "catppuccin-latte",
  "rose-pine-dawn",
  "gruvbox-light",
] as const;

export type Mode = "dark" | "light";

export const poolFor = (mode: Mode): readonly string[] =>
  mode === "light" ? LIGHT_THEMES : DARK_THEMES;

/* Day = 7:00–18:59 local time. Used as the default mode when the visitor
   has never touched the sun/moon toggle. */
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 19;
