import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../src/lib/world/audio.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const { createWorldAudio } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
test("ambience is opt-in, single-instance, yields to games, pauses, and disposes", () => {
  const nodes = [];
  let buffers = 0;
  globalThis.document = { hidden: false };
  globalThis.AudioContext = class {
    currentTime = 0;
    state = "running";
    destination = {};
    resume() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
    createBuffer(channels, length) {
      buffers++;
      const data = new Float32Array(length);
      return { getChannelData: () => data };
    }
    createBufferSource() {
      const node = {
        loop: false,
        connect() {},
        disconnect() {},
        start() {
          this.started = true;
        },
        stop() {
          this.stopped = true;
        },
      };
      nodes.push(node);
      return node;
    }
    createGain() {
      return {
        gain: {
          value: 0,
          setTargetAtTime(v) {
            this.value = v;
          },
        },
        connect() {},
        disconnect() {},
      };
    }
  };
  const audio = createWorldAudio();
  audio.sync(null, false);
  assert.equal(nodes.length, 0);
  audio.setEnabled(true);
  audio.sync(null, false);
  assert.equal(nodes.length, 1);
  assert(nodes[0].loop);
  assert(nodes[0].buffer.getChannelData().some((v) => v !== 0));
  audio.sync(null, false);
  assert.equal(nodes.length, 1);
  audio.sync({ kind: "red-light", status: "playing", phase: "red" }, false);
  assert(nodes[0].stopped);
  audio.sync(null, false);
  assert.equal(nodes.length, 2);
  assert.equal(buffers, 1);
  audio.sync(null, true);
  assert(nodes[1].stopped);
  document.hidden = true;
  audio.sync(null, false);
  assert.equal(nodes.length, 2);
  document.hidden = false;
  audio.sync(null, false);
  audio.setVolume(0.1);
  audio.setEnabled(false);
  assert(nodes[2].stopped);
  audio.setEnabled(true);
  audio.sync(null, false);
  audio.dispose();
  assert(nodes[3].stopped);
  delete globalThis.document;
  delete globalThis.AudioContext;
});
