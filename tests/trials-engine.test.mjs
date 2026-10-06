import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// The engine has no runtime imports. Compile only this module for Node 20.
const source = await readFile(
  new URL("../src/lib/trials-engine.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const engine = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const {
  createTrial,
  startTrial,
  advanceTrial,
  pauseTrial,
  resumeTrial,
  jump,
  togglePlayer,
  lockRoom,
} = engine;
function until(state, predicate, input = () => false) {
  for (let i = 0; i < 3000 && !predicate(state); i++)
    state = advanceTrial(state, 1 / 60, input(state));
  assert(predicate(state), "Expected gameplay condition was never reached");
  return state;
}

test("ready and paused games never advance or accept jumping", () => {
  const ready = createTrial("jump-rope");
  assert.equal(advanceTrial(ready, 1), ready);
  const paused = pauseTrial(startTrial("jump-rope"));
  assert.equal(advanceTrial(paused, 1), paused);
  assert.equal(jump(paused), paused);
  assert.equal(resumeTrial(paused).elapsed, 0);
});
test("a long browser stall cannot skip the reaction cue", () => {
  const state = advanceTrial(startTrial("red-light"), 20, true);
  assert.equal(state.phase, "green");
  assert.equal(state.elapsed, 0.1);
});
test("green permits movement; the warning freezes progress before red", () => {
  const warning = until(
    startTrial("red-light"),
    (s) => s.phase === "warning",
    () => true,
  );
  assert(warning.progress > 0);
  const after = advanceTrial(warning, 0.1, true);
  assert.equal(after.progress, warning.progress);
  assert.equal(after.status, "playing");
  const red = until(after, (s) => s.phase === "red");
  assert.equal(advanceTrial(red, 0.02, true).status, "lost");
});
test("releasing during the warning allows a complete red-light round", () => {
  const result = until(
    startTrial("red-light"),
    (s) => s.status === "won",
    (s) => s.phase === "green",
  );
  assert.equal(result.progress, 1);
  assert(result.elapsed < 35);
});
test("inactive players time out and can restart cleanly", () => {
  const result = until(startTrial("red-light"), (s) => s.status === "lost");
  assert.match(result.message, /Time/);
  const reset = startTrial("red-light");
  assert.equal(reset.elapsed, 0);
  assert.equal(reset.progress, 0);
});
test("mingle selections are reversible and cannot be made while spinning", () => {
  const started = startTrial("mingle");
  assert.equal(togglePlayer(started, 0), started);
  let state = until(started, (s) => s.phase === "choose");
  state = togglePlayer(togglePlayer(state, 0), 0);
  assert.deepEqual(state.selected, []);
  assert.equal(lockRoom(state).status, "lost");
});
test("mingle requires the exact requested group in each of three rooms", () => {
  let state = startTrial("mingle");
  for (let round = 0; round < 3; round++) {
    state = until(state, (s) => s.phase === "choose");
    for (let id = 0; id < state.target; id++) state = togglePlayer(state, id);
    state = lockRoom(state);
  }
  assert.equal(state.status, "won");
  assert.equal(state.round, 3);
  assert.equal(state.progress, 1);
});
test("mingle doors close when the player does not choose", () => {
  const state = until(startTrial("mingle"), (s) => s.status === "lost");
  assert.match(state.message, /doors closed/);
});
test("jump rope can be won with five well-timed jumps", () => {
  let state = startTrial("jump-rope");
  for (let i = 0; i < 2000 && state.status === "playing"; i++) {
    if (
      state.nextRope - state.elapsed < 0.35 &&
      state.elapsed - state.jumpAt > 0.85
    )
      state = jump(state);
    state = advanceTrial(state, 1 / 60);
  }
  assert.equal(state.status, "won");
  assert.equal(state.round, 5);
});
test("missed or early jumps lose the round without accumulating points", () => {
  for (const early of [false, true]) {
    let state = startTrial("jump-rope");
    if (early) state = jump(state);
    state = until(state, (s) => s.status === "lost");
    assert.equal(state.round, 0);
  }
});
test("pause preserves a jumping player and exact remaining rope time", () => {
  let state = startTrial("jump-rope");
  state = until(state, (s) => s.elapsed > 2.9);
  state = jump(state);
  const paused = pauseTrial(state);
  assert.deepEqual(advanceTrial(paused, 40), paused);
  state = until(resumeTrial(paused), (s) => s.round === 1);
  assert.equal(state.status, "playing");
});
