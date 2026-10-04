# Player 370 — a playable portfolio

A Squid Game-inspired miniature world for Akshit’s full-stack engineering portfolio. Next.js static export, React, Tailwind CSS, and procedural Three.js sets. Portfolio content and links are available without winning a game.

## Design checkpoints

- `feat/3d-workshop-portfolio` at `703dd5f`: the saved graphite/copper workshop design.
- `feat/player-370-game-portfolio`: the invitation and miniature game version.

Switch between the branches with a clean working tree to compare the versions. No production deployment is triggered by local branch switching.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. The existing Geist fonts are fetched by Next.js during development/build and self-hosted in the output.

## The experience

- A textured, reversible circle–triangle–square invitation card.
- A 3D dormitory/staircase set, player dossier, career journey, and project control room.
- Three optional mini-games: Red Light, Green Light; Mingle; Jump Rope.
- Skill evidence derived from actual experience and project stacks, achievement proof links, and contact details.
- Opt-in synthesized sound cues, with configured slots for owner-supplied licensed music.

Game input supports touch/pointer and keyboard. The round pauses when the browser loses focus, the tab becomes hidden, or the arena leaves view. Red light includes a visible reaction window. Games are nonviolent and always offer a retry. Each scene loads near the viewport and has a static fallback if WebGL is unavailable. Decorative motion respects reduced-motion preferences; game timing and progress also have text indicators.

## Editing

| File | Purpose |
| --- | --- |
| `src/data/resume.ts` | Authoritative profile, experience, projects, skills, and proof links |
| `src/app/page.tsx` | Server-rendered portfolio content and story sections |
| `src/app/trials.css` | Active design and responsive layouts |
| `src/components/trials/` | Invitation, navigation, audio, project selector, and game controls |
| `src/lib/trials-scene.ts` | Procedural miniature geometry, lighting, rendering, and cleanup |
| `src/lib/trials-engine.ts` | Deterministic, DOM-independent game rules |
| `src/data/trials-audio.ts` | Optional music paths, attribution, and license links |
| `public/audio/README.md` | Audio asset handoff instructions |
| `tests/trials-engine.test.mjs` | Win/loss, reaction-window, timing, and pause regression tests |

Legacy IDE and workshop components remain for reference. Only the new trial page is mounted, apart from the reused skill evidence and copy-email controls.

## Verify and build

```sh
npm run lint
npm test
npx tsc --noEmit
npm run build
```

The test runner transpiles only the dependency-free rules module using the existing TypeScript dependency, so it runs on Node 20 without adding a test framework. The production export is written to `out/`. Existing Vercel hosting settings are unchanged.
