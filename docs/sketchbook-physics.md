# Sketchbook physics adaptations

Reference: local `/home/akshit/Sketchbook`, upstream `swift502/Sketchbook`, commit `62f4b7986fd1ce1e4f91daba89ef032c20a6ce55` (version 0.4.0).

Sketchbook is MIT licensed, copyright (c) 2020 swift502. The complete notice is included at `public/licenses/Sketchbook-MIT.txt`, which is also shipped in the static website export.

## Adapted code and patterns

- `src/ts/core/FunctionLibrary.ts` (`spring`): the acceleration → damping → integration calculation is adapted in `src/lib/world/rules.ts` (`springStep`). It uses plain numeric records, coefficients tuned for 120 Hz, and bounded substeps instead of Sketchbook’s `SimulationFrame` class. Ground movement and character orientation both use this spring.
- `src/ts/physics/spring_simulation/SimulatorBase.ts`, `SpringSimulator.ts`, and `VectorSpringSimulator.ts`: their fixed-frame accumulator and cached-frame interpolation pattern informs `advancePhysics` and the previous/current body interpolation in `runtime.ts`. The whole character simulation now advances at 120 Hz rather than changing its timestep with the rendering FPS. Catchup is bounded to avoid a spiral after a stalled frame; hidden tabs and menus do not advance game time.
- `src/ts/characters/Character.ts`, especially `physicsPostStep`, `springRotation`, and `rotateModel`: surface-relative movement, velocity at a moving contact point, ground/slope handling, spring turning, and turn banking inform this controller. The carousel supplies angular contact velocity and jumps inherit it. Collision still uses the portfolio’s existing capsule-footprint/box controller.
- `src/ts/characters/character_states/Falling.ts`, `JumpRunning.ts`, and the `Drop*` states: separate ground, rising, falling, and landing handling. Air control adds modest steering to existing momentum; it does not brake the player to a stop on key release. The procedural avatar blends limb poses and landing compression rather than requiring Sketchbook’s animation assets.

## Integration boundaries

This is an incremental controller adaptation, not an import of Sketchbook’s complete world, bundled Cannon engine, old Three.js version, vehicles, or animations. No Sketchbook repository files are modified. Existing portfolio content, collision geometry, camera obstruction handling, and optional mini-games remain in place.

Red Light no longer applies its former warning brake: players must release input and let the motor decelerate during the doll’s turn. Terminal game states still clear velocity and spring acceleration. Teleports and retries reset the physics accumulator, cached body, movement springs, and turning spring. The rotating carousel stops with the music and menus; the player can walk relative to the platform while it rotates.

Regression tests cover render-rate independence, bounded catchup, spring settling, momentum in air, slope speed, platform carry, inherited jump momentum, locomotion transitions, and existing collision/game rules.
