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

  it(`clearActivity fully removes presence (not an empty update)`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // WHY: an empty UpdateRichPresence still shows "Playing <AppName>" + icon.
    // Clearing must use ClearRichPresence to remove the activity entirely.
    clearActivity({ client });
    expect(state.cleared).toBe(true);
    expect(state.calls).toContain(`Discord_Client_ClearRichPresence`);
    expect(state.calls).not.toContain(`Discord_Client_UpdateRichPresence`);
  });

  it(`marshals the full rich-presence surface (assets, timestamps, party, buttons)`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await setActivity(
      {
        type: `playing`,
        details: `Competitive`,
        state: `Playing Solo`,
        timestamps: { start: 1_700_000_000_000, end: 1_700_000_600_000 },
        assets: {
          largeImage: `numbani`,
          largeText: `Numbani`,
          smallImage: `rogue`,
          smallText: `Rogue - Lvl 100`
        },
        party: { id: `p1`, currentSize: 1, maxSize: 5 },
        buttons: [
          { label: `Website`, url: `https://saeris.gg` },
          { label: `Repo`, url: `https://github.com/discordkit/discordkit` }
        ]
      },
      { client }
    );
    // Why: each field must reach its correct setter with the correct value, and
    // each sub-object must be attached to the activity — otherwise the card
    // renders partially or not at all.
    expect(state.activity).toMatchObject({
      details: `Competitive`,
      state: `Playing Solo`,
      startTimestamp: 1_700_000_000_000n,
      endTimestamp: 1_700_000_600_000n,
      largeImage: `numbani`,
      largeText: `Numbani`,
      smallImage: `rogue`,
      partyCurrent: 1,
      partyMax: 5
    });
    expect(state.activity.buttons).toEqual([
      { label: `Website`, url: `https://saeris.gg` },
      { label: `Repo`, url: `https://github.com/discordkit/discordkit` }
    ]);
    expect(state.activity.attached).toEqual(
      expect.arrayContaining([`assets`, `timestamps`, `party`, `button`])
    );
  });

  it(`skips empty strings + empty sub-objects (SDK rejects empty values)`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await setActivity(
      {
        type: `playing`,
        state: `In Match`,
        // Empty image keys / party-without-id / empty button must NOT be sent —
        // the SDK rejects empty length-constrained fields, and a party needs an id.
        assets: {
          largeImage: ``,
          largeText: ``,
          smallImage: ``,
          smallText: ``
        },
        party: { currentSize: 1, maxSize: 5 },
        buttons: [{ label: ``, url: `` }]
      },
      { client }
    );
    // Why: a cleared field (RHF holds "") would otherwise reach the SDK as an
    // empty string and fail the whole presence update — the exact bug the live
    // editor surfaced.
    expect(state.activity.largeImage).toBeUndefined();
    expect(state.activity.attached).not.toContain(`assets`);
    expect(state.activity.attached).not.toContain(`party`); // no id → not built
    expect(state.activity.attached).not.toContain(`button`);
    expect(state.calls).toContain(`Discord_Client_UpdateRichPresence`); // still updates
  });

  it(`caps buttons at two (Discord's limit)`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await setActivity(
      {
        type: `playing`,
        buttons: [
          { label: `A`, url: `https://a` },
          { label: `B`, url: `https://b` },
          { label: `C`, url: `https://c` }
        ]
      },
      { client }
    );
    // Why: Discord ignores >2 buttons; building a third is wasted work and
    // could mislead a reader into thinking three render.
    expect(state.activity.buttons).toHaveLength(2);
  });
});
