@AGENTS.md

# Project context (handoff notes — keep updated as the site evolves)

## Current design — Player 370 open world, October 5, 2026

Active branch: `feat/player-370-open-world`. The saved miniature version is `feat/player-370-game-portfolio` at `2de9ddd`; the workshop is `feat/3d-workshop-portfolio` at `703dd5f`. Do not commit or push without the owner asking.

The root page now mounts a real third-person Three.js world with walking, jumping, camera orbit, collision, touch controls, map/fast travel, and eight connected destinations. Portfolio dossiers open near physical markers. Red Light, Mingle, and Jump Rope operate on the same character’s world position. The original scrolling page is preserved at `/portfolio` as a direct route and WebGL fallback. Portfolio facts remain in `src/data/resume.ts`.

`src/components/world/WorldExperience.tsx` owns React UI, `src/app/world.css` its styling, and `src/lib/world/` contains the renderer, geometry, audio, and DOM-independent physics/game rules. `tests/world-rules.test.mjs` tests those rules. The character motor now has acceleration/braking, buffered/coyote jumps, ceiling and landing collision. Camera math in `src/lib/world/camera.ts` uses swept camera volumes, immediate obstruction pull-in, eased recovery, smooth orbit, and C/button recentering. Tests cover these behaviors in `tests/world-camera.test.mjs` and the rules suite. Red Light uses manual stopping with short 1–2-second green periods and a 0.85–1.05-second turning grace period. The red traffic lamp lights at the start of the turn; movement is checked once she faces the player; a fresh seeded schedule is generated for each attempt. Keep the earlier trial modules because `/portfolio` still uses them.

The owner supplied three MP3s in `src/data/` and explicitly requested using them. Runtime copies live in `public/audio/world/`. Music is opt-in and follows game phase/pause state. Local CC0 Kenney scenery models and their license are under `public/models/`; architecture and characters are procedural. Visual game signals work with audio disabled.

## Automatic chase camera

Camera follow is enabled by default, with a manual-orbit option in the pause menu. `camera.ts` holds tested chase-pan, manual-hold, and movement-reference helpers. Keep movement's captured input heading separate from automatic camera yaw; coupling them makes held side input spiral. Intentional direction changes/releasing input refresh that reference. Dragging sets a 1.6-second override even for gestures completed between animation frames. Stationary players and passive carousel riders do not trigger automatic orbit. Existing collision clearance remains applied after the chase framing.

## Sketchbook physics reference

The owner requested using `/home/akshit/Sketchbook` as the reference for consecutive physics improvements. Its MIT spring helper is adapted in `rules.ts`; runtime uses a true 120 Hz accumulator with previous/current body interpolation. Ground and airborne movement are separate, the carousel carries riders and passes velocity into jumps, and the avatar blends locomotion poses with spring turning and banking. See `docs/sketchbook-physics.md` and `public/licenses/Sketchbook-MIT.txt`. Do not edit the reference repository. Existing camera clearance remains intentional; Red Light’s old warning brake was removed at the owner’s request.

## Saved workshop design — October 2026

The user approved **Inside the Machine with warm workshop materials** and the site has been revamped accordingly. The active page is `src/app/page.tsx`, styled by `src/app/workshop.css` after the legacy globals. It uses `src/components/workshop/` for navigation, interactive 3D scenes, project selection, and skill evidence. The procedural Three.js renderer lives in `src/lib/workshop-scene.ts` and is dynamically imported near the viewport. Scene rendering stops offscreen and in hidden tabs; reduced motion renders still views, and a CSS assembly is the WebGL/no-JS fallback.

The sections are hero → projects → experience/education → skills/achievements → contact. The fixed palette is graphite, warm cream, and copper. The old rotating editor themes, terminal, and performance HUD are no longer mounted. Existing legacy components remain in the repository for reference. Content still comes from `src/data/resume.ts`, without changes to the owner's claims or URLs. Keep the full-stack/AI positioning and honest team attribution.

The notes below describe the previous design and its history, except that **Owner preferences**, **Verified facts**, and unrelated backlog items still apply. The near-zero-JS claim is superseded by the deferred Three.js design.

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

## Red Light difficulty and presentation

The active world has larger HUD/dossier type and auto-fitted 3D sign text. Red Light uses a 45-second clock above the doll, randomized green/red durations and forgiving turn windows, and manual stopping. Only terminal states force a stop. Eliminations show two guard rifle shots, raised rifles and recoil, travelling bullets/tracers, brief impact blood particles, opt-in synthesized gunfire, and a collapse. Pause and hidden tabs freeze this sequence; retries reset it. Reduced-motion preferences suppress shot flashes, bullets/tracers, and blood particles. Regression tests verify continued motion during the turn, creeping detection, reproducible seeded schedules, timeout, and wins with 350ms manual reactions.
