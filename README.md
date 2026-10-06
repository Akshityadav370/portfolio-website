# Player 370 — a third-person portfolio world

A walkable Squid Game-inspired compound for Akshit’s engineering portfolio. Built with Next.js static export, React, and Three.js. The same character explores portfolio locations and plays three spatial games. No game must be won to access the portfolio.

## Design checkpoints

- `feat/3d-workshop-portfolio` at `703dd5f`: graphite/copper workshop.
- `feat/player-370-game-portfolio` at `2de9ddd`: invitation and miniature game version.
- `feat/player-370-open-world`: current third-person world.

The original Mac/IDE portfolio is available at `/portfolio`, including when WebGL cannot start.

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

- **Red Light, Green Light:** physically cross the field. Stop yourself when the doll turns. Each attempt randomizes green/red durations, with a forgiving turning grace period and a 45-second clock above the doll. Movement after the red-light turn causes guard gunfire, a brief blood-particle impact, and a collapse.
- **Mingle:** walk into the correct numbered room after the carousel stops. Three rounds, ten seconds per choice.
- **Jump Rope:** move between five bridge checkpoints and jump over the rope on each crossing.

Games pause with menus, window blur, and hidden tabs. Music and synthesized gunfire are off initially and follow the sound toggle and volume setting. Owner-supplied tracks from `src/data/` are copied into `public/audio/world/` for static hosting; original files are preserved. Scenery GLBs are from Kenney’s CC0 Nature Kit; see `public/models/ATTRIBUTION.md` and the included license. Characters and architecture are generated in code.

## Automatic third-person camera

The camera now settles behind the direction of travel, pans through turns at a bounded rate, and frames a little more of the path ahead. Running slightly widens outdoor framing; interiors keep their closer view. Manual mouse movement (touch dragging) has priority and delays automatic follow for 1.6 seconds. While idle, your chosen angle stays put. C / ↺ still recenters immediately, and the pause menu can switch to manual orbit.

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
| `src/app/portfolio/page.tsx` | Original Mac/IDE portfolio |

## Verify and build

```sh
npm run lint
npm test
npx tsc --noEmit
npm run build
```

The test runner transpiles only the dependency-free rules module using the existing TypeScript dependency, so it runs on Node 20 without adding a test framework. The production export is written to `out/`. Existing Vercel hosting settings are unchanged.

Red Light now has paired red/green traffic lights beside the doll. Green lasts 1–2 seconds; the red lamp starts a 0.85–1.05-second turn before movement checks begin. The 45-second deadline and manual stopping remain. Guards raise and recoil their rifles; bullets travel to the player before a brief blood-particle impact and collapse. Reduced motion suppresses flashes and projectile/impact particles.

Desktop camera look follows mouse movement without holding a button. Click the world to capture the pointer for continuous turning; Escape releases it and pauses. Menus, blur, and disposal release capture. Touch devices retain drag-to-look. Manual look also updates the movement heading while a direction is held.

Jump Rope now checks the animated rope against the player capsule throughout its swing, including movement between physics ticks. Missing a marker repeats the pass without elimination or progress; only rope contact ends an attempt (no timeout). Mingle has large camera-facing numbers above each room, highlights the called room, and sends two guards toward an eliminated player before firing.

The entry invitation offers the 3D world or the original `/portfolio` page. A falling card and moving symbols play on the first visit; repeat visits skip the animation, and reduced-motion settings disable it. The SPA retains its original design, theme switcher, terminal, and content, without Squid Game styling. The selected next scene concepts are documented in `docs/world-section-concepts.md`.

## Interactive portfolio objects

Sixteen objects across the five portfolio areas respond to E or the mobile interaction button: a player locker, four company archives along the stairs, five project consoles, four equipment cases, and a contact phone/résumé dossier. Hinges, receivers, lights, and proximity rings respond in the world. A live panel shows the selected content and relevant project/contact links; F opens the full record. E toggles the object, walking away closes it, and the panel counts objects explored this visit. The original SPA is unchanged.
