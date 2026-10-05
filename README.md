# Player 370 — a third-person portfolio world

A walkable Squid Game-inspired compound for Akshit’s engineering portfolio. Built with Next.js static export, React, and Three.js. The same character explores portfolio locations and plays three spatial games. No game must be won to access the portfolio.

## Design checkpoints

- `feat/3d-workshop-portfolio` at `703dd5f`: graphite/copper workshop.
- `feat/player-370-game-portfolio` at `2de9ddd`: invitation and miniature game version.
- `feat/player-370-open-world`: current third-person world.

The previous scrolling experience is also available at `/portfolio`, including when WebGL cannot start.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Next.js fetches the existing Geist fonts during the build.

## Explore and play

WASD/arrows walk, Shift runs, Space jumps, dragging turns the camera, and scrolling adjusts camera distance. C (or the ↺ button) recenters behind the character. Camera sensitivity and closer/wider presets are available in the pause menu. Approach a pink marker and press E. M opens a map with fast travel; Escape pauses. Touch devices have a movement joystick and jump button. A light graphics option disables shadows and lowers rendering resolution.

Movement includes acceleration, ground braking, limited air steering, buffered jumps, a short coyote-time window, solid landings and ceiling collision. The camera uses volume-based obstruction checks for architecture, scenery, and moving arena props, pulls in immediately, and eases back out. Indoor distance limits, smooth stair following, and close-camera character fading keep tight spaces navigable.

Eight connected places contain the player profile, career staircase, project control room, skill equipment room, three game arenas, and contact portal. Portfolio facts come from `src/data/resume.ts`.

- **Red Light, Green Light:** physically cross the field. A short turning warning precedes red; movement on red ends the round.
- **Mingle:** walk into the correct numbered room after the carousel stops. Three rounds, ten seconds per choice.
- **Jump Rope:** move between five bridge checkpoints and jump over the rope on each crossing.

Games pause with menus, window blur, and hidden tabs. Music is off initially and follows game phases after opting in. Owner-supplied tracks from `src/data/` are copied into `public/audio/world/` for static hosting; original files are preserved. Scenery GLBs are from Kenney’s CC0 Nature Kit; see `public/models/ATTRIBUTION.md` and the included license. Characters and architecture are generated in code.

## Automatic third-person camera

The camera now settles behind the direction of travel, pans through turns at a bounded rate, and frames a little more of the path ahead. Running slightly widens outdoor framing; interiors keep their closer view. Manual dragging has priority and delays automatic follow for 1.6 seconds. While idle, your chosen angle stays put. C / ↺ still recenters immediately, and the pause menu can switch to manual orbit.

A held movement gesture keeps its world heading while the camera pans. Releasing or deliberately changing direction captures the current camera-relative heading, preventing the auto-follow feedback loop that would otherwise make a held side direction run in circles. Small joystick jitter does not reset that heading. Reduced-motion preferences disable the extra look-ahead and speed-based widening.

## Sketchbook-inspired controller

This iteration adapts the spring integration and fixed-frame simulation patterns from the owner’s local Sketchbook checkout. The controller runs at 120 Hz with interpolated rendering, spring-based locomotion and turning, retained airborne momentum, slope-adjusted movement, moving-carousel contact velocity, and blended jump/fall/landing poses. The original MIT notice ships with the site.

See [adaptation notes](docs/sketchbook-physics.md) for the exact source files, reference commit, changes, and integration boundaries.

## Editing

| File | Purpose |
| --- | --- |
| `src/data/resume.ts` | Authoritative portfolio content |
| `src/components/world/WorldExperience.tsx` | Invitation, HUD, map, touch input, dossiers, and game briefings |
| `src/app/world.css` | World interface and responsive layouts |
| `src/lib/world/runtime.ts` | Third-person camera, input, rendering, lifecycle, and gameplay integration |
| `src/lib/world/assets.ts` | Architecture, characters, imported scenery, collision geometry |
| `src/lib/world/camera.ts` | Camera clearance and damping math |
| `src/lib/world/rules.ts` | Layout, movement, collision, and spatial trial rules |
| `src/lib/world/audio.ts` | Opt-in playback tied to game state |
| `tests/world-rules.test.mjs` | Collision, traversal, jumping, and physical win/loss checks |
| `tests/world-camera.test.mjs` | Camera clearance, ceiling, recovery, and angle-wrap regressions |
| `src/app/portfolio/page.tsx` | Preserved scrolling portfolio |

## Verify and build

```sh
npm run lint
npm test
npx tsc --noEmit
npm run build
```

The test runner transpiles only the dependency-free rules module using the existing TypeScript dependency, so it runs on Node 20 without adding a test framework. The production export is written to `out/`. Existing Vercel hosting settings are unchanged.
