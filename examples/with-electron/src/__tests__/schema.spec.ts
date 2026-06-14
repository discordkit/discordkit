import { describe, it, expect } from "vitest";
import * as v from "valibot";
import {
  createActivitySchema,
  DEFAULT_VALUES,
  type FormValues
} from "../schema.js";

const PARTY_ID = `test-party-id`;
const STARTED_AT = 1_700_000_000_000;
const schema = createActivitySchema(PARTY_ID, STARTED_AT);

/** Parse a (possibly partial) form override through the schema transform. */
const run = (override: (f: FormValues) => void) => {
  const form = structuredClone(DEFAULT_VALUES);
  override(form);
  return v.parse(schema, form);
};

describe(`schema transform`, () => {
  it(`defaults produce the expected baseline activity`, () => {
    const out = run(() => {});
    // Why: the defaults are the out-of-the-box presence; they must map to a complete, sensible activity (details + state on, both sample images, elapsed timer, one button) and — crucially — NO party (off by default).
    expect(out.type).toBe(`playing`);
    expect(out.details).toBe(`Building with discordkit`);
    expect(out.state).toBe(`Editing Rich Presence`);
    expect(out.assets?.largeImage).toContain(`api.dicebear.com`);
    expect(out.assets?.smallImage).toContain(`api.dicebear.com`);
    expect(out.timestamps?.start).toBe(STARTED_AT);
    expect(out.buttons).toHaveLength(1);
    expect(out).not.toHaveProperty(`party`);
  });

  it(`details off omits details`, () => {
    const out = run((f) => {
      f.activity.details.on = false;
    });
    expect(out).not.toHaveProperty(`details`);
  });

  it(`state off omits state`, () => {
    const out = run((f) => {
      f.activity.state.on = false;
    });
    expect(out).not.toHaveProperty(`state`);
  });

  it(`party on with sizes emits party with the injected id`, () => {
    const out = run((f) => {
      f.activity.party.on = true;
      f.activity.party.currentSize = 2;
      f.activity.party.maxSize = 5;
    });
    // Why: Discord requires a party id when sizes are present; the transform injects the session-stable id passed to createActivitySchema.
    expect(out.party).toEqual({
      id: PARTY_ID,
      currentSize: 2,
      maxSize: 5
    });
  });

  it(`party on but both sizes zero omits party`, () => {
    const out = run((f) => {
      f.activity.party.on = true;
      f.activity.party.currentSize = 0;
      f.activity.party.maxSize = 0;
    });
    // Why: an empty count would render as "(0 of 0)" — treat zeros as "no party".
    expect(out).not.toHaveProperty(`party`);
  });

  it(`image source = url uses the url verbatim`, () => {
    const out = run((f) => {
      f.activity.largeImage.source = `url`;
      f.activity.largeImage.url = `https://example.com/a.png`;
    });
    expect(out.assets?.largeImage).toBe(`https://example.com/a.png`);
  });

  it(`image source = sample derives a dicebear url from the seed`, () => {
    const out = run((f) => {
      f.activity.largeImage.seed = `abc`;
    });
    expect(out.assets?.largeImage).toContain(`seed=abc`);
  });

  it(`image off omits that image's keys`, () => {
    const out = run((f) => {
      f.activity.smallImage.on = false;
    });
    expect(out.assets).not.toHaveProperty(`smallImage`);
    expect(out.assets).not.toHaveProperty(`smallText`);
  });

  it(`buttons with empty label or url are filtered out`, () => {
    const out = run((f) => {
      f.activity.buttons = [
        { label: `ok`, url: `https://x.com` },
        { label: ``, url: `` }
      ];
    });
    expect(out.buttons).toHaveLength(1);
  });

  it(`useTimestamp off omits timestamps`, () => {
    const out = run((f) => {
      f.activity.useTimestamp = false;
    });
    expect(out).not.toHaveProperty(`timestamps`);
  });

  it(`both images off omits the assets key entirely`, () => {
    const out = run((f) => {
      f.activity.largeImage.on = false;
      f.activity.smallImage.on = false;
    });
    // Why: an empty `assets: {}` is noise in the Show Code output; omit it.
    expect(out).not.toHaveProperty(`assets`);
  });

  it(`no valid buttons omits the buttons key entirely`, () => {
    const out = run((f) => {
      f.activity.buttons = [];
    });
    // Why: an empty `buttons: []` is noise; omit it rather than ship the array.
    expect(out).not.toHaveProperty(`buttons`);
  });
});
