import { describe, it, expect } from "vitest";
import { createClient } from "../client.js";
import { setActivity, clearActivity } from "../presence.js";
import { mockBackend, mockStateOf } from "./testBackend.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`setActivity (mock backend)`, () => {
  it(`marshals object input into the Activity setters then updates presence`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await setActivity(
      { type: `playing`, state: `In Match`, details: `Rank: Diamond II` },
      { client }
    );
    // Why: presence is only correct if each field reaches the right setter with
    // the right value, and the activity is handed to UpdateRichPresence.
    expect(state.activity).toMatchObject({
      type: 0, // playing
      state: `In Match`,
      details: `Rank: Diamond II`
    });
    expect(state.calls).toContain(`Discord_Client_UpdateRichPresence`);
    expect(state.calls).toContain(`Discord_Activity_Drop`); // no leak of the activity handle
  });

  it(`accepts a builder callback equivalently to an object`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await setActivity(
      (a) => {
        a.type = `watching`;
        a.state = `a demo`;
      },
      { client }
    );
    // Why: the builder is sugar over the object form — it must produce the same
    // native calls, or the two documented input styles would diverge.
    expect(state.activity.type).toBe(3); // watching
    expect(state.activity.state).toBe(`a demo`);
  });

  it(`maps each activity type to its ABI enum value`, async () => {
    const cases: [Parameters<typeof setActivity>[0], number][] = [];
    for (const [type, code] of [
      [`playing`, 0],
      [`streaming`, 1],
      [`listening`, 2],
      [`watching`, 3],
      [`competing`, 5]
    ] as const) {
      cases.push([{ type }, code]);
    }
    for (const [input, code] of cases) {
      using client = createClient(config);
      const state = mockStateOf(client.lib);
      await setActivity(input, { client });
      // Why: a wrong enum mapping silently shows the wrong activity type to
      // every user — exactly the kind of off-by-one a literal table prevents.
      expect(state.activity.type).toBe(code);
    }
  });

  it(`clearActivity updates presence with an empty activity`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await clearActivity({ client });
    expect(state.calls).toContain(`Discord_Client_UpdateRichPresence`);
    expect(state.activity.state).toBeUndefined();
  });
});
