import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { makeTimerSurfaceSnapshot } from "../src/features/timer/timerSurfaceSnapshot.ts";

const focus = 25 * 60_000;
const rest = 5 * 60_000;
const started = Date.parse("2026-09-14T00:00:00.000Z");
const session = {
  phase: "focus",
  endTime: started + focus,
  currentCycle: 1,
  cycleCount: 4,
  startedAt: new Date(started).toISOString(),
};

test("includes all focus intervals and the final break", () => {
  const snapshot = makeTimerSurfaceSnapshot(session, focus, rest);
  assert.equal(snapshot.endTime, started + 4 * (focus + rest));
  assert.equal(snapshot.sessionId, session.startedAt);
});

test("switching phases or cycles preserves the same session deadline", () => {
  const expected = makeTimerSurfaceSnapshot(session, focus, rest);
  for (let cycle = 1; cycle <= 4; cycle++) {
    const cycleStart = started + (cycle - 1) * (focus + rest);
    for (const phase of ["focus", "break"]) {
      assert.deepEqual(makeTimerSurfaceSnapshot({
        ...session, currentCycle: cycle, phase,
        endTime: cycleStart + focus + (phase === "break" ? rest : 0),
      }, focus, rest), expected);
    }
  }
});

test("short QA intervals use the same deadline logic", () => {
  assert.equal(makeTimerSurfaceSnapshot({ ...session, endTime: started + 5000 }, 5000, 3000).endTime, started + 32_000);
});

test("the last break ends exactly at the session deadline", () => {
  const lastBreak = { ...session, phase: "break", currentCycle: 4, endTime: started + 120 * 60_000 };
  assert.equal(makeTimerSurfaceSnapshot(lastBreak, focus, rest).endTime, lastBreak.endTime);
});

test("expired display snapshots contain no completion or restoration command", () => {
  const snapshot = makeTimerSurfaceSnapshot(session, focus, rest);
  assert.deepEqual(Object.keys(snapshot).sort(), ["cycleCount", "endTime", "sessionId"]);
});

test("app and extension ActivityKit schemas stay identical", () => {
  const normalize = (file) => readFileSync(new URL(file, import.meta.url), "utf8")
    .replace(/^\/\/.*$/gm, "").replace(/\s+/g, " ").trim();
  assert.equal(
    normalize("../modules/timer-surfaces/ios/TimerActivityAttributes.swift"),
    normalize("../targets/timer-widget/TimerActivityAttributes.swift"),
  );
});

function loadBridge(native) {
  const output = ts.transpileModule(readFileSync(new URL("../src/features/timer/timerSurfaces.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exported = {};
  vm.runInNewContext(output, {
    exports: exported,
    require: (name) => {
      if (name === "expo") return { requireOptionalNativeModule: () => native };
      if (name === "react-native") return { Platform: { OS: "web" } };
      throw new Error(`Unexpected import: ${name}`);
    },
    console: { warn() {} },
  });
  return exported;
}

const drain = () => new Promise((resolve) => setImmediate(resolve));

test("cold launch cleanup precedes publication and reset cannot be overtaken", async () => {
  const calls = [];
  const bridge = loadBridge({
    reset: async () => { calls.push("reset"); },
    update: async (value) => { calls.push(value.sessionId); },
  });
  const snapshot = makeTimerSurfaceSnapshot(session, focus, rest);
  bridge.syncTimerSurfaces(snapshot);
  bridge.initializeTimerSurfaces();
  bridge.syncTimerSurfaces(null);
  await drain();
  assert.deepEqual(calls, ["reset", session.startedAt, "reset"]);
});

test("timer ticks do not flood native updates; foreground refresh can retry", async () => {
  let updates = 0;
  const bridge = loadBridge({ reset: async () => {}, update: async () => {
    updates++;
    throw new Error("Live Activities unavailable");
  } });
  const snapshot = makeTimerSurfaceSnapshot(session, focus, rest);
  bridge.syncTimerSurfaces(snapshot);
  await drain();
  for (let tick = 0; tick < 100; tick++) bridge.syncTimerSurfaces(snapshot);
  await drain();
  assert.equal(updates, 1);
  bridge.syncTimerSurfaces(snapshot, true);
  await drain();
  assert.equal(updates, 2);
});

test("web and development clients without the native module remain usable", async () => {
  const bridge = loadBridge(null);
  assert.doesNotThrow(() => {
    bridge.initializeTimerSurfaces();
    bridge.syncTimerSurfaces(makeTimerSurfaceSnapshot(session, focus, rest));
    bridge.syncTimerSurfaces(null);
  });
  await bridge.prepareTimerSurfaces();
});
