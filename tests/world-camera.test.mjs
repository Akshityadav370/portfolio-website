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
const { cameraClearance, cameraDistance, dampAngle } = await import(
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
