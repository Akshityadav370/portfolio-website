import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const source = await readFile(
  new URL("../src/lib/world/player-avatar.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const code = outputText.replace(
  '"three"',
  JSON.stringify(import.meta.resolve("three")),
);
const { createPlayerAvatar } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);
test("supplied rig stays in place through locomotion and blends back from jumping", async () => {
  const loader = new GLTFLoader();
  loader.register(() => ({
    name: "skipTexturesInNode",
    loadTexture: () => Promise.resolve(null),
  }));
  const bytes = await readFile(
    new URL("../public/models/tommy_vercetti.glb", import.meta.url),
  );
  const gltf = await loader.parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
  const avatar = createPlayerAvatar(gltf);
  const hips = gltf.scene.getObjectByName("mixamorigHips_01");
  const start = hips.position.clone();
  const bounds = new THREE.Box3().setFromObject(avatar.visual, true);
  assert.ok(Math.abs(bounds.min.y) < 0.08, "feet sit at ground level");
  assert.ok(bounds.max.y > 1.7 && bounds.max.y < 1.9, "human scale");
  for (const [moving, airborne, vertical] of [
    [true, false, 0],
    [true, true, 4],
    [true, true, -4],
    [false, false, 0],
  ]) {
    for (let i = 0; i < 180; i++)
      avatar.animate(i / 60, moving, airborne, {
        speed: moving ? 4 : 0,
        vertical,
        landing: 0,
        dt: 1 / 60,
      });
    assert.ok(Math.abs(hips.position.x - start.x) < 0.0001);
    assert.ok(Math.abs(hips.position.z - start.z) < 0.0001);
    assert.ok(
      Math.abs(hips.position.y - start.y) < 10,
      "vertical motion is rebased, not original root offset",
    );
  }
  const idle = hips.position.clone();
  avatar.animate(0, true, true, { speed: 5, vertical: 4, landing: 0, dt: 0 });
  assert.deepEqual(
    hips.position.toArray(),
    idle.toArray(),
    "pause freezes animation",
  );
  avatar.dispose();
});
