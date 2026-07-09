@AGENTS.md

# Project context (handoff notes — keep updated as the site evolves)

## What this is
Akshit's portfolio at **https://iakshit.space** — Next.js static export (`output: "export"`) + Tailwind v4, deployed on Vercel (project lives under the `xansr` team scope — his deliberate choice, do not suggest moving it). Auto-deploys on push to `main` (repo: github.com/Akshityadav370/portfolio-website). The pitch is **speed**: near-zero JS (~5kb, live PerfHud pill bottom-right proves it), no animation libraries — everything is CSS + small rAF loops. Only npm dep added so far: `simple-icons` (tree-shaken brand icon paths — used by `SkillIcon.tsx`, which maps ~55 skill names to brand-colored icons across skills.json rows and all stack chips; near-black brands auto-switch to theme foreground in dark mode via `.si-invert`; AWS/OpenAI/Zustand/Liveblocks have no icons in the library and fall back to plain text).

## Design system
- **All content lives in `src/data/resume.ts`** (profile, experience, projects with github/live links, skillGroups, codingProfiles, achievements with proof links, education). Sections derive from it — edit data, not markup.
- **14 rotating themes** in `src/data/themes.ts` + `[data-theme]`/`[data-mode]` CSS vars in `globals.css` (9 dark editor/mood themes, 5 light). A pre-paint inline script in `layout.tsx` picks mode by local hour (7–19 = light) unless the Nav sun/moon toggle persisted an override, then rotates within the pool per visit (`theme-i-dark`/`theme-i-light` in localStorage). Client helpers: `src/lib/theme.ts`. ThemeBadge pill (bottom-left) shuffles.
- **BackgroundFX**: 3 drifting aurora blobs (wrapped in `.fx-aurora-mask` — full color at screen edges, ~28% under the reading column for readability; don't undo this), dot grid, cursor spotlight grid, film grain.
- **Identity motif is "engineer's desktop"**: hero = Apple-style multilingual typewriter greeting; experience = `git log --career` timeline (scroll-progress line, active commit gets dot glow + text-shine, details expanded by default — he wants work descriptions visible); skills = `skills.json` editor window (values ^prod/^shipped/^familiar auto-derived from stacks + ALIASES map; hover = GitLens-style ghost comment showing where a skill was used); projects = VS Code-style file explorer (`ls ~/projects` — sidebar of `<project>.md` files with tech icons, click opens a rendered-markdown pane with highlights/stack/links, status bar; horizontal file strip on mobile; replaced the earlier bento+TiltCard layout, which lives in git history); terminal easter egg (click `~/akshit` logo or press backtick; discoverable via the nav logo periodically retyping itself as `~/terminal`, and via `MiniTerminal.tsx` — a self-typing decorative terminal in the contact card that opens the real one on click); contact card is a two-column layout (info left, mini terminal right).
- Utilities: `.text-gradient`, `.btn-gradient`, `.tw-caret`, and a glass family: `.glass` (nav pill + dropdown, most transparent), `.glass-card` (content cards, more opaque + backdrop blur; `.tilt-card` has the same treatment baked in), `.glass-chip` (small chips/buttons — translucent tint + inner highlight but deliberately NO backdrop-filter, since ~60 live blur layers would tank scroll perf). Light-mode card shadows via `[data-mode="light"] .tilt-card / .lift`.
- **Nav is a floating glass pill** with a theme dropdown (grouped dark/light, per-theme gradient swatches via `data-theme` stamped on the swatch span so CSS vars re-resolve) + sun/moon mode toggle. The old bottom-left ThemeBadge chip was removed at his request.

## Owner preferences (learned, respect these)
- **Discuss options before implementing** UI/design changes — present 3-4 ideas with trade-offs, let him pick.
- **Honest framing**: Zotok perf wins were team efforts — "collaborated on / helping cut", never solo claims. He targets **full-stack roles** (not "frontend engineer" positioning).
- **He commits/pushes himself** — don't commit unless he asks. He also edits `resume.ts`/`layout.tsx` directly between turns; re-read before editing, never revert his wording.
- Claims need receipts: skills show where they were used; achievements link certificates/profiles.

## Verified facts
- GitHub: Akshityadav370 · LinkedIn: linkedin.com/in/akshit-yadav/ · coding profiles username `bucephalus370` (LeetCode/GfG) + Naukri Code360 UUID profile — all in resume.ts.
- Lovable Clone live at http://lovable.iakshit.space/ (HTTP only — no TLS on that GKE ingress yet).

## Dev gotchas
- **Turbopack stale-CSS wedge**: after rapid `globals.css` edits, new rules may never reach the browser (even after reload). Verify with `npx @tailwindcss/cli -i src/app/globals.css -o /tmp/out.css`; if the CLI output is fine, `rm -rf .next/dev` and restart `npm run dev`.
- **Don't hand-write `-webkit-` prefixed duplicates** (e.g. `-webkit-backdrop-filter` next to `backdrop-filter`) — the dev pipeline merges duplicate properties keeping only the last, which silently drops the standard one. Write the standard property once; the compiler prefixes for target browsers.
- Page uses `scroll-behavior: smooth` — set it to `auto` before programmatic scrolling in browser tests, or reveals won't trigger.
- Playwright MCP is the preferred way to visually verify changes (screenshots + evaluate).

## Backlog (agreed, not started)
- Spotify "last played" card + anonymous WhatsApp messaging — both need serverless (Vercel route handlers; conflicts with `output: "export"`, needs migration decision) + credentials from Akshit.
- "Copy email" affordance in contact (mailto is dead for Gmail-only users).
- HTTPS for lovable.iakshit.space (GKE managed cert), then flip the project link to https.
- `www.iakshit.space` CNAME was not resolving at launch — check Namecheap.
- Untried alternate project layout: git-log style (IDE file explorer is current; bento retrievable from git history).
- Possible: AI "ask my portfolio" chat, GitHub activity widget, visitor counter, Konami confetti.
