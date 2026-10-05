import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../src/lib/world/rules.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const {
  moveBody,
  groundAt,
  startSpatialTrial,
  stepSpatialTrial,
  ropeZ,
  createMotion,
  stepMotion,
  advancePhysics,
  surfaceVelocity,
  springStep,
  redLightTiming,
  RED_LIGHT_TIME_LIMIT,
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const body = (x = 0, z = 0, y = groundAt(x, z)) => ({
  x,
  z,
  y,
  vy: 0,
  grounded: true,
});
test("collision stops at walls while permitting sliding", () => {
  let p = body();
  const walls = [{ x: 1, z: 0, w: 0.5, d: 10, bottom: 0, top: 4 }];
  for (let i = 0; i < 20; i++) p = moveBody(p, 0.1, -0.1, 0.02, walls);
  assert(p.x < 0.44);
  assert(p.z < -1.9);
});
test("player walks up career stairs and bridge ramp", () => {
  for (const [start, end, height] of [
    [-9, -24, 4.2],
    [52, 44, 2],
  ]) {
    let p = body(0, start);
    for (let i = 0; i < Math.round((start - end) / 0.08); i++)
      p = moveBody(p, 0, -0.08, 0.02, []);
    assert(Math.abs(p.y - height) < 0.01);
  }
});
test("jump lifts player and lands; holding jump is not required", () => {
  let p = moveBody(body(), 0, 0, 0.02, [], true);
  let max = p.y;
  for (let i = 0; i < 70; i++) {
    p = moveBody(p, 0, 0, 0.02, []);
    max = Math.max(max, p.y);
  }
  assert(max > 0.9);
  assert.equal(p.y, 0);
  assert(p.grounded);
});
test("red light detects actual movement and finish depends on position", () => {
  const state = { ...startSpatialTrial("red-light"), phase: "red" };
  assert.equal(
    stepSpatialTrial(state, 0.02, body(-28, -20), 0.1).status,
    "lost",
  );
  assert.equal(
    stepSpatialTrial(state, 0.02, body(-28, -20), 0).status,
    "playing",
  );
  assert.equal(
    stepSpatialTrial(startSpatialTrial("red-light"), 0.02, body(-28, -34), 0.1)
      .status,
    "won",
  );
  assert.equal(
    stepSpatialTrial(startSpatialTrial("red-light"), 0.02, body(-28, -11), 0)
      .progress,
    0,
  );
});
test("mingle requires entering the correct physical room in each round", () => {
  let s = startSpatialTrial("mingle");
  for (const room of [
    { x: -21, z: 9 },
    { x: -35, z: 9 },
    { x: -35, z: 21 },
  ]) {
    s = { ...s, phase: "choose" };
    s = stepSpatialTrial(s, 0.02, body(room.x, room.z), 0.1);
  }
  assert.equal(s.status, "won");
  const wrong = stepSpatialTrial(
    { ...startSpatialTrial("mingle"), phase: "choose" },
    0.02,
    body(-35, 9),
    0.1,
  );
  assert.equal(wrong.status, "lost");
});
test("rope requires both checkpoint position and an airborne player", () => {
  let s = startSpatialTrial("jump-rope");
  assert.equal(
    stepSpatialTrial({ ...s, elapsed: 3.59 }, 0.02, body(0, 42), 0).status,
    "lost",
  );
  assert.equal(
    stepSpatialTrial({ ...s, elapsed: 3.59 }, 0.02, body(0, 44, 3), 0).status,
    "lost",
  );
  for (let i = 0; i < 5; i++) {
    s = stepSpatialTrial(
      { ...s, elapsed: s.nextCrossing - 0.01 },
      0.02,
      body(0, ropeZ(s.round), 3),
      0,
    );
  }
  assert.equal(s.status, "won");
});

test("fast displacement cannot tunnel through a thin wall", () => {
  const p = moveBody(body(), 4, 0, 0.04, [
    { x: 1, z: 0, w: 0.08, d: 4, bottom: 0, top: 4 },
  ]);
  assert(p.x < 0.65);
});
test("a jump hits a ceiling and lands on solid furniture", () => {
  const ceiling = [{ x: 0, z: 0, w: 4, d: 4, bottom: 2.15, top: 2.4 }];
  let p = moveBody(body(), 0, 0, 0.02, ceiling, true);
  for (let i = 0; i < 20; i++) {
    p = moveBody(p, 0, 0, 0.02, ceiling);
    assert(p.y + 1.85 <= 2.151);
  }
  const platform = [{ x: 0, z: 0, w: 2, d: 2, bottom: 0, top: 1 }];
  p = { ...body(0, 0, 2), grounded: false, vy: -2 };
  for (let i = 0; i < 60; i++) p = moveBody(p, 0, 0, 1 / 120, platform);
  assert.equal(p.y, 1);
  assert(p.grounded);
});
test("descending a staircase keeps feet grounded", () => {
  let p = body(0, -23);
  for (let i = 0; i < 160; i++) {
    p = moveBody(p, 0, 0.08, 0.02, []);
    assert(p.grounded);
    assert(Math.abs(p.y - groundAt(p.x, p.z)) < 0.001);
  }
});
test("motor accelerates, brakes, and normalizes diagonal input", () => {
  let p = body(),
    m = createMotion();
  let result = stepMotion(
    p,
    m,
    { x: 1, z: 0, speed: 6.5, jump: false },
    1 / 120,
    [],
  );
  assert(result.motion.vx > 0 && result.motion.vx < 1);
  for (let i = 0; i < 120; i++) {
    result = stepMotion(
      p,
      m,
      { x: 1, z: 1, speed: 6.5, jump: false },
      1 / 120,
      [],
    );
    p = result.body;
    m = result.motion;
  }
  assert(Math.hypot(m.vx, m.vz) <= 6.5001);
  for (let i = 0; i < 30; i++) {
    result = stepMotion(
      p,
      m,
      { x: 0, z: 0, speed: 6.5, jump: false },
      1 / 120,
      [],
    );
    p = result.body;
    m = result.motion;
  }
  assert(Math.hypot(m.vx, m.vz) < 0.001);
});
test("coyote time allows a late jump but never a second air jump", () => {
  let p = { ...body(0, 0, 0.2), grounded: false, vy: -1 };
  let m = { ...createMotion(), coyote: 0.06 };
  let result = stepMotion(
    p,
    m,
    { x: 0, z: 0, speed: 4.5, jump: true },
    0.01,
    [],
  );
  assert(result.body.vy > 5);
  p = result.body;
  m = result.motion;
  result = stepMotion(p, m, { x: 0, z: 0, speed: 4.5, jump: true }, 0.01, []);
  assert(result.body.vy < p.vy);
});
test("jump pressed just before landing is buffered", () => {
  let p = { ...body(0, 0, 0.025), grounded: false, vy: -3 },
    m = createMotion();
  let r = stepMotion(p, m, { x: 0, z: 0, speed: 4.5, jump: true }, 0.02, []);
  assert(r.body.grounded);
  r = stepMotion(
    r.body,
    r.motion,
    { x: 0, z: 0, speed: 4.5, jump: false },
    0.01,
    [],
  );
  assert(r.body.vy > 5);
});
test("finished-round brake stops locomotion", () => {
  const r = stepMotion(
    body(-28, -20),
    { ...createMotion(), vx: 3, vz: -4 },
    { x: 0, z: 0, speed: 4.5, jump: false, brake: true },
    1 / 120,
    [],
  );
  assert.equal(r.body.x, -28);
  assert.equal(r.body.z, -20);
  assert.equal(r.motion.vx, 0);
});

test("fixed simulation gives the same travel at 30, 60 and 144 rendering FPS", () => {
  const run = (fps) => {
    let p = body(),
      m = createMotion(),
      remainder = 0;
    for (let i = 0; i < fps * 2; i++) {
      const frame = advancePhysics(remainder, 1 / fps, (dt) => {
        const r = stepMotion(
          p,
          m,
          { x: 1, z: 0, speed: 4.5, jump: false },
          dt,
          [],
        );
        p = r.body;
        m = r.motion;
      });
      remainder = frame.remainder;
    }
    return p;
  };
  const reference = run(120);
  for (const fps of [30, 60, 144])
    assert(Math.abs(run(fps).x - reference.x) < 1e-8);
});
test("fixed simulation bounds catchup work and never advances on pause", () => {
  let steps = 0;
  const r = advancePhysics(0, 30, () => steps++);
  assert.equal(steps, 18);
  assert(r.alpha < 1);
  advancePhysics(r.remainder, 0, () => steps++);
  assert.equal(steps, 18);
});
test("airborne momentum persists without input and steering cannot instantly reverse it", () => {
  let p = { ...body(0, 0, 2), grounded: false, vy: 3 },
    m = { ...createMotion(), vx: 6 };
  for (let i = 0; i < 30; i++) {
    const r = stepMotion(
      p,
      m,
      { x: 0, z: 0, speed: 6.5, jump: false },
      1 / 120,
      [],
    );
    p = r.body;
    m = r.motion;
  }
  assert(m.vx > 5.8);
  const r = stepMotion(
    p,
    m,
    { x: -1, z: 0, speed: 6.5, jump: false },
    1 / 120,
    [],
  );
  assert(r.motion.vx > 5.7);
});
test("rotating platform carries an idle rider without fake walking", () => {
  let p = body(-28, 17),
    m = createMotion();
  const surface = { x: -28, z: 15, radius: 5.8, speed: 0.6 };
  for (let i = 0; i < 120; i++) {
    const r = stepMotion(
      p,
      m,
      { x: 0, z: 0, speed: 4.5, jump: false, surface },
      1 / 120,
      [],
    );
    p = r.body;
    m = r.motion;
  }
  assert(p.x > -27);
  assert(Math.abs(Math.hypot(p.x + 28, p.z - 15) - 2) < 0.02);
  assert.equal(m.state, "idle");
  assert.equal(p.y, 0.22);
});
test("jump inherits surface momentum and transitions through falling and landing", () => {
  const surface = { x: -28, z: 15, radius: 5.8, speed: 0.6 };
  let r = stepMotion(
    body(-28, 17),
    createMotion(),
    { x: 0, z: 0, speed: 4.5, jump: true, surface },
    1 / 120,
    [],
  );
  assert(r.motion.vx > 1);
  assert.equal(r.motion.state, "jump");
  let fell = false,
    landed = false;
  for (let i = 0; i < 150; i++) {
    r = stepMotion(
      r.body,
      r.motion,
      { x: 0, z: 0, speed: 4.5, jump: false, surface },
      1 / 120,
      [],
    );
    fell ||= r.motion.state === "fall";
    landed ||= r.motion.state === "land";
  }
  assert(fell && landed);
  assert(r.body.grounded);
});
test("slope movement preserves surface speed instead of accelerating uphill", () => {
  const p = body(0, -16),
    m = { ...createMotion(), vz: -4.5 };
  const r = stepMotion(
    p,
    m,
    { x: 0, z: -1, speed: 4.5, jump: false },
    1 / 120,
    [],
  );
  assert(
    Math.abs(Math.hypot(r.body.z - p.z, r.body.y - p.y) / (1 / 120) - 4.5) <
      0.02,
  );
});
test("Sketchbook spring adaptation settles without oscillating around a standing target", () => {
  let p = 0,
    v = 0;
  for (let i = 0; i < 300; i++) {
    const s = springStep(p, 4.5, v, 18, 0.55, 1 / 120);
    p = s.position;
    v = s.velocity;
    assert(p <= 4.500001);
  }
  assert(Math.abs(p - 4.5) < 0.001);
  assert(Math.abs(v) < 0.001);
  assert.deepEqual(surfaceVelocity(body(), undefined), { x: 0, z: 0 });
});

test("red-light schedules vary by seed and remain within bounded reaction windows", () => {
  const schedule = (seed) => {
    let s = startSpatialTrial("red-light", seed);
    const times = [];
    for (let i = 0; i < 9; i++) {
      times.push(s.phaseDuration);
      s = stepSpatialTrial(
        { ...s, phaseTime: s.phaseDuration },
        0.01,
        body(-28, -11),
        0,
      );
    }
    return times;
  };
  assert.deepEqual(schedule(123), schedule(123));
  assert.notDeepEqual(schedule(123), schedule(456));
  for (let seed = 1; seed < 100; seed++) {
    const timing = redLightTiming(seed, "warning");
    assert(timing.phaseDuration >= 0.85 && timing.phaseDuration <= 1.05);
  }
});
test("holding forward during the turn continues movement and causes elimination on red", () => {
  let p = body(-28, -11),
    m = { ...createMotion(), vz: -4.5 };
  let s = {
    ...startSpatialTrial("red-light", 7),
    phase: "warning",
    phaseDuration: 0.4,
  };
  for (let i = 0; i < 80 && s.status === "playing"; i++) {
    const old = p;
    const r = stepMotion(
      p,
      m,
      { x: 0, z: -1, speed: 4.5, jump: false, brake: s.status !== "playing" },
      1 / 120,
      [],
    );
    p = r.body;
    m = r.motion;
    s = stepSpatialTrial(s, 1 / 120, p, Math.hypot(p.x - old.x, p.z - old.z));
  }
  assert(p.z < -12.5, "turning must not auto-stop the player");
  assert.equal(s.status, "lost");
});
test("a 350ms manual reaction can win several randomized schedules", () => {
  for (const seed of [1, 2, 370, 0xdeadbeef]) {
    let p = body(-28, -11),
      m = createMotion(),
      s = startSpatialTrial("red-light", seed);
    for (
      let i = 0;
      i < RED_LIGHT_TIME_LIMIT * 120 + 5 && s.status === "playing";
      i++
    ) {
      const moving =
        s.phase === "green" || (s.phase === "warning" && s.phaseTime < 0.35);
      const old = p;
      const r = stepMotion(
        p,
        m,
        { x: 0, z: moving ? -1 : 0, speed: 4.5, jump: false },
        1 / 120,
        [],
      );
      p = r.body;
      m = r.motion;
      s = stepSpatialTrial(s, 1 / 120, p, Math.hypot(p.x - old.x, p.z - old.z));
    }
    assert.equal(
      s.status,
      "won",
      `reactive player should be able to win seed ${seed}: ${s.message}`,
    );
  }
});
test("doll deadline is 45 seconds and red detects even slow creeping", () => {
  let s = startSpatialTrial("red-light", 3);
  assert.equal(
    stepSpatialTrial({ ...s, elapsed: 44.99 }, 0.02, body(-28, -11), 0).status,
    "lost",
  );
  assert.equal(
    stepSpatialTrial({ ...s, phase: "red" }, 1 / 120, body(-28, -11), 0.001)
      .status,
    "lost",
  );
});
