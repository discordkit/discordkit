import { describe, it, expect } from "vitest";
import { createClient } from "../client.js";
import { mockBackend, mockStateOf } from "./testBackend.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`createClient (mock backend)`, () => {
  it(`initializes the native handle and applies the application id`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // Why: a client is unusable until Init runs and the app id is set — these
    // are the preconditions for every later SDK call.
    expect(state.calls).toContain(`Discord_Client_Init`);
    expect(state.applicationId).toBe(123n);
  });

  it(`drives the status signal from the SDK callback as the pump runs`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // Why: status must reflect the SDK's OnStatusChanged, not a guess — a
    // consumer gating on "Ready" depends on this wiring being live.
    expect(client.status.get()).toBe(`Disconnected`);
    state.pump();
    expect(client.status.get()).toBe(`Connecting`);
    state.pump();
    state.pump();
    expect(client.status.get()).toBe(`Ready`);
  });

  it(`delivers log lines to onLog subscribers and stops after unsubscribe`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    const seen: string[] = [];
    const off = client.onLog((e) => seen.push(e.message));
    state.pump(); // emits one "mock connecting" log on first pump
    expect(seen).toEqual([`mock connecting`]);
    off();
    state.pump();
    state.pump();
    // Why: a removed subscriber must not keep receiving — leaks here would grow
    // unboundedly in a long-lived desktop process.
    expect(seen).toEqual([`mock connecting`]);
  });

  it(`disposes: drops the handle and unregisters all callbacks`, () => {
    const client = createClient(config);
    const state = mockStateOf(client.lib);
    expect(state.liveCallbacks).toBeGreaterThan(0); // status + log registered
    client.close();
    // Why: the SDK handle and every C callback are native resources; failing to
    // release them on close leaks across the process lifetime.
    expect(state.dropped).toBe(true);
    expect(state.liveCallbacks).toBe(0);
  });

  it(`close is idempotent`, () => {
    const client = createClient(config);
    client.close();
    expect(() => {
      client.close();
    }).not.toThrow();
  });
});
