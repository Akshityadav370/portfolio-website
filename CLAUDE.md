@AGENTS.md

# Project context (handoff notes — keep updated as the site evolves)

## What this is
Akshit's portfolio at **https://iakshit.space** — Next.js static export (`output: "export"`) + Tailwind v4, deployed on Vercel (project lives under the `xansr` team scope — his deliberate choice, do not suggest moving it). Auto-deploys on push to `main` (repo: github.com/Akshityadav370/portfolio-website). The pitch is **speed**: near-zero JS (~5kb, live PerfHud pill bottom-right proves it), no animation libraries — everything is CSS + small rAF loops. Only npm dep added so far: `simple-icons` (tree-shaken brand icon paths).

## Design system
- **All content lives in `src/data/resume.ts`** (profile, experience, projects with github/live links, skillGroups, codingProfiles, achievements with proof links, education). Sections derive from it — edit data, not markup.
- **14 rotating themes** in `src/data/themes.ts` + `[data-theme]`/`[data-mode]` CSS vars in `globals.css` (9 dark editor/mood themes, 5 light). A pre-paint inline script in `layout.tsx` picks mode by local hour (7–19 = light) unless the Nav sun/moon toggle persisted an override, then rotates within the pool per visit (`theme-i-dark`/`theme-i-light` in localStorage). Client helpers: `src/lib/theme.ts`. ThemeBadge pill (bottom-left) shuffles.
- **BackgroundFX**: 3 drifting aurora blobs (wrapped in `.fx-aurora-mask` — full color at screen edges, ~28% under the reading column for readability; don't undo this), dot grid, cursor spotlight grid, film grain.
- **Identity motif is "engineer's desktop"**: hero = Apple-style multilingual typewriter greeting; experience = `git log --career` timeline (scroll-progress line, active commit gets dot glow + text-shine, details expanded by default — he wants work descriptions visible); skills = `skills.json` editor window (values ^prod/^shipped/^familiar auto-derived from stacks + ALIASES map; hover = GitLens-style ghost comment showing where a skill was used); projects = bento grid with TiltCard 3D hover; terminal easter egg (click `~/akshit` logo or press backtick).
- Utilities: `.text-gradient`, `.btn-gradient`, `.tw-caret`, light-mode card shadows via `[data-mode="light"] .tilt-card / .lift`.

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
- Page uses `scroll-behavior: smooth` — set it to `auto` before programmatic scrolling in browser tests, or reveals won't trigger.
- Playwright MCP is the preferred way to visually verify changes (screenshots + evaluate).

## Backlog (agreed, not started)
- Spotify "last played" card + anonymous WhatsApp messaging — both need serverless (Vercel route handlers; conflicts with `output: "export"`, needs migration decision) + credentials from Akshit.
- "Copy email" affordance in contact (mailto is dead for Gmail-only users).
- HTTPS for lovable.iakshit.space (GKE managed cert), then flip the project link to https.
- `www.iakshit.space` CNAME was not resolving at launch — check Namecheap.
- Untried alternate project layouts: git-log style, IDE file explorer (bento is current).
- Possible: AI "ask my portfolio" chat, GitHub activity widget, visitor counter, Konami confetti.
