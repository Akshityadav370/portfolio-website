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
const { moveBody, groundAt, startSpatialTrial, stepSpatialTrial, ropeZ } =
  await import(
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
