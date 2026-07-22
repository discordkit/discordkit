import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { presenceOf } from "./mock.js";
import { setActivity } from "../richPresence.js";

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
    expect(presenceOf(state)).toMatchObject({
      type: 0, // playing
      state: `In Match`,
      details: `Rank: Diamond II`
    });
    expect(state.calls).toContain(`Discord_Client_UpdateRichPresence`);
    expect(state.calls).toContain(`Discord_Activity_Drop`); // no handle leak
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
    expect(presenceOf(state).type).toBe(3); // watching
    expect(presenceOf(state).state).toBe(`a demo`);
  });

  it(`maps each activity type to its ABI enum value`, async () => {
    for (const [type, code] of [
      [`playing`, 0],
      [`streaming`, 1],
      [`listening`, 2],
      [`watching`, 3],
      [`competing`, 5]
    ] as const) {
      using client = createClient(config);
      const state = mockStateOf(client.lib);
      await setActivity({ type }, { client });
      // Why: a wrong enum mapping silently shows the wrong activity type to
      // every user — exactly the kind of off-by-one a literal table prevents.
      expect(presenceOf(state).type).toBe(code);
    }
  });

  it(`maps each statusDisplayType key to its ABI enum value`, async () => {
    for (const [statusDisplayType, code] of [
      [`name`, 0],
      [`state`, 1],
      [`details`, 2]
    ] as const) {
      using client = createClient(config);
      const state = mockStateOf(client.lib);
      await setActivity({ type: `playing`, statusDisplayType }, { client });
      // Why: a wrong mapping surfaces the wrong field in the user's status text
      // for every viewer — the same off-by-one risk as the activity-type table.
      expect(presenceOf(state).statusDisplayType).toBe(code);
      expect(state.calls).toContain(`Discord_Activity_SetStatusDisplayType`);
    }
  });

  it(`omits statusDisplayType when unset (leaves the SDK default)`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await setActivity({ type: `playing`, state: `In Match` }, { client });
    // Why: not passing the field must NOT call the setter — otherwise every
    // activity would override the user's chosen default.
    expect(presenceOf(state).statusDisplayType).toBeUndefined();
    expect(state.calls).not.toContain(`Discord_Activity_SetStatusDisplayType`);
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
    expect(presenceOf(state)).toMatchObject({
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
    expect(presenceOf(state).buttons).toEqual([
      { label: `Website`, url: `https://saeris.gg` },
      { label: `Repo`, url: `https://github.com/discordkit/discordkit` }
    ]);
    expect(presenceOf(state).attached).toEqual(
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
        // the SDK rejects empty length-constrained fields, a party needs an id.
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
    expect(presenceOf(state).largeImage).toBeUndefined();
    expect(presenceOf(state).attached).not.toContain(`assets`);
    expect(presenceOf(state).attached).not.toContain(`party`); // no id → not built
    expect(presenceOf(state).attached).not.toContain(`button`);
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
    // Why: Discord ignores >2 buttons; building a third is wasted work and could
    // mislead a reader into thinking three render.
    expect(presenceOf(state).buttons).toHaveLength(2);
  });
});
