import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../src/lib/world/camera.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const {
  cameraClearance,
  cameraDistance,
  dampAngle,
  movementReference,
  chaseMemory,
  chaseYaw,
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const origin = { x: 0, y: 1.3, z: 0 },
  direction = { x: 0, y: 0, z: 1 };
test("camera volume stops before a wall and catches near-plane edge clipping", () => {
  const wall = { x: 0, z: 3, w: 4, d: 0.2, bottom: 0, top: 4 };
  assert(cameraClearance(origin, direction, 8, [wall]) < 2.7);
  const edge = { ...wall, x: 2.2 };
  assert(cameraClearance(origin, direction, 8, [edge]) < 8);
  assert.equal(cameraClearance(origin, direction, 8, [{ ...wall, x: 3 }]), 8);
});
test("camera avoids a ceiling on an upward orbit", () => {
  const roof = { x: 0, z: 2, w: 6, d: 6, bottom: 3, top: 3.3 };
  const d = { x: 0, y: Math.SQRT1_2, z: Math.SQRT1_2 };
  assert(cameraClearance(origin, d, 8, [roof]) < 2.1);
});
test("obstruction entry is immediate and recovery is damped", () => {
  assert.equal(cameraDistance(8, 2, 0.016), 2);
  const out = cameraDistance(2, 8, 0.016);
  assert(out > 2 && out < 3);
});
test("camera damping takes the shortest arc across the angle seam", () => {
  const from = Math.PI - 0.02,
    to = -Math.PI + 0.02;
  const result = dampAngle(from, to, 18, 0.016);
  assert(result > from && result < Math.PI + 0.02);
});

test("chase follows travel heading along the shortest arc at a bounded rate", () => {
  let yaw = 0;
  for (let i = 0; i < 180; i++) {
    const next = chaseYaw(yaw, 4.5, 0, 1 / 60);
    assert(Math.abs(next - yaw) <= 2 / 60 + 0.00001);
    yaw = next;
  }
  assert(Math.abs(yaw + Math.PI / 2) < 0.01);
  const nearSeam = chaseYaw(Math.PI - 0.03, 0.1, 4.5, 1 / 60);
  assert(Math.abs(nearSeam - (Math.PI - 0.03)) < 0.04);
  assert.equal(chaseYaw(1.3, 0, 0, 1 / 60), 1.3);
});
test("manual look postpones auto follow, which becomes eligible only after the hold expires", () => {
  let state = { hold: 0, moving: 0 };
  for (let i = 0; i < 60; i++) state = chaseMemory(state, 4.5, true, 1 / 60);
  assert.equal(state.hold, 1.6);
  for (let i = 0; i < 60; i++) state = chaseMemory(state, 4.5, false, 1 / 60);
  assert(state.hold > 0);
  for (let i = 0; i < 60; i++) state = chaseMemory(state, 4.5, false, 1 / 60);
  assert.equal(state.hold, 0);
  assert(state.moving > 0.24);
  assert.equal(chaseMemory(state, 0, false, 1 / 60).moving, 0);
});
test("holding a side direction follows a straight course while the camera swings behind", () => {
  let frame = { yaw: 0, x: 0, z: 0 },
    yaw = 0,
    x = 0,
    z = 0;
  for (let i = 0; i < 180; i++) {
    frame = movementReference(frame, yaw, 1, 0);
    const vx = Math.cos(frame.yaw) * 4.5,
      vz = -Math.sin(frame.yaw) * 4.5;
    x += vx / 60;
    z += vz / 60;
    yaw = chaseYaw(yaw, vx, vz, 1 / 60);
  }
  assert(x > 13);
  assert(Math.abs(z) < 1e-8);
  assert(Math.abs(yaw + Math.PI / 2) < 0.01);
});
test("releasing or deliberately changing direction captures the new camera heading", () => {
  let frame = movementReference({ yaw: 0, x: 0, z: 0 }, 0, 1, 0);
  frame = movementReference(frame, -1.4, 1, 0.02);
  assert.equal(frame.yaw, 0);
  frame = movementReference(frame, -1.4, 0, 1);
  assert.equal(frame.yaw, -1.4);
  frame = movementReference(frame, 0.8, 0, 0);
  frame = movementReference(frame, 0.8, 1, 0);
  assert.equal(frame.yaw, 0.8);
});
test("chase settles consistently across rendering rates", () => {
  const run = (fps) => {
    let yaw = 0;
    for (let i = 0; i < fps * 3; i++) yaw = chaseYaw(yaw, 4.5, 0, 1 / fps);
    return yaw;
  };
  assert(Math.abs(run(30) - run(144)) < 0.005);
});
